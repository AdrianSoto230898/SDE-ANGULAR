import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

import {
  ConsultaRemisionesRequest,
  ConsultaRemisionesResponse,
} from '../model/consulta-remisiones.model';

@Injectable({
  providedIn: 'root',
})
export class ConsultaRemisionesService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = (environment.URL_API_SDE ?? '')
    .trim()
    .replace(/\/+$/, '');

  consultarRemisiones(
    request: ConsultaRemisionesRequest,
  ): Promise<ConsultaRemisionesResponse> {
    const payload = {
      remisionID: request.remisionID ?? '',
      sociedad: request.sociedad ?? '',
      clienteId: request.clienteId ?? '',
      clienteConsignatarioNumero:
        request.clienteConsignatarioNumero ?? '',
      fechaInicio: request.fechaInicio ?? null,
      fechaFin: request.fechaFin ?? null,
    };

    console.log('==============================');
    console.log('📦 CONSULTA REMISIONES REQUEST');
    console.log('==============================');
    console.log('➡️ REQUEST ORIGINAL 👉', request);
    console.log('➡️ PAYLOAD FINAL 👉', payload);

    /* ==================== 🔸 MODO MOCK 🔸 ==================== */
    if (!environment.production) {
      const response = this.getMockConsultaRemisiones(payload);

      console.log('==============================');
      console.log('🧪 CONSULTA REMISIONES MOCK RESPONSE');
      console.log('==============================');
      console.log('✅ RESPONSE MOCK 👉', response);
      console.log('✅ DATA MOCK 👉', response.data?.items);

      return Promise.resolve(response);
    }

    /* ==================== 🔸 API REAL 🔸 ==================== */
    const url = this.buildUrl('api/reportes/remisiones/consulta');

    console.log('🌐 CONSULTA REMISIONES API URL 👉', url);

    return firstValueFrom(
      this.http.post<ConsultaRemisionesResponse>(url, payload),
    )
      .then((response) => {
        console.log('==============================');
        console.log('✅ CONSULTA REMISIONES API RESPONSE');
        console.log('==============================');
        console.log('✅ RESPONSE 👉', response);
        console.log('✅ DATA 👉', response.data?.items);

        return response;
      })
      .catch((error) => {
        console.log('==============================');
        console.log('❌ CONSULTA REMISIONES API ERROR');
        console.log('==============================');
        console.error('❌ ERROR 👉', error);

        throw error;
      });
  }

  private buildUrl(path: string): string {
    const cleanPath = path.replace(/^\/+/, '');
    return `${this.baseUrl}/${cleanPath}`;
  }

  private getMockConsultaRemisiones(
    request: ConsultaRemisionesRequest,
  ): ConsultaRemisionesResponse {
    const mockItems = [
      {
        tipoDocumentoId: 'REM',
        remisionID: '316070340006',
        sociedad: 'TM01',
        clienteId: '3000001358',
        clienteConsignatarioNumero: '3000001358',
        fechaRemision: '2026-04-10T00:00:00',
        fechaRecepcionSDE: '2026-04-28T16:33:00',
        documentoNombreConExtension: 'REM316070340006.pdf',
        formatoDocumento: 'application/pdf',
      },
      {
        tipoDocumentoId: 'REM',
        remisionID: '200005023180',
        sociedad: 'TM01',
        clienteId: 'H000850000',
        clienteConsignatarioNumero: '4800001728',
        fechaRemision: '2026-02-18T00:00:00',
        fechaRecepcionSDE: '2026-02-18T14:23:00',
        documentoNombreConExtension: 'REM200005023180.pdf',
        formatoDocumento: 'application/pdf',
      },
      {
        tipoDocumentoId: 'REM',
        remisionID: '200005026269',
        sociedad: 'TM01',
        clienteId: 'H000850000',
        clienteConsignatarioNumero: '4800001728',
        fechaRemision: '2026-04-15T00:00:00',
        fechaRecepcionSDE: '2026-04-15T00:51:00',
        documentoNombreConExtension: 'REM200005026269.pdf',
        formatoDocumento: 'application/pdf',
      },
    ];

    let filtered = [...mockItems];

    if (request.remisionID) {
      filtered = filtered.filter((x) =>
        x.remisionID.includes(request.remisionID ?? ''),
      );
    }

    if (request.sociedad) {
      filtered = filtered.filter((x) =>
        x.sociedad.includes(request.sociedad ?? ''),
      );
    }

    if (request.clienteId) {
      filtered = filtered.filter((x) =>
        x.clienteId.includes(request.clienteId ?? ''),
      );
    }

    if (request.clienteConsignatarioNumero) {
      filtered = filtered.filter((x) =>
        x.clienteConsignatarioNumero.includes(
          request.clienteConsignatarioNumero ?? '',
        ),
      );
    }

    return {
      codigo: 'OK',
      mensaje: 'Consulta mock ejecutada correctamente',
      data: {
        items: filtered,
      },
    };
  }
}