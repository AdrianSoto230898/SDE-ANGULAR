export interface Toast {
    id: number; // Identificador único
    message: string;
    type: 'success' | 'error' | 'warning';
    show: boolean;
    duration?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  }
  