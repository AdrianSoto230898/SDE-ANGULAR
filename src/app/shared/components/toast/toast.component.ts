import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/ui/toast/toast.service';
import { CommonModule } from '@angular/common';
import { Toast } from '../../models/toast/toast';


@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    imports: [CommonModule],
    styleUrl: './toast.component.scss'
})
export class ToastComponent {
  toastService = inject(ToastService);

  trackByFn(index: number, item: Toast): number {
    return item.id; // Usamos la propiedad `id` única de cada toast
  }

  getPositionClass(toast: any): string {
    switch (toast.position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
    }
  }

  ngOnDestroy(): void {
    // Limpiar recursos si es necesario (por ejemplo, timeouts)
  }
}
