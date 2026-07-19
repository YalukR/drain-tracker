import { Component, input } from '@angular/core';

@Component({
  selector: 'app-summary-stats',
  standalone: true,
  imports: [],
  templateUrl: './summary-stats.component.html',
})
export class SummaryStatsComponent {
  totalLogs = input.required<number>();
  totalMl = input.required<number>();
  avgMl = input.required<number>();
  trendIcon = input.required<string>();
  trendColorClass = input.required<string>();
  trendLabel = input.required<string>();
}