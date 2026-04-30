import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private http = inject(HttpClient);

  saveStatistics(params: {
    usuarioId: number;
    estadisticaPantallaId: number;
    articuloId?: number;
    prompt?: string;
    resultados?: number;
  }) {
    if (!environment.production) {
      return of(null); // 👈 devolvemos un Observable "vacío"
    }
  
    const url = `${environment.URL_API}Estadistica/registrar`;
  
    return this.http.post<any>(url, {
      usuarioId: params.usuarioId,
      estadisticaPantallaId: params.estadisticaPantallaId,
      articuloId: params.articuloId ?? null,
      prompt: params.prompt ?? null,
      resultados: params.resultados ?? null
    });
  }
}
