import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Drain, AppSettings } from '../../core/models';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './setup.page.html'
})
export class SetupPage implements OnInit {
  router = inject(Router);
  private storage = inject(StorageService);
  private notifications = inject(NotificationService);

  drains = signal<Drain[]>([]);
  newLabel = '';
  newDate = '';
  today = new Date().toISOString().split('T')[0];
  deleteTarget = signal<Drain | null>(null);

  // Settings
  settings: AppSettings = {};
  settingsSaved = signal(false);

  ngOnInit(): void {
    this.drains.set(this.storage.getDrains());
    this.settings = { ...this.storage.getSettings() };
  }

  // ── Drains ──────────────────────────────────────────────────────────────
  add(): void {
    if (!this.newLabel.trim() || !this.newDate) return;
    const drain: Drain = {
      id: crypto.randomUUID(),
      label: this.newLabel.trim(),
      startDate: this.newDate,
    };
    const updated = [...this.drains(), drain];
    this.drains.set(updated);
    this.storage.saveDrains(updated);
    this.newLabel = '';
    this.newDate = '';
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

  formatDate(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  // ── Settings ────────────────────────────────────────────────────────────
  saveSettings(): void {
    // Limpiar valores vacíos para no guardar basura
    const clean: AppSettings = {
      surgeryDate: this.settings.surgeryDate || undefined,
      alertThresholdMl: this.settings.alertThresholdMl
        ? Number(this.settings.alertThresholdMl)
        : undefined,
      reminderIntervalHours: this.settings.reminderIntervalHours
        ? Number(this.settings.reminderIntervalHours)
        : undefined,
    };
    this.storage.saveSettings(clean);
    this.settingsSaved.set(true);
    this.notifications.schedule();
    setTimeout(() => this.settingsSaved.set(false), 2500);
  }

  clearSurgeryDate(): void {
    this.settings.surgeryDate = undefined;
    this.saveSettings();
  }
}