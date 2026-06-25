import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Drain } from '../../models';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup.page.html' 
})
export class SetupPage implements OnInit {
  router = inject(Router);
  private storage = inject(StorageService);

  drains = signal<Drain[]>([]);
  newLabel = '';
  newDate = '';
  today = new Date().toISOString().split('T')[0];
  deleteTarget = signal<Drain | null>(null);

  ngOnInit(): void { this.drains.set(this.storage.getDrains()); }

  add(): void {
    if (!this.newLabel.trim() || !this.newDate) return;
    const drain: Drain = { id: crypto.randomUUID(), label: this.newLabel.trim(), startDate: this.newDate };
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
}
