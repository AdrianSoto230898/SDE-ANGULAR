import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class ProcessesService {
  private http = inject(HttpClient);

  getProcesosTree(): Observable<any> {
    const url = environment.production
      ? `${environment.URL_API}Procesos`
      : 'assets/data/procesos.json';
    return this.http.get<any>(url);
  }
}
