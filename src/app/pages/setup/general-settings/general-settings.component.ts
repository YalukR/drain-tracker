import { Component, OnInit, input, output, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppSettings } from '../../../core/models';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './general-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralSettingsComponent {
  settings = input.required<AppSettings>();
  today = input.required<string>();
  save = output<AppSettings>();

  // true cuando este componente vive dentro del flujo de onboarding: oculta el botón
  // "Guardar configuración" y guarda automáticamente al salir de cada campo, para no
  // competir con el botón "Continuar" del onboarding.
  embedded = input(false);

  saved = signal(false);

  // Copia local editable: los `input()` de signals son de solo lectura,
  // así que el ngModel de los campos trabaja sobre esta copia.
  local: AppSettings = {};

  // Modo vista/edición. Arranca en `false` (editable) hasta que sepamos si ya
  // hay datos guardados — el effect de abajo lo ajusta apenas llega `settings()`.
  editing = signal(false);

  private initialized = false;

  constructor() {
    // A diferencia de ngOnInit (que corre una sola vez), este effect se re-ejecuta
    // cada vez que `settings()` cambia — así si el padre carga los datos de forma
    // async y el valor llega después del primer render, sí se refleja aquí.
    effect(() => {
      const value = this.settings();
      this.local = { ...value };

      if (!this.initialized) {
        this.initialized = true;
        // Si ya venía con algo guardado (no es la primera vez), arranca en modo
        // vista/bloqueado. Si viene vacío (onboarding, primera vez), arranca editable.
        const hasData = !!(value.surgeryDate || value.alertThresholdMl || value.reminderTime);
        this.editing.set(this.embedded() || !hasData);
      }
    });
  }

  startEditing(): void {
    this.editing.set(true);
  }

  submit(): void {
    const clean: AppSettings = {
      surgeryDate: this.local.surgeryDate || undefined,
      alertThresholdMl: this.local.alertThresholdMl
        ? Number(this.local.alertThresholdMl)
        : undefined,
      reminderTime: this.local.reminderTime || undefined,
    };
    this.save.emit(clean);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);

    if (!this.embedded()) {
      this.editing.set(false); // vuelve a modo vista tras guardar
    }
  }

  // Llamado en (change) de cada campo cuando embedded() es true: guarda sin
  // necesidad de un botón explícito, ya que en onboarding no queremos ese paso extra.
  onFieldCommit(): void {
    if (this.embedded()) {
      this.submit();
    }
  }

  clearSurgeryDate(): void {
    this.local.surgeryDate = undefined;
    this.submit();
  }

  formatReminderTime(t: string): string {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  }
}