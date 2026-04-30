// src/app/core/models/catalogos.models.ts
export interface ResponseModel<T = any> {
    error: boolean;
    mensaje: string;
    data: T;
  }
  
  
  export interface ArticuloTipoDto {
    articuloTipoId: number;
    articuloTipoName: string;
    activo: boolean;
  }
  
  export interface AreaDto {
    areaId: number;
    areaName: string;
    sociedadId: number;
    orden: number;
    activo: boolean;
  }
  
  export interface AreaProcesoDto {
    areaProcesoId: number;
    areaProcesoName: string;
    areaId: number;
    orden: number;
    activo: boolean;
  }
  
  export interface AreaSubprocesoDto {
    areaSubprocesoId: number;
    areaSubprocesoName: string;
    areaProcesoId: number;
    usuarioReferenteId: number;
    orden: number;
    activo: boolean;
  }
  
  export interface ArticuloTipoSeccionDto {
    articuloTipoSeccionId: number;
    articuloTipoSeccionNombre: string;
    articuloTipoId: number;
    orden: number;
    activo: boolean;
  }
  