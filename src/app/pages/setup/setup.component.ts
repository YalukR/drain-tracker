import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit, output, input } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Drain, AppSettings } from '../../core/models';
import { DrainListsComponent } from './drain-lists/drain-lists.component';
import { DrainFormComponent, NewDrainPayload } from './drain-form/drain-form.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { WarningDialogComponent } from 'src/app/shared/warn-dialog/warn-dialog.component';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [DrainListsComponent, DrainFormComponent, GeneralSettingsComponent, WarningDialogComponent],
  templateUrl: './setup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupComponent implements OnInit {
  router = inject(Router);
  private storage = inject(StorageService);
  private notifications = inject(NotificationService);

  // true cuando este componente vive dentro del flujo de onboarding: oculta el botón
  // "Ir a registrar limpieza" (redundante con el "Continuar" del onboarding) y pasa
  // el mismo flag a general-settings para que también oculte su botón de guardar.
  embedded = input(false);

  drains = signal<Drain[]>([]);
  settings = signal<AppSettings>({});
  loading = signal(true);
  today = new Date().toISOString().split('T')[0];

  drainsChanged = output<Drain[]>();

  deleteTarget = signal<Drain | null>(null);
  deleteDialogVisible = computed(() => this.deleteTarget() !== null);
  deleteMessage = computed(() =>
    `Se eliminará "${this.deleteTarget()?.label ?? ''}" y todos sus registros asociados. Esta acción no se puede deshacer.`
  );

  async ngOnInit(): Promise<void> {
    const [drains, settings] = await Promise.all([
      this.storage.getDrains(),
      this.storage.getSettings(),
    ]);
    this.drains.set(drains);
    this.settings.set(settings);
    this.loading.set(false);
  }

  async addDrain(payload: NewDrainPayload): Promise<void> {
    const drain: Drain = { id: crypto.randomUUID(), ...payload };
    const updated = [...this.drains(), drain];
    this.drains.set(updated);
    await this.storage.saveDrains(updated);
    this.drainsChanged.emit(updated);
  }

  confirmDelete(drain: Drain): void { this.deleteTarget.set(drain); }
  cancelDelete(): void { this.deleteTarget.set(null); }

  async executeDelete(): Promise<void> {
    const target = this.deleteTarget();
    if (!target) return;
    const updated = this.drains().filter(d => d.id !== target.id);
    this.drains.set(updated);
    await this.storage.saveDrains(updated);
    this.drainsChanged.emit(updated);
    this.deleteTarget.set(null);
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    this.settings.set(settings);
    await this.storage.saveSettings(settings);
    await this.notifications.schedule();
  }
}