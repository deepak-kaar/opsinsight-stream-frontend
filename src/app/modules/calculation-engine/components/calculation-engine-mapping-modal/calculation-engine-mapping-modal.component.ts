import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CalculationEngineService } from '../../services/calculation-engine.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { forkJoin, take } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgZone } from '@angular/core';

interface MappingValidation {
  error: string,
  field: string,
  type: string,
  rowName: string,
  formType: string
}

@Component({
  selector: 'app-calculation-engine-mapping-modal',
  standalone: false,
  templateUrl: './calculation-engine-mapping-modal.component.html',
  styleUrl: './calculation-engine-mapping-modal.component.css'
})

export class CalculationEngineMappingModalComponent implements OnInit {
  mappingForm: FormGroup
  mode: string = '';
  appData: any;
  flagInput: any;
  typeOptions: { [key: number]: any[] } = {};
  ttypeOptions: { [key: number]: any[] } = {};
  tattributesOptions: { [key: number]: any[] } = {};
  attributesOptions: { [key: number]: any[] } = {};
  outputtypeOptions: { [key: number]: any[] } = {};
  outputattributesOptions: { [key: number]: any[] } = {};
  entities: any;
  instances: any;
  isShow: boolean = false;
  frequencyOptions = [{
    name: 'Hour',
    type: 'H'
  },
  {
    name: 'Day',
    type: 'D'
  },
  {
    name: 'Week',
    type: 'W'
  },
  {
    name: 'Month',
    type: 'M'
  },
  {
    name: 'Quarterly',
    type: 'Q'
  },
  {
    name: 'Semi Annual',
    type: 'S'
  },
  {
    name: 'Year',
    type: 'Y'
  }];
  flagOutput = [
    {
      "variableName": "Output Variable",
      "type": "Entity",
      "entityOrInstance": "6818b6bed5d32499884d0511",
      "attribute": "6819acc5643ca38d429fae96"
    }
  ]
  types = ['Entity', 'Instance', 'Tags']
  template: any;
  constructor(public dialogConfig: DynamicDialogConfig,
    protected ref: DynamicDialogRef,
    private fb: FormBuilder,
    private messageService: MessageService,
    private datapointAdminService: DatapointAdministrationService,
    private calculationEngineService: CalculationEngineService,
    private spinner: NgxSpinnerService, private ngZone: NgZone) {
    if (this.dialogConfig.data.template) {
      this.template = this.dialogConfig.data.template;
    }
    this.mode = dialogConfig?.data?.mode;
    this.appData = dialogConfig?.data?.appData || {};
    this.mappingForm = this.fb.group({
      mappingDesc: new FormControl<string>('', Validators.required),
      inputMappings: this.fb.array([]),
      outputMappings: this.fb.array([]),
      triggerParams: this.fb.array([]),
    })
  }
  ngOnInit() {
    this.setMapping();
  }
  get inputMappings(): FormArray {
    return this.mappingForm.get('inputMappings') as FormArray;
  }

  get outputMappings(): FormArray {
    return this.mappingForm.get('outputMappings') as FormArray;
  }

  get triggerParams(): FormArray {
    return this.mappingForm.get('triggerParams') as FormArray;
  }

