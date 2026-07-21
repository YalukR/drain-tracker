import { Component, signal, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { WelcomeComponent } from '../welcome/welcome.component';
import { SetupComponent } from '../setup/setup.component';
import { DialogComponentComponent } from 'src/app/shared/dialog-component/dialog-component.component';
import { LoadingComponent } from 'src/app/shared/loading/loading.component';
import { Drain } from '../../core/models';

type OnboardingStep = 'welcome' | 'setup' | 'finishing';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [WelcomeComponent, SetupComponent, ButtonModule, DialogComponentComponent, LoadingComponent],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent {
  step = signal<OnboardingStep>('welcome');

  hasAtLeastOneDrain = signal(false);
  confirmVisible = signal(false);

  completed = output<void>();

  goToSetup(): void {
    this.step.set('setup');
  }

  onDrainsChanged(drains: Drain[]): void {
    this.hasAtLeastOneDrain.set(drains.length > 0);
  }

  askFinish(): void {
    this.confirmVisible.set(true);
  }

  confirmFinish(): void {
    this.confirmVisible.set(false);
    this.step.set('finishing');

    // Pausa deliberada: no hace falta técnicamente, pero un salto instantáneo
    // de "Sí, terminé" a la app completa se siente demasiado abrupto. Este
    // breve momento le da al usuario la sensación de que algo se preparó.
    setTimeout(() => this.completed.emit(), 1200);
  }

  cancelFinish(): void {
    this.confirmVisible.set(false);
  }
}