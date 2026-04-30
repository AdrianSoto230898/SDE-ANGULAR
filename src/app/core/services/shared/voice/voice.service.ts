import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class VoiceService {

  public http = inject(HttpClient);
  apiUrl = `${environment.URL_API}${environment.VOICE_URL}`;

  //Envia el audio al controlador para procesarlo
  uploadAudio(blob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('audioFile', blob, 'audio.wav');

    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.http.post<any>(this.apiUrl, formData, { headers });
  }
  
}
