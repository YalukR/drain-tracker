import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageFooterComponent } from './layout/page-footer/page-footer.component';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PageFooterComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private notifications = inject(NotificationService);

  ngOnInit(): void {
    // Programar recordatorio al abrir la app.
    // Si no hay intervalo configurado, schedule() no hace nada.
    this.notifications.schedule();
  }
}