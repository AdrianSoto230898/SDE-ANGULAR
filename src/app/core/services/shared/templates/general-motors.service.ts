import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment.development';
import { LocalService } from '../storage/local.service';


@Injectable({
  providedIn: 'root'
})
export class GeneralMotorsService {

  private localService = inject(LocalService)

  // Método para obtener los datos extraidos
  async getDataExtraction(): Promise<any> {
    try {
      const storageIndex = await this.localService.getJsonValue(environment.INDEX);

      // Buscar en sessionStorage si no existe en la señal
      const storedOrder = await this.localService.getJsonValue(environment.ORDER_DATA);

      if (storedOrder) {
        // Parsear el JSON desde sessionStorage
        let orderExtract = JSON.parse(storedOrder.datosExtraidos);

        // Tomar solo el elemento según el índice
        let orderExtraction = [orderExtract.data[storageIndex.index]];

        // Mapear el objeto para agregar 'valid' como false y desglosar campos específicos
        orderExtraction = orderExtraction.map((item: any) => {
          const mappedItem: any = {};

          Object.keys(item).forEach(key => {
            let value = item[key];

            // Si el valor es un string, crear el formato con 'value' y 'valid'
            mappedItem[key] = {
              value: value,
              valid: false
            };

            // Procesar campos específicos como 'gauge_tolerance'
            if (key === 'gauge_tolerance') {
              mappedItem[key] = this.parseGaugeTolerance({ value, valid: false });
            }
          });

          return mappedItem;
        });

        return orderExtraction; // Devuelve los datos procesados
      } else {
        console.error('No se encontraron datos almacenados en sessionStorage.');
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  // Método para obtener los datos exportados
  async getDataExport(): Promise<any> {
    try {
      const storageIndex = await this.localService.getJsonValue(environment.INDEX);

      // Buscar en sessionStorage si no existe en la señal
      const storedOrder = await this.localService.getJsonValue(environment.ORDER_DATA);

      if (storedOrder) {

        // Parsear el JSON desde sessionStorage
        let orderExtract = JSON.parse(storedOrder.datosExportados);

        // Tomar solo el elemento según el índice
        let orderExtraction = [orderExtract[storageIndex.index]];

        // Mapear el objeto para agregar 'valid' como false y desglosar campos específicos
        orderExtraction = orderExtraction.map((item: any) => {
          const mappedItem: any = {};

          Object.keys(item).forEach(key => {
            let value = item[key];

            // Si el valor es un string, crear el formato con 'value' y 'valid'
            mappedItem[key] = {
              value: value,
              valid: false
            };

            // Procesar campos específicos como 'gauge_tolerance'
            if (key === 'gauge_tolerance') {
              mappedItem[key] = this.parseGaugeTolerance({ value, valid: false });
            }
          });

          return mappedItem;
        });

        return orderExtraction; // Devuelve los datos procesados
      } else {
        console.error('No se encontraron datos almacenados en sessionStorage.');
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async getOrderData(): Promise<any> {
    const orderData = await this.localService.getJsonValue(environment.ORDER_DATA);
    
    if (!orderData || Object.keys(orderData).length === 0) {
      console.warn('No se encontraron datos de la orden.');
      // Puedes devolver un valor por defecto o manejar la ausencia de datos según tu lógica.
      return null; // o un valor predeterminado, ej. {}
    }
    
    return orderData;
  }
  

  // Método para desglosar el campo gauge_tolerance
  parseGaugeTolerance(input: { value: string, valid: boolean }): any {
    const { value, valid } = input;

    // Usar una expresión regular para separar números, signos y unidades
    const regex = /([\d.]+)\s*(mm)?|([+-])\s*([\d.]+)\s*(mm)?/g;
    const matches = [...value.matchAll(regex)]; // Obtener todas las coincidencias

    // Retornar los valores correctamente desglosados
    return {
      base: `${matches[0][1]} ${matches[0][2] || ''}`, // Número base con unidad
      tolerancePlus: `${matches[1][3]} ${matches[1][4]} ${matches[1][5] || ''}`, // Tolerancia positiva con unidad
      toleranceMinus: `${matches[2][3]} ${matches[2][4]} ${matches[2][5] || ''}`, // Tolerancia negativa con unidad
      valid: valid
    };
  }
}