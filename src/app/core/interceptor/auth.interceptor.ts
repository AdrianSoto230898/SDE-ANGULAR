import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LocalService } from '../services/shared/storage/local.service';

const startsWithBaseUrl = (url: string, baseUrl: string): boolean => {
  const normalizedBaseUrl = baseUrl?.trim().replace(/\/+$/, '');
  if (!normalizedBaseUrl) {
    return false;
  }

  return url.startsWith(normalizedBaseUrl);
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const localStorage = inject(LocalService);

  return from(localStorage.getJsonValue(environment.AZURE_AD)).pipe(
    switchMap((userData) => {
      if (!userData) {
        return next(req);
      }

      const apiToken = userData.tokenApi || userData.token || userData.sdeSession?.accessToken || '';
      const legacyToken = userData.tokenMDW || '';

      if (startsWithBaseUrl(req.url, environment.URL_API_SDE) && apiToken) {
        return next(req.clone({
          setHeaders: {
            Authorization: `Bearer ${apiToken}`
          }
        }));
      }

      if ((startsWithBaseUrl(req.url, environment.URL_API) || startsWithBaseUrl(req.url, environment.URL_FRONTEND)) && legacyToken) {
        return next(req.clone({
          setHeaders: {
            Authorization: `Bearer ${legacyToken}`
          }
        }));
      }

      return next(req);
    })
  );
};