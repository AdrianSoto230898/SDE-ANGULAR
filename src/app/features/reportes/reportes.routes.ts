import { Routes } from '@angular/router';

export const ReportesRoutes: Routes = [
  {
    path: 'remisiones',
    loadComponent: () =>
      import('./consulta-remisiones/consulta-remisiones.component').then(
        (m) => m.ConsultaRemisionesComponent
      ),
  },
];