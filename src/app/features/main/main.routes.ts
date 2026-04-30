import { Routes } from '@angular/router';

export const mainRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((module) => module.DashboardPage)
  },
  {
    path: 'chat',
    loadComponent: () => import('../documents/pages/documents.page').then((module) => module.DocumentsPage)
  }
];