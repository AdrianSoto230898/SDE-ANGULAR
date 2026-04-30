import { Routes } from '@angular/router';

export const configurationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'form',
        loadComponent: () =>
          import('./pages/form/form.page').then((m) => m.FormPage),
      },
      {
        path: 'form/:id',
        loadComponent: () =>
          import('./pages/form/form.page').then((m) => m.FormPage),
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./pages/list/list.page').then((m) => m.ListPage),
      }
    ],
  },
];
