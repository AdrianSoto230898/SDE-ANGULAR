import { Injectable, signal, Signal } from "@angular/core";
import { Toast } from "../../../../shared/models/toast/toast";

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _toasts = signal<Toast[]>([]); // Mantiene solo un toast a la vez
  private toastId = 0; // Contador para generar IDs únicos

  toasts(): Signal<Toast[]> {
    return this._toasts;
  }

  showToast(
    message: string,
    type: 'success' | 'error' | 'warning',
    duration: number = 3000,
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center' = 'bottom-center'
  ): void {
    const newToast: Toast = { 
      id: ++this.toastId, 
      message, 
      type, 
      show: true, 
      duration, 
      position 
    };

    // Reemplazar cualquier toast existente con el nuevo
    this._toasts.set([newToast]);


    // Programar el ocultamiento del toast
    setTimeout(() => {
      // Verifica que el toast actual es el mismo antes de modificar su estado
      this._toasts.update((toasts) =>
        toasts.map((t) => (t.id === newToast.id ? { ...t, show: false } : t))
      );
    }, duration);

    // Programar la eliminación del toast después de la animación de salida
    setTimeout(() => {
      this._toasts.update((toasts) => toasts.filter((t) => t.id !== newToast.id));
    }, duration + 500); // 500ms extra para la animación
  }
}