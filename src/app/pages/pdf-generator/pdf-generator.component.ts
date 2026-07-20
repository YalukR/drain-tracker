import { Component, inject, input, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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
      const { blob, base64, fileName } = await this.pdfService.generate(this.logs(), drains);

      if (Capacitor.isNativePlatform()) {
        await this.saveAndShareNative(base64, fileName);
      } else {
        this.downloadInBrowser(blob, fileName);
      }
    } finally {
      this.generating.set(false);
    }
  }

  // Flujo nativo (iOS/Android vía Capacitor): escribe el archivo en el
  // almacenamiento del caché de la app y abre la hoja de compartir del SO,
  // que es la única forma confiable de "guardar" un archivo en móvil.
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

  // Flujo web (navegador de escritorio): el patrón clásico de blob + <a download>
  // sigue funcionando perfecto aquí, no hace falta tocarlo.
  private downloadInBrowser(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}