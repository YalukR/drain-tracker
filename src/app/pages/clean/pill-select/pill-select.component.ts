import { Component, input, output } from '@angular/core';

export interface PillOption<T = string> {
  value: T;
  label: string;
  hex?: string; // color propio opcional (ej: moretones) — si no se da, usa el azul de marca
}

@Component({
  selector: 'app-pill-select',
  standalone: true,
  imports: [],
  templateUrl: './pill-select.component.html',
})
export class PillSelectComponent<T = string> {
  options = input.required<PillOption<T>[]>();
  value = input<T | undefined>();

  // 'grid-2' | 'grid-3' | 'grid-4' | 'wrap' — clases literales, no interpoladas
  // (Tailwind necesita ver la clase completa en el código fuente para generarla)
  layout = input<'grid-2' | 'grid-3' | 'grid-4' | 'wrap'>('grid-2');

  // 'square' = rounded-lg (coágulo, dolor) · 'round' = rounded-full (moretón)
  shape = input<'square' | 'round'>('square');

  valueChange = output<T>();

  select(option: PillOption<T>): void {
    this.valueChange.emit(option.value);
  }

  isSelected(option: PillOption<T>): boolean {
    return this.value() === option.value;
  }

  borderColor(option: PillOption<T>): string {
    if (!this.isSelected(option)) return 'transparent';
    return option.hex ?? '';
  }

  backgroundColor(option: PillOption<T>): string {
    if (!this.isSelected(option) || !option.hex) return '';
    return option.hex + '33'; // ~20% opacidad en hex
  }
}