import { Component, signal, computed, inject } from '@angular/core';
import { ThemeComponent } from './theme/theme.component';
import { SetupComponent } from '../setup/setup.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ThemeComponent, SetupComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {

}