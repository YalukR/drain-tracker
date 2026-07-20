import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'clean',
    pathMatch: 'full',
  },
  {
    path: 'clean',
    loadComponent: () => import('./pages/clean/clean.component').then(m => m.CleanComponent),
    data: { icon: 'pi-plus-circle', label: 'Registrar' },
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent),
    data: { icon: 'pi-list', label: 'Historial' },
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/stats/stats.component').then(m => m.StatsComponent),
    data: { icon: 'pi-chart-bar', label: 'Estadísticas' },
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    data: { icon: 'pi-cog', label: 'Configuraciones' },
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    data: { icon: 'pi-share-alt', label: 'Share' },
  },
  { path: '**', redirectTo: '' },
];