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
  direccion: 'arriba' | 'abajo' | 'izquierda' | 'derecha';
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
  fondo?: string | File;
}

export interface ITablero {
  id: number;
  nombre: string;
  filas: number;
  columnas: number;
  mainTag: ITag;
  listaTags: ITag[];
  _id?: string;
  fondo?: string;
  colorlineas: string | File;
  tamanioCelda?: number;
}