import { Component, Input, ViewEncapsulation } from '@angular/core';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';
import { WidgetService } from '../../../widget.service';

@Component({
  selector: 'app-dynamic-table',
  standalone: false,
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DynamicTableComponent extends BaseWidget {


  @Input() dataSets: any;
  @Input() style: any;
  @Input() emitterId: any;
  @Input() id: any;

  public override serialize(): NgCompInputs | undefined {
    return this.dataSets || this.style
      ? { dataSets: this.dataSets, style: this.style }
      : undefined;
  }

  constructor(private commonService: WidgetService) {
    super();
  }

  attributes = [
    { attributeName: 'Column1' },
    { attributeName: 'Column2' },
    { attributeName: 'Column3' },
    { attributeName: 'Column4' },
    { attributeName: 'Column5' },
  ];

  products = [
    { 'Column1': 'Column1', Column2: 'Column2', Column3: 'Column3', Column4: 'Column4', Column5: 'Column5' },
    { 'Column1': 'Column1', Column2: 'Column2', Column3: 'Column3', Column4: 'Column4', Column5: 'Column5' },
  ];

  ngOnInit() {
    console.log(this.dataSets.attributes);
    console.log(this.dataSets.products);
    this.dataSets.attributes.sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);;
    this.commonService.getSubject(this.emitterId).subscribe((value) => {
      if (value) {
        this.fetchDataBasedOnDropdown(value);
      }
    });
  }
  fetchDataBasedOnDropdown(value: any) {
    const payload = { entityOrInstanceId: value.id, type: 'Table' };
    this.commonService.getData(payload).subscribe({
      next: (res: any) => {
        this.dataSets = res.dataSets
      },
      error: (err: any) => { },
    });
  }
}