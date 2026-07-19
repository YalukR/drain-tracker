import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-MX';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-MX' },
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
        }
      }
    })
  ]
};
