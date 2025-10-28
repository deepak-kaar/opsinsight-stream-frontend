import { Component, inject } from '@angular/core';
import { DatabaseAdministrationService } from './services/database-administration.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from 'primeng/dynamicdialog';
import { SystemFilterService } from './services/system/system-filter.service';

@Component({
  selector: 'app-database-administration',
  standalone: false,
  templateUrl: './database-administration.component.html',
  styleUrl: './database-administration.component.css'
})
export class DatabaseAdministrationComponent {
  /**
      * @property {databaseAdminService} databaseAdminService - Service to interact with the backend for fetching and managing activity.
      * @property {MessageService} messageService - Service to interact with the toast.
      * @property {NgxSpinnerService} spinner - Service to interact with the spinner.
      * @property {FilterService} filterService - Service to interact with the filter.
      */

  protected readonly databaseAdministrationService = inject(DatabaseAdministrationService);
  protected readonly messageService = inject(MessageService);
  protected readonly spinner = inject(NgxSpinnerService);
  protected readonly filterService = inject(SystemFilterService);
  protected readonly dialog = inject(DialogService);

  /**
   * @method showToast - Shows a toast notification.
   * @param {string} severity - The severity of the toast.
   * @param {string} summary - The summary of the toast.
   * @param {string} detail - The detail of the toast.
   * @param {boolean} sticky - Whether the toast should be sticky.
   */
  protected showToast(severity: string, summary: string, detail: string, sticky: boolean) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, sticky: sticky })
  }
}
