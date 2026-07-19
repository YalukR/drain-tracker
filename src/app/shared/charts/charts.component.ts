import { Component, input, computed } from '@angular/core';

export interface ChartPoint {
  label: string;
  value: number;
}

let instanceCounter = 0;

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [],
  templateUrl: './charts.component.html',
})
export class ChartsComponent {
  data = input.required<ChartPoint[]>();
  colorClass = input('text-blue dark:text-blue-dark');

  private readonly width = 300;
  private readonly height = 80;
  private readonly padding = 10;

  // Cada instancia necesita un id de gradiente único, o si hay
  // 2+ gráficas en la misma página, todas comparten el mismo <linearGradient>.
  gradientId = `chart-grad-${instanceCounter++}`;

  max = computed(() => Math.max(...this.data().map(d => d.value), 1));

  points = computed(() => {
    const items = this.data();
    if (items.length < 2) return [];
    const max = this.max();
    return items.map((d, i) => ({
      x: this.padding + (i / (items.length - 1)) * (this.width - this.padding * 2),
      y: this.height - this.padding - (d.value / max) * (this.height - this.padding * 2),
      value: d.value,
      label: d.label,
    }));
  });

  polyline = computed(() =>
    this.points().map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  );

  areaPolygon = computed(() => {
    const poly = this.polyline();
    if (!poly) return '';
    return `${this.padding},${this.height} ${poly} ${this.width - this.padding},${this.height}`;
  });

  // Si hay pocos puntos, mostramos etiqueta en todos; si hay muchos, solo primero/último.
  showAllLabels = computed(() => this.data().length <= 7);
}