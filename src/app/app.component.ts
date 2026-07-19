import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent],
  template: `
    <router-outlet />
    <app-bottom-nav />
  `
})
export class AppComponent implements OnInit {
  private notifications = inject(NotificationService);

  ngOnInit(): void {
    // Programar recordatorio al abrir la app.
    // Si no hay intervalo configurado, schedule() no hace nada.
    this.notifications.schedule();
  }
}