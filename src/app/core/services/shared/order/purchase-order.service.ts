import { Injectable, WritableSignal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  // Señales individuales para la orden
  public orderPartNumber = signal({ value: '', valid: false });
  public orderFamily = signal({ value: '', valid: false });
  public orderNorma = signal({ value: '', valid: false });
  public orderGrado = signal({ value: '', valid: false });
  public orderCapa = signal({ value: '', valid: false });
  public orderNormaRecubrimiento = signal({ value: '', valid: false });
  public orderEspesor = signal({ value: '', valid: false });

  // Señales individuales para el formulario
  public formPartNumber = signal({ value: '', valid: false });
  public formFamily = signal({ value: '', valid: false });
  public formNorma = signal({ value: '', valid: false });
  public formGrado = signal({ value: '', valid: false });
  public formCapa = signal({ value: '', valid: false });
  public formNormaRecubrimiento = signal({ value: '', valid: false });
  public formEspesor = signal({ value: '', valid: false });

  // Señal global para verificar si todos los campos son válidos
  private verifiedFields = signal(false);

  capaChecked = false;
  normaChecked = false;

  // Método para obtener la señal global de solo lectura
  getVerifiedFields() {
    return this.verifiedFields();
  }

  // Método para verificar los elementos de la orden o formulario
  checkOrderElements(component: 'purchase_order' | 'form', field: string, value: boolean) {
    // Actualizar el estado del campo en la orden o formulario
    if (component === 'purchase_order') {
      this.updateOrderField(field, value);
    } else if (component === 'form') {
      this.updateFormField(field, value);
    }

    // Verificar si todos los campos son válidos
    this.updateVerifiedFields();
  }

  // Método para actualizar un campo de la orden
  private updateOrderField(field: string, value: boolean) {
    switch (field) {
      case 'noParte':
        this.orderPartNumber.set({ value: '', valid: value });
        break;
      case 'familia':
        this.orderFamily.set({ value: '', valid: value });
        break;
      case 'norma':
        this.orderNorma.set({ value: '', valid: value });
        this.orderGrado.set({ value: '', valid: value });
        break;
      case 'capa':
        this.orderCapa.set({ value: '', valid: value });
        this.orderNormaRecubrimiento.set({ value: '', valid: value });
        break;
      case 'espesor':
        this.orderEspesor.set({ value: '', valid: value });
        break;
    }
  }


  // Método para actualizar un campo del formulario
  private updateFormField(field: string, value: boolean) {
    switch (field) {
      case 'noParte':
        this.formPartNumber.set({ value: '', valid: value });
        break;
      case 'familia':
        this.formFamily.set({ value: '', valid: value });
        break;
      case 'norma':
        this.formNorma.set({ value: '', valid: value });
        this.formGrado.set({ value: '', valid: value });
        break;
      case 'capa':
        this.formCapa.set({ value: '', valid: value });
        this.formNormaRecubrimiento.set({ value: '', valid: value });
        break;
      case 'espesor':
        this.formEspesor.set({ value: '', valid: value }); // Corrige el campo
        break;
    }
  }

  // Método para actualizar el estado global `verifiedFields`
  private updateVerifiedFields() {
    // Verificar que todos los campos de la orden sean válidos
    const allOrderValid =
      this.orderPartNumber().valid &&
      this.orderFamily().valid &&
      this.orderNorma().valid &&
      this.orderGrado().valid &&
      this.orderCapa().valid &&
      this.orderNormaRecubrimiento().valid &&
      this.orderEspesor().valid; // Evaluar correctamente `orderEspesor`

    // Verificar que todos los campos del formulario sean válidos
    const allFormValid =
      this.formPartNumber().valid &&
      this.formFamily().valid &&
      this.formNorma().valid &&
      this.formGrado().valid &&
      this.formCapa().valid &&
      this.formNormaRecubrimiento().valid &&
      this.formEspesor().valid; // Evaluar correctamente `formEspesor`

    // Verificar que ambas condiciones sean verdaderas
    const allValid = allOrderValid && allFormValid;

    // Actualizar la señal global
    this.verifiedFields.set(allValid);
  }
}
