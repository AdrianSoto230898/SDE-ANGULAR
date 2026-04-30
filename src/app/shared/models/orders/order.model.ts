export interface Order {
    name: string;
    image: string;
    size: string;
    format: string;
    estadoExtraccion: string;
    codigoCliente: string;
    descCliente: string;
    documento: string;
    idExtraccionDatos: string;
    ordenCompra: string;
    paginasEnCurso: string;
    paginasProcesadas: string;
    datosExportados: string;
    status: string;
    json: any;
    base64: any;
  }


  export interface OrderDetail {
    idSolicitud: number;
    accion: string;
    capa: string;
    espesor: number;
    estatus: string;
    extraccion_id: number;
    familia: string;
    fecha_creacion: string;
    grado: number;
    norma: string;
    norma_recubrimiento: string;
    numero_parte: string;
    resultado: string;
  }