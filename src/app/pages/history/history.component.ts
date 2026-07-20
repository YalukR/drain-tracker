import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
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
  private messageService = inject(MessageService);

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

    try {
      await this.storage.deleteLog(id);
      await this.refresh();

      this.messageService.add({
        severity: 'success',
        summary: 'Registro eliminado',
        detail: 'El registro se eliminó permanentemente.',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'No se pudo eliminar',
        detail: 'Ocurrió un error al eliminar el registro. Intenta de nuevo.',
        life: 4000,
      });
    } finally {
      this.deleteTargetId.set(null);
    }
  }
}