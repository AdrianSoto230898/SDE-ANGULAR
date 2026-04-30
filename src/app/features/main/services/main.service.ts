import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class MainService {
  private http = inject(HttpClient);

  constructor() { }

  // Obtiene todos los artículos
  getAllArticulos(): Observable<any[]> {
    const url = environment.production
      ? `${environment.URL_API}Articulo`
      : 'assets/data/articulo.json';

    return this.http.get<any[]>(url);
  }

  // Obtiene un artículo por su id
  getById(id: number): Observable<any> {
    const url = environment.production
      ? `${environment.URL_API}Articulo/${id}`
      : 'assets/data/articuloId.json';

    return this.http.get<any>(url);
  }

  // Stream de chat desde backend con SSE (Server-Sent Events).
  streamChatSse(prompt: string): Observable<string> {
    return new Observable<string>((observer) => {
      const url = `https://localhost:44364/api/WikiChat/stream-json?prompt=${encodeURIComponent(prompt)}`;
      const eventSource = new EventSource(url);
  
      eventSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
          observer.complete();
          eventSource.close();
        } else {
          observer.next(event.data);
        }
      };
  
      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };
  
      // Cleanup
      return () => eventSource.close();
    });
  }
}
