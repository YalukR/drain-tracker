import { Component, OnInit, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppSettings } from '../../../core/models';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './general-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralSettingsComponent implements OnInit {
  settings = input.required<AppSettings>();
  today = input.required<string>();
  save = output<AppSettings>();

  saved = signal(false);

  // Copia local editable: los `input()` de signals son de solo lectura,
  // así que el ngModel de los campos trabaja sobre esta copia.
  local: AppSettings = {};

  ngOnInit(): void {
    this.local = { ...this.settings() };
  }

  submit(): void {
    const clean: AppSettings = {
      surgeryDate: this.local.surgeryDate || undefined,
      alertThresholdMl: this.local.alertThresholdMl
        ? Number(this.local.alertThresholdMl)
        : undefined,
      reminderIntervalHours: this.local.reminderIntervalHours
        ? Number(this.local.reminderIntervalHours)
        : undefined,
    };
    this.save.emit(clean);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  clearSurgeryDate(): void {
    this.local.surgeryDate = undefined;
    this.submit();
  }
}