import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';
import { WidgetService } from 'src/app/modules/widgets/widget.service';

@Component({
  selector: 'app-donut',
  standalone: false,
  templateUrl: './donut.component.html',
  styleUrl: './donut.component.css'
})
export class DonutComponent extends BaseWidget {
  data: any;
  options: any;
  @Input() style: any;
  @Input() labels: any[] = [];
  @Input() values: any[] = [];
  @Input() emitterId: any;
  @Input() id: any;
  @Input() inputOdt: any;

  plugins: any;
  constructor(private commonService: WidgetService) {
    super();
  }
  ngOnInit() {
    const textColor = this.style?.color;
    this.data = {
      labels: this.labels,
      datasets: [
        {
          data: this.values,
          backgroundColor: this.style?.backgroundColors || [
            '#4CAF50',
            '#2196F3',
            '#FFEB3B',
          ],
          hoverBackgroundColor: this.style?.backgroundColors || [
            '#4CAF50',
            '#2196F3',
            '#FFEB3B',
          ],
        },
      ],
    };

    this.plugins = [
      {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart: any, args: any, options: any) => {
          const { ctx } = chart;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = options.color || '#ffffff';
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();
        },
      },
      {
        id: 'idSetter',
        beforeInit(chart: any) {
          const canvas = chart.canvas;
          if (canvas) {
            canvas.id = chart.options.plugins.idSetter.id;
          }
        },
      },
    ];

    this.options = {
      cutout: '60%',
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              weight: this.style?.fontWeight,
              family: this.style?.fontFamily,
              size: this.style?.fontSize,
            },
          },
        },
        customCanvasBackgroundColor: {
          color: this.style?.backgroundColor,
        },
        idSetter: {
          id: this.id,
        },
        tooltip: {
          backgroundColor: this.style?.tooltipBgColor,
          titleColor: this.style?.tooltipColor,
          bodyColor: this.style?.tooltipColor,
          footerColor: this.style?.tooltipColor,
          titleAlign: this.style?.textAlign,
          bodyAlign: this.style?.textAlign,
          footerAlign: this.style?.textAlign,
          titleFont: {
            family: this.style?.fontFamily,
            size: this.style?.fontSize,
            weight: this.style?.fontWeight,
          },
          bodyFont: {
            family: this.style?.fontFamily,
            size: this.style?.fontSize,
            weight: this.style?.fontWeight,
          },
          footerFont: {
            family: this.style?.fontFamily,
            size: this.style?.fontSize,
            weight: this.style?.fontWeight,
          },
          caretSize: 8,
          cornerRadius: 6,
          padding: 10,
        },
      },
    };
    // Subscribe to changes in the 'dropdown' key
    this.commonService.getSubject(this.emitterId).subscribe((value) => {
      if (value) {
        this.fetchChartDataBasedOnDropdown(value);
      }
    });
  }

  // Method to simulate API call and update chart data
  fetchChartDataBasedOnDropdown(value: any): void {
    //api call based on the instance id
    const payload = { entityOrInstanceId: value.id };
    this.commonService.getData(payload).subscribe({
      next: (res: any) => {
        this.data = {
          labels: res[this.inputOdt.labels.name],
          datasets: [
            {
              data: res[this.inputOdt.values.name],
              backgroundColor: this.style?.backgroundColors || [
                '#4CAF50',
                '#2196F3',
                '#FFEB3B',
              ],
              hoverBackgroundColor: this.style?.backgroundColors || [
                '#4CAF50',
                '#2196F3',
                '#FFEB3B',
              ],
            },
          ],
        };
      },
      error: (err: any) => { },
    });
  }
}

