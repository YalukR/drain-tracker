import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DrainEntry, LiquidColor, LiquidColorOption } from 'src/app/core/models';
import { PillSelectComponent, PillOption } from 'src/app/pages/clean/pill-select/pill-select.component';

type ClotSize = NonNullable<DrainEntry['clotSize']>;
type ClotStatus = NonNullable<DrainEntry['clotStatus']>;

const DEFAULT_CUSTOM_COLOR = '#8b8b8b';

@Component({
  selector: 'app-drain-entry-card',
  standalone: true,
  imports: [FormsModule, PillSelectComponent],
  templateUrl: './drain-entry-card.component.html',
})
export class DrainEntryCardComponent {
  drainLabel = input.required<string>();
  amount = input.required<number>();
  entry = input.required<Partial<DrainEntry>>();
  liquidColors = input.required<LiquidColorOption[]>();
  clotSizeOptions = input.required<PillOption<ClotSize>[]>();
  clotStatusOptions = input.required<PillOption<ClotStatus>[]>();

  amountChange = output<number>();
  entryFieldChange = output<{ field: keyof DrainEntry; value: unknown }>();

  defaultCustomColor = DEFAULT_CUSTOM_COLOR;

  increment(): void { this.amountChange.emit(this.amount() + 5); }
  decrement(): void { this.amountChange.emit(this.amount() - 5); }
  onAmountInput(val: number): void {
    this.amountChange.emit(Math.max(0, Math.round(Number(val) || 0)));
  }

  setField(field: keyof DrainEntry, value: unknown): void {
    this.entryFieldChange.emit({ field, value });
  }

  setColor(color: LiquidColor): void { this.setField('liquidColor', color); }

  // Al elegir un color del selector nativo, marcamos liquidColor='otro' y
  // guardamos el hex exacto que escogió — así el color queda registrado tal
  // cual, sin forzarlo a la lista predefinida.
  onCustomColorPick(hex: string): void {
    this.setField('liquidColor', 'otro');
    this.setField('customLiquidColorHex', hex);
  }

  get customColorHex(): string {
    return this.entry().customLiquidColorHex ?? DEFAULT_CUSTOM_COLOR;
  }
}