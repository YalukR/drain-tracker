import { Component, signal, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { WelcomeComponent } from '../welcome/welcome.component';
import { SetupComponent } from '../setup/setup.component';
import { Drain } from '../../core/models';

type OnboardingStep = 'welcome' | 'setup';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [WelcomeComponent, SetupComponent, ButtonModule],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent {
  step = signal<OnboardingStep>('welcome');

  // Ya hay al menos 1 drenaje configurado, así que mostramos el botón de continuar.
  // No avanzamos automáticamente: el usuario decide cuándo terminar de configurar
  // (puede querer agregar más drenajes o ajustar settings antes de seguir).
  hasAtLeastOneDrain = signal(false);

  // Se emite cuando el usuario confirma que terminó de configurar: el padre (AppComponent)
  // debe dejar de mostrar este componente y mostrar el shell normal de la app.
  completed = output<void>();

  goToSetup(): void {
    this.step.set('setup');
  }

  onDrainsChanged(drains: Drain[]): void {
    this.hasAtLeastOneDrain.set(drains.length > 0);
  }

  finishOnboarding(): void {
    this.completed.emit();
  }
}