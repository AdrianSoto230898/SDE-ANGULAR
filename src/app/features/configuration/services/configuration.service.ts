import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ArticuloFilter, ArticuloUpsertDto } from '../models/configuration.model';
import { map, Observable } from 'rxjs';
import { ArticuloModel } from '../../processes/models/area.model';
import { ResponseModel } from '../models/catalogos.models';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private http: HttpClient = inject(HttpClient);

  private base = `${environment.URL_API}Articulo`;
  constructor() { }

  // 🔹 Caché en memoria
  private cache = new Map<string, any[]>();

  // LISTA/BÚSQUEDA (GET)
  buscar(params: { titulo?: string }): Observable<any[]> {
    const key = params?.titulo?.toLowerCase() || '__all__';

    // 1. Si existe en caché, devolver directamente
    if (this.cache.has(key)) {
      return new Observable(observer => {
        observer.next(this.cache.get(key)!);
        observer.complete();
      });
    }

    // 2. MOCK (dev)
    if (!environment.production) {
      return this.http.get<any[]>('assets/data/buscar.json').pipe(
        map(items => {
          let result = items;
          if (params?.titulo) {
            const q = params.titulo.toLowerCase();
            result = items.filter(x =>
              (x.titulo ?? '').toLowerCase().includes(q) ||
              (x.areaSubprocesoNombre ?? '').toLowerCase().includes(q) ||
              (x.articuloTipoNombre ?? '').toLowerCase().includes(q) ||
              (x.keywords ?? '').toLowerCase().includes(q)
            );
          }
          this.cache.set(key, result); // guardar en cache
          return result;
        })
      );
    }

    // 3. PRODUCCIÓN (API real)
    let httpParams = new HttpParams();
    if (params?.titulo) {
      httpParams = httpParams.set('Titulo', params.titulo);
    }

    return this.http.get<any[]>(`${this.base}/buscar`, { params: httpParams })
      .pipe(
        map(result => {
          this.cache.set(key, result); // guardar en cache
          return result;
        })
      );
  }

  clearCache() {
    this.cache.clear();
  }

  // CRUD
  getById(id: number) { return this.http.get<any>(`${this.base}/${id}`); }

  // POST: crear nuevo artículo
  create(dto: ArticuloUpsertDto): Observable<ResponseModel<ArticuloModel>> {
    return this.http.post<ResponseModel<ArticuloModel>>(this.base, dto).pipe(
      map(res => {
        this.clearCache();   // 🔹 limpiar cache al crear
        return res;
      })
    );
  }
  
  // PUT: actualizar artikel
  update(id: number, dto: any): Observable<any> {
    return this.http.put<any>(`${this.base}/${id}`, dto).pipe(
      map(res => {
        this.clearCache();   // 🔹 limpiar cache al actualizar
        return res;
      })
    );
  }
  
  // DELETE: Elimina un artículo
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/${id}`).pipe(
      map(res => {
        this.clearCache();   // 🔹 limpiar cache al eliminar
        return res;
      })
    );
  }

  // Adjuntos
  listAdjuntos(id: number) { return this.http.get<any[]>(`${this.base}/${id}/Adjuntos`); }
  addAdjunto(id: number, file: File, titulo?: string, descripcion?: string) {
    const fd = new FormData();
    fd.append('file', file);
    if (titulo) fd.append('titulo', titulo);
    if (descripcion) fd.append('descripcion', descripcion);
    return this.http.post<any>(`${this.base}/${id}/Adjuntos`, fd);
  }
  deleteAdjunto(adjuntoId: number) { return this.http.delete<any>(`${this.base}/Adjuntos/${adjuntoId}`); }

}