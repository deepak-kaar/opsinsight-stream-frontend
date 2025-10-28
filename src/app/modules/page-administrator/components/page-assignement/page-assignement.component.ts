import { Component, Input, OnInit } from '@angular/core';
import { Assignment } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { PageAdministratorService } from '../../page-administrator.service';
import { OrganizationAdministrationService } from 'src/app/modules/organization-administration/organization-administration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-page-assignement',
  standalone: false,
  templateUrl: './page-assignement.component.html',
  styleUrl: './page-assignement.component.css'
})
export class PageAssignementComponent {
  clear(arg0: any) {
    throw new Error('Method not implemented.');
  }
  @Input() app!: string;
  @Input() org!: string;
  @Input() reportType!: string;
  availablePages: Assignment[] = [{
    id: '',
    name: 'Manifa Report',
    description: 'Report for manifa reporting app'
  }];
  selectedPages: any;

  assignedPages: Assignment[] = [{
    id: '',
    name: 'Crude Oil Data',
    description: 'Crude Oil Data Update'
  }]
  unSelectedPages: any
  searchValue: any;
  roles: any[] = [];
  /**
    * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
    */
  isMobile$!: Observable<boolean>;

  constructor(private pageAdminService: PageAdministratorService,
    private orgAdminService: OrganizationAdministrationService,
    private spinner: NgxSpinnerService,
  private responsive: ResponsiveService) {

  }
  ngOnInit() {
    this.getRoles();
    this.isMobile$ = this.responsive.isMobile$()
  }

  ngOnChanges() {
    console.log(this.app)
    this.getRoles();
  }

  getRoles() {
    if (this.app) {
      this.spinner.show();
      this.orgAdminService.getRoles({ level: this.app }).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.roles = res.roles
        },
        error: (err) => {
          this.spinner.hide();
        }
      })
    }
  }
}
