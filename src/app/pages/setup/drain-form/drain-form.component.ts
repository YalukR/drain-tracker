import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface NewDrainPayload {
  label: string;
  startDate: string;
}

@Component({
  selector: 'app-drain-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './drain-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrainFormComponent {
  today = input.required<string>();
  add = output<NewDrainPayload>();

  newLabel = '';
  newDate = '';

  submit(): void {
    if (!this.newLabel.trim() || !this.newDate) return;
    this.add.emit({ label: this.newLabel.trim(), startDate: this.newDate });
    this.newLabel = '';
    this.newDate = '';
  }
}