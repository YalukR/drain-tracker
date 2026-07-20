import { Component, inject, input, signal } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { PdfService } from '../../core/services/pdf.service';
import { CleaningLog } from '../../core/models';

@Component({
  selector: 'app-pdf-generator',
  standalone: true,
  imports: [],
  templateUrl: './pdf-generator.component.html',
})
export class PdfGeneratorComponent {
  private storage = inject(StorageService);
  private pdfService = inject(PdfService);

  logs = input.required<CleaningLog[]>();

  generating = signal(false);

  async downloadPdf(): Promise<void> {
    this.generating.set(true);
    try {
      const drains = await this.storage.getDrains();
      await this.pdfService.generate(this.logs(), drains);
    } finally {
      this.generating.set(false);
    }
  }
}