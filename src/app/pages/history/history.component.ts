import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { PdfService } from '../../core/services/pdf.service';
import { CleaningLog, LIQUID_COLORS } from '../../core/models';
import { WarningDialogComponent } from '../../shared/warn-dialog/warn-dialog.component';
import { EmptyComponent } from 'src/app/shared/empty/empty.component';

type BadgeVariant = 'cyan' | 'success' | 'danger' | 'warning' | 'neutral';

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  cyan: 'bg-blue-soft text-blue dark:bg-blue-soft-dark dark:text-blue-dark',
  success: 'bg-green/10 text-green dark:bg-green-dark/10 dark:text-green-dark',
  danger: 'bg-danger/10 text-danger dark:bg-danger-dark/10 dark:text-danger-dark',
  warning: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
  neutral: 'bg-surface-alt text-muted dark:bg-surface-alt-dark dark:text-muted-dark',
};

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [WarningDialogComponent, EmptyComponent],
  templateUrl: './history.component.html'
})
export class HistoryComponent implements OnInit {
  private storage = inject(StorageService);
  private pdfService = inject(PdfService);

  logs = signal<CleaningLog[]>([]);
  generating = signal(false);
  deleteTargetId = signal<string | null>(null);
  deleteDialogVisible = computed(() => this.deleteTargetId() !== null);

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

  badgeClasses(variant: BadgeVariant): string {
    return `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_CLASSES[variant]}`;
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