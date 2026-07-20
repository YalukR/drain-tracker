import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit, output, input } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
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
  private messageService = inject(MessageService);

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

  showAddForm = signal(this.embedded());
  showGeneralSettings = signal(this.embedded());

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
    try {
      const drain: Drain = { id: crypto.randomUUID(), ...payload };
      const updated = [...this.drains(), drain];
      this.drains.set(updated);
      await this.storage.saveDrains(updated);
      this.drainsChanged.emit(updated);

      this.messageService.add({
        severity: 'success',
        summary: 'Drenaje agregado',
        detail: `"${payload.label}" se agregó correctamente.`,
        life: 3000,
      });

      if (!this.embedded()) {
        this.showAddForm.set(false);
      }
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'No se pudo agregar',
        detail: 'Ocurrió un error al guardar el drenaje. Intenta de nuevo.',
        life: 4000,
      });
    }
  }

  confirmDelete(drain: Drain): void { this.deleteTarget.set(drain); }
  cancelDelete(): void { this.deleteTarget.set(null); }

  async executeDelete(): Promise<void> {
    const target = this.deleteTarget();
    if (!target) return;

    try {
      const updated = this.drains().filter(d => d.id !== target.id);
      this.drains.set(updated);
      await this.storage.saveDrains(updated);
      this.drainsChanged.emit(updated);

      this.messageService.add({
        severity: 'success',
        summary: 'Drenaje eliminado',
        detail: `"${target.label}" y sus registros fueron eliminados.`,
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'No se pudo eliminar',
        detail: 'Ocurrió un error al eliminar el drenaje. Intenta de nuevo.',
        life: 4000,
      });
    } finally {
      this.deleteTarget.set(null);
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      this.settings.set(settings);
      await this.storage.saveSettings(settings);
      await this.notifications.schedule();

      this.messageService.add({
        severity: 'success',
        summary: 'Configuración guardada',
        detail: 'Tus preferencias se actualizaron correctamente.',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'No se pudo guardar',
        detail: 'Ocurrió un error al guardar la configuración.',
        life: 4000,
      });
    }
  }
}