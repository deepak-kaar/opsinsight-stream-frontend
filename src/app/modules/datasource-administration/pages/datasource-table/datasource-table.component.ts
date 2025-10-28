import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, map, Observable, Subject, takeUntil } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { DatasourceAdministrationComponent } from '../../datasource-administration.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ManageDatasourceComponent } from '../../components/dialogs/manage-datasource/manage-datasource.component';
import { Table, TableRowSelectEvent } from 'primeng/table';

@Component({
  selector: 'app-datasource-table',
  standalone: false,
  templateUrl: './datasource-table.component.html',
  styleUrl: './datasource-table.component.css'
})
export class DatasourceTableComponent extends DatasourceAdministrationComponent implements OnInit, OnDestroy {

  buttonActions: string[] = [
    "Create"
  ]

  selectedButtonAction!: string;

  isShowDetails: boolean = false;

  appRef!: DynamicDialogRef;

  private subscribe$ = new Subject<void>();

  /**
 * @property {any} searchDatasourceValue - Stores the search input value for filtering applications.
 */
  searchDatasourceValue: any;


  /**
 * @property {unknown} iSDatasourceloading - Indicates the loading state (can be replaced with a boolean for better clarity).
 */
  iSDatasourceloading: unknown;

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
* @property {Observable<any>} datasource_data - Stores the list of data source fetched from the backend.
*/
  datasource_data$!: Observable<any>;


  /**
* @property {FormGroup} updateDataSourceForm - Form group that holds application form controls.
*/
  updateDataSourceForm: FormGroup;


  selectedDatasource: any; // store selected Receive row data

  /**
* @property {any[]} activeStatus - Stores a list of active status (potentially for dropdown selection).
*/
  activeStatus: any[] = [
    {
      name: 'Active',
      value: true
    },
    {
      name: 'Inactive',
      value: false
    }
  ];



  systemTypes = ['Connection Type 1', 'Connection Type 2', 'Connection Type 3', 'Connection Type 4', 'Connection Type 5'];

  editorOptions = {
    theme: 'vs-dark', language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false
  };


  /**
 * Constructor injects necessary services.
 * @constructor
 * @param {Router} router - Angular Router service to interact router,
 * @param {FormBuilder} fb - Form builder service for handling reactive forms.
 */
  constructor(private router: Router, private fb: FormBuilder, private datePipe: DatePipe,) {
    super();
    // this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
    //   if (event) {
    //     this.getPIData();
    //   }
    // })
    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getDatasource();
      }
    });



    this.updateDataSourceForm = this.fb.group({
      sysId: new FormControl<string>('', [Validators.required]),
      sysName: new FormControl<string>('', [Validators.required]),
      sysType: new FormControl<string>('', []),
      active: new FormControl<boolean>(true),
      description: new FormControl<string>('', []),
      userJson: new FormControl<string>('', []),
      operatingFacility: new FormControl<string>('', []),
      lastConnectionDate: new FormControl<string>({ value: '', disabled: true }),
      lastRunDuration: new FormControl<number>({ value: 0, disabled: true }),
      lastConnectionSts: new FormControl<string>({ value: '', disabled: true }),
    });


    this.getDatasource();
  }

  ngOnInit() {
  }

  onTabClick() {

  }

  getDatasource(): void {
    // this.spinner.show();
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }

    // this.datasource_data = [
    //   {
    //     sysId: 'SYS-001',
    //     sysName: 'Process Monitoring System',
    //     sysType: 'Type 1',
    //     active: true,
    //     userId: 'user123',
    //     url: 'http://pms.example.com',
    //     operatingFacility: 'Riyadh Plant',
    //     lastConnectionDate: new Date('2025-09-10'),
    //     lastRunDuration: 125, // seconds
    //     lastConnectionSts: 'Success'
    //   },
    //   {
    //     sysId: 'SYS-002',
    //     sysName: 'Maintenance Tracking System',
    //     sysType: 'Type 2',
    //     active: false,
    //     userId: 'user456',
    //     url: 'http://mts.example.com',
    //     operatingFacility: 'Dhahran Refinery',
    //     lastConnectionDate: new Date('2025-09-05'),
    //     lastRunDuration: 300,
    //     lastConnectionSts: 'Failed'
    //   },
    //   {
    //     sysId: 'SYS-003',
    //     sysName: 'Energy Dashboard',
    //     sysType: 'Type 3',
    //     active: true,
    //     userId: 'user789',
    //     url: 'http://energy.example.com',
    //     operatingFacility: 'Jubail Facility',
    //     lastConnectionDate: new Date('2025-09-14'),
    //     lastRunDuration: 210,
    //     lastConnectionSts: 'Pending'
    //   }
    // ];

    this.datasource_data$ = this.dataSourceAdministrationService.getDataSource().pipe(
      map((res: any) => res?.dataSourceData || []),
      finalize(() => this.spinner.hide())
    );
  }

  mobileTabButtonChange(): void {

  }


  createDatasource(): void {
    // if (!(this.filterService.currentOrg)) {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an organization' });
    //   return;
    // }

    this.appRef = this.dialog.open(ManageDatasourceComponent, {
      header: 'Create Datasource',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Datasource created successfully', life: 3000 });
        this.getDatasource();
      }
    });
  }

  private formatDateSafe(value: any): string | null {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : this.datePipe.transform(date, 'mediumDate');
  }

  /**
* Patches the TagSend data to the updateSendForm
* @param {any} data - application data
* @returns {void} - returns nothing (i.e) void
*/
  patchDataSourceValue(data: any): void {
    console.log(data);
    this.updateDataSourceForm.patchValue({
      sysId: data.sysId,
      sysName: data.sysName,
      sysType: data.sysType,
      active: data.active,
      userId: data.userId,
      url: data.url,
      description: data.description,
      userJson: JSON.stringify(data.userJson),
      operatingFacility: data.operatingFacility,
      lastConnectionDate: this.formatDateSafe(data.lastConnectionDate),
      lastRunDuration: data.lastRunDuration,
      lastConnectionSts: data.lastConnectionSts,
    })
  }


  /**
 * Handles application selection from a table.
 * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
 */
  onDataSourceSelect(event: TableRowSelectEvent) {
    this.patchDataSourceValue(event.data);
    this.isShowDetails = true;
  }


  /**
 * Clears the table filter/search.
 * @param {Table} _t19 - The table reference whose filter should be cleared.
 */
  clearDatasourceTable(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  /**
 * Edits an existing DataSource.
 * @param {any} data - The datasource to be edited.
 */
  editDatasource(data: any) {
    if (this.updateDataSourceForm.valid) {
      const payload = {
        ...this.updateDataSourceForm.getRawValue()
      }
      this.dataSourceAdministrationService.putDataSource(payload, data._id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Updated successfully'
          });
          this.getDatasource();
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
  deleteDatasource(data: any) {
    this.dataSourceAdministrationService.deleteDataSource(data._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Deleted successfully'
        });
        this.getDatasource();
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



  getSeverity(status: boolean) {
    switch (status) {
      case true:
        return 'success';

      case false:
        return 'danger';
      default:
        return 'success'
    }
  }

  getStatus(status: boolean) {
    switch (status) {
      case true:
        return 'Active';

      case false:
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
    this.isShowDetails = false;
  }
}
