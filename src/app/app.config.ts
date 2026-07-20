import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-MX';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { MessageService } from 'primeng/api';

registerLocaleData(localeEs);

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      // Escala de modo CLARO (sin cambios)
      50: '#eaf1fc',
      100: '#d3e3f8',
      200: '#a7c7f1',
      300: '#7aabea',
      400: '#4d8fe0',
      500: '#1e63c4',
      600: '#1a55a8',
      700: '#14488f',
      800: '#103a72',
      900: '#0c2c56',
      950: '#081e3a',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f2f4f7',
          100: '#e9edf2',
          200: '#dce3ea',
          300: '#c5cfd9',
          400: '#a3b0bf',
          500: '#64748b',
          600: '#4b5768',
          700: '#374151',
          800: '#26303f',
          900: '#1a2333',
          950: '#10151f',
        },
      },
      dark: {
        // Escala de superficies Monokai real (base cálida #272822, no gris VSCode)
        surface: {
          0: '#1e1f1a',
          50: '#272822',   // fondo base
          100: '#2f3029',
          200: '#3e3d32',  // línea resaltada / hover
          300: '#49483e',  // selección / bordes
          400: '#5b594c',
          500: '#75715e',  // comentario / texto apagado
          600: '#9a9585',
          700: '#c1bdae',
          800: '#e0ded4',
          900: '#f2f1ea',
          950: '#f8f8f2',  // foreground
        },
        // Acento primario Monokai: cyan/azul (coincide con blue.dark de Tailwind)
        primary: {
          color: '#66d9ef',
          contrastColor: '#1e1f1a',
          hoverColor: '#7fdff2',
          activeColor: '#4fc3dc',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-MX' },
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.dark',
        },
      },
    }),

    MessageService,
  ],
};