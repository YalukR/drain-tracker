import { Component, signal, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { MessageService } from 'primeng/api';

const REPO_URL = 'https://github.com/YalukR/drain-tracker';

const SHARE_MESSAGE =
  `Drain Tracker: una app gratuita y de código abierto para llevar el registro de drenajes post-quirúrgicos ` +
  `(volumen, síntomas, recordatorios). La hice de forma voluntaria para que nadie tenga que pagar por algo así ` +
  `en un momento donde ya se gasta bastante. Si a ti o alguien que conoces le sirve:\n\n${REPO_URL}`;

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
})
export class AboutComponent {
  private messageService = inject(MessageService);

  repoUrl = REPO_URL;
  sharing = signal(false);

  async share(): Promise<void> {
    this.sharing.set(true);
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: 'Drain Tracker',
          text: SHARE_MESSAGE,
          dialogTitle: 'Compartir Drain Tracker',
        });
        return;
      }

      // Navegador: Web Share API si está disponible (móvil sobre todo),
      // si no, copiamos el mensaje al portapapeles como último recurso.
      if (navigator.share) {
        await navigator.share({ title: 'Drain Tracker', text: SHARE_MESSAGE });
        return;
      }

      await navigator.clipboard.writeText(SHARE_MESSAGE);
      this.messageService.add({
        severity: 'success',
        summary: 'Mensaje copiado',
        detail: 'Pégalo donde quieras compartirlo.',
        life: 3000,
      });
    } catch (err) {
      // AbortError = el usuario cerró la hoja de compartir sin elegir nada; no es un error real.
      if (err instanceof Error && err.name === 'AbortError') return;

      this.messageService.add({
        severity: 'error',
        summary: 'No se pudo compartir',
        detail: 'Intenta de nuevo o copia el enlace manualmente.',
        life: 4000,
      });
    } finally {
      this.sharing.set(false);
    }
  }
}