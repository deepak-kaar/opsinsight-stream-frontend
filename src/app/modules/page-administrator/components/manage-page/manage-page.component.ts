import { Component, Input, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { ReportTypes } from '../../interfaces/page-administrator';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PageAdministratorService } from '../../page-administrator.service';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-manage-page',
  standalone: false,
  templateUrl: './manage-page.component.html',
  styleUrl: './manage-page.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ManagePageComponent {
  @Input() app!: string;
  @Input() org!: string;
  @Input() reportType!: string;
  loading: unknown;
  showDetails: boolean = false;
  tabActions = ['Page Manager', 'Role Page Assignment', 'Page Assignment']
  selectedTab: any;
  classifications = [
    "Confidential",
    "Company Use",
    "General Use"
  ]

  reportDetails: any[] = [];
  private isFirstChange = true;
  reportVersions: any[] = [];
  pages: any[] = [];
  selectedPage: any;
  searchValue: any;
  statuses: any[] = [];
  values: any;
  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  constructor(private router: Router, private messageService: MessageService, private pageadminService: PageAdministratorService, private responsive: ResponsiveService) {
    this.selectedTab = this.tabActions[0]
  }
  ngOnInit() {
    this.isMobile$ = this.responsive.isMobile$()
  }


  /**
 * Called when any data-bound input property changes, excluding the first change.
 *
 * This lifecycle hook filters out the initial change and only executes logic
 * for subsequent updates to the `someInput` input property.
 *
 * @param changes - A map of changed input properties with their current and previous values.
 */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.isFirstChange) {
      this.isFirstChange = false;
      return;
    }
    else {
      this.getPages();
    }
  }


  getPages() {
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org }),
      ...(this.reportType && { templateType: this.reportType })
    };
    this.pageadminService.getIdt(payload).subscribe({
      next: (res: any) => {
        this.pages = res.idtList
      },
      error: (err) => {

      }
    })
  }

  onTabClick() {
  }
  deletePage(page: any) {

  }
  editPage(page: any) {
  }
  copyPage(page: any) {

  }
  clear(table: Table) {

  }
  onPageSelect(page: TableRowSelectEvent) {
    this.showDetails = true;
    this.getPageVersions(page.data.templateId);
  }
  onPageUnSelect(page: TableRowSelectEvent) {
    this.reportDetails.pop();
    this.showDetails = false;
  }

  openPageBuilder() {
    if (this.app) {
      this.router.navigateByUrl('/pageAdmin/pageBuilder', { state: { appId: this.app, orgId: this.org, reportType: this.reportType } })
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an application' });
    }
  }

  getPageVersions(pageId: string) {
    this.pageadminService.getIdtVersions({ templateId: pageId }).subscribe({
      next: (res: any) => {
        this.reportDetails.pop();
        this.reportDetails.push(res.reportDetails);
        this.reportVersions = res.pageVersions;
      },
      error: (err) => {

      }
    })
  }
}
