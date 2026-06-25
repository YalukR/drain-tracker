import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/setup/setup.page').then(m => m.SetupPage)
  },
  {
    path: 'clean',
    loadComponent: () => import('./pages/clean/clean.page').then(m => m.CleanPage)
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then(m => m.HistoryPage)
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/stats/stats.page').then(m => m.StatsPage)
  },
  { path: '**', redirectTo: '' }
];
