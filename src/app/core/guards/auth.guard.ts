import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { LocalService } from '../services/shared/storage/local.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const localService = inject(LocalService);

  let payload: any = null;
  try {
    payload = await localService.getJsonValue(environment.AZURE_AD);
  } catch (error) {
    console.warn('authGuard: no fue posible leer la sesion local.', error);
    localService.removeItem(environment.AZURE_AD);
  }

  const currentToken = payload?.tokenApi || payload?.token || '';
  if (currentToken && payload?.expiresOn) {
    const expirationDate = new Date(payload.expiresOn);
    const now = new Date();

    if (expirationDate > now) {
      return true;
    }

    localService.clearToken();
  }

  router.navigate(['/access/auth']);
  return false;
};