import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { TableRowSelectEvent, Table } from 'primeng/table';
import { ManageAppComponent } from '../../components/dialogs/manage-app/manage-app.component';
import { OrganizationAdministrationService } from '../../organization-administration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageRoleComponent } from '../../components/dialogs/manage-role/manage-role.component';
import { MessageService } from 'primeng/api';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-roles',
  standalone: false,
  templateUrl: './roles-manager.component.html',
  styleUrl: './roles-manager.component.css',
  encapsulation: ViewEncapsulation.None
})
export class RolesManagerComponent implements OnInit {
  /**
   * @property {any[]} roles - Stores the list of roles fetched from the backend.
   */
  roles: any[] = [];

  /**
   * @property {any} selectedApp - Stores the currently selected application.
   */
  selectedRole: any;

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
   * @param {MessageService}  messageService - Primeng Message service to intearct with toast
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders
   */
  constructor(private orgAdminService: OrganizationAdministrationService,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private responsive: ResponsiveService
  ) {

  }

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * Fetches the list of applications from the backend.
   * @returns {void} - returns nothing i.e(void)
   */
  ngOnInit(): void {
    this.getRoles()
    this.isMobile$ = this.responsive.isMobile$()
  }

  /**
   * Fetches the list of applications from the backend and assigns it to the `roles` array.
   * calls the show method from spinner service to show the loader before getRoles method and hides after fetching.
   * @returns {void} - returns nothing i.e(void)
   */
  getRoles(): void {
    this.spinner.show();
    this.orgAdminService.getRoles({ roleLevel: 'OpsInsight', roleLevelId: null }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.roles = res.roles
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  /**
   * Opens the ManageRole Component with mode as create to create a role.
   * Subscribes the dialog close method and calls the getApp method to refresh the list of roles after creation.
   * @returns {void} - returns nothing (i.e) void
   */
  createRole(): void {
    this.appRef = this.dialog.open(ManageRoleComponent, {
      header: 'Create Role',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        roleLevel: 'OpsInsight'
      },
      // width: '800px',
      width:getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res.status)
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role created successfully', life: 3000 });
      this.getRoles();
    });
  }

  /**
   * Handles application selection from a table.
   * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
   */
  onRoleSelect($event: TableRowSelectEvent) {
    // TODO: Implement role selection logic
  }

  /**
   * Handles application deselection.
   */
  onRoleUnSelect() {
    // TODO: Implement role deselection logic
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
  copyRole(_t59: any) {
    // TODO: Implement role copy logic
  }

  /**
   * Edits an existing role.
   * @param {any}role - The role data to be edited.
   */
  editRole(role: any) {
    this.appRef = this.dialog.open(ManageRoleComponent, {
      header: 'Edit App',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        appData: role,
        roleLevel: 'OpsInsight'
      },
      // width: '800px',
      width:getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res.status)
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role updated successfully', life: 3000 });
      this.getRoles();
    });
  }

  /**
   * Deletes an existing role.
   * @param {string} roleId - The role id to be deleted.
   */
  deleteRole(roleId: string) {
    this.orgAdminService.deleteRole(roleId).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role deleted successfully', life: 3000 });
        this.getRoles();
      },
      error: (err) => {

      }
    })
  }
}
