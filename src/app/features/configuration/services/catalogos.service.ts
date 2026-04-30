// src/app/core/services/catalogos.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, shareReplay } from 'rxjs';
import { ResponseModel, ArticuloTipoDto, AreaDto, AreaProcesoDto, AreaSubprocesoDto, ArticuloTipoSeccionDto } from '../models/catalogos.models';
import { environment } from '../../../../environments/environment.development';


@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private http = inject(HttpClient);

  // Ajusta si tu base ya incluye /api o no.
  private baseUrl = `${environment.URL_API}/Catalogos`;

  // --- Caché simple (opcional) ---
  private cache = new Map<string, Observable<any>>();

  private fromCacheOrFetch<T>(key: string, request$: Observable<T>, cache = true): Observable<T> {
    if (!cache) return request$; // omitir cache si se requiere
    const hit = this.cache.get(key);
    if (hit) return hit;
    const shared$ = request$.pipe(shareReplay(1));
    this.cache.set(key, shared$);
    return shared$;
  }

  // Helpers
  private unwrap<T>(obs$: Observable<ResponseModel<T>>): Observable<T> {
    return obs$.pipe(
      map((resp) => {
        if (resp.error) throw new Error(resp.mensaje || 'Error en servicio');
        return resp.data;
      }),
      catchError((err) => {
        // Aquí puedes loguear o mapear a un tipo de error de UI
        return throwError(() => err);
      })
    );
  }

  // =============================
  // Endpoints
  // =============================


  /** GET /Catalogos/Areas?soloActivos=true */
  getAreas(): Observable<{ value: string, label: string }[]> {
    if (!environment.production) {
      return this.http.get<ResponseModel<AreaDto[]>>('assets/data/catalogos/area.json').pipe(
        map(resp => resp.data.map(area => ({
          value: String(area.areaId),
          label: area.areaName
        })))
      );
    }

    const params = new HttpParams()
      .set('Option', '1')
      .set('Activo', 'true');

    return this.http.get<ResponseModel<AreaDto[]>>(`${environment.URL_API}Wiki/Area/list`, { params }).pipe(
      map(resp => resp.data.map(area => ({
        value: String(area.areaId),
        label: area.areaName
      })))
    );
  }


  /** GET /Catalogos/Procesos?areaId=...&soloActivos=true */
  getAreaProcesos(): Observable<{ value: string, label: string }[]> {
    if (!environment.production) {
      return this.http.get<ResponseModel<AreaProcesoDto[]>>('assets/data/catalogos/areaProceso.json').pipe(
        map(resp => resp.data.map(proceso => ({
          value: String(proceso.areaProcesoId),
          label: proceso.areaProcesoName
        })))
      );
    }

    const params = new HttpParams()
      .set('Option', '1')
      .set('Activo', 'true');

    return this.http.get<ResponseModel<AreaProcesoDto[]>>(`${environment.URL_API}Wiki/AreaProceso/list`, { params }).pipe(
      map(resp => resp.data.map(proceso => ({
        value: String(proceso.areaProcesoId),
        label: proceso.areaProcesoName
      })))
    );
  }


  /** GET /Wiki/AreaSubproceso/list?Option=1&Activo=true */
  getAreaSubprocesos(): Observable<{ value: string, label: string }[]> {
    if (!environment.production) {
      return this.http.get<ResponseModel<AreaSubprocesoDto[]>>('assets/data/catalogos/areaSubproceso.json').pipe(
        map(resp => resp.data.map(sub => ({
          value: String(sub.areaSubprocesoId),
          label: sub.areaSubprocesoName
        })))
      );
    }

    const params = new HttpParams()
      .set('Option', '1')
      .set('Activo', 'true');

    return this.http.get<ResponseModel<AreaSubprocesoDto[]>>(`${environment.URL_API}Wiki/AreaSubproceso/list`, { params }).pipe(
      map(resp => resp.data.map(sub => ({
        value: String(sub.areaSubprocesoId),
        label: sub.areaSubprocesoName
      })))
    );
  }

  getArticuloTipos(): Observable<{ value: string, label: string }[]> {
    if (!environment.production) {
      return this.http.get<ResponseModel<ArticuloTipoDto[]>>('assets/data/catalogos/articuloTipo.json').pipe(
        map(resp => resp.data.map(tipo => ({
          value: String(tipo.articuloTipoId),
          label: tipo.articuloTipoName
        })))
      );
    }

    const params = new HttpParams()
      .set('Option', '1')
      .set('ArticuloTipoNombre', '')
      .set('Activo', 'true');

    return this.http.get<ResponseModel<ArticuloTipoDto[]>>(`${environment.URL_API}Wiki/ArticuloTipo/list`, { params }).pipe(
      map(resp => resp.data.map(tipo => ({
        value: String(tipo.articuloTipoId),
        label: tipo.articuloTipoName
      })))
    );
  }

  
  // Utilidad: limpiar caché cuando haga sentido (e.g., después de crear/editar catálogos en admin)
  clearCache(prefix?: string) {
    if (!prefix) { this.cache.clear(); return; }
    for (const k of Array.from(this.cache.keys())) {
      if (k.startsWith(prefix)) this.cache.delete(k);
    }
  }
}
