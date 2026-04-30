import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedItemsService {
  // Creamos una señal para mantener la lista de archivos
  items = signal<any[]>([]);

  // Método para actualizar los archivos
  addItem(newItem: any) {
    this.items.update((items) => [...items, newItem]); // Agregar nuevo archivo a la lista
  }

  // Método para obtener la lista de archivos
  getItems() {
    return this.items();
  }

  // Método para actualizar el estado de una orden
  updateOrderStatus(name: string, estatus: string, json: any) {
    this.items.update((currentItems) => {
      const updatedItems = [...currentItems];
      const orderIndex = updatedItems.findIndex(order => order.name === name);

      if (orderIndex !== -1) {
        updatedItems[orderIndex].status = estatus;
        updatedItems[orderIndex].json = json;
      }

      return updatedItems;
    });
  }
}
