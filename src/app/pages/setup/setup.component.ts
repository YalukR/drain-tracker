import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
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
export class SetupComponent {
  router = inject(Router);
  private storage = inject(StorageService);
  private notifications = inject(NotificationService);

  drains = signal<Drain[]>(this.storage.getDrains());
  settings = signal<AppSettings>(this.storage.getSettings());
  today = new Date().toISOString().split('T')[0];

  deleteTarget = signal<Drain | null>(null);
  deleteDialogVisible = computed(() => this.deleteTarget() !== null);
  deleteMessage = computed(() =>
    `Se eliminará "${this.deleteTarget()?.label ?? ''}" y todos sus registros asociados. Esta acción no se puede deshacer.`
  );

  addDrain(payload: NewDrainPayload): void {
    const drain: Drain = { id: crypto.randomUUID(), ...payload };
    const updated = [...this.drains(), drain];
    this.drains.set(updated);
    this.storage.saveDrains(updated);
  }

  confirmDelete(drain: Drain): void { this.deleteTarget.set(drain); }
  cancelDelete(): void { this.deleteTarget.set(null); }

  executeDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    const updated = this.drains().filter(d => d.id !== target.id);
    this.drains.set(updated);
    this.storage.saveDrains(updated);
    this.deleteTarget.set(null);
  }

  saveSettings(settings: AppSettings): void {
    this.settings.set(settings);
    this.storage.saveSettings(settings);
    this.notifications.schedule();
  }
}