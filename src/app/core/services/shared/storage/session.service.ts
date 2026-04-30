import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { User } from '../../../../shared/models/user/user.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  public storageService = inject(StorageService);

  async setJsonValue(key: string, value: any) {
    const { encrypted, iv } = await this.storageService.encryptUsingAESGCM(JSON.stringify(value));
    const dataToStore = JSON.stringify({ encrypted, iv });
    sessionStorage.setItem(key, dataToStore);
  }

  async getJsonValue(key: string): Promise<any> {
    const item = sessionStorage.getItem(key);
    if (item) {
      const { encrypted, iv } = JSON.parse(item);
      const decrypted = await this.storageService.decryptUsingAESGCM({ encrypted, iv });
      return JSON.parse(decrypted);
    }
    return null;
  }

  // Nuevo método para obtener los claims del usuario desencriptados
  async getUserClaims(): Promise<User | null> {
    const item = sessionStorage.getItem('USER_CLAIMS');
    if (item) {
      const { encrypted, iv } = JSON.parse(item);
      const decrypted = await this.storageService.decryptUsingAESGCM({ encrypted, iv });
      const parsedData = JSON.parse(decrypted);
  
      // Verifica si los datos están envueltos en __zone_symbol__value
      if (parsedData?.__zone_symbol__value) {
        return parsedData.__zone_symbol__value as User;
      }
  
      // Si no están envueltos, devuelve los datos directamente
      return parsedData as User;
    }
    return null;
  }

  clearToken() {
    sessionStorage.clear();
  }

  removeItem(key: string) {
    sessionStorage.removeItem(key);
  }
}
