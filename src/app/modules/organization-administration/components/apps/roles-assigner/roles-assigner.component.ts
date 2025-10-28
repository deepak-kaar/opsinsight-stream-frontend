import { Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from 'primeng/dynamicdialog';
import { Assignment } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { OrganizationAdministrationService } from '../../../organization-administration.service';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-roles-assigner',
  standalone: false,
  templateUrl: './roles-assigner.component.html',
  styleUrl: './roles-assigner.component.css'
})
export class RolesAssignerComponent {

  /**
   * @property {any[]} orgs - Stores the list of applications fetched from the backend.
   */
  orgs: any[] = [];

  /**
   * @property {any[]} roles - Stores the list of roles fetched from the backend.
   */
  roles: any[] = [];
  
   /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
   isMobile$!: Observable<boolean>;

  @Input() appId!: string;

  availablePages: Assignment[] = [{
    id: '',
    name: 'Manifa Report',
    description: 'Report for manifa reporting app'
  }];
  selectedPages: any;

  assignedPages: any[] = []
  unSelectedPages: any
  searchValue: any;
  org: any;

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
 * @param {Router} router - Angular Router service to interact router
 * @param {FormBuilder} fb - Form builder service for handling reactive forms.
 */
  constructor(private orgAdminService: OrganizationAdministrationService,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
  private responsive: ResponsiveService) {
  }

  ngOnInit() {
    this.getOrgs();
    this.getRoles();
    this.isMobile$ = this.responsive.isMobile$()
  }

  /**
   * Fetches the list of applications from the backend and assigns it to the `orgs` array.
   * @returns {void} - returns nothing i.e(void)
   */
  getOrgs(): void {
    this.spinner.show();
    this.orgAdminService.getOrgsByApp(this.appId).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.orgs = res.orgs
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  /**
 * Fetches the list of applications from the backend and assigns it to the `roles` array.
 * calls the show method from spinner service to show the loader before getRoles method and hides after fetching.
 * @returns {void} - returns nothing i.e(void)
 */
  getRoles(): void {
    this.spinner.show();
    this.orgAdminService.getRoles({ level: this.appId }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.roles = res.roles.map((role: any) => ({
          roleId: role.roleId,
          roleName: role.roleName,
          roleDescription: role.roleDescription
        }))
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  assignRoles() {
    if (this.org)
      if (!this.assignedPages) {
        this.assignedPages = [];
        this.assignedPages.push(...this.selectedPages);
      }

      else
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please choose an organization", life: 3000 });
  }

  onOrgChange(value: any) {
    this.getOrgDetails(value)
  }
  clear(arg0: any) {
    throw new Error('Method not implemented.');
  }

  saveAssigned() {
    if (this.org && this.assignedPages.length > 0) {
      const payload = {
        orgId: this.org,
        roleId: this.assignedPages
      }
      this.orgAdminService.updateOrgRoles(payload).subscribe({
        next: (res: any) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: "Roles Assigned successfully ", life: 3000 });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While updating the roles", life: 3000 });
        }
      })
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please choose an organization", life: 3000 });
    }
  }

  getOrgDetails(orgId: string) {
    this.orgAdminService.getOrgDetails(orgId).subscribe({
      next: (res: any) => {
        this.assignedPages = res?.orgJson[0]?.roleId
      },
      error: (err) => {

      }
    })
  }

  deleteAssigned() {
    this.assignedPages = this.assignedPages.filter(
      (item1: any) => !this.unSelectedPages.some((item2: any) => item2.roleId === item1.roleId)
    );
  }
}
