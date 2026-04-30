import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { accessRoutes } from './features/access/access.routes';
import { configurationRoutes } from './features/configuration/configuration.routes';
import { documentsRoutes } from './features/documents/documents.routes';
import { glosaryRoutes } from './features/glossary/glosary.routes';
import { mainRoutes } from './features/main/main.routes';
import { processesRoutes } from './features/processes/processes.routes';
import { LayoutPagePage } from './layout/layout/layout.page';
import { LayoutLoginComponent } from './layout/layout-login/layout-login.component';

export const routes: Routes = [
  {
    path: 'access',
    component: LayoutLoginComponent,
    children: accessRoutes
  },
  {
    path: 'main',
    component: LayoutPagePage,
    canActivate: [authGuard],
    children: mainRoutes
  },
  {
    path: 'documents',
    component: LayoutPagePage,
    canActivate: [authGuard],
    children: documentsRoutes
  },
  {
    path: 'glossary',
    component: LayoutPagePage,
    canActivate: [authGuard],
    children: glosaryRoutes
  },
  {
    path: 'processes',
    component: LayoutPagePage,
    canActivate: [authGuard],
    children: processesRoutes
  },
  {
    path: 'article',
    component: LayoutPagePage,
    canActivate: [authGuard],
    children: configurationRoutes
  },
  {
    path: '**',
    redirectTo: 'documents',
    pathMatch: 'full'
  }
];