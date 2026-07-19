import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/setup/setup.component').then(m => m.SetupComponent),
    data: { icon: 'pi-home', label: 'Inicio' },
  },
  {
    path: 'clean',
    loadComponent: () => import('./pages/clean/clean.component').then(m => m.CleanComponent),
    data: { icon: 'pi-plus-circle', label: 'Registrar' },
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then(m => m.HistoryPage),
    data: { icon: 'pi-list', label: 'Historial' },
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/stats/stats.page').then(m => m.StatsPage),
    data: { icon: 'pi-chart-bar', label: 'Estadísticas' },
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    data: { icon: 'pi-cog', label: 'Configuraciones'}
    // sin `data.icon` -> no aparece en el footer
  },
  { path: '**', redirectTo: '' },
];