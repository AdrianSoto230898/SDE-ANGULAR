import { Routes } from '@angular/router';

export const processesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/processes.page').then((m) => m.ProcessesPage),
      }
    ],
  },
];