  setMapping() {
    this.spinner.show();
    if (this.mode === 'edit') {
      this.mappingForm.get('')
      Object.entries(this.template.inputJsonSchema).forEach(([key, res], index) => {
        const typedRes = res as any;
        const row = this.fb.group({
          index: [index],
          variableName: [key],
          type: [typedRes?.type],
          typeName: [typedRes?.typeName],
          attribute: [typedRes?.attribute],
          frequency: [typedRes?.frequency],
          offset: [typedRes?.offset],
          calcTrigInd: [typedRes?.calcTrigInd],
          calcReTrigInd: [typedRes?.calcReTrigInd],
          approvalReq: [typedRes?.approvalReq]
        });
        row.get('type')?.valueChanges.subscribe((selectedType: string) => {
          this.onTypeChange(selectedType, index, 'input');
        });
        row.get('typeName')?.valueChanges.subscribe((selectedType: string) => {
          this.onTypeNameChange(selectedType, index, 'input');
        });
        this.inputMappings.push(row);
        this.onTypeChange(typedRes.type, index, 'input');
        this.onTypeNameChange(typedRes.typeName, index, 'input');
      });

      Object.entries(this.template.outputJsonSchema).forEach(([key, res], index) => {
        const typedRes = res as any;
        const row = this.fb.group({
          index: [index],
          variableName: [key],
          type: [typedRes?.type],
          typeName: [typedRes?.typeName],
          attribute: [typedRes?.attribute],
          frequency: [typedRes?.frequency],
          offset: [typedRes?.offset],
          calcTrigInd: [typedRes?.calcTrigInd],
          calcReTrigInd: [typedRes?.calcReTrigInd],
          approvalReq: [typedRes?.approvalReq]
        });
        row.get('type')?.valueChanges.subscribe((selectedType: string) => {
          this.onTypeChange(selectedType, index, 'output');
        });

        row.get('typeName')?.valueChanges.subscribe((selectedType: string) => {
          this.onTypeNameChange(selectedType, index, 'output');
        });
        this.outputMappings.push(row);
        this.onTypeChange(typedRes.type, index, 'output');
        this.onTypeNameChange(typedRes.typeName, index, 'output');
      });

      // Object.entries(this.template.t).forEach(([key, res], index) => {
      //   const typedRes = res as any;
      //   const row = this.fb.group({
      //     index: [index],
      //     variableName: [key],
      //     type: [typedRes?.type],
      //     typeName: [typedRes?.typeName],
      //     attribute: [typedRes?.attribute],
      //     frequency: [typedRes?.frequency],
      //     offset: [typedRes?.offset],
      //     calcTrigInd: [typedRes?.calcTrigInd],
      //     calcReTrigInd: [typedRes?.calcReTrigInd],
      //     approvalReq: [typedRes?.approvalReq]
      //   });
      //   row.get('type')?.valueChanges.subscribe((selectedType: string) => {
      //     this.onTypeChange(selectedType, index, 'output');
      //   });

      //   row.get('typeName')?.valueChanges.subscribe((selectedType: string) => {
      //     this.onTypeNameChange(selectedType, index, 'output');
      //   });
      //   this.outputMappings.push(row);
      //   this.onTypeChange(typedRes.type, index, 'output');
      //   this.onTypeNameChange(typedRes.typeName, index, 'output');
      // });

      setTimeout(() => {
        this.spinner.hide()
        this.isShow = true;
      }
        , 500);
      // this.ngZone.onStable.pipe(take(1)).subscribe(() => {

      // });
      // this.spinner.hide();
    }
    else {
      this.template.inputAttributes.properties.map((res: any, index: number) => {
        const row = this.fb.group({
          index: [index],
          variableName: [res.name],
          type: [res.type],
          typeName: [res.typeName],
          attribute: [null, [Validators.required]],
          frequency: [null, [Validators.required]],
          offset: [0, [Validators.required]],
          calcTrigInd: [false],
          calcReTrigInd: [false],
          approvalReq: [false]
        });

        row.get('type')?.valueChanges.subscribe((selectedType: string) => {
          this.onTypeChange(selectedType, index, 'input');
        });

        row.get('typeName')?.valueChanges.subscribe((selectedType: string) => {
          this.onTypeNameChange(selectedType, index, 'input');
        });
        this.inputMappings.push(row);
      });
      this.template.outputAttributes.properties.map((res: any, index: number) => {
        const row = this.fb.group({
          index: [index],
          variableName: [res.name],
          type: [res.type],
          typeName: [res.typeName],
          attribute: [null, [Validators.required]],
          frequency: [null, [Validators.required]],
          offset: [0, [Validators.required]],
          calcTrigInd: [false],
          calcReTrigInd: [false],
          approvalReq: [false]
        });
        row.get('type')?.valueChanges.subscribe((selectedType: string) => {
          this.onTypeChange(selectedType, index, 'output');
        });

        row.get('typeName')?.valueChanges.subscribe((selectedType: string) => {
          this.onTypeNameChange(selectedType, index, 'output');
        });
        this.outputMappings.push(row);
        this.isShow = true;
      });
      this.spinner.hide();
    }

  }

  onTypeChange(selectedType: string, rowIndex: number, type: string) {
    // Clear current selections when type changes
    const currentRow = type === 'input' ? this.inputMappings.at(rowIndex) : type === 'trigger' ? this.triggerParams.at(rowIndex) : this.outputMappings.at(rowIndex);
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

  onTypeNameChange(selectedType: any, rowIndex: number, iotype: string) {
    // Clear current selections when type changes
    const currentRow = iotype === 'input' ? this.inputMappings.at(rowIndex) : iotype === 'trigger' ? this.triggerParams.at(rowIndex) : this.outputMappings.at(rowIndex);
    const type = currentRow.get('type')?.value;
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


  createMapping() {
    let checkArray: MappingValidation[] = this.validatorsCheck();
    if (checkArray.length > 0) {
      let msg = checkArray[0].formType === 'normal' ? `${checkArray[0].error} "${checkArray[0].field}"` : `${checkArray[0].error} "${checkArray[0].field}" of ${checkArray[0].rowName} in ${checkArray[0].type}`
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: msg, life: 3000 });
      return;
    }

    let inputAttributes: { [key: string]: any } = {};
    let outputAttributes: { [key: string]: any } = {};
    let triggerParams: { [key: string]: any } = {};

    this.mappingForm.controls['inputMappings']?.value.map((res: any) => {
      inputAttributes[res.variableName] = {
        "type": res.type,
        "typeName": res.typeName,
        "attribute": res.attribute,
        "frequency": res.frequency,
        "offset": res.offset,
        "calcTrigInd": res.calcTrigInd,
        "calcReTrigInd": res.calcReTrigInd
      }
    })

    this.mappingForm.controls['outputMappings']?.value.map((res: any) => {
      outputAttributes[res.variableName] = {
        "type": res.type,
        "typeName": res.typeName,
        "attribute": res.attribute,
        "frequency": res.frequency,
        "offset": res.offset,
        "calcTrigInd": res.calcTrigInd,
        "calcReTrigInd": res.calcReTrigInd
      }
    })


    this.mappingForm.controls['triggerParams']?.value.map((res: any) => {
      triggerParams[res.variableName] = {
        "type": res.type,
        "typeName": res.typeName,
        "attribute": res.attribute,
        "frequency": res.frequency,
        "offset": res.offset,
        "calcTrigInd": res.calcTrigInd,
        "calcReTrigInd": res.calcReTrigInd
      }
    })


    let calLogic = {
      [this.template.outputAttributes.properties[0].name]: this.template.calculationLogic
    }
    let payload = {
      calculationId: this.template.calculationId,
      calculationName: this.template.calculationName,
      calculationDesc: this.mappingForm.get('mappingDesc')?.value,
      calculationLogic: calLogic,
      inputAttributes: inputAttributes,
      outputAttributes: outputAttributes,
      triggerParams: triggerParams
    }

    this.calculationEngineService.createCalEngineMapping(payload).subscribe({
      next: (res: any) => {
        if (res) {
          this.ref.close({ status: 200 });
          this.messageService.add({ severity: 'success', summary: 'Success', detail: "Calculation mapping created successfully", life: 3000 });
        }
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error while creating calculation mapping template", life: 3000 });
      }
    })
  }

