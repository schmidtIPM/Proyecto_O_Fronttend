export type TipoAccion = 'audio' | 'movimiento' | 'luz';

export class Accion {
  id!: number;
  delay: number = 0;
  tipo!: string;
}

export class Audio extends Accion {
  archivo: File | null | string = null;
  constructor(id: number) {
    super();
    this.id = id;
    this.tipo = 'audio';
  }
}

export class Movimiento extends Accion {
  direccion: 'avanzar' | 'girar' = 'avanzar';
  constructor(id: number) {
    super();
    this.id = id;
    this.tipo = 'movimiento';
  }
}

export class Luz extends Accion {
  color: string = '#ffffff';
  intervalo: number = 0;
  constructor(id: number) {
    super();
    this.id = id;
    this.tipo = 'luz';
  }
}


export class Tag {
  constructor(
    public ID: number,
    public listaAcciones: Accion[], 
    public fila: number,
    public columna: number,
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
