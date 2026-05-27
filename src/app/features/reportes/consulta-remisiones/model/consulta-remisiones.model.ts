export interface ConsultaRemisionesRequest {
  remisionID?: string;
  sociedad?: string;
  clienteId?: string;
  clienteConsignatarioNumero?: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
}

export interface ConsultaRemisionItem {
  tipoDocumentoId: string;
  remisionID: string;
  sociedad: string;
  clienteId: string;
  clienteConsignatarioNumero: string;
  fechaRemision: string;
  fechaRecepcionSDE: string;

  /**
   * Viene del SP como BINARIO.
   * Puede venir como string hexadecimal, byte array serializado o base64,
   * dependiendo de cómo lo regrese tu API.
   */
  binario?: string;

  documentoNombreConExtension: string;
  formatoDocumento: string;
}

export interface ConsultaRemisionesResponse {
  codigo: string;
  mensaje?: string;
  data?: {
    items: ConsultaRemisionItem[];
  };
}