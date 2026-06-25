import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { PdfService } from '../../services/pdf.service';
import { CleaningLog, LIQUID_COLORS } from '../../models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.page.html'
})
export class HistoryPage implements OnInit {
  private storage = inject(StorageService);
  private pdfService = inject(PdfService);

  logs = signal<CleaningLog[]>([]);
  generating = signal(false);
  deleteTargetId = signal<string | null>(null);

  ngOnInit(): void { this.logs.set(this.storage.getLogs()); }

  total(log: CleaningLog): number {
    return log.entries.reduce((s, e) => s + e.amountMl, 0);
  }

  hasSymptoms(log: CleaningLog): boolean {
    if (!log.symptoms) return false;
    const s = log.symptoms;
    return s.redness || s.numbness || s.suctionSensation || s.tingling ||
           s.itching || s.skinColorChange || s.fever || s.painLevel !== 'ninguno';
  }

  getColorHex(value: string): string {
    return LIQUID_COLORS.find(c => c.value === value)?.hex ?? '#ccc';
  }

  getColorLabel(value: string): string {
    return LIQUID_COLORS.find(c => c.value === value)?.label ?? value;
  }

  confirmDelete(id: string): void { this.deleteTargetId.set(id); }
  cancelDelete(): void { this.deleteTargetId.set(null); }

  confirmDeleteAction(): void {
    const id = this.deleteTargetId();
    if (!id) return;
    this.storage.deleteLog(id);
    this.logs.set(this.storage.getLogs());
    this.deleteTargetId.set(null);
  }

  async downloadPdf(): Promise<void> {
    this.generating.set(true);
    try {
      await this.pdfService.generate(this.logs(), this.storage.getDrains());
    } finally {
      this.generating.set(false);
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-MX', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
}
