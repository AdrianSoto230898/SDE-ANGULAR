import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class LocalService {

  public storageService = inject(StorageService);

  async setJsonValue(key: string, value: any) {
    const { encrypted, iv } = await this.storageService.encryptUsingAESGCM(JSON.stringify(value));
    const dataToStore = JSON.stringify({ encrypted, iv });
    localStorage.setItem(key, dataToStore);
  }

  async getJsonValue(key: string): Promise<any> {
    const item = localStorage.getItem(key);
    if (item) {
      const { encrypted, iv } = JSON.parse(item);
      const decrypted = await this.storageService.decryptUsingAESGCM({ encrypted, iv });
      return JSON.parse(decrypted);
    }
    return null;
  }

  clearToken() {
    localStorage.clear();
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }
}
