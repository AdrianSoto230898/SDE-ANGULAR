import { Routes } from '@angular/router';

export const documentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/documents.page').then((module) => module.DocumentsPage)
  }
];
