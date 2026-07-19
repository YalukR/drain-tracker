import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Symptoms, PainLevel, BruiseColor } from 'src/app/core/models';
import { PillSelectComponent, PillOption } from 'src/app/pages/clean/pill-select/pill-select.component';

@Component({
  selector: 'app-symptoms-section',
  standalone: true,
  imports: [FormsModule, PillSelectComponent],
  templateUrl: './symptoms-section.component.html',
})
export class SymptomsSectionComponent {
  symptoms = model.required<Symptoms>();

  painOptions = input.required<PillOption<PainLevel>[]>();
  bruiseOptions = input.required<PillOption<BruiseColor>[]>();

  setField<K extends keyof Symptoms>(field: K, value: Symptoms[K]): void {
    this.symptoms.update(s => ({ ...s, [field]: value }));
  }
}