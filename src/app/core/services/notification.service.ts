import { Injectable, inject } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StorageService } from './storage.service';

const NOTIFICATION_ID = 1001; // ID fijo para poder cancelarlo y reemplazarlo fácilmente

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private storage = inject(StorageService);

  // Pedir permiso y programar el recordatorio diario según la hora guardada.
  // Llamar esto al iniciar la app y cada vez que el usuario cambie la hora.
  async schedule(): Promise<void> {
    const { reminderTime } = await this.storage.getSettings();

    // Cancelar siempre primero para evitar duplicados
    await this.cancel();

    if (!reminderTime) return;

    const [hour, minute] = reminderTime.split(':').map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return;

    const { display } = await LocalNotifications.requestPermissions();
    if (display !== 'granted') return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_ID,
          title: 'Recordatorio de limpieza',
          body: 'Es momento de vaciar y registrar tus drenajes.',
          schedule: {
            on: { hour, minute },
            repeats: true, // se repite todos los días a esta hora
          },
          sound: undefined,
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  }

  async cancel(): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
    } catch {
      // Si no había notificación programada, ignorar el error
    }
  }

  // Llamar esto después de guardar un registro para reiniciar el contador
  async reschedule(): Promise<void> {
    await this.schedule();
  }
}