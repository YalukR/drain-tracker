import { Component, inject, input, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { MessageService } from 'primeng/api';
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
  private messageService = inject(MessageService);

  logs = input.required<CleaningLog[]>();

  generating = signal(false);

  async downloadPdf(): Promise<void> {
    this.generating.set(true);
    try {
      const drains = await this.storage.getDrains();
      const { blob, base64, fileName } = await this.pdfService.generate(this.logs(), drains);

      if (Capacitor.isNativePlatform()) {
        await this.saveAndShareNative(base64, fileName);
      } else {
        this.downloadInBrowser(blob, fileName);
      }
    } catch (err) {
      // Antes este error se perdía en silencio (sin catch, la promesa
      // rechazada nunca llegaba a ningún lado visible para el usuario).
      console.error('Error generando/compartiendo PDF:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'No se pudo generar el PDF',
        detail: err instanceof Error ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo.',
        life: 5000,
      });
    } finally {
      this.generating.set(false);
    }
  }

  private async saveAndShareNative(base64: string, fileName: string): Promise<void> {
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });

    await Share.share({
      title: 'Registro de drenajes',
      text: 'Reporte de limpiezas generado desde la app.',
      url: result.uri,
      dialogTitle: 'Guardar o compartir PDF',
    });
  }

  private downloadInBrowser(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}