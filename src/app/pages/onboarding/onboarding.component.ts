import { Component, signal, output } from '@angular/core';
import { WelcomeComponent } from '../welcome/welcome.component';
import { SetupComponent } from '../setup/setup.component';
import { Drain } from '../../core/models';

type OnboardingStep = 'welcome' | 'setup';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [WelcomeComponent, SetupComponent],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent {
  step = signal<OnboardingStep>('welcome');

  // Se emite cuando el usuario ya configuró al menos un drenaje: el padre (AppComponent)
  // debe dejar de mostrar este componente y mostrar el shell normal de la app.
  completed = output<void>();

  goToSetup(): void {
    this.step.set('setup');
  }

  onDrainsChanged(drains: Drain[]): void {
    if (drains.length > 0) {
      this.completed.emit();
    }
  }
}