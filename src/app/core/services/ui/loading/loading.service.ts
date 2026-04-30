import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // Usar una señal pública para que el componente pueda acceder a ella directamente
  public isLoading = signal(false);

  show(): void {
    this.isLoading.set(true); // Activa la señal
  }

  hide(): void {
    this.isLoading.set(false); // Desactiva la señal
  }

  get loading() {
    return this.isLoading();
  }
}
