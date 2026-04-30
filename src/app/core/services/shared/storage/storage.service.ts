import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private key: Promise<CryptoKey>;

  constructor() {
    this.key = this.deriveKey();
  }

  private async deriveKey(): Promise<CryptoKey> {
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(environment.APP_ID),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode("some-salt"), // Use a fixed salt
        iterations: 1000,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  async encryptUsingAESGCM(value: string): Promise<{ encrypted: string, iv: string }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(value);
    const key = await this.key;

    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encoded
    );

    // Convertimos el buffer de datos cifrados y el IV a Base64 para almacenarlos como string
    return {
      encrypted: window.btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: window.btoa(String.fromCharCode(...iv))
    };
  }

  async decryptUsingAESGCM(encryptedData: { encrypted: string, iv: string }): Promise<string> {
    const key = await this.key;
    const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
    const encryptedArrayBuffer = Uint8Array.from(atob(encryptedData.encrypted), c => c.charCodeAt(0)).buffer;

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encryptedArrayBuffer
    );

    return new TextDecoder().decode(decrypted);
  }
}
