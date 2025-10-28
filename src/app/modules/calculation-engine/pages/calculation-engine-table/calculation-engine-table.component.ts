import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { ManageCalculationEngineComponent } from '../../components/manage-calculation-engine/manage-calculation-engine.component';
import { CalculationEngineService } from '../../services/calculation-engine.service';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';
import { FilterEngineService } from '../../services/filter-engine.service';


@Component({
  selector: 'app-calculation-engine-table',
  standalone: false,
  templateUrl: './calculation-engine-table.component.html',
  styleUrl: './calculation-engine-table.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class CalculationEngineTableComponent {

  calculationData$!: Observable<any>;
  selectedCalculation: any;
  loading: unknown;
  searchValue: any;
  appRef!: DynamicDialogRef;
  private subscribe$ = new Subject<void>();
  showSelections: boolean = false;
  selectionOptions: string[] = ["Calculation Details", "Calculation Mapping", "Calculation Test Run"];
  selectedOption: string = this.selectionOptions[0];

  /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
   * Constructor injects necessary services.
   * @constructor
   * @param {OrganizationAdministrationService} orgAdminService - Service to interact with the backend for fetching and managing applications.
   * @param {DialogService} dialog - Primeng dialog Service to interact with dialog components.
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders.
   * @param {Router} router - Angular Router service to interact router,
   * @param {MessageService}  messageService - Primeng Message service to intearct with toast
   */

  constructor(
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private calculationEngineService: CalculationEngineService,
    private filterService: FilterEngineService) {
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getCalData();
      }
    })

    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getCalData();
      }
    })
  }

  ngOnInit(): void {
    this.getCalData()
  }

  getCalData(): void {
    this.spinner.show();
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }
    this.calculationData$ = this.calculationEngineService.getCalEngine(payload).pipe(
      finalize(() => this.spinner.hide())
    );
  }

  createApp(): void {
    if (!(this.filterService.currentApp)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an application' });
      return;
    }

    this.appRef = this.dialog.open(ManageCalculationEngineComponent, {
      header: 'Create Calculation',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Calculation Tempate created successfully', life: 3000 });
        this.getCalData();
      }
    });
  }


  onCalculationSelect(event: TableRowSelectEvent) {
    this.showSelections = true;
  }

  onCalculationUnSelect(event: TableRowSelectEvent) {
    this.showSelections = false;
  }

  clear(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  copyApp(_t59: any) {
    // TODO: Implement app copy logic
  }


  /**
   * Edits an existing application.
   * @param {any}app - The application data to be edited.
   */
  editApp(app: any) {
    this.appRef = this.dialog.open(ManageCalculationEngineComponent, {
      header: 'Edit App',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        rowData: app
      },
      // width: '800px',
      width: getResponsiveDialogWidth(),
    })
  }


  deleteApp(event: any, calculationId: string) {
    // this.confirmationService.confirm({
    //   target: event.target as EventTarget,
    //   message: 'Do you want to delete this App?',
    //   header: 'Danger Zone',
    //   icon: 'pi pi-info-circle',
    //   rejectLabel: 'Cancel',
    //   rejectButtonProps: {
    //     label: 'Cancel',
    //     severity: 'secondary',
    //     outlined: true,
    //   },
    //   acceptButtonProps: {
    //     label: 'Delete',
    //     severity: 'danger',
    //   },

    //   accept: () => {
    //     this.orgAdminService.deleteApp(appId).subscribe({
    //       next: (res: any) => {
    //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'App deleted successfully', life: 3000 });
    //         this.getApps();
    //       },
    //       error: (err) => {
    //         this.messageService.add({ severity: 'error', summary: 'Rejected', detail: err.error.response });
    //       }
    //     })
    //   },
    //   reject: () => {
    //     this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
    //   },
    // });
  }

  OnUpdateEmit(event: any) {
    this.getCalData();
  }

  ngOnDestroy(): void {
    this.subscribe$.next();
    this.subscribe$.complete();
  }
}
