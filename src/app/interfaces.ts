export type TipoAccion = 'audio' | 'movimiento' | 'luz';

export interface IAccion {
  id: number;
  delay: number;
  tipo: TipoAccion | string;
}

export interface IAudio extends IAccion {
  tipo: 'audio';
  archivo?: string | null | File;
}

export interface IMovimiento extends IAccion {
  tipo: 'movimiento';
  direccion: 'avanzar' | 'girar';
}

export interface ILuz extends IAccion {
  tipo: 'luz';
  color: string;
  intervalo: number;
}

export interface ITag {
  ID: number;
  listaAcciones: IAccion[];
  _id?: string;
}

export interface ITablero {
  id: number;
  nombre: string;
  filas: number;
  columnas: number;
  mainTag: ITag;
  listaTags: ITag[];
  _id?: string;
}