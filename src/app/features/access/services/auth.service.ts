import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { LocalService } from '../../../core/services/shared/storage/local.service';

export interface TokenResponse {
  token: string;
  userName: string;
  creation: string;
  expires: string;
}

export interface SdeIdentityPermissionItem {
  key: string;
  description: string;
}

export interface SdeIdentitySession {
  isValid: boolean;
  validationMode: string;
  expirationValidated: boolean;
  permissionsResolved: boolean;
  message: string;
  name: string;
  email: string;
  sigla: string;
  appId: string;
  appDisplayName: string;
  tenantId: string;
  expiresAtUtc?: string | null;
  expiresAtUnix?: number | null;
  permissions: SdeIdentityPermissionItem[];
  warnings: string[];
  accessToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly localService = inject(LocalService);

  async getUserAvatar(accessToken: string, userPrincipalName: string): Promise<string> {
    if (!accessToken || !userPrincipalName) {
      throw new Error('Token o userPrincipalName invalido.');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`
    });

    const photoUrl = `https://graph.microsoft.com/v1.0/users/${userPrincipalName}/photo/$value`;

    try {
      const blob = await firstValueFrom(
        this.http.get(photoUrl, { headers, responseType: 'blob' })
      );
      return await this.blobToBase64(blob);
    } catch (error: any) {
      if (error.status === 404) {
        return 'assets/images/default-avatar.png';
      }

      throw error;
    }
  }

  async validateSdeSession(accessToken: string, email: string): Promise<SdeIdentitySession> {
    const url = `${this.normalizeBaseUrl(environment.URL_API_SDE)}/api/identity/validate`;
    return firstValueFrom(
      this.http.post<SdeIdentitySession>(url, {
        accessToken,
        email
      })
    );
  }

  async getSdeSession(): Promise<SdeIdentitySession> {
    const url = `${this.normalizeBaseUrl(environment.URL_API_SDE)}/api/identity/session`;
    return firstValueFrom(this.http.get<SdeIdentitySession>(url));
  }

  async saveUserData(key: string, payload: unknown): Promise<void> {
    await this.localService.setJsonValue(key, payload);
  }

  async logout(): Promise<void> {
    await this.localService.removeItem(environment.AZURE_AD);
  }

  async getProfile(): Promise<any> {
    return this.localService.getJsonValue(environment.AZURE_AD);
  }

  getTokenMdwDirect(idToken: string): Promise<TokenResponse> {
    const url = `${this.normalizeBaseUrl(environment.URL_FRONTEND)}/FrontendSecurityService/api/FrontendSecurityService/SignInFromADFS`;
    const body = { tokenid: idToken };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return firstValueFrom(
      this.http.post<TokenResponse>(url, body, { headers, withCredentials: false })
    );
  }

  async getTestFecha(): Promise<any> {
    const url = `${this.normalizeBaseUrl(environment.URL_API)}/api/AutenticacionMDW/fecha`;
    return firstValueFrom(this.http.get(url));
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private normalizeBaseUrl(url: string): string {
    return (url ?? '').trim().replace(/\/+$/, '');
  }
}