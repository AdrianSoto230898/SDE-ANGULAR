import { Routes } from '@angular/router';

export const glosaryRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/glossary.page').then((m) => m.GlossaryPage),
      }
    ],
  },
];
