import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  // Signal para rastrear el estado de actualización
  reloadOrders = signal(false);
  private httpClient = inject(HttpClient);

  // Método para activar la señal
  triggerReloadOrders() {
    this.reloadOrders.set(true); // Cambiar el estado a true
  }

  // Método para resetear la señal después de usarla
  resetReloadOrders() {
    this.reloadOrders.set(false); // Restablecer el estado
  }

  // Método para iniciar el análisis con un timeout extendido
  startAnalysis(file: File,
    params: {
      pageSize?: number;
      model?: string;
      validator?: string;
      validatorValue?: string;
      idClientePlantillaEstampador?: number;
      fileName?: string
    }
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    let url: string;

    // Validar y agregar al FormData
    const formDataMappings: Record<string, string | number | undefined> = {
      pageSize: params.pageSize,
      model: params.model,
      validator: params.validator,
      validatorValue: params.validatorValue,
      idClientePlantillaEstampador: params.idClientePlantillaEstampador?.toString(),
      fileName: params.fileName?.toString(),
    };

    Object.entries(formDataMappings).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Determinar la URL según el entorno
    url = environment.TEST_API
      ? `${environment.URL_API_OPERATIONS}/api/openai/start-analysis`
      : `${environment.URL_API_OPERATIONS}/api/orden/extraccion/iniciar-analisis`;

    // Enviar la petición al endpoint (SIN TIMEOUT)
    return this.httpClient.post(url, formData);
  }

  // Método para obtener el resultado del análisis con un timeout extendido
  getAnalysisResult(jobId: string): Observable<any> {
    return this.httpClient.get(`${environment.URL_API_OPERATIONS}/api/extraccion/get-analysis-result/${jobId}`)
      .pipe(timeout(60000)); // Timeout de 10 minutos (600,000 ms)
  }

  saveExtractionData(data: any): Observable<any> {
    const url = `${environment.URL_API_OPERATIONS}/api/extraccion/guardarExtraccion`;
    return this.httpClient.post(url, data);
  }
}
