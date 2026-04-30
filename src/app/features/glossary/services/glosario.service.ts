import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class GlosarioService {
  private http = inject(HttpClient);

  // Cambia la ruta de JSON local si necesitas otro nombre
  private readonly localJson = 'assets/data/glosario.json';

  getAll(): Observable<any> {
    const url = environment.production
      ? `${environment.URL_API}Glosario`
      : this.localJson;

    return this.http.get<any>(url);
  }
}
