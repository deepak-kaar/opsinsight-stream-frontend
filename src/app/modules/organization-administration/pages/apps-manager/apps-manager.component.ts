import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableRowSelectEvent } from 'primeng/table';
import { Table } from 'primeng/table';
import { OrganizationAdministrationService } from 'src/app/modules/organization-administration/organization-administration.service';
import { ManageAppComponent } from 'src/app/modules/organization-administration/components/dialogs/manage-app/manage-app.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { PostLogsComponent } from '../../components/dialogs/post-logs/post-logs.component';

/**
 * @component
 * @description
 * The `AppsManagerComponent` is responsible for managing applications in the organization administration module.
 * It retrieves the list of applications, allows selection, creation, editing, and deletion of applications.
 */
@Component({
  selector: 'app-app-manager',
  standalone: false,
  templateUrl: './apps-manager.component.html',
  styleUrl: './apps-manager.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppsManagerComponent implements OnInit {

  /**
  * @property {any[]} apps - Stores the list of applications fetched from the backend.
  */
  apps: any[] = [];

  /**
   * @property {any} selectedApp - Stores the currently selected application.
   */
  selectedApp: any;

  /**
   * @property {unknown} loading - Indicates the loading state (can be replaced with a boolean for better clarity).
   */
  loading: unknown;

  /**
   * @property {any} searchValue - Stores the search input value for filtering applications.
   */
  searchValue: any;

  /**
   * @property {DynamicDialogRef} appRef - Reference to the dynamic dialog used for displaying application-related dialogs.
   * It helps in opening, closing, and managing the dialog state dynamically.
   */
  appRef!: DynamicDialogRef;

  /**
   * @property {DynamicDialogRef} logRef - Reference to the dynamic dialog used for displaying application-related dialogs.
   * It helps in opening, closing, and managing the dialog state dynamically.
   */
  logRef!: DynamicDialogRef;

  /**
   * @property {boolean} isOpsAdmin - stores the boolean value.
   * It helps to hide the create App and roles segment for appAdmins.
   */
  isOpsAdmin: boolean = false;

  /**
   * @property {string} url - stores the url path.
   * It helps to hide the create App and roles segment for appAdmins.
   */
  url: string = '';

  /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;


  /**
   * Constructor injects necessary services.
   * @constructor
   * @param {OrganizationAdministrationService} orgAdminService - Service to interact with the backend for fetching and managing applications.
   * @param {DialogService} dialog - Primeng dialog Service to interact with dialog components.
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders.
   * @param {Router} router - Angular Router service to interact router,
   * @param {MessageService}  messageService - Primeng Message service to intearct with toast
   */
  constructor(private orgAdminService: OrganizationAdministrationService,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private responsive: ResponsiveService) {
    this.url = this.router.url.split('/')[2];
    if (this.url === 'opsAdmin') {
      this.isOpsAdmin = true;
    }
  }

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * Fetches the list of applications from the backend.
   * @returns {void} - returns nothing i.e(void)
   */
  ngOnInit(): void {
    this.getApps()
    this.isMobile$ = this.responsive.isMobile$()
  }

  /**
   * Fetches the list of applications from the backend and assigns it to the `apps` array.
   * @returns {void} - returns nothing i.e(void)
   */
  getApps(): void {
    this.spinner.show();
    this.orgAdminService.getApps().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.apps = res.apps
      },
      error: (err) => {
        this.spinner.hide();
        if (err.error.token === '404' && err.error.response === 'Apps not found')
          this.apps = []
      }
    })
  }


  postLogs() {
    this.logRef = this.dialog.open(PostLogsComponent,{
      modal:true,
      header:'Post Logs',
      closable: true
    })
  }

  /**
   * Opens the ManageApp Component with mode as create to create an application.
   * Subscribes the dialog close method and calls the getApp method to refresh the list of apps after creation.
   * @returns {void} - returns nothing (i.e) void
   */
  createApp(): void {
    this.appRef = this.dialog.open(ManageAppComponent, {
      header: 'Create App',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      // width: '800px',
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'App created successfully', life: 3000 });
        this.getApps();
      }
    });
  }

  /**
   * Handles application selection from a table.
   * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
   */
  onAppSelect(app: TableRowSelectEvent) {

    this.router.navigate(['orgAdmin/appAdmin/home/appDetail', app?.data?.appId], { state: { appName: app?.data?.appName } })
    // const url = this.router.serializeUrl(
    //   this.router.createUrlTree(['orgAdmin/appDetail', app?.data?.appId], {
    //     queryParams: { appName: app?.data?.appName }
    //   })
    // );

    // window.open(url, '_self');
  }


  /**
   * Clears the table filter/search.
   * @param {Table} _t19 - The table reference whose filter should be cleared.
   */
  clear(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  /**
   * Copies an existing application.
   * @param {any} _t59 - The application data to be copied.
   */
  copyApp(_t59: any) {
    // TODO: Implement app copy logic
  }

  /**
   * Edits an existing application.
   * @param {any}app - The application data to be edited.
   */
  editApp(app: any) {
    this.appRef = this.dialog.open(ManageAppComponent, {
      header: 'Edit App',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        appData: app
      },
      // // width: '800px',
      width: getResponsiveDialogWidth(),

    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res.status)
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'App updated successfully', life: 3000 });
      this.getApps();
    });
  }

  /**
   * Deletes an existing application.
   * opens an confirmation popup using primeng Confirmation service
   * Opens the toast by using primeng message sevice and shows the message
   * @param {string} appId - The application data to be deleted.
   */
  deleteApp(event: any, appId: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this App?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },

      accept: () => {
        this.orgAdminService.deleteApp(appId).subscribe({
          next: (res: any) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'App deleted successfully', life: 3000 });
            this.getApps();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Rejected', detail: err.error.response });
          }
        })
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      },
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'active':
        return 'success';

      case 'inactive':
        return 'danger';
      default:
        return 'success'
    }
  }

  getStatus(status: string) {
    switch (status) {
      case 'active':
        return 'Active';

      case 'inactive':
        return 'Inactive';
      default:
        return 'success'
    }
  }
}
