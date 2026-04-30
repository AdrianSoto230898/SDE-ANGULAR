export interface ArticuloUpsertDto {
    articuloId?: number | null;
    titulo: string;
    areaSubprocesoId: number;
    articuloTipoId: number;
    usuarioReferenteId: number;
    contenidoHTML: string;
    contenidoSinFormato: string;
    orden?: number;
    keywords?: string | null;
    fechaPublicacion?: string | null;
  }

  export interface ArticuloFilter {
    articuloId?: number;
    titulo?: string;
    areaSubprocesoId?: number;
    articuloTipoId?: number;
    activo?: boolean;
  }
  