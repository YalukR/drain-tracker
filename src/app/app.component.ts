import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageFooterComponent } from './layout/page-footer/page-footer.component';
import { NotificationService } from './core/services/notification.service';
import { StorageService } from './core/services/storage.service';
import { OnboardingComponent } from './pages/onboarding/onboarding.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PageFooterComponent, OnboardingComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private notifications = inject(NotificationService);
  private storage = inject(StorageService);

  onboardingComplete = signal<boolean | null>(null); // null = aún verificando

  async ngOnInit(): Promise<void> {
    // Programar recordatorio al abrir la app.
    // Si no hay intervalo configurado, schedule() no hace nada.
    await this.notifications.schedule();

    const drains = await this.storage.getDrains();
    this.onboardingComplete.set(drains.length > 0);
  }

  onOnboardingCompleted(): void {
    this.onboardingComplete.set(true);
  }
}