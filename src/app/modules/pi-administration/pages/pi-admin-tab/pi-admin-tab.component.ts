import { Component, OnInit } from '@angular/core';
import { finalize, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { PiAdministrationComponent } from '../../pi-administration.component';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { Router } from '@angular/router';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ManagePiTagsSendComponent } from '../../components/dialogs/manage-pi-tags-send/manage-pi-tags-send.component';
import { ManagePiTagsReceiveComponent } from '../../components/dialogs/manage-pi-tags-receive/manage-pi-tags-receive.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SelectButtonOptionClickEvent } from 'primeng/selectbutton';
import { DatasourceAdministrationService } from 'src/app/modules/datasource-administration/datasource-administration.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-pi-admin-tab',
  standalone: false,
  templateUrl: './pi-admin-tab.component.html',
  styleUrl: './pi-admin-tab.component.css'
})
export class PiAdminTabComponent extends PiAdministrationComponent implements OnInit {
  tabActions = ['PI Tag Receive', 'PI Tag Send',]
  selectedTab: any;
  selectedTabIndex = 0;

  tabButtonActions: string[] = [
    "Import",
    "Export",
    "Create"
  ]

  selectedButtonAction!: string;

  isShowSendTagDetails: boolean = false;

  isShowReceiveTagDetails: boolean = false;

  appRef!: DynamicDialogRef;

  PIData$!: Observable<any>;
  private subscribe$ = new Subject<void>();

  /**
 * @property {any} searchPISendValue - Stores the search input value for filtering applications.
 */
  searchPISendValue: any;

  /**
* @property {any} searchPIReceiveValue - Stores the search input value for filtering applications.
*/
  searchPIReceiveValue: any;


  /**
 * @property {unknown} iSPISendloading - Indicates the loading state (can be replaced with a boolean for better clarity).
 */
  iSPISendloading: unknown;

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
* @property {Observable<any>} pi_send_data - Stores the list of PI TAG SEND fetched from the backend.
*/
  pi_send_data$!: Observable<any>;

  /**
* @property {Observable<any>} pi_receive_data$ - Stores the list of PI TAG RECEIVE fetched from the backend.
*/
  pi_receive_data$!: Observable<any>;


  /**
  * @property {FormGroup} updateSendForm - Form group that holds application form controls.
  */
  updateSendForm: FormGroup;

  /**
* @property {FormGroup} updateReceiveForm - Form group that holds application form controls.
*/
  updateReceiveForm: FormGroup;

  selectedSend: any; // store selected Send row data

  selectedReceive: any; // store selected Receive row data

  /**
* @property {any[]} activeStatus - Stores a list of active status (potentially for dropdown selection).
*/
  activeStatus: any[] = [
    {
      name: 'Active',
      value: 'active'
    },
    {
      name: 'Inactive',
      value: 'inactive'
    }
  ];

  extTypes = ['ABSTOTAL', 'AC', 'APV', 'ATMAX', 'C', 'MAX', 'MAXTIME', 'MEAN', 'MIN', 'PCTON', 'PV', 'RANGE', 'STD', 'SUMTANKS', 'TOTAL', '1:30AM', '2AM', '4AM', '5AM',];
  freqTypes = ['D', 'H'];
  sysNames = ['RTR'];

  /**
* @property {Observable<any>} sysNameDropDown$ - Observable to retrieve system name from backend.
*/
  sysNameDropDown$!: Observable<any>;

  /**
* @property {Observable<any>} attrDropDown$ - Observable to retrieve attribute name from backend.
*/
  attrDropDown$!: Observable<any>;

  globalAttributes: [] = [];


  /**
 * Constructor injects necessary services.
 * @constructor
 * @param {Router} router - Angular Router service to interact router,
 * @param {FormBuilder} fb - Form builder service for handling reactive forms.
 * @param {DatasourceAdministrationService} datasourceAdministrationService - Service to fetch dropdown value.
 */
  constructor(private router: Router, private fb: FormBuilder, private datePipe: DatePipe, private datasourceAdministrationService: DatasourceAdministrationService, private confirmationService: ConfirmationService) {
    super();
    this.selectedTab = this.tabActions[0];
    // this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
    //   if (event) {
    //     this.getPIData();
    //   }
    // })
    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {

      this.isShowSendTagDetails = false;
      this.isShowReceiveTagDetails = false;
      this.attrDropDown$ = this.piAdminService.getAttributesByOrg({ orgId: this.filterService.currentOrg?.orgId ?? null }).pipe(
        map((res: any) => res?.attributes || []),
        finalize(() => this.spinner.hide())
      );
      if (this.selectedTab == this.tabActions[0]) {
        this.getPIReceiveData();
      } else {
        this.getPISendData();
      }

    });

