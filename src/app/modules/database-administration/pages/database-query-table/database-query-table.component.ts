import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatabaseAdministrationComponent } from '../../database-administration.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { ManageQueryComponent } from '../../components/manage-query/manage-query.component';

@Component({
  selector: 'app-database-query-table',
  standalone: false,
  templateUrl: './database-query-table.component.html',
  styleUrl: './database-query-table.component.css'
})
export class DatabaseQueryTableComponent extends DatabaseAdministrationComponent implements OnInit, OnDestroy {

  isShowMappingTable: boolean = false;

  appRef!: DynamicDialogRef;

  private subscribe$ = new Subject<void>();

  /**
 * @property {any} searchDBQueryValue - Stores the search input value for filtering applications.
 */
  searchDBQueryValue: any;


  /**
 * @property {unknown} iSDBQueryloading - Indicates the loading state (can be replaced with a boolean for better clarity).
 */
  iSDBQueryloading: unknown;

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
* @property {Observable<any>} db_query_data - Stores the list of data source fetched from the backend.
*/
  db_query_data$!: Observable<any>;

  selectedDBQuery: any; // store selected Receive row data

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


  /**
 * Constructor injects necessary services.
 * @constructor
 */
  constructor() {
    super();
    this.filterService.selectedSystem$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        console.log("event occured:",event);
        this.getDBQuery();
      }
    });
    this.getDBQuery();
  }

  ngOnInit() {
  }

  getDBQuery(): void {
    // this.spinner.show();

    this.db_query_data$ = of([
      {
        sysId: 'SYS-001',
        query: 'query1',
        queryId: 'Q-001',
        sysName: 'Process Monitoring System',
        description: 'query Description 1',
        queryLanguage: 'sql'
      },
      {
        sysId: 'SYS-002',
        query: 'query2',
        queryId: 'Q-002',
        sysName: 'Maintenance Tracking System',
        description: 'query Description 2',
        queryLanguage: 'sql'
      },
      {
        sysId: 'SYS-003',
        query: 'query3',
        queryId: 'Q-003',
        sysName: 'Energy Dashboard',
        description: 'query Description 3',
        queryLanguage: 'sql'
      }
    ]);


    // this.database_data$ = this.databaseAdministrationService.getDatabase().pipe(
    //   map((res: any) => res?.dataBaseData || []),
    //   finalize(() => this.spinner.hide())
    // );
  }

  mobileTabButtonChange(): void {

  }


  createDBQuery(): void {
    // if (!(this.filterService.currentOrg)) {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an organization' });
    //   return;
    // }

    this.appRef = this.dialog.open(ManageQueryComponent, {
      header: 'Create Query',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Query created successfully', life: 3000 });
        this.getDBQuery();
      }
    });
  }


  onDBQuerySelect(event: TableRowSelectEvent) {
    this.isShowMappingTable = true;
  }

  /**
 * Clears the table filter/search.
 * @param {Table} _t19 - The table reference whose filter should be cleared.
 */
  clearDBQueryTable(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  /**
 * Edits an existing Database query.
 * @param {any} data - The database query to be edited.
 */
  editDBQuery(data: any) {
    this.appRef = this.dialog.open(ManageQueryComponent, {
      header: 'Edit Query',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        queryData: data
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Query edited successfully', life: 3000 });
        this.getDBQuery();
      }
    });
  }

  /**
   * Deletes an existing application.
   * opens an confirmation popup using primeng Confirmation service
   * Opens the toast by using primeng message sevice and shows the message
   * @param {any} data - The application data to be deleted.
   */
  deleteDBQuery(data: any) {
    // this.databaseAdministrationService.deleteDBQuery(data._id).subscribe({
    //   next: () => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Deleted',
    //       detail: 'Deleted successfully'
    //     });
    //     this.getDBQuery();
    //   },
    //   error: () => {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Error',
    //       detail: 'Failed to delete'
    //     });
    //   }
    // });
  }

  /**
  * Lifecycle hook triggered after the time of component destroy.
  * unsubscribes the filter subscriptions
  */
  ngOnDestroy() {
    this.isShowMappingTable = false;
  }
}
