import { Injectable, inject } from '@angular/core';
import { LocalNotifications, ScheduleResult } from '@capacitor/local-notifications';
import { StorageService } from './storage.service';

const NOTIFICATION_ID = 1001; // ID fijo para poder cancelarlo y reemplazarlo fácilmente

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private storage = inject(StorageService);

  // Pedir permiso y programar el recordatorio según la configuración guardada.
  // Llamar esto al iniciar la app y cada vez que el usuario cambie el intervalo.
  async schedule(): Promise<void> {
    const { reminderIntervalHours } = this.storage.getSettings();

    // Cancelar siempre primero para evitar duplicados
    await this.cancel();

    if (!reminderIntervalHours || reminderIntervalHours <= 0) return;

    const { display } = await LocalNotifications.requestPermissions();
    if (display !== 'granted') return;

    const intervalMs = reminderIntervalHours * 60 * 60 * 1000;
    const firstAt = new Date(Date.now() + intervalMs);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_ID,
          title: 'Recordatorio de limpieza',
          body: 'Es momento de vaciar y registrar tus drenajes.',
          schedule: {
            at: firstAt,
            repeats: true,
            every: 'hour',
            count: reminderIntervalHours, // repetir cada N horas
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