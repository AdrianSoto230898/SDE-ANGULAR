export interface ArticuloModel {
    articuloId: number;
    articuloNombre: string;
  }
  
  export interface AreaSubprocesoModel {
    areaSubprocesoId: number;
    areaSubprocesoNombre: string;
    articulos: ArticuloModel[];
  }
  
  export interface AreaProcesoModel {
    areaProcesoId: number;
    areaProcesoNombre: string;
    subprocesos: AreaSubprocesoModel[];
  }
  
  export interface AreaModel {
    areaId: number;
    areaNombre: string;
    procesos: AreaProcesoModel[];
  }