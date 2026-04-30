import { Routes } from '@angular/router';

export const accessRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'auth',
        loadComponent: () => import('../access/pages/auth/auth.component').then(m => m.AuthComponent)
      },
      {
        path: 'denied',
        loadComponent: () => import('../access/pages/denied/denied.component').then(m => m.DeniedComponent)
      },
    ],
  },
];
