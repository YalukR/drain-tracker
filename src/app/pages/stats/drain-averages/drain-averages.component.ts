import { Component, input } from '@angular/core';

interface DrainAvg {
  id: string;
  label: string;
  avg: number;
  pct: number;
}

@Component({
  selector: 'app-drain-averages',
  standalone: true,
  imports: [],
  templateUrl: './drain-averages.component.html',
})
export class DrainAveragesComponent {
  drainAvgs = input.required<DrainAvg[]>();
}