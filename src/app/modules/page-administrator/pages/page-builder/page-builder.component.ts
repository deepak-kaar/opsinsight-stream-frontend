import { Component, ElementRef, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CanvasConfigComponent } from 'src/app/modules/page-administrator/components/dialogs/canvas-config/canvas-config.component';
import { Router } from '@angular/router';
import { Widget } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GridStackOptions } from 'gridstack';
import {
  GridstackComponent,
  NgGridStackOptions,
} from 'gridstack/dist/angular';
import { MenuItem, MessageService } from 'primeng/api';
import { CodeEditorComponent } from 'src/app/modules/page-administrator/components/dialogs/code-editor/code-editor.component';
import { FrequencyConfigComponent } from '../../components/dialogs/frequency-config/frequency-config.component';
import { ImageUploadComponent } from '../../components/dialogs/image-upload/image-upload.component';
import { TextInputComponent } from '../../components/dialogs/text-input/text-input.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { TemplateConfirmationComponent } from '../../components/dialogs/template-confirmation/template-confirmation.component';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { LlmChatboxComponent } from '../../components/dialogs/llm-chatbox/llm-chatbox.component';

type WidgetType = 'section' | 'input-text' | 'dropdown' | 'text-area' | 'label' | 'paragraph' |
  'radio-button' | 'date-picker' | 'file-upload' | 'checkbox' | 'btn' | 'btn-icon' |
  'primeng-dynamic-table' | 'pie-chart' | 'donut-chart' | 'polar' | 'radar' | 'bar-chart' |
  'line' | 'hbar' | 'svbar' | 'shbar' | 'image' | 'video' | 'map' | 'tag' | 'date-tag' | 'location-tag' | 'divider' | 'guage';

@Component({
  selector: 'app-page-builder',
  standalone: false,
  templateUrl: './page-builder.component.html',
  styleUrl: './page-builder.component.css',
  encapsulation: ViewEncapsulation.None
})

export class PageBuilderComponent implements OnInit {

  private baseStyles = { style: {} };
  private defaultChartDims = { w: 4, h: 4 };
  private commonMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  protected dividerTypes = ['solid', 'dashed', 'dotted'];
  protected dividerLayouts = ['vertical', 'horizontal'];
  templates: any;
  colWidth: number = 1;
  colSpan: number = 1;
  payload: any;
  colorHex = '#ffffff';
  alphaPercent = 20;

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  private createSimpleInput(extras = {}): any {
    return { ...this.baseStyles, ...extras };
  }

  private createMirroredInputs(extras = {}): { input: any, inputOdt: any } {
    return {
      input: this.createSimpleInput(extras),
      inputOdt: this.createSimpleInput(extras)
    };
  }

