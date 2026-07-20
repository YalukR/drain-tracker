import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  continueClicked = output<void>();
}