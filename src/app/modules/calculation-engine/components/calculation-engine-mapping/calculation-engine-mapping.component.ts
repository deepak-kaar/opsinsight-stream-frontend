import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CalculationEngineService } from '../../services/calculation-engine.service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CalculationEngineMappingModalComponent } from '../calculation-engine-mapping-modal/calculation-engine-mapping-modal.component';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Table } from 'primeng/table';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-calculation-engine-mapping',
  standalone: false,
  templateUrl: './calculation-engine-mapping.component.html',
  styleUrl: './calculation-engine-mapping.component.css'
})
export class CalculationEngineMappingComponent implements OnChanges {
  flags: any;
  searchValue: any;
  @Input() template: any;
  mappings: any;
  visible: boolean = false;
  showResult: boolean = false;
  templateData: any;
  testDate: any;
  resultData: any;


  appRef!: DynamicDialogRef;
  /**
  * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
  */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  constructor(private fb: FormBuilder, private messageService: MessageService,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private calculationEngService: CalculationEngineService,
  ) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getMappings();
  }

  confirm(template: any) {
    this.templateData = template
    this.visible = true;
  }

  getMappings() {
    this.calculationEngService.getCalcMappings({ templateId: this.template.calculationId }).subscribe({
      next: (res: any) => {
        this.mappings = res.calculationMapping;
      },
      error: (err: any) => {
      }
    })
  }

  createAttributeTemplate() {
    this.appRef = this.dialog.open(CalculationEngineMappingModalComponent, {
      header: 'Create Attribute Template Mapping',
      modal: true,
      closable: true,
      maximizable: true,
      data: {
        template: this.template,
        mode: 'create',
        appData: {
          appId: this.template.appId,
          orgId: this.template.orgId
        }
      },
      width: '95rem'
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status === 200) {
        this.getMappings();
      }
    });
  }

  applyFilterGlobal($event: any, arg1: any) {
    throw new Error('Method not implemented.');
  }
  openMapping(template: any) {
    this.appRef = this.dialog.open(CalculationEngineMappingModalComponent, {
      header: 'Create Attribute Template Mapping',
      modal: true,
      closable: true,
      maximizable: true,
      data: {
        template: template,
        mode: 'edit',
        appData: {
          appId: this.template.appId,
          orgId: this.template.orgId
        }
      },
      width: '95rem'
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status === 200) {
        this.getMappings();
      }
    });
  }
  clear(_t17: any) {
    throw new Error('Method not implemented.');
  }

  run() {
    this.spinner.show();
    if (!this.templateData)
      return;
    const changedAttributes: Record<string, string> = {};
    Object.keys(this.templateData.inputAttributeList).forEach(key => {
      const [id, suffix] = key.split("_");
      changedAttributes[id] = suffix;
    });
    const payload = {
      changedAttributes,
      triggeredDate: new Date(this.testDate).toISOString()
    }
    this.calculationEngService.runCalc(payload).subscribe(({
      next: (res: any) => {
        this.showResult = true
        this.resultData = res.executedCalculations[0].result
        console.log(this.resultData);
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
      }
    }))
  }
  closeRun() {
    this.showResult = false;
    this.visible = !this.visible
  }


}