  validatorsCheck(): MappingValidation[] {
    let checkArray: MappingValidation[] = [];
    if (this.mappingForm.controls['mappingDesc']?.value === null || undefined) {
      checkArray.push({
        error: "Please fill the required field",
        field: "template name",
        type: "",
        rowName: "",
        formType: "normal"
      })
    }

    this.mappingForm.controls['inputMappings']?.value.map((res: any) => {
      if (res?.attribute === null || undefined) {
        checkArray.push({
          error: "Please fill the required field",
          field: "attribute",
          type: "inputAttributes",
          rowName: res.inputAttributeName,
          formType: "formArray"
        })
      }
      if (res?.frequency === null || undefined) {
        checkArray.push({
          error: "Please fill the required field",
          field: "frequency",
          type: "inputAttributes",
          rowName: res.inputAttributeName,
          formType: "formArray"
        })
      }
      if (res?.offset === null || undefined) {
        checkArray.push({
          error: "Please fill the required field",
          field: "offset",
          type: "inputAttributes",
          rowName: res.inputAttributeName,
          formType: "formArray"
        })
      }
    })

    this.mappingForm.controls['outputMappings']?.value.map((res: any) => {
      if (res?.attribute === null || undefined) {
        checkArray.push({
          error: "Please fill the required field",
          field: "attribute",
          type: "outputAttributes",
          rowName: res.inputAttributeName,
          formType: "formArray"
        })
      }
      if (res?.frequency === null || undefined) {
        checkArray.push({
          error: "Please fill the required field",
          field: "frequency",
          type: "outputAttributes",
          rowName: res.inputAttributeName,
          formType: "formArray"
        })
      }
      if (res?.offset === null || undefined) {
        checkArray.push({
          error: "Please fill the required field",
          field: "offset",
          type: "outputAttributes",
          rowName: res.inputAttributeName,
          formType: "formArray"
        })
      }
    })

    if (checkArray.length > 0) {
      return checkArray;
    }
    else {
      return checkArray;
    }
  }

  addTriggerMapping(typedRes?: any) {
    const length = this.triggerParams.length
    const row = this.fb.group({
      index: [length],
      variableName: [typedRes?.variableName || ''],
      type: [typedRes?.type || ''],
      typeName: [typedRes?.typeName || ''],
      attribute: [typedRes?.attribute || ''],
      frequency: [typedRes?.frequency || ''],
      offset: [typedRes?.offset || ''],
      calcTrigInd: [typedRes?.calcTrigInd || ''],
      calcReTrigInd: [typedRes?.calcReTrigInd || ''],
      approvalReq: [typedRes?.approvalReq || '']
    });
    row.get('type')?.valueChanges.subscribe((selectedType: string) => {
      this.onTypeChange(selectedType, length, 'trigger');
    });
    row.get('typeName')?.valueChanges.subscribe((selectedType: string) => {
      this.onTypeNameChange(selectedType, length, 'trigger');
    });
    this.triggerParams.push(row);
  }

  onTrigger(index: number) {
    this.spinner.show();
    const currentRow = this.inputMappings.at(index);
    const trigger = currentRow.get('calcTrigInd')?.value;
    const type = currentRow.get('type')?.value;
    const typeName = currentRow.get('typeName')?.value;
    const typedRes = currentRow.getRawValue();
    if (trigger) {
      const length = this.triggerParams.length;
      this.addTriggerMapping(typedRes);
      this.onTypeChange(type, length, 'trigger');
      this.onTypeNameChange(typeName, length, 'trigger');
      setTimeout(() => {
        this.spinner.hide();
      }, 300)
    }
    else {
      const index = this.inputMappings.controls.findIndex(
        (control) => control.get('variableName')?.value === currentRow.get('variableName')?.value
      );
      this.triggerParams.removeAt(index);
      this.spinner.hide();
    }

  }
}

