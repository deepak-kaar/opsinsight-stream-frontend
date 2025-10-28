import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, Subject, finalize, takeUntil } from 'rxjs';
import { ActivityEngineComponent } from '../../activity-engine.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ManageActivityFmComponent } from '../../components/dialogs/manage-activity-fm/manage-activity-fm.component';

@Component({
  selector: 'app-function-models',
  standalone: false,
  templateUrl: './function-models.component.html',
  styleUrl: './function-models.component.css'
})
export class FunctionModelsComponent extends ActivityEngineComponent implements OnInit {
  fmData$!: Observable<any>;
  selectedCalculation: any;
  loading: unknown;
  searchValue: any;
  appRef!: DynamicDialogRef;
  private subscribe$ = new Subject<void>();

  /**   
   * calls the super constructor and subscribes to the app and org filters.
   */
  constructor() {
    super()
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getFmData();
      }
    })
    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getFmData();
      }
    })
  }

  /**
   * @method ngOnInit - Angular life cycle method
   * @returns void
   */
  ngOnInit(): void {
    this.getFmData()
  }

  /**
   * @method getFmData
   * Fetches the list of function models.
   * @returns void
   */
  getFmData(): void {
    this.spinner.show();
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }
    this.fmData$ = this.activityService.getFunctionModels(payload).pipe(
      finalize(() => this.spinner.hide())
    );
  }

  /**
   * @method createStep
   * Creates a function model.
   * @returns void
   */
  createStep(): void {
    if (!(this.filterService.currentApp)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an application' });
      return;
    }

    this.appRef = this.dialog.open(ManageActivityFmComponent, {
      header: 'Create Activity Step',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.showToast('success', 'Success', 'Activity Function Model created successfully', false, 3000);
        this.getFmData();
      }
    });
  }


  /**
   * @method onCalculationSelect
   * Selects a function model.
   * @returns void
   */
  onCalculationSelect(event: any) {
    this.appRef = this.dialog.open(ManageActivityFmComponent, {
      header: 'Function Model Details',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        rowData: event.data
      },
    })
    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.showToast('success', 'Success', 'Activity Function Model details fetched successfully', false, 3000);
      }
    });
  }

  /**
   * @method onCalculationUnSelect
   * Unselects a function model.
   * @returns void
   */
  onCalculationUnSelect(event: any) {

  }

  /**
   * @method clear
   * Clears the table.
   * @returns void
   */
  clear(_t19: any) {
    // TODO: Implement table clearing logic
  }

  /**
   * @method copyApp
   * Copies a function model.
   * @returns void
   */
  copyApp(_t59: any) {
    // TODO: Implement app copy logic
  }


  /**
   * Edits an existing application.
   * @param {any}app - The application data to be edited.
   * @returns void
   */
  editApp(app: any) {
    this.appRef = this.dialog.open(ManageActivityFmComponent, {
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


  /**
   * @method deleteApp
   * Deletes a function model.
   * @returns void
   */
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

  /**
   * @method OnUpdateEmit
   * Updates a function model.
   * @returns void
   */
  OnUpdateEmit(event: any) {
    this.getFmData();
  }

  /**
   * @method ngOnDestroy
   * Destroys the component.
   * @returns void
   */
  ngOnDestroy(): void {
    this.subscribe$.next();
    this.subscribe$.complete();
  }
}
