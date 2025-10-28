import { Component, inject } from '@angular/core';
import { CorrelationEngineService } from './services/correlation-engine.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-correlation-engine',
  standalone: false,
  templateUrl: './correlation-engine.component.html',
  styleUrl: './correlation-engine.component.css'
})
export class CorrelationEngineComponent {

  protected readonly correlationService = inject(CorrelationEngineService);
  protected readonly messageService = inject(MessageService);
  protected readonly spinner = inject(NgxSpinnerService);

  protected showToast(severity: string, summary: string, detail: string, sticky: boolean) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, sticky: sticky })
  }
}
