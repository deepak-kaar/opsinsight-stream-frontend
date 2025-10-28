import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { ActivityEngineComponent } from '../../../activity-engine.component';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ManageWfstepComponent } from '../manage-wfstep/manage-wfstep.component';

@Component({
  selector: 'app-manage-activity-template',
  standalone: false,
  templateUrl: './manage-activity-template.component.html',
  styleUrl: './manage-activity-template.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ManageActivityTemplateComponent extends ActivityEngineComponent implements OnInit {


  private fb = inject(FormBuilder);
  private datapointAdminService = inject(DatapointAdministrationService)
  private dialogRef!: DynamicDialogRef;

  templateForm!: FormGroup;
  editorOptions = {
    theme: 'vs-dark', language: 'javascript',
    automaticLayout: true
  };
  fmData$!: Observable<any>;
  typeOptions: { [key: number]: any[] } = {};
  ttypeOptions: { [key: number]: any[] } = {};
  tattributesOptions: { [key: number]: any[] } = {};
  attributesOptions: { [key: number]: any[] } = {};
  outputtypeOptions: { [key: number]: any[] } = {};
  outputattributesOptions: { [key: number]: any[] } = {};
  stepTypes: string[] = ['Normal', 'Control']
  appData = {};
  types = ['Entity', 'Instance', 'Tags']

  retryRules = ['No Retry', 'Retry', 'Retry Until Success'];
  runModes = ['RW', 'RM'];
  dataTypes = ['Double', 'String', 'Boolean', 'Integer', 'Date'];

  ngOnInit(): void {
    this.templateForm = this.fb.group({
      templateName: new FormControl('', Validators.required),
      templateDesc: new FormControl(''),
      workflowSteps: this.fb.array([], Validators.required),
      internalJsonSchema: this.fb.array([]),
    });
    this.addWorkflowStep();
    this.getFmData();
    this.addWorkflowIp();
  }

  /** Workflow Steps getter */
  get workflowSteps(): FormArray {
    return this.templateForm.get('workflowSteps') as FormArray;
  }

  get workflowIps(): FormArray {
    return this.templateForm.get('internalJsonSchema') as FormArray;
  }


  addWorkflowIp() {
    this.workflowIps.push(
      this.fb.group({
        ipName: [''],
        type: [''],
        isRequired: ['']
      })
    );
  }


  /** Add workflow step */
  addWorkflowStep() {
    this.workflowSteps.push(
      this.fb.group({
        activityName: ['', Validators.required],
        order: [this.workflowSteps.length + 1],
        activitySteps: this.fb.array([]),
      })
    );

    this.addActivityStep(this.workflowSteps.length - 1);
  }

  /** Remove workflow step */
  removeWorkflowStep(index: number) {
    this.workflowSteps.removeAt(index);
  }

  /** Activity Steps getter */
  getActivitySteps(stepIndex: number): FormArray {
    return this.workflowSteps.at(stepIndex).get('activitySteps') as FormArray;
  }

  /** Add activity step */
  addActivityStep(stepIndex: number) {
    this.getActivitySteps(stepIndex).push(
      this.fb.group({
        stepName: ['', Validators.required],
        stepDesc: [''],
        retryRule: [''],
        stepType: ['Normal'],
        stepOrder: [''],
        stepLogic: [''],
        runMode: [''],
        functionModel: ['', Validators.required],
        functionId: [''],
        functionName: [''],
        functionType: [''],
        inputJsonSchema: this.fb.array([]),
        outputJsonSchema: this.fb.array([]),
      })
    );
  }

  /** Remove activity step */
  removeActivityStep(stepIndex: number, actIndex: number) {
    this.getActivitySteps(stepIndex).removeAt(actIndex);
  }

  /** Input Attributes getter */
  getInputAttributes(stepIndex: number, actIndex: number): FormArray {
    return this.getActivitySteps(stepIndex)
      .at(actIndex)
      .get('inputJsonSchema') as FormArray;
  }

  getOutputAttributes(stepIndex: number, actIndex: number): FormArray {
    return this.getActivitySteps(stepIndex)
      .at(actIndex)
      .get('outputJsonSchema') as FormArray;
  }

  /** When function model changes */
  onFunctionModelChange(stepIndex: number, actIndex: number, fm: any) {

    const attrs = fm?.inputJsonSchema.properties ?? [];
    const attrs1 = fm?.outputJsonSchema.properties ?? [];
    const inputAttrArray = this.getInputAttributes(stepIndex, actIndex);
    const outputAttrArray = this.getOutputAttributes(stepIndex, actIndex);
    inputAttrArray.clear();

    attrs.forEach((attr: any, index: number) => {
      const row = this.fb.group({
        name: [attr.name],
        type: [attr.type],
        value: [''],
      });

      row.get('mapType')?.valueChanges.subscribe((selectedType: any) => {
        this.onTypeChange(selectedType, index, 'input', stepIndex, actIndex);
      });

      row.get('typeName')?.valueChanges.subscribe((selectedType: any) => {
        this.onTypeNameChange(selectedType, index, 'input', stepIndex, actIndex);
      });
      inputAttrArray.push(row);
    });

    attrs1.forEach((attr: any, index: number) => {
      const row = this.fb.group({
        name: [attr.name],
        type: [attr.type],
        value: [''],
      });

      row.get('mapType')?.valueChanges.subscribe((selectedType: any) => {
        this.onTypeChange(selectedType, index, 'input', stepIndex, actIndex);
      });

      row.get('typeName')?.valueChanges.subscribe((selectedType: any) => {
        this.onTypeNameChange(selectedType, index, 'input', stepIndex, actIndex);
      });
      outputAttrArray.push(row);
    });
  }

  /** Fetch function models from API */
  getFmData(): void {
    let payload = {};
    this.fmData$ = this.activityService.getFunctionModels(payload).pipe(
      finalize(() => this.spinner.hide())
    );
  }

  onSubmit() {
    if (this.templateForm.valid) {
      console.log(this.templateForm.value);
    }
  }


  onTypeChange(selectedType: string, rowIndex: number, type: string, stepIndex: number, actIndex: number) {
    // Clear current selections when type changes
    const currentRow = type === 'input' ? this.getInputAttributes(stepIndex, actIndex).at(rowIndex) : this.getOutputAttributes(stepIndex, actIndex).at(rowIndex);
    const isInitialLoad = currentRow.get('type')?.value === selectedType &&
      (currentRow.get('attribute')?.value || currentRow.get('frequency')?.value);

    if (!isInitialLoad) {
      currentRow.get('attribute')?.setValue(null);
      currentRow.get('frequency')?.setValue(null);
    }


    // Make API call based on selected type
    switch (selectedType) {
      case 'Entity':
        this.loadEntityOptions(rowIndex, type);
        break;
      case 'Instance':
        this.loadInstanceOptions(rowIndex, type);
        break;
      case 'Tags':
        this.loadTagsOptions(rowIndex, type);
        break;
      default:
        this.typeOptions[rowIndex] = [];
    }
  }

  onTypeNameChange(selectedType: any, rowIndex: number, iotype: string, stepIndex: number, actIndex: number) {
    // Clear current selections when type changes
    const currentRow = iotype === 'input' ? this.getInputAttributes(stepIndex, actIndex).at(rowIndex) : this.getOutputAttributes(stepIndex, actIndex).at(rowIndex);
    const type = currentRow.get('mapType')?.value;
    // Make API call based on selected type
    switch (type) {
      case 'Entity':
        this.getEntityAttr(rowIndex, selectedType.id, iotype)
        break;
      case 'Instance':
        this.getInstanceAttr(rowIndex, selectedType.id, iotype)
        break;
      default:
        this.attributesOptions[rowIndex] = [];
    }
  }

  private loadEntityOptions(rowIndex: number, type: string) {
    // API call for Entity type
    this.datapointAdminService.getEntityList(this.appData).subscribe({
      next: (res) => {
        if (type === 'input')
          this.typeOptions[rowIndex] = res.Entity_Attributes.map((res: any) => ({
            name: res.entityName,
            id: res.entityId
          }));
        else if (type === 'trigger')
          this.ttypeOptions[rowIndex] = res.Entity_Attributes.map((res: any) => ({
            name: res.entityName,
            id: res.entityId
          }));
        else if (type === 'output')
          this.outputtypeOptions[rowIndex] = res.Entity_Attributes.map((res: any) => ({
            name: res.entityName,
            id: res.entityId
          }));
      },
      error: (error) => {
        console.error('Error loading entity attributes:', error);
        this.typeOptions[rowIndex] = [];
        if (type === 'output')
          this.outputtypeOptions[rowIndex] = [];
      }
    });
  }

  private loadInstanceOptions(rowIndex: number, type: string) {
    // API call for Instance type
    this.datapointAdminService.getInstanceList(this.appData).subscribe({
      next: (res) => {
        if (type === 'input')
          this.typeOptions[rowIndex] = res.Instances.map((res: any) => ({
            name: res.instanceName,
            id: res.instanceId
          }));
        else if (type === 'output')
          this.outputtypeOptions[rowIndex] = res.Instances.map((res: any) => ({
            name: res.instanceName,
            id: res.instanceId
          }));
      },
      error: (error) => {
        console.error('Error loading instance attributes:', error);
        this.typeOptions[rowIndex] = [];
        if (type === 'output')
          this.outputtypeOptions[rowIndex] = [];
      }
    });
  }

  private loadTagsOptions(rowIndex: number, type: string) {
    this.datapointAdminService.getAttrList(this.appData).subscribe({
      next: (res) => {
        if (type === 'input')
          this.attributesOptions[rowIndex] = res[0].attributes.map((res: any) => ({
            name: res.attributeName,
            id: res.attributeId
          }));
        else if (type === 'trigger')
          this.tattributesOptions[rowIndex] = res[0].attributes.map((res: any) => ({
            name: res.attributeName,
            id: res.attributeId
          }));
        else if (type === 'output')
          this.outputattributesOptions[rowIndex] = res[0].attributes.map((res: any) => ({
            name: res.attributeName,
            id: res.attributeId
          }));
      },
      error: (error) => {
        console.error('Error loading tags attributes:', error);
        this.typeOptions[rowIndex] = [];
        if (type === 'output')
          this.outputattributesOptions[rowIndex] = [];
      }
    });
  }

  // Helper method to get attribute options for a specific row
  getTypeOptions(rowIndex: number, type: string): any[] {
    if (type === 'input')
      return this.typeOptions[rowIndex] || [];
    else if (type === 'output')
      return this.outputtypeOptions[rowIndex] || [];
    else if (type === 'trigger')
      return this.ttypeOptions[rowIndex] || [];
    else
      return []
  }

  getAttributeOptions(rowIndex: number, type: string): any[] {
    if (type === 'input')
      return this.attributesOptions[rowIndex] || [];
    else if (type === 'output')
      return this.outputattributesOptions[rowIndex] || [];
    else if (type === 'trigger')
      return this.tattributesOptions[rowIndex] || [];
    else
      return []
  }

  // // Helper method to get frequency options for a specific row
  // getFrequencyOptions(rowIndex: number): any[] {
  //   return this.frequencyOptions[rowIndex] || [];
  // }

  private getEntityAttr(rowIndex: number, entityId: string, type: string) {
    this.datapointAdminService.getEntityDetailsById(entityId).subscribe({
      next: (res) => {
        if (type === 'input')
          this.attributesOptions[rowIndex] = res.attributes.map((res: any) => ({
            name: res.attributeName,
            id: res.attributeId
          }));
        else if (type === 'trigger')
          this.tattributesOptions[rowIndex] = res.attributes.map((res: any) => ({
            name: res.attributeName,
            id: res.attributeId
          }));
        else if (type === 'output')
          this.outputattributesOptions[rowIndex] = res.attributes.map((res: any) => ({
            name: res.attributeName,
            id: res.attributeId
          }));
      },
      error: (error) => {
        console.error('Error loading tags attributes:', error);
        this.typeOptions[rowIndex] = [];
        this.outputattributesOptions[rowIndex] = [];
      }
    });
  }
  private getInstanceAttr(rowIndex: number, instanceId: string, type: string) {
    this.datapointAdminService.getInstanceDetailsById(instanceId).subscribe({
      next: (res) => {
        if (type === 'input')
          this.attributesOptions[rowIndex] = res.attributes.map((res: any) => ({
            name: res.attributeName,
            id: res.attributeId
          }));
        if (type === 'trigger')
          this.tattributesOptions[rowIndex] = res.attributes.map((res: any) => ({
            name: res.attributeName,
            id: res.attributeId
          }));
        else if (type === 'output')
          this.outputattributesOptions[rowIndex] = res.attributes.map((res: any) => ({
            name: res.attributeName,
            id: res.attributeId
          }));
      },
      error: (error) => {
        console.error('Error loading tags attributes:', error);
        this.typeOptions[rowIndex] = [];
        this.outputattributesOptions[rowIndex] = [];
      }
    });
  }


  /**
   * Removes an attribute group from the `inputAttr` form array.
   * @param {number} index - Index of the attribute to remove.
   * @returns {void}
   */
  removeInputAttr(index: number): void {
    this.workflowIps.removeAt(index);
  }


  moreActions(stepIndex: number, actIndex: any) {
    const data = {
      inputAttrArray: this.getInputAttributes(stepIndex, actIndex),
      outputAttrArray: this.getOutputAttributes(stepIndex, actIndex),
      stepIndex: stepIndex,
      actIndex: actIndex,
      internalIp: this.workflowIps,
    }
    this.dialogRef = this.dialog.open(ManageWfstepComponent, {
      header: 'More Actions',
      closable: true,
      modal: true,
      data: data,
      width: '50rem'
    })
    this.dialogRef.onClose.subscribe((res: any) => {
      if (res) {
        this.getInputAttributes(stepIndex, actIndex).setValue(res.inputAttributes);
        this.getOutputAttributes(stepIndex, actIndex).setValue(res.outputAttributes);
        this.getActivitySteps(stepIndex).at(actIndex).get('functionId')?.setValue(res.functionId);
        this.getActivitySteps(stepIndex).at(actIndex).get('functionName')?.setValue(res.functionName);
        this.getActivitySteps(stepIndex).at(actIndex).get('functionType')?.setValue(res.functionType);
        this.getActivitySteps(stepIndex).at(actIndex).get('runMode')?.setValue(res.runMode);
        this.getActivitySteps(stepIndex).at(actIndex).get('retryRule')?.setValue(res.retryRule);
      }
    })
  }

}
