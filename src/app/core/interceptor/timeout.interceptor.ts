import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  private readonly TIMEOUT: number = 10000;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      timeout(this.TIMEOUT),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          console.error('Request timeout:', error);
          return throwError(() => new Error('Request timed out'));
        }
        return throwError(() => error);
      })
    );
  }
}