    this.updateSendForm = this.fb.group({
      attributeId: new FormControl<string>('', [Validators.required]),
      attributeName: new FormControl<string>('', [Validators.required]),
      tagNumber: new FormControl<string>(''),
      piTagNumber: new FormControl<string>(''),
      piDesc: new FormControl<string>('',),
      piSendStatus: new FormControl<string>('active'),
      systemName: new FormControl<string>('',),
      createdOn: new FormControl<string>({ value: '', disabled: true }),
      createdBy: new FormControl<string>({ value: '', disabled: true }),
      modifiedDate: new FormControl<string>({ value: '', disabled: true }),
      modifiedBy: new FormControl<string>({ value: '', disabled: true }),
      orgId: new FormControl<string>('',),
      orgName: new FormControl<string>('',),
    });


    this.updateReceiveForm = this.fb.group({
      attributeId: new FormControl<string>('', [Validators.required]),
      attributeName: new FormControl<string>('', [Validators.required]),
      tagNumber: new FormControl<string>('', [Validators.required]),
      piTagNumber: new FormControl<string>('', [Validators.required]),
      piDesc: new FormControl<string>('',),
      piReceiveStatus: new FormControl<string>('active'),
      extType: new FormControl<string>('',),
      freqType: new FormControl<string>('',),
      systemName: new FormControl<string>('',),
      createdOn: new FormControl<string>({ value: '', disabled: true }),
      createdBy: new FormControl<string>({ value: '', disabled: true }),
      modifiedDate: new FormControl<string>({ value: '', disabled: true }),
      modifiedBy: new FormControl<string>({ value: '', disabled: true }),
      value_status: new FormControl<string>({ value: '', disabled: true }),
      orgId: new FormControl<string>('',),
      orgName: new FormControl<string>('',),
      last_updated_date: new FormControl<string>({ value: '', disabled: true }),
      record_ts: new FormControl<string>({ value: '', disabled: true }),
    });
  }

  ngOnInit() {
    this.sysNameDropDown$ = this.datasourceAdministrationService.getDataSource({ fields: 'sysName' }).pipe(
      map((res: any) => res?.dataSourceData || []),
      finalize(() => this.spinner.hide())
    );

    this.attrDropDown$ = this.piAdminService.getAttributesByOrg({ orgId: this.filterService.currentOrg?.orgId ?? null }).pipe(
      map((res: any) => res?.attributes || []),
      tap(attrs => {
        this.globalAttributes = attrs;
      }),
      finalize(() => this.spinner.hide())
    );
  }

  onTabClick(event: SelectButtonOptionClickEvent) {
    this.isShowSendTagDetails = false;
    this.isShowReceiveTagDetails = false;

    this.selectedTabIndex = event.index ?? 0;

    switch (this.selectedTabIndex) {
      case 0:
        this.getPIReceiveData();
        break;
      case 1:
        this.getPISendData();
        break;
      default:
        this.getPIReceiveData();
        break;
    }
  }

  getPISendData(): void {
    this.spinner.show();
    let payload = {
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }

    this.pi_send_data$ = this.piAdminService.getPISend(payload).pipe(
      map((res: any) => res?.piData || []),
      finalize(() => this.spinner.hide())
    );
  }

  getPIReceiveData(): void {
    this.spinner.show();
    let payload = {
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }

    this.pi_receive_data$ = this.piAdminService.getPIReceive(payload).pipe(
      map((res: any) => res?.piData || []),
      finalize(() => this.spinner.hide())
    );
  }

  mobileTabButtonChange(): void {

  }

  importSendTags(): void {

  }

  exportSendTags(): void {

  }

  validateSendTag(send: any): void {


  }

  onAttributeSendChange(event: any) {
    const selectedId = event.value;
    const obj: any = this.globalAttributes.find((x: any) => x.attributeId === selectedId);
    this.updateSendForm.patchValue({
      attributeName: obj.attributeName
    });
  }

  createSendTag(): void {
    if (!(this.filterService.currentOrg)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an organization' });
      return;
    }

    this.appRef = this.dialog.open(ManagePiTagsSendComponent, {
      header: 'Create Tag Assignment',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        orgId: this.filterService.currentOrg?.orgId ?? ''
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tag Assignment created successfully', life: 3000 });
        this.getPISendData();
      }
    });


  }


  /**
 * Patches the TagSend data to the updateSendForm
 * @param {any} send - application data
 * @returns {void} - returns nothing (i.e) void
 */
  patchSendValue(send: any): void {
    this.updateSendForm.patchValue({
      attributeId: send.attributeId,
      attributeName: send.attributeName,
      tagNumber: send.tagNumber ?? '',
      piDesc: send.piDesc,
      tagSendLevelId: send.tagSendLevelId,
      piSendStatus: send.piSendStatus,
      systemName: send.systemName,
      createdOn: this.datePipe.transform(new Date(send.createdOn), 'mediumDate'),
      createdBy: send.createdBy,
      modifiedDate: this.datePipe.transform(new Date(send.createdOn), 'mediumDate'),
      modifiedBy: send.modifiedBy,
      orgId: send.orgId,
      orgName: send.orgName
    })
  }


  /**
   * Handles application selection from a table.
   * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
   */
  onPISendSelect(event: TableRowSelectEvent) {
    this.patchSendValue(event.data);
    this.isShowSendTagDetails = true;
  }


  /**
   * Clears the table filter/search.
   * @param {Table} _t19 - The table reference whose filter should be cleared.
   */
  clearSendTable(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  /**
   * Edits an existing PI SEnd.
   * @param {any} data - The PI Send data to be edited.
   */
  editPISend(data: any) {
    if (this.updateSendForm.valid) {
      const payload = {
        ...this.updateSendForm.getRawValue()
      }
      this.piAdminService.putPISend(payload, data._id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Updated successfully'
          });
          this.getPISendData();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update'
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Fields validation failed'
      });
    }
  }

  /**
   * Deletes an existing application.
   * opens an confirmation popup using primeng Confirmation service
   * Opens the toast by using primeng message sevice and shows the message
   * @param {any} data - The application data to be deleted.
   */
  deletePISend(data: any) {
    this.isShowSendTagDetails = false;
    this.piAdminService.deletePISend(data._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Deleted successfully'
        });
        this.getPISendData();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete'
        });
      }
    });
  }



  importReceiveTags(): void {

  }

  exportReceiveTags(): void {

  }

  validateReceiveTag(receive: any): void {

  }

  onAttributeReceiveChange(event: any) {
    const selectedId = event.value;
    const obj: any = this.globalAttributes.find((x: any) => x.attributeId === selectedId);
    this.updateReceiveForm.patchValue({
      attributeName: obj.attributeName
    });
  }

  createReceiveTag(): void {
    console.log(this.filterService.currentOrg);
    if (!(this.filterService.currentOrg)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an organization' });
      return;
    }

    this.appRef = this.dialog.open(ManagePiTagsReceiveComponent, {
      header: 'Create Tag Assignment',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        orgId: this.filterService.currentOrg?.orgId ?? ''
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tag Assignment created successfully', life: 3000 });
        this.getPIReceiveData();
      }
    });
  }


  /**
* Patches the TagSend data to the updateSendForm
* @param {any} receive - application data
* @returns {void} - returns nothing (i.e) void
*/
  patchReceiveValue(receive: any): void {
    this.updateReceiveForm.patchValue({
      attributeId: receive.attributeId,
      attributeName: receive.attributeName,
      piTagNumber: receive.piTagNumber,
      tagNumber: receive.tagNumber,
      piDesc: receive.piDesc,
      tagReceiveLevelId: receive.tagReceiveLevelId,
      piReceiveStatus: receive.piReceiveStatus,
      extType: receive.extType,
      freqType: receive.freqType,
      systemName: receive.systemName,
      createdOn: this.datePipe.transform(new Date(receive.createdOn), 'mediumDate'),
      createdBy: receive.createdBy,
      modifiedDate: this.datePipe.transform(new Date(receive.createdOn), 'mediumDate'),
      modifiedBy: receive.modifiedBy,
      value_status: receive.value_status,
      last_updated_date: receive.last_updated_date,
      record_ts: receive.record_ts,
      orgId: receive.orgId,
      orgName: receive.orgName
    })
  }


  /**
 * Handles application selection from a table.
 * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
 */
  onPIReceiveSelect(event: TableRowSelectEvent) {
    console.log(event.data);
    this.patchReceiveValue(event.data);
    this.isShowReceiveTagDetails = true;
  }


  /**
 * Clears the table filter/search.
 * @param {Table} _t19 - The table reference whose filter should be cleared.
 */
  clearReceiveTable(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  /**
 * Edits an existing PI Receive.
 * @param {any} data - The PI Receive data to be edited.
 */
  editPIReceive(data: any) {
    if (this.updateReceiveForm.valid) {
      const payload = {
        ...this.updateReceiveForm.getRawValue()
      }
      this.piAdminService.putPIReceive(payload, data._id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Updated successfully'
          });
          this.getPIReceiveData();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update'
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to validate fields'
      });
    }

  }

  /**
   * Deletes an existing application.
   * opens an confirmation popup using primeng Confirmation service
   * Opens the toast by using primeng message sevice and shows the message
   * @param {any} data - The application data to be deleted.
   */
  deletePIReceive(data: any) {
    this.isShowReceiveTagDetails = false;
    this.piAdminService.deletePIReceive(data._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Deleted successfully'
        });
        this.getPIReceiveData();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete'
        });
      }
    });
  }



  getSeverity(status: any) {
    switch (status) {
      case 'active':
        return 'success';

      case 'inactive':
        return 'danger';
      default:
        return 'success'
    }
  }

  getStatus(status: any) {
    switch (status) {
      case 'active':
        return 'Active';

      case 'inactive':
        return 'Inactive';
      default:
        return 'success'
    }
  }


  /**
  * Lifecycle hook triggered after the time of component destroy.
  * unsubscribes the filter subscriptions
  */
  ngOnDestroy() {
    this.isShowSendTagDetails = false;
    this.isShowReceiveTagDetails = false;
  }


}
