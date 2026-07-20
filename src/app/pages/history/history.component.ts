import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { CleaningLog } from '../../core/models';
import { WarningDialogComponent } from '../../shared/warn-dialog/warn-dialog.component';
import { EmptyComponent } from 'src/app/shared/empty/empty.component';
import { PdfGeneratorComponent } from '../pdf-generator/pdf-generator.component';
import { LogCardComponent } from './log-card/log-card.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [WarningDialogComponent, EmptyComponent, PdfGeneratorComponent, LogCardComponent],
  templateUrl: './history.component.html'
})
export class HistoryComponent implements OnInit {
  private storage = inject(StorageService);

  logs = signal<CleaningLog[]>([]);
  loading = signal(true);
  deleteTargetId = signal<string | null>(null);
  deleteDialogVisible = computed(() => this.deleteTargetId() !== null);

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    this.loading.set(true);
    this.logs.set(await this.storage.getLogs());
    this.loading.set(false);
  }

  confirmDelete(id: string): void { this.deleteTargetId.set(id); }
  cancelDelete(): void { this.deleteTargetId.set(null); }

  async confirmDeleteAction(): Promise<void> {
    const id = this.deleteTargetId();
    if (!id) return;
    await this.storage.deleteLog(id);
    await this.refresh();
    this.deleteTargetId.set(null);
  }
}