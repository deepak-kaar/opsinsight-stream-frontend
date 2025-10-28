import { Component, OnInit, inject } from '@angular/core';
import { ActivityEngineComponent } from '../../../activity-engine.component';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-manage-wfstep',
  standalone: false,
  templateUrl: './manage-wfstep.component.html',
  styleUrl: './manage-wfstep.component.css'
})
export class ManageWfstepComponent extends ActivityEngineComponent implements OnInit {

  fmDetail!: FormGroup
  public dialogConfig = inject(DynamicDialogConfig);
  protected ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);
  retryRules = ['No Retry', 'Retry', 'Retry Until Success'];
  runModes = ['RW', 'RM'];
  internalIps: any;
  // internalOps: any;

  ngOnInit(): void {
    if (this.dialogConfig?.data) {
      this.fmDetail = this.fb.group({
        retryRule: new FormControl<string>(''),
        runMode: new FormControl<string>(''),
        inputAttributes: this.dialogConfig?.data.inputAttrArray,
        outputAttributes: this.dialogConfig?.data.outputAttrArray
      })
      this.internalIps = this.dialogConfig?.data?.internalIp?.value;
      // this.internalOps = this.dialogConfig?.data?.internalOp?.value;
    }
  }

  get workflowIps(): FormArray {
    return this.fmDetail.get('inputAttributes') as FormArray;
  }

  get workflowOps(): FormArray {
    return this.fmDetail.get('outputAttributes') as FormArray;
  }

  onSubmit(): void {
    if (this.fmDetail.valid) {
      this.ref.close(this.fmDetail.value);
    }
  }

}