  // Base configurations for different widget types
  private WIDGET_CONFIGS: Record<WidgetType, (id: string) => any> = {
    'section': id => ({
      w: 12,
      h: 4,
      selector: 'app-section',
      ...this.createMirroredInputs(),
      subGridOpts: {
        cellHeight: 50,
        column: 24,
        acceptWidgets: true,
        margin: 2,
        subGridDynamic: true,
        float: true
      }
    }),
    'input-text': id => ({
      ...this.defaultChartDims,
      w: 4,
      h: 1,
      selector: 'app-input-text',
      ...this.createMirroredInputs({ value: '' })
    }),
    'dropdown': id => ({
      w: 3,
      h: 1,
      selector: 'app-dropdown',
      ...this.createMirroredInputs({
        data: Array(5).fill(0).map((_, i) => ({ name: `Value${i + 1}`, code: `V${i + 1}` })),
        optionValue: '',
        optionLabel: '',
        value: ''
      })
    }),
    'text-area': id => ({
      w: 5,
      h: 2,
      selector: 'app-text-area',
      ...this.createMirroredInputs({ value: '' })
    }),
    'label': id => ({
      minW: 2,
      minH: 1,
      selector: 'app-label',
      input: { label: 'Label', style: { paddingLeft: 10 } },
      inputOdt: { label: '', style: { paddingLeft: 10 } }
    }),
    'paragraph': id => ({
      w: 2,
      h: 1,
      selector: 'app-paragraph',
      ...this.createMirroredInputs({ content: 'content', style: { paddingLeft: 10 } })
    }),
    'radio-button': id => ({
      w: 5,
      h: 1,
      selector: 'app-radio-button',
      input: { label1: 'Label', checked: 'yes', label2: 'Label', style: {} },
      inputOdt: { label1: 'Label', label2: 'Label', checked: true, style: {} }
    }),
    'date-picker': id => ({
      w: 4,
      h: 1,
      selector: 'app-date-picker',
      ...this.createMirroredInputs({ style: { buttonBar: false }, date: '' })
    }),
    'file-upload': id => ({
      w: 9,
      h: 3,
      selector: 'app-file-upload',
      ...this.createMirroredInputs({ file: '' })
    }),
    'checkbox': id => ({
      w: 1,
      h: 1,
      selector: 'app-checkbox',
      ...this.createMirroredInputs({ checked: false })
    }),
    'btn': id => ({
      w: 3,
      h: 1,
      selector: 'app-button',
      input: { buttonLabel: 'Button', style: {} },
      inputOdt: { buttonLabel: 'Button', style: { backgroundColor: '#00A3E0', border: 'none' } }
    }),
    'btn-icon': id => ({
      w: 1,
      h: 1,
      selector: 'app-icon-button',
      ...this.createMirroredInputs({ icon: 'pi pi-user' })
    }),
    'primeng-dynamic-table': id => {
      const attributes = Array(5).fill(0).map((_, i) => ({ attributeName: `Column${i + 1}` }));
      const products = Array(2).fill(0).map(() =>
        attributes.reduce((obj, attr) => ({ ...obj, [attr.attributeName]: attr.attributeName }), {})
      );
      return {
        x: 0,
        w: 12,
        h: 6,
        selector: 'app-dynamic-table',
        ...this.createMirroredInputs({
          dataSets: { attributes, products },
          cols: ['Q1', 'Q2', 'Q3'],
          rows: [540, 325, 702]
        })
      };
    },
    'pie-chart': id => ({
      ...this.defaultChartDims,
      selector: 'app-pie-chart',
      ...this.createMirroredInputs({ labels: ['A', 'B', 'C'], values: [540, 300, 400] })
    }),
    'donut-chart': id => ({
      ...this.defaultChartDims,
      selector: 'app-donut',
      ...this.createMirroredInputs({ labels: ['A', 'B', 'C'], values: [100, 200, 300] })
    }),
    'polar': id => ({
      ...this.defaultChartDims,
      selector: 'app-polar-area',
      input: { style: {}, labels: ['Green', 'Yellow', 'Blue'], values: [11, 16, 7, 3, 14], title: 'Title' },
      inputOdt: { style: {}, labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'], values: [11, 16, 7, 3, 14], title: 'Title' }
    }),
    'radar': id => ({
      ...this.defaultChartDims,
      selector: 'app-radar',
      ...this.createMirroredInputs({
        labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
        values: [65, 59, 90, 81, 56, 55, 40],
        title: 'Title'
      })
    }),
    'bar-chart': id => ({
      ...this.defaultChartDims,
      selector: 'app-bar-chart',
      ...this.createMirroredInputs({
        labels: ['Q1', 'Q2', 'Q3'],
        values: [540, 325, 702],
        title: 'Title'
      })
    }),
    'line': id => ({
      ...this.defaultChartDims,
      selector: 'app-line',
      ...this.createMirroredInputs({
        labels: this.commonMonths,
        values: [65, 59, 80, 81, 56, 55, 40],
        title: 'Titile'
      })
    }),
    'hbar': id => ({
      ...this.defaultChartDims,
      selector: 'app-horizontal-bar',
      ...this.createMirroredInputs({
        labels: this.commonMonths,
        values: [65, 59, 80, 81, 56, 55, 40],
        title: 'Titile'
      })
    }),
    'svbar': id => ({
      ...this.defaultChartDims,
      selector: 'app-sv-bar',
      ...this.createMirroredInputs({
        labels: this.commonMonths,
        values1: [50, 25, 12, 48, 90, 76, 42],
        title1: 'Titile1',
        values2: [21, 84, 24, 75, 37, 65, 34],
        title2: 'Titile2'
      })
    }),
    'shbar': id => ({
      ...this.defaultChartDims,
      selector: 'app-sh-bar',
      ...this.createMirroredInputs({
        labels: this.commonMonths,
        values1: [50, 25, 12, 48, 90, 76, 42],
        title1: 'Titile1',
        values2: [21, 84, 24, 75, 37, 65, 34],
        title2: 'Titile2'
      })
    }),
    'image': id => ({
      ...this.defaultChartDims,
      selector: 'app-image',
      input: { style: {}, src: '/assets/images/svgs/no-image.svg', alterateText: 'Image' },
      inputOdt: { style: {}, src: 'images/svg/page-builder/no-image.svg', alterateText: 'Image' }
    }),
    'video': id => ({
      ...this.defaultChartDims,
      selector: 'app-video',
      ...this.createMirroredInputs({
        videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'images/svg/page-builder/video.svg'
      })
    }),
    'map': id => ({
      ...this.defaultChartDims,
      selector: 'app-map',
      ...this.createMirroredInputs({ src: 'https://www.google.com/maps/embed?pb=!…' })
    }),
    'tag': id => {
      const baseTagStyle = {
        width: '100%', height: '100%', padding: '5px', 'border-radius': '8px'
      };
      return {
        w: 2,
        h: 1,
        selector: 'app-tag',
        input: { value: 'Event Status', style: { ...baseTagStyle, backgroundColor: '#F2FFD6', color: '#83BD01' } },
        inputOdt: { value: 'Event Status', style: { ...baseTagStyle, 'background-color': '#F2FFD6', color: '#83BD01' } }
      };
    },
    'date-tag': id => {
      const tagStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#EAD6F3',
        color: '#643278',
        borderRadius: '8px',
        padding: '5px'
      };
      return {
        w: 2,
        h: 1,
        selector: 'app-date-tag',
        ...this.createMirroredInputs({ style: tagStyle, date: 'Date' })
      };
    },
    'location-tag': id => {
      const tagStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#F2FFD6',
        color: '#83BD01',
        borderRadius: '8px',
        padding: '5px'
      };
      return {
        w: 3,
        h: 1,
        selector: 'app-location-tag',
        ...this.createMirroredInputs({ style: tagStyle, location: 'Location' })
      };
    },
    'divider': id => {
      const tagStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#F2FFD6',
        color: '#83BD01',
        borderRadius: '8px',
        padding: '5px',
        dividerType: 'solid',
        dividerLayout: 'horizontal'
      };
      return {
        w: 3,
        h: 1,
        selector: 'app-divider',
        ...this.createMirroredInputs({ style: tagStyle })
      };
    },
    'guage': id => {
      const tagStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#F2FFD6',
        color: '#83BD01',
        borderRadius: '8px',
        padding: '5px',
        dividerType: 'solid',
        dividerLayout: 'horizontal'
      };
      return {
        w: 3,
        h: 1,
        selector: 'app-speed-guage',
        ...this.createMirroredInputs({ style: tagStyle, speed: 23  })
      };
    }
  };

  @ViewChild(GridstackComponent) gridComp?: GridstackComponent;
  showUi: boolean = false;
  formConfig: { appId: string, orgId: string, reportType: string } | any;
  configRef!: DynamicDialogRef;
  codeRef!: DynamicDialogRef;
  llmRef!: DynamicDialogRef;
  sidebarState: string = 'collapse';
  borderStyles = ['solid', 'dotted', 'dashed', 'groove'];
  tempActions: string[] = [
    'Widgets',
    'Templates'
  ]
  tabValue = 0;
  selectedWidget: any
  widgetOptions: string[] = ["Styles", "Data Mapping"]
  decorationOptions: any[] = [
    {
      icon: '/assets/images/svgs/underlined.svg',
      decoration: 'Underline',
    },
    {
      icon: '/assets/images/svgs/strikethrough.svg',
      decoration: 'Strike',
    },
  ];
  selectedBtn!: string;
  selectedOpt!: string;
  tabs!: Widget[];
  sidePanelWidth: number = 200;
  canvasWidth = '';
  canvasHeight = '';
  canvasType = '';
  counter = 0;
  selectedWidget1: any;

  highlightedWidget: any;
  modifiedWidget: any;
  widgetStyles: any = {
    backgroundColor: '',
    fontFamily: '',
    fontSize: 14,
    fontWeight: '',
    color: '',
    textAlign: 'Left',
    textDecoration: '',
    raised: false,
    rounded: false,
    text: false,
    outlined: false,
    borderColors: ['#FF9F40', '#4BC0C0', '#36A2EB'],
    backgroundColors: ['#4CAF50', '#2196F3', '#FFEB3B'],
    tooltipColor: '#ffffff',
    tooltipBgColor: '#000000',
    gridColor: '#dfe7ef',
    bgColor: '#2196F3',
    borderColor: '#2196F3',
    pBorderColor: '#2196F3',
    phBgColor: '#2196F3',
    phBorderColor: '#2196F3',
    bg1: '#2196F3',
    bg2: '#4CAF50',
    buttonBar: false,
    selectionRange: false,
    month: false,
    year: false,
    paddingLeft: '10',
    paddingRight: '0',
    paddingTop: '0',
    paddingBottom: '0',
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderRightStyle: 'solid',
    borderTopWidth: '0',
    borderBottomWidth: '0',
    borderLeftWidth: '0',
    borderRightWidth: '0',
    borderTopColor: 'black',
    borderBottomColor: 'black',
    borderLeftColor: 'black',
    borderRightColor: 'black',
    dividerType: 'solid',
    dividerLayout: 'horizontal'
  };

  private _gridOptions: GridStackOptions = {
    // margin: 5,
    column: 24,
    handle: '.drag-handle',
    margin: 2,
    // animate: false,
    float: true,
    minRow: 1,
    // maxRow: 10,
    cellHeight: 50,
    // acceptWidgets: true,
    subGridDynamic: true,
    subGridOpts: {
      cellHeight: 50,
      column: 24,
      acceptWidgets: true,
      margin: 2,
      subGridDynamic: true,
      float: true
    },
    // removable: '#trash',
  };
  fontFamilies: any[] = [];
  fontWeights: any[] = [];
  justifyOptions: any = [];
  serializedData: any;
  textEl: any;

  static_text: string = '';
  availableProducts: any[] | undefined;
  selectedProducts: any[] = [];
  draggedAttribute: any | undefined | null;
  selectedCountry: any;
  entityList: any[] = [];
  selectedAttributes: any;
  selectedAttributesObj: { name: string; attributes: string[] }[] | undefined;
  entityDetails: any[] = [];
  inputProps: any[] = [];
  templateId: any;
  isShowUi: boolean = false;
  containerStyle: any;
  dropZones: any[] = [];
  droppedItemsByProp: { [key: string]: any[] } = {};
  eventId: string = '';
  eventList: any;
  attributes: any[] = []
  entityId: string = '';
  screenType: string = '';
  activeTabIndex: any;
  isShowAttr: boolean = true;
  // New variable to store selected widget
  selectedEmitter: any = {};

  // New variable to store the available widgets (this should come from an API)
  emitterList: any[] = [];

  emitterListWidgetSpecific: any[] = [];
  ref: DynamicDialogRef | undefined;
  staticList = [
    {
      id: '1',
      name: 'Text',
      type: 'Static',
    },
    {
      id: '2',
      name: 'Image',
      type: 'Static',
    },
    {
      id: '3',
      name: 'Custom Array',
      type: 'Static'
    }
  ];

  public get gridOptions(): GridStackOptions {
    return this._gridOptions;
  }
  public set gridOptions(value: GridStackOptions) {
    this._gridOptions = value;
  }
  gridOptionsFull: NgGridStackOptions = {
    ...this.gridOptions,
  };
  gridStyle: any = {};
  items: MenuItem[];
  items1: MenuItem[];


  constructor(private dialogService: DialogService,
    private router: Router,
    private pageAdminService: PageAdministratorService,
    public sanitizer: DomSanitizer,
    private messageService: MessageService,
    private renderer: Renderer2, private el: ElementRef,
    private spinner: NgxSpinnerService) {
    this.items = [
      {
        label: 'Save as Draft',
        command: () => {
          this.save();
        }
      },
      {
        label: 'Save as Template',
        command: () => {
          this.saveTemplate();
        }
      },
      {
        label: 'Save',
        command: () => {
          this.saveGrid();
        }
      },
    ];

    this.items1 = [
      {
        label: 'Code Editor',
        command: () => {
          this.openCodeEditor();
        }
      },
      {
        label: 'LLM Generated',
        command: () => {
          this.openLlmEditor();
        }
      },
    ];
    this.formConfig = this.router.getCurrentNavigation()?.extras.state;
    this.payload = {
      ...(this.formConfig?.appId && { appId: this.formConfig?.appId }),
      ...(this.formConfig?.orgId && { orgId: this.formConfig?.orgId })
    };
  }


  ngOnInit() {
    this.fontFamilies = this.pageAdminService.getFonts();
    this.fontWeights = this.pageAdminService.getWeights();
    this.justifyOptions = this.pageAdminService.getJustfyOptions();
    if (!this.formConfig?.reportType || !this.formConfig?.appId) {
      this.openConfigDiaglog();
    }
    else if (this.formConfig?.reportType === 'Card Design') {
      this.openConfigDiaglog();
    }
    else {
      this.getDatas();
      this.showUi = true;
    }
    this.selectedBtn = this.tempActions[0];
    this.selectedOpt = this.widgetOptions[0];
  }

  getDatas() {
    this.getEntityData();
    this.getAttrList();
    this.getTemplates();
    this.getWidgets();
  }


  openConfigDiaglog() {
    this.configRef = this.dialogService.open(CanvasConfigComponent, {
      data: this.formConfig,
      header: 'Canvas Config ',
      width: '25%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true
    });

    this.configRef.onClose.subscribe((config: any) => {
      if (config) {
        this.formConfig = {};
        this.formConfig.appId = config.app
        this.formConfig.orgId = config.org;
        this.formConfig.reportType = config.canvasType
        this.getDatas();
        this.showUi = true;
        if (config?.canvasWidth && config?.canvasHeight) {
          this.canvasWidth = config.canvasWidth;
          this.canvasHeight = config.canvasHeight;
          this.canvasType = config.canvasType;
          this.centerGridZone();
        } else {
          this.gridStyle = {};
        }
      }
      else {
        this.router.navigateByUrl('/pageAdmin/pageManager')
      }
    });
  }

  getWidgets() {
    this.tabs = this.pageAdminService.getAllWidgtes()
  }

  centerGridZone() {

    // this.gridStyle = {
    //   position: 'absolute',
    //   'margin-top': `${verticalMargin}px`,
    //   'margin-left': `${horizontalMargin}px`,
    //   'margin-right': `${horizontalMargin}px`,
    //   width: `${this.canvasWidth}px`,
    //   height: `${this.canvasHeight}px`,
    // };

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const gridWidth = parseInt(this.canvasWidth);
    const gridHeight = parseInt(this.canvasHeight);

    const horizontalMargin = Math.max(
      (viewportWidth - this.sidePanelWidth - gridWidth) / 2,
      0
    );

    console.log(horizontalMargin);
    const verticalMargin = Math.max((viewportHeight - gridHeight) / 2, 0);

    this.gridStyle = {
      width: `${this.canvasWidth}px`,
      height: `${this.canvasHeight}px`,
      // display: 'flex',
      // justifyContent: 'center',
      // alignItems: 'center',
      margin: 'auto',
      marginTop: `${verticalMargin}px`
    };

  }

  onTabClick() {
  }

  addWidget(type: string, event: any, widgetName: string): void {
    if (this.highlightedWidget?.selector === 'app-section') {
      if (!this.isWidgetType(widgetName)) {
        console.warn(`Unknown widget type: ${widgetName}`);
        return;
      }

      let customW = 24 / this.colWidth;
      const gridStackItemId = this.generateId();
      this.selectedWidget = {
        id: gridStackItemId,
        ...this.WIDGET_CONFIGS[widgetName](gridStackItemId),
        w: customW
      };
      this.highlightedWidget?.subGrid?.addWidget(this.selectedWidget);
    }
    else {
      if (!this.isWidgetType(widgetName)) {
        return;
      }

      const gridStackItemId = this.generateId();
      let customW = this.colSpan === 1 ? 24 : 12;
      this.selectedWidget = {
        id: gridStackItemId,
        ...this.WIDGET_CONFIGS[widgetName](gridStackItemId),
        w: customW
      };
      this.gridComp?.grid?.addWidget(this.selectedWidget);
    }
  }

  // Type guard to check if a string is a valid WidgetType
  private isWidgetType(value: string): value is WidgetType {
    return Object.keys(this.WIDGET_CONFIGS).includes(value);
  }


  clearGrid() {
    if (!this.gridComp) return;
    this.gridComp.grid?.removeAll();
  }

  deleteWidget() {
    if (this.highlightedWidget) {
      const isAppSection = this.highlightedWidget?.grid.parentGridNode?.selector === 'app-section';
      const grid = isAppSection
        ? this.highlightedWidget.grid.parentGridNode.subGrid
        : this.gridComp?.grid;
      grid.removeWidget(this.highlightedWidget?.el);
      this.highlightedWidget = undefined
    }
  }

  saveGrid() {
    this.serializedData =
      (this.gridComp?.grid?.save(false, true) as GridStackOptions) || ''; // no content, full options
    // if (this.textEl)
    //   this.textEl.nativeElement.value = JSON.stringify(
    //     this.serializedData,
    //     null,
    //     '  '
    //   );
    console.log('Page-designdata: ', this.serializedData);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Template saved locally you can preview it',
      life: 5000,
    });
  }


  generateRGBA() {
    const hex = this.colorHex;
    const opacity = this.alphaPercent / 100;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Update the actual CSS property
    this.widgetStyles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    this.onStyleChange();
  }


  /**
   * Handles style changes and updates the widget accordingly.
   * @returns - returns nothing (i.e void)
   */
  onStyleChange(): void {
    if (!this.highlightedWidget) {
      const item = this.el.nativeElement.querySelector(`.grid-zone`);
      if (item) {
        this.renderer.setStyle(item, 'background-color', this.widgetStyles.backgroundColor);
      }
    } else {
      // Create modified widget with essential properties
      this.modifiedWidget = {
        id: this.highlightedWidget.id,
        w: this.highlightedWidget.w,
        h: this.highlightedWidget.h,
        y: this.highlightedWidget.y,
        x: this.highlightedWidget.x,
        selector: this.highlightedWidget.selector,
        input: this.highlightedWidget.input,
        inputOdt: this.highlightedWidget.inputOdt,
        grid: this.highlightedWidget?.grid,
        subGrid: this.highlightedWidget?.subGrid,
        subGridOpts: this.highlightedWidget?.subGridOpts
      };

      console.log(this.widgetStyles);
      // Apply styles
      const inputStyle = this.modifiedWidget.input.style;
      Object.entries(this.widgetStyles).forEach(([key, value]) => {
        inputStyle[key] = value === false ? false : value || inputStyle[key];
      });

      // Remove old widget and add new one
      const isAppSection = this.highlightedWidget?.grid.parentGridNode?.selector === 'app-section';
      const grid = isAppSection
        ? this.highlightedWidget.grid.parentGridNode.subGrid
        : this.gridComp?.grid;

      grid?.removeWidget(this.highlightedWidget.el);
      this.highlightedWidget = undefined;
      const newWidget = grid?.addWidget(this.modifiedWidget);
      if (this.modifiedWidget?.selector === 'app-section') {
        const item = this.el.nativeElement.querySelector(`gridstack-item[gs-id="${this.modifiedWidget.id}"].grid-stack-sub-grid`);
        if (item) {
          this.renderer.setStyle(item, 'border-top-style', this.widgetStyles.borderTopStyle);
          this.renderer.setStyle(item, 'border-bottom-style', this.widgetStyles.borderBottomStyle);
          this.renderer.setStyle(item, 'border-right-style', this.widgetStyles.borderRightStyle);
          this.renderer.setStyle(item, 'border-left-style', this.widgetStyles?.borderLeftStyle);
          this.renderer.setStyle(item, 'border-top-color', this.widgetStyles?.borderTopColor);
          this.renderer.setStyle(item, 'border-bottom-color', this.widgetStyles?.borderBottomColor);
          this.renderer.setStyle(item, 'border-right-color', this.widgetStyles?.borderRightColor);
          this.renderer.setStyle(item, 'border-left-color', this.widgetStyles?.borderLeftColor);
          this.renderer.setStyle(item, 'border-top-width', this.widgetStyles?.borderTopWidth + 'px');
          this.renderer.setStyle(item, 'border-bottom-width', this.widgetStyles?.borderBottomWidth + 'px');
          this.renderer.setStyle(item, 'border-right-width', this.widgetStyles?.borderRightWidth + 'px');
          this.renderer.setStyle(item, 'border-left-width', this.widgetStyles?.borderLeftWidth + 'px');
          this.renderer.setStyle(item, 'border-top-left-radius', this.widgetStyles?.borderTopLeftRadius + 'px');
          this.renderer.setStyle(item, 'border-top-right-radius', this.widgetStyles?.borderTopRightRadius + 'px');
          this.renderer.setStyle(item, 'border-bottom-left-radius', this.widgetStyles?.borderBottomLeftRadius + 'px');
          this.renderer.setStyle(item, 'border-bottom-right-radius', this.widgetStyles?.borderBottomRightRadius + 'px');
          this.renderer.setStyle(item, 'background-color', this.widgetStyles.backgroundColor);
        }
      }

      // Find the widget node
      const widgetId = newWidget?.getAttribute('gs-id');
      this.highlightedWidget = this.gridComp?.grid?.engine.nodes.find(
        node => node.id === widgetId
      ) || newWidget?.gridstackNode;

      // Handle selection toggling
      if (newWidget) {
        if (this.selectedWidget1 === newWidget) {
          newWidget.classList.remove('selected');
          this.selectedWidget1 = null;
          this.highlightedWidget = undefined;
        } else {
          if (this.selectedWidget1) this.selectedWidget1.classList.remove('selected');
          this.selectedWidget1 = newWidget;
          newWidget.classList.add('selected');
        }
      }
    }
  }

  /**
   * Resets the widget styles to default values.
   * @returns - returns nothing (i.e void)
   *
   */
  resetStyles(): void {
    this.widgetStyles = {
      backgroundColor: '',
      fontFamily: '',
      fontSize: 14,
      fontWeight: '',
      color: '',
      textAlign: 'Left',
      textDecoration: '',
      raised: false,
      rounded: false,
      buttonBar: false,
      selectionRange: false,
      month: false,
      year: false,
      text: false,
      outlined: false,
      borderColors: ['#FF9F40', '#4BC0C0', '#36A2EB'],
      backgroundColors: ['#4CAF50', '#2196F3', '#FFEB3B'],
      tooltipColor: '#ffffff',
      tooltipBgColor: '#000000',
      gridColor: '#dfe7ef',
      bgColor: '#2196F3',
      borderColor: '#2196F3',
      pBorderColor: '#2196F3',
      phBgColor: '#2196F3',
      phBorderColor: '#2196F3',
      bg1: '#2196F3',
      bg2: '#4CAF50',
      paddingLeft: 10,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      borderTopRightRadius: 0,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderTopStyle: 'solid',
      borderBottomStyle: 'solid',
      borderLeftStyle: 'solid',
      borderRightStyle: 'solid',
      borderTopWidth: '0',
      borderBottomWidth: '0',
      borderLeftWidth: '0',
      borderRightWidth: '0',
      borderTopColor: 'black',
      borderBottomColor: 'black',
      borderLeftColor: 'black',
      borderRightColor: 'black',
      dividerType: 'solid',
      dividerLayout: 'horizontal'
    };
  }

  /**
  * Checks the widget type belongs to the listed chart types
  * @returns {boolean} - returns True or false based on the widget
  */
  isChartWidget(): boolean {
    const chartTypes = [
      'app-pie-chart',
      'app-donut',
      'app-bar-chart',
      'app-polar-area',
      'app-primeng-hbar',
      'app-line',
      'app-radar',
      'app-sv-bar',
    ];
    return chartTypes.includes(this.highlightedWidget?.selector);
  }


  /**
   * Checks the widget type belongs to the listed grid chart types
   * @returns {boolean} - returns True or false based on the widget
   */
  isGridChart(): boolean {
    const chartTypes = [
      'app-primeng-bar-chart',
      'app-polar-area',
      'app-horizontal-bar',
      'app-line',
      'app-radar',
      'app-sv-bar',
    ];
    return chartTypes.includes(this.highlightedWidget?.selector);
  }

  /**
   * Generates an unique Id for widget to be added in the grid
   * @returns {string} - returns Unique Id for the widget
   */
  generateId(): string {
    this.counter += 1;
    return `grid-item-${this.counter}`;
  }

  openCodeEditor() {
    this.serializedData =
      (this.gridComp?.grid?.save(false, true) as GridStackOptions) || '';
    console.log('Page-designdata: ', this.serializedData);
    this.codeRef = this.dialogService.open(CodeEditorComponent, {
      width: '70vw',
      height: '50vw',
      data: this.serializedData,
      header: 'Code Editor',
      closable: true,
      modal: true
    })
    this.codeRef.onClose.subscribe((config: any) => {
      if (config && config.status === true) {
        console.log(JSON.parse(config.code))
        this.clearGrid();
        this.gridOptionsFull = JSON.parse(config.code)
      }
    });
  }

  openLlmEditor() {
    this.llmRef = this.dialogService.open(LlmChatboxComponent, {
      width: '90vw',
      height: '90vw',
      data: this.serializedData,
      header: 'LLM Chat Box',
      closable: true,
      modal: true,
      maximizable: true
    })
    // this.codeRef.onClose.subscribe((config: any) => {
    //   if (config && config.status === true) {
    //     console.log(JSON.parse(config.code))
    //     this.clearGrid();
    //     this.gridOptionsFull = JSON.parse(config.code)
    //   }
    // });
  }

  saveTemplate() {
    this.openConfirmationDialog('Template');

  }
  save() {
    this.openConfirmationDialog('Draft');
  }

  getTemplates(): any {
    this.spinner.show();
    this.pageAdminService.getTemplateList(this.payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.templates = res?.template || [];
      },
      error: (err) => {
        this.spinner.hide();
      },
    });
  }

  loadTemplate(templateData: any) {
    this.spinner.show();
    const templateId = templateData.templateId;
    this.pageAdminService.getTemplateByID(templateId).subscribe({
      next: (res: any) => {
        this.clearGrid();
        this.spinner.hide();
        const IDTData = res.result[0];
        if (IDTData.templateType === 'Card Design') {
          this.canvasWidth = IDTData.templateWidth;
          this.canvasHeight = IDTData.templateHeight;
          this.centerGridZone();
        } else {
          this.gridStyle = {};
        }
        IDTData.children?.forEach((child: any) => {
          this.gridComp?.grid?.addWidget({ ...child });
        });
      },
      error: (err) => {
        this.spinner.hide();
      },
    });
  }


  // Mapping

  onTabChange(event: number) {
    if (event === 2) {
      this.isShowAttr = false;
    } else {
      this.isShowAttr = true;
    }
  }

  onWidgetClick(event: any) {
    const clickedWidget = event.target.closest('.grid-stack-item');
    if (clickedWidget) {
      const widgetId = clickedWidget.getAttribute('gs-id');
      let widget = this.gridComp?.grid?.engine.nodes.find(
        (node: any) => node.id === widgetId
      );
      if (!widget) {
        widget = clickedWidget?.gridstackNode;
      }
      this.highlightedWidget = widget;
      const { style1, ...rest1 } = this.highlightedWidget.inputOdt;
      Object.entries(rest1).forEach(([key, value]) => {
        const arrName = key + '-' + this.highlightedWidget.OdtId
        if (!this.droppedItemsByProp[arrName]) {
          this.droppedItemsByProp[arrName] = [];
        }

        const isDuplicate = this.droppedItemsByProp[arrName].some(
          (existingValue) =>
            JSON.stringify(existingValue) === JSON.stringify(value)
        );

        if (
          !isDuplicate &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          this.droppedItemsByProp[arrName].push(value);
        }
      });

      //Emitter Mapping
      // this.emitterListWidgetSpecific = this.emitterList.filter(
      //   (item: any) => item.emitterId !== this.highlightedWidget.OdtId
      // );
      // this.selectedEmitter = this.emitterListWidgetSpecific.find(
      //   (item: any) => item.emitterId === res.emitterId
      // );

      const { style, ...rest } = this.highlightedWidget.input;
      const selector = this.highlightedWidget.selector
      this.inputProps = Object.keys(rest).map((key) => ({
        key: key,
        name: key + '-' + this.highlightedWidget.OdtId,
        type: Array.isArray(rest[key]) ? 'array' : typeof rest[key],
        displayName: this.camelToPascalSpace(key),
        selector: selector
      }));
      this.dropZones = this.inputProps.map(() => []);

      if (clickedWidget) {
        // Toggle selection: if it's already selected, deselect it, else select it
        if (this.selectedWidget1 === clickedWidget) {
          this.selectedWidget1.classList.remove('selected');
          this.selectedWidget1 = null;
          this.highlightedWidget = undefined;
        } else {
          // Deselect the previous widget
          if (this.selectedWidget1) {
            this.selectedWidget1.classList.remove('selected');
          }
          // Select the new widget
          this.selectedWidget1 = clickedWidget;
          this.selectedWidget1.classList.add('selected');
        }
      }

    }
  }

  dragStart(attribute: any) {
    this.draggedAttribute = attribute;
  }

  drop(prop: any, event: any) {
    if (this.draggedAttribute) {
      const draggedItem = this.draggedAttribute;

      if (draggedItem.type === 'Static') {
        if (prop.selector === 'app-primeng-dropdown' && prop.key === 'data') {
          this.showText(draggedItem, 'create', prop);
        }
        if (prop.type !== 'array') {
          if (draggedItem.name === 'Text') {
            this.showText(draggedItem, 'create', prop);
          } else if (draggedItem.name === 'Image') {
            this.showImage(draggedItem, 'create', prop);
          }
        }
      }
      else if (draggedItem.type === 'Attribute') {
        if (draggedItem.timeSeries) {
          this.showFrequency(draggedItem, 'create', prop);
        }
        else {
          if ((prop.type === 'string' && this.droppedItemsByProp[prop.name].length === 0 && draggedItem?.dataType != 'Array') || (prop.type === 'array' && draggedItem?.dataType === 'Array')) {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.type === 'boolean' && this.droppedItemsByProp[prop.name].length === 0 && draggedItem?.dataType != 'boolean') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.selector === 'app-primeng-dropdown') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.selector === 'app-primeng-sbar') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `You can't map an more than one attribute directly to input type ${prop.type}`,
            });
          }
        }

      }
      else if (draggedItem.type === 'Entity' || draggedItem.type === 'List') {
        if (prop.type === 'array') {
          this.droppedItemsByProp[prop.name].push(draggedItem);
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            this.draggedAttribute
          );
        }
        else if (prop.selector === 'app-primeng-dynamic-table') {
          this.droppedItemsByProp[prop.name].push(draggedItem);
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            this.draggedAttribute
          );
        }
        else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `You can't map an entity directly to input type ${prop.type}`,
          });
        }
      }
      else if (draggedItem.type === 'Event') {
        if (prop.type === 'string') {
          this.droppedItemsByProp[prop.name].push(draggedItem);
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            this.draggedAttribute
          );
        }
        else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `You can't map an event info directly to input type ${prop.type}`,
          });
        }
      }
    }
  }

  dragEnd() {
    this.draggedAttribute = null;
  }

  findIndex(product: any) {
    let index = -1;
    for (let i = 0; i < (this.entityDetails as any[]).length; i++) {
      if (
        product.attributeId === (this.entityDetails as any[])[i].attributeId
      ) {
        index = i;
        break;
      }
    }
    return index;
  }

  getEntityData() {
    this.pageAdminService.getEntityList(this.payload).subscribe({
      next: (res: any) => {
        this.entityList = res.Entity_Attributes.map((item: any) => ({
          id: item.entityId,
          name: item.entityName,
          type: 'Entity',
        }));
      },
      error: (err) => { },
    });
  }

  /**
   * Handles the change event for the dropdown and fetches entity details by ID.
   * Sets the `isShowAttribute` flag to true and assigns the attributes of the fetched entity to `entityDetails`.
   * Logs the response or error using the logger service.
   *
   * @param {DropdownChangeEvent} event - The dropdown change event containing the selected entity's details.
   * @returns {void}
   */
  getAttributes(entityId: any): void {
    if (entityId) {
      this.pageAdminService.getEntityDetailsById(entityId).subscribe({
        next: (res: any) => {
          this.entityDetails = res.attributes.map((item: any) => ({
            id: item.attributeId,
            name: item.attributeName,
            type: 'Attribute',
            dataType: item?.dataPointID?.dataType,
            timeSeries: item?.timeSeries
          }));
        },
        error: (err) => {

        },
      });
    }
  }
  getAttrList() {
    this.pageAdminService.getAttrList(this.payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        console.log(res);
        this.attributes = res[0].attributes
      },
      error: (err) => {
        this.spinner.hide();
      },
    });
  }


  updateODTMapping(odtId: string, inputObjType: string, attributeId: any) {

    this.modifiedWidget = {
      id: this.highlightedWidget.id,
      w: this.highlightedWidget.w,
      h: this.highlightedWidget.h,
      y: this.highlightedWidget.y,
      x: this.highlightedWidget.x,
      selector: this.highlightedWidget.selector,
      input: this.highlightedWidget.input,
      inputOdt: this.highlightedWidget.inputOdt,
    };

    if (this.modifiedWidget.input.hasOwnProperty(inputObjType)) {
      this.modifiedWidget.input[inputObjType] = attributeId?.content;
    }

    const isAppSection = this.highlightedWidget?.grid.parentGridNode?.selector === 'app-section';
    const grid = isAppSection
      ? this.highlightedWidget.grid.parentGridNode.subGrid
      : this.gridComp?.grid;


    grid?.removeWidget(this.highlightedWidget.el);
    this.highlightedWidget = undefined;
    grid?.addWidget(this.modifiedWidget);


    console.log(this.modifiedWidget, attributeId);
    const payload = {
      odtId: odtId,
      inputObjType: inputObjType,
      value: attributeId,
    };
    this.spinner.show();
    this.spinner.hide();
    // this.pageAdminService.postWidgetMapping(payload).subscribe({
    //   next: (res: any) => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Success',
    //       detail: `Mapped Successfully`,
    //     });
    //     this.spinner.hide();
    //   },
    //   error: (err) => {
    //     this.spinner.hide();
    //   },
    // });
  }

  selectEntity: any;
  removeItem(propName: string, itemToRemove: any) {
    this.droppedItemsByProp[propName] = this.droppedItemsByProp[
      propName
    ].filter((item) => item.entityName !== itemToRemove.entityName);
  }

  camelToPascalSpace(input: string): string {
    if (!/[A-Z]/.test(input.slice(1))) {
      return input.charAt(0).toUpperCase() + input.slice(1);
    }
    return input
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }


  // Handle widget selection
  onEmitterValueChange(event: any) {
    const selectedWidget = event.value;
    console.log(selectedWidget);
    if (this.highlightedWidget) {
      // API call to create a new instance of the selected widget
      this.createWidgetInstance(
        this.highlightedWidget.OdtId,
        selectedWidget.emitterId
      );
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Please select a widget to map the emitter`,
      });
    }
  }

  // Create a new instance of the selected widget
  createWidgetInstance(widgetId: string, emitterId: string) {
    const payload = {
      odtId: widgetId,
      emitterId: emitterId, // Assuming the templateId is relevant for the new widget
      // Include other necessary data for widget creation
    };

    this.spinner.show();
    this.pageAdminService.updateEmitterMapping(payload).subscribe({
      next: (res: any) => {
        // Handle success: Log or show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Widget emitter created successfully!`,
        });
        this.spinner.hide();
      },
      error: (err) => {
        // Handle error: Show error message
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to map widget emitter`,
        });
        this.spinner.hide();
      },
    });
  }
  deleteWidgetInstance() {
    const payload = {
      odtId: this.highlightedWidget.OdtId,
      emitterId: '', // Assum  ing the templateId is relevant for the new widget
      // Include other necessary data for widget creation
    };

    this.spinner.show();
    this.pageAdminService.updateEmitterMapping(payload).subscribe({
      next: (res: any) => {
        // Handle success: Log or show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Widget emitter created successfully!`,
        });
        this.spinner.hide();
      },
      error: (err) => {
        // Handle error: Show error message
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to map widget emitter`,
        });
        this.spinner.hide();
      },
    });
  }


  showText(draggedItem: any, type: any, prop?: any,) {
    if (type === 'create') {
      this.ref = this.dialogService.open(TextInputComponent, {
        header: 'Provide an Input',
        width: '25rem',
        modal: true,
        closable: true,
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      });

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          if (prop.selector === 'app-primeng-dropdown' && prop.key === 'data') {
            const res = this.validateInput(data);
            if (res) {
              draggedItem.content = res;
              this.droppedItemsByProp[prop.name].push(draggedItem);
              this.updateODTMapping(
                this.highlightedWidget.OdtId,
                prop.key,
                draggedItem
              );
            }
          }
          else {
            draggedItem.content = data;
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
        }
      });
    }
    else {
      this.ref = this.dialogService.open(TextInputComponent, {
        data: draggedItem.content,
        header: 'Provide an Input',
        width: '25rem',
        modal: true,
        closable: true,
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      });

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          draggedItem.content = data;
          const index = this.droppedItemsByProp[prop.name].findIndex(item => item.name === draggedItem.name);

          if (index !== -1) {
            this.droppedItemsByProp[prop.name][index] = draggedItem;
          } else {
            this.droppedItemsByProp[prop.name].push(draggedItem);
          }
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            draggedItem
          );
        }
      });
    }

  }

  showImage(draggedItem: any, type: any, prop: any) {
    if (type === 'create') {
      this.ref = this.dialogService.open(ImageUploadComponent, {
        header: 'Upload Image',
        width: '50vw',
        modal: true,
        closable: true,
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      });

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          draggedItem.content = data;
          this.droppedItemsByProp[prop.name].push(draggedItem);
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            draggedItem
          );
        }
      });
    } else {
      this.ref = this.dialogService.open(ImageUploadComponent, {
        data: draggedItem.content,
        header: 'Upload Image',
        width: '25rem',
        modal: true,
        closable: true,
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      });

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          draggedItem.content = data;
          const index = this.droppedItemsByProp[prop.name].findIndex(item => item.name === draggedItem.name);

          if (index !== -1) {
            // Replace the existing object
            this.droppedItemsByProp[prop.name][index] = draggedItem;
          } else {
            // Add it if it doesn't exist
            this.droppedItemsByProp[prop.name].push(draggedItem);
          }
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            draggedItem
          );
        }
      });
    }
  }


  showFrequency(draggedItem: any, type: any, prop: any) {
    if (type === 'create') {
      this.ref = this.dialogService.open(FrequencyConfigComponent, {
        header: 'Choose Frequency',
        width: '25rem',
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      });
      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          draggedItem.frequency = data;
          console.log(draggedItem);
          if ((prop.type === 'string' && this.droppedItemsByProp[prop.name].length === 0 && draggedItem?.dataType != 'Array') || (prop.type === 'array' && draggedItem?.dataType === 'Array')) {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.type === 'boolean' && this.droppedItemsByProp[prop.name].length === 0 && draggedItem?.dataType != 'boolean') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.selector === 'app-primeng-dropdown') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.selector === 'app-primeng-sbar') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `You can't map an more than one attribute directly to input type ${prop.type}`,
            });
          }
        }
      });
    } else {
      this.ref = this.dialogService.open(FrequencyConfigComponent, {
        data: draggedItem.content,
        header: 'Upload Image',
        width: '25rem',
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      });

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          draggedItem.content = data;
          const index = this.droppedItemsByProp[prop.name].findIndex(item => item.name === draggedItem.name);
          if (index !== -1) {
            // Replace the existing object
            this.droppedItemsByProp[prop.name][index] = draggedItem;
          } else {
            // Add it if it doesn't exist
            this.droppedItemsByProp[prop.name].push(draggedItem);
          }
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            draggedItem
          );
        }
      });
    }
  }


  onStaticClick(dropedItem: any, prop: any) {
    if (dropedItem.type === 'Static') {
      if (dropedItem.name === 'Text') {
        this.showText(dropedItem, 'update', prop)
      }
      else if (dropedItem.name === 'Custom Array') {
        dropedItem.content = JSON.stringify(dropedItem?.content, null, 2);
        this.showText(dropedItem, 'update', prop)
      }
      else if (dropedItem.name === 'Image') {
        this.showImage(dropedItem, 'update', prop);
      }
    }
  }

  validateInput(userInput: any) {
    try {
      const parsedData = JSON.parse(userInput);
      if (!Array.isArray(parsedData)) {
        throw new Error('Input is not an array!');
      }
      if (parsedData.every(item => typeof item === 'string')) {
      } else if (parsedData.every(item => typeof item === 'number')) {
      } else if (parsedData.every(item => typeof item === 'object' && item.name && item.Value)) {
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Misformatted Array`,
        });
      }
      console.log('Valid Data:', parsedData);
      return parsedData
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Json Syntax Error',
        detail: `${error}`,
      });
      return null;
    }
  }

  openConfirmationDialog(saveType: string) {
    this.ref = this.dialogService.open(TemplateConfirmationComponent, {
      data: saveType,
      modal: true,
      header: 'Save Page',
      closable: true
    })
    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.spinner.show();
        this.serializedData =
          (this.gridComp?.grid?.save(false, true) as GridStackOptions) || '';
        console.log(this.serializedData);
        const payload = {
          templateName: data.pageName,
          templateDescription: data.pageDescription,
          templateWidth: this.canvasWidth,
          templateHeight: this.canvasHeight,
          saveType: data.saveType,
          templateType: this.formConfig?.reportType,
          appId: this.formConfig?.appId,
          orgId: this.formConfig?.orgId,
          templateObj: this.serializedData,
          "activeIdtVersion": "Parent",
          "activeOdtVersion": "Parent",
          "visble": false,
          "sharable": false,
          "confidentialType": false,
          "allowCopyContent": false,
          "allowEditContent": false,
          "isActive": false,
        }
        console.log(payload);
        this.pageAdminService.savePage(payload).subscribe({
          next: (res: any) => {
            this.spinner.hide();
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Page Saved Successfully' })
          },
          error: (err) => {
            this.spinner.hide();
          }
        })
      }
    })
  }

  preview() {
    this.router.navigate(['/globalRenderer/preview'], { state: { pageData: this.serializedData } });
  }
}
