// Accion base y subtipos
export type TipoAccion = 'audio' | 'movimiento' | 'luz';

export class Accion {
  constructor(
    public id: number,
    public tipo: TipoAccion,
    public _id?: string // ID generado por MongoDB
  ) {}
}

export class Audio extends Accion {
  constructor(id: number, _id?: string) {
    super(id, 'audio', _id);
  }
}

export class Movimiento extends Accion {
  constructor(id: number, _id?: string) {
    super(id, 'movimiento', _id);
  }
}

export class Luz extends Accion {
  constructor(id: number, _id?: string) {
    super(id, 'luz', _id);
  }
}

export class Tag {
  constructor(
    public ID: number,
    public listaAcciones: Accion[], // Lista de instancias de Accion (o subclases)
    public posterior: Tag | null = null,
    public _id?: string
  ) {}
}

export class Tablero {
  constructor(
    public id: number,
    public nombre: string,
    public filas: number,
    public columnas: number,
    public mainTag: Tag,
    public listaTags: Tag[],
    public _id?: string
  ) {}
}
