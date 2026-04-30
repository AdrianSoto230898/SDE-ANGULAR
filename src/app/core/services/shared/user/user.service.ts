import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { catchError, finalize, map, switchMap, tap, timeout } from 'rxjs/operators';
import { SessionService } from '../storage/session.service';
import { User } from '../../../../shared/models/user/user.model';
import { environment } from '../../../../../environments/environment';
import { LoadingService } from '../../ui/loading/loading.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private loadingService = inject(LoadingService);
  private sessionService = inject(SessionService);

  // Método para obtener el usuario dependiendo del ambiente
  getUser(): Observable<User> {
    if (environment.production) {
      // Ambiente de producción
      return this.prodUser();
    } else {
      // Ambiente de desarrollo
      return this.devUser();
    }
  }

  // Método para ambiente de desarrollo (lee del JSON local)
  devUser(): Observable<User> {
    const jsonPath = 'assets/items/user.json'; // Ruta al JSON en assets

    return this.http.get<User>(jsonPath).pipe(
      tap(user => {
        //console.log('Usuario (dev):', user);
        if (user.isAuthenticated) {
          this.sessionService.setJsonValue(environment.USER_CLAIMS, user);
        } else {
          this.sessionService.removeItem(environment.USER_CLAIMS);
        }
      }),
      catchError((error) => {
        console.error('Error al cargar usuario en modo dev:', error);
        // Retorna un usuario no autenticado como fallback
        return of({
          isAuthenticated: false,
          nameClaimType: '',
          roleClaimType: '',
          claims: []
        });
      })
    );
  }

  // Método para ambiente de producción (API externa)
  prodUser(): Observable<User> {
    const userUrl = `${environment.URL_API}${environment.USER_URL}`;

    return this.http.get<User>(userUrl).pipe(
      tap(user => {
        if (user.isAuthenticated) {
          this.sessionService.setJsonValue(environment.USER_CLAIMS, user);
        } else {
          this.sessionService.removeItem(environment.USER_CLAIMS);
        }
      }),
      catchError((error) => {
        //console.error('Error al obtener el usuario en modo prod:', error);
        if (error.status === 500 && error.error?.message) {
          console.error('Detalles del error:', error.error.message);
        }
        // Retorna un usuario no autenticado como fallback
        return of({
          isAuthenticated: false,
          nameClaimType: '',
          roleClaimType: '',
          claims: []
        });
      })
    );
  }


  // Método general que decide si usar devProfile o prodProfile
  getUserProfile(accountName: string): Observable<any> {
    if (environment.production) {
      return this.prodProfile(accountName);
    } else {
      return this.devProfile(accountName);
    }
  }

  // Método para obtener el perfil en ambiente de desarrollo
  devProfile(accountName: string): Observable<any> {
    //console.log('Usando datos de desarrollo para el perfil.');
    // Datos simulados para el ambiente de desarrollo
    const mockProfile = [
      { type: 'GUID_Profile', value: '22BB364-4490-43EC-B903-E48B6FC74CD4' },
      { type: 'TypeProfile', value: 'S' },
      { type: 'ProfileName', value: 'Universal NCA México' },
    ];
    return of(mockProfile);
  }

  // Método para obtener el perfil en ambiente de producción
  prodProfile(accountName: string): Observable<any> {
    //console.log('Obteniendo perfil del usuario desde la API en producción.');
    const profileUrl = `${environment.URL_API}/User/GetUserProfile?accountName=${accountName}`;
    return this.http.get<any>(profileUrl);
  }

}
