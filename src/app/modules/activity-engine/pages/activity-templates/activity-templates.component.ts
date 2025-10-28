import { Component } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, Subject, takeUntil, finalize } from 'rxjs';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ActivityEngineComponent } from '../../activity-engine.component';
import { ManageActivityTemplateComponent } from '../../components/dialogs/manage-activity-template/manage-activity-template.component';

@Component({
  selector: 'app-activity-templates',
  standalone: false,
  templateUrl: './activity-templates.component.html',
  styleUrl: './activity-templates.component.css'
})
export class ActivityTemplatesComponent extends ActivityEngineComponent {
  templatesData$!: Observable<any>;
  selectedCalculation: any;
  loading: unknown;
  searchValue: any;
  appRef!: DynamicDialogRef;
  private subscribe$ = new Subject<void>();
  showSelections: boolean = false;
  selectionOptions: string[] = ["Template Details", "Template Mapping", "Template Test Run"];
  selectedOption: string = this.selectionOptions[0];

  /**
   * calls
   */
  constructor() {
    super()
    console.log("test");
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getTemplatesData();
      }
    })
    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getTemplatesData();
      }
    })
  }

  /**
   * @method ngOnInit - Angular life cycle method
   * @returns void
   */
  ngOnInit(): void {
    this.getTemplatesData()
  }

  /**
   * @method getFmData
   * 
   */
  getTemplatesData(): void {
    this.spinner.show();
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }
    this.templatesData$ = this.activityService.getTemplates(payload).pipe(
      finalize(() => this.spinner.hide())
    );
  }

  createStep(): void {
    // if (!(this.filterService.currentApp)) {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an application' });
    //   return;
    // }

    // this.appRef = this.dialog.open(ManageActivityTemplateComponent, {
    //   header: 'Create Activity Template',
    //   modal: true,
    //   closable: true,
    //   data: {
    //     mode: 'create'
    //   },
    //   width: getResponsiveDialogWidth(),
    // })

    this.router.navigate(['activityEngine/home/createActivityTemplate']);

    // this.appRef.onClose.subscribe((res: any) => {
    //   if (res?.status) {
    //     this.showToast('success', 'Success', 'Activity Template created successfully', false, 3000);
    //     this.getTemplatesData();
    //   }
    // });
  }


  onCalculationSelect(event: any) {
    this.showSelections = true;
  }

  onCalculationUnSelect(event: any) {
    this.showSelections = false;
  }

  clear(_t19: any) {
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
    this.appRef = this.dialog.open(ManageActivityTemplateComponent, {
      header: 'Edit Template',
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
    this.getTemplatesData();
  }

  ngOnDestroy(): void {
    this.subscribe$.next();
    this.subscribe$.complete();
  }
}
