import { Component, input } from '@angular/core';
import { ChartsComponent, ChartPoint } from '../../../shared/charts/charts.component';

@Component({
  selector: 'app-trend-chart-card',
  standalone: true,
  imports: [ChartsComponent],
  templateUrl: './trend-chart-card.component.html',
})
export class TrendChartCardComponent {
  data = input.required<ChartPoint[]>();
  dayCount = input.required<number>();
  maxDay = input.required<number>();
  avgMl = input.required<number>();
}