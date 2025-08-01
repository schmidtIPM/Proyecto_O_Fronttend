import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ConectionBackService } from '../conection-back.service';
import { Tablero, Tag, Accion, Audio, Movimiento, Luz } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-simulador-tablero',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './simulador-tablero.component.html',
  styleUrl: './simulador-tablero.component.css'
})
export class SimuladorTableroComponent {
  mostrarZoom = false;
  tablero!: Tablero;
  tableroGrid: { acciones: Accion[] }[][] = [];
  cargando = true;
  accionesDisponibles: string[] = ['audio', 'movimiento', 'luz'];
  zoomLevel = 1;
  mainTagAccions: Accion[] = [];
  selectedCell: { fila: number; columna: number } | null = null;
  panelStyles: any = {};
  nuevaAccion: Accion | null = null;
  idAccion = 0;
  robotPos: { fila: number; columna: number; direccion: string } = { fila: -1, columna: 0, direccion: "abajo" };
  anteriorPobotPos: { fila: number; columna: number } = { fila: -1, columna: 0 };
  movimientosAcomulados: string[] = [];

  constructor(private route: ActivatedRoute,private conectionBack: ConectionBackService,
    private router: Router, private snackBar: MatSnackBar){}
  async play() {
    this.anteriorPobotPos = { ...this.robotPos };
    for (const mov of this.movimientosAcomulados) {
      let { fila, columna, direccion } = this.robotPos;
      let nuevaFila = fila;
      let nuevaColumna = columna;
      let nuevaDireccion = direccion;
      switch (mov) {
        case 'arriba':
          ({ fila: nuevaFila, columna: nuevaColumna } = this.moverEnDireccion('arriba'));
          break;
        case 'abajo':
          ({ fila: nuevaFila, columna: nuevaColumna } = this.moverEnDireccion('abajo'));
          break;
        case 'izquierda':
          nuevaDireccion = this.girarDireccionDelRobot(mov);
          break;
        case 'derecha':
          nuevaDireccion = this.girarDireccionDelRobot(mov);
          break;
      }
      this.robotPos = { fila: nuevaFila, columna: nuevaColumna, direccion: nuevaDireccion };
      await this.esperar(500);
    }
    this.movimientosAcomulados = [];
    this.ejecutarListaDeAcciones();
  }
  moverEnDireccion(sentido: 'arriba' | 'abajo') {
    const { fila, columna, direccion } = this.robotPos;
    let nuevaFila: number = fila;
    let nuevaColumna: number = columna;
    const retroceder = (d: string) => {
      switch(d) {
        case 'arriba': if(nuevaFila < this.tablero.filas-1){ nuevaFila++;} break;
        case 'abajo': if(nuevaFila != 0){ nuevaFila--;} break;
        case 'derecha': if(nuevaColumna != 0){nuevaColumna--;} break;
        default: if(nuevaColumna < this.tablero.columnas-1){nuevaColumna++;}
      }
    };
    const avanzar = (d: string) => {
      switch(d) {
        case 'arriba': if(nuevaFila != 0){ nuevaFila--;} break;
        case 'abajo': if(nuevaFila < this.tablero.filas-1){ nuevaFila++;} break;
        case 'derecha': if(nuevaColumna < this.tablero.columnas-1){nuevaColumna++;} break;
        default: if(nuevaColumna != 0){nuevaColumna--;}
      }
    };
    if(sentido == 'arriba'){avanzar(direccion);}
    else{retroceder(direccion);}
    return {
      fila: nuevaFila,
      columna: nuevaColumna
    };
  }
  girarDireccionDelRobot(direccion: 'izquierda' | 'derecha'){
    switch(this.robotPos.direccion){
      case 'izquierda':
        if(direccion == 'izquierda'){return 'abajo'}
        else{return 'arriba'}
      case 'derecha':
        if(direccion == 'derecha'){return 'abajo'}
        else{return 'arriba'}
      case 'abajo':
        if(direccion == 'derecha'){return 'izquierda'}
        else{return 'derecha'}
      default:
        return direccion;
    }
  }
  async ejecutarListaDeAcciones(){
    for (const tags of this.tablero.listaTags){
      if(tags.columna == this.robotPos.columna && tags.fila == this.robotPos.fila){
        for(const accion of tags.listaAcciones){
          this.ejecutarAccion(accion);
          if(accion.tipo == 'movimiento' && ((accion as Movimiento).direccion == 'arriba' || 
            (accion as Movimiento).direccion == 'abajo')){return;}
        }
      }
    }
  }
  async ejecutarAccion(accion: Accion) {
    switch (accion.tipo) {
      case 'audio': {
        this.reproducirAudio((accion as Audio).archivo);
        break;
      } 
      case 'movimiento': {
        const accionMov = accion as Movimiento;
        if(accionMov.direccion == 'abajo' || accionMov.direccion == 'arriba'){
          this.moverRobot(accionMov.direccion);
          await this.play();
        }else{
          this.robotPos.direccion = this.girarDireccionDelRobot(accionMov.direccion);
        }
        break;
      }
      case 'luz': {
        // Manejo de acción de luz
        break;
      }
    }
  }
  esperar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  moverRobot(direccion: 'arriba' | 'abajo' | 'izquierda' | 'derecha') {
    this.movimientosAcomulados.push(direccion);
  }
  verificarTamanioCeldas() {
    setTimeout(() => {
      const unaCelda = document.querySelector('.celda') as HTMLElement;
      if (unaCelda) {
        const { width, height } = unaCelda.getBoundingClientRect();
        this.mostrarZoom = this.tablero.columnas > 6 || this.tablero.filas > 5;
      }
    }, 0);
  }
  ngOnInit(): void {
    const id: string | null = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.conectionBack.getTableroPorId(id).then(tablero => {
      if (!tablero) {
        this.snackBar.open('Tablero no encontrado', 'Cerrar', { 
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.router.navigate(['/']);
        this.cargando = false;
        return;
      }
      this.tablero = tablero;
      if (tablero) {
        this.procesarTablero(tablero);
      }
      this.cargando = false;
    }).catch(error => {
      console.error('Error al cargar tablero:', error);
      this.cargando = false;
    });
  }
  get luz(): Luz | null {
    return this.nuevaAccion instanceof Luz ? this.nuevaAccion as Luz : null;
  }
  getFondoTablero() {
    const fondo = this.tablero.fondo;

    if (!fondo) return {};
    if (typeof fondo === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(fondo)) {
      return {
        'background-color': fondo
      };
    }
    const url = typeof fondo === 'string' ? fondo : URL.createObjectURL(fondo);
    return {
      'background-image': `url(${url})`,
      'background-size': 'cover',
      'background-position': 'center'
    };
  }
  isFilePath(fondo: string): boolean {
    return /\.(png|jpg|jpeg|gif|webp)$/i.test(fondo);
  }
  getEstiloCelda(fila: number, columna: number): any {
    let tag: Tag | null = null;
    let listTags: Tag[] = this.tablero.listaTags;
    listTags.push(this.tablero.mainTag);
    for (var tagAux of listTags) {
      if(fila == tagAux.fila && columna == tagAux.columna){
        tag = tagAux;
        break;
      }
    }
    if(tag == null){return;}
    if (tag && tag.fondo) {
      if(tag.fondo instanceof File){
        const url = typeof tag.fondo === 'string' ? tag.fondo : URL.createObjectURL(tag.fondo);
        return {
          'background-image': `url(${url})`,
          'background-size': 'cover',
          'background-position': 'center',
          'border-color': this.tablero.colorlineas
        };
      }else if(this.isFilePath(tag.fondo)){
        return {
          'background-image': `url(${tag.fondo})`,
          'background-size': 'cover',
          'background-position': 'center',
          'border-color': this.tablero.colorlineas
        };
      }else{
        return {
          'background-color': `${tag.fondo}`,
          'background-size': 'cover',
          'background-position': 'center',
          'border-color': this.tablero.colorlineas
        };
      }
    }
    return {
      'background': 'transparent',
      'border-color': this.tablero.colorlineas
    };
  }
  procesarTablero(tablero: Tablero) {
    this.verificarTamanioCeldas();
    const grid: { acciones: Accion[] }[][] = Array.from({ length: tablero.filas }, () =>
      Array.from({ length: tablero.columnas }, () => ({ acciones: [] }))
    );
    this.mainTagAccions = tablero.mainTag.listaAcciones.map(acc => {
      switch (acc.tipo) {
        case 'audio':
          const audio = new Audio(acc.id);
          audio.archivo = (acc as Audio).archivo;
          return audio;
        case 'movimiento':
          const mov = new Movimiento(acc.id);
          mov.direccion = (acc as Movimiento).direccion;
          return mov;
        case 'luz':
          const luz = new Luz(acc.id);
          luz.color = (acc as Luz).color;
          luz.intervalo = (acc as Luz).intervalo;
          return luz;
        default:
          return acc;
      }
    });
    for (const tag of tablero.listaTags) {
      const acciones: Accion[] = tag.listaAcciones.map(acc => {
        switch (acc.tipo) {
          case 'audio':
            const audio = new Audio(acc.id);
            audio.archivo = (acc as Audio).archivo;
            return audio;
          case 'movimiento':
            const mov = new Movimiento(acc.id);
            mov.direccion = (acc as Movimiento).direccion;
            return mov;
          case 'luz':
            const luz = new Luz(acc.id);
            luz.color = (acc as Luz).color;
            luz.intervalo = (acc as Luz).intervalo;
            return luz;
          default:
            return acc;
        }
      });
      grid[tag.fila][tag.columna].acciones = acciones;
    }
    this.tableroGrid = grid;
  }
  seleccionarCelda(fila: number, columna: number) {
    this.selectedCell = { fila, columna };
    setTimeout(() => {
      const celdaElem = document.querySelectorAll('.tablero tr')[fila]?.children[columna] as HTMLElement;
      if (celdaElem) {
        const rect = celdaElem.getBoundingClientRect();
        const espacioDerecha = window.innerWidth - rect.right;

        const left = espacioDerecha > 300 ? rect.right + 10 : rect.left - 310;
        const top = rect.top + window.scrollY;

        this.panelStyles = {
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`,
        };
      }
    });
  }
  cerrarPanel() {
    this.selectedCell = null;
  }
  async reproducirAudio(base64: string | null | File) {
    if (base64 === null) {
      console.log("No hay audio.");
      return;
    } else if (typeof base64 === 'string'){
      const audio = new window.Audio(base64);
      audio.play();
    }
  }
  esAudio(accion: Accion): accion is Audio {
    return accion instanceof Audio && typeof accion.archivo === 'string';
  }
  zoomIn() {
    this.zoomLevel = Math.min(100, this.zoomLevel + 0.1);
  }
  zoomOut() {
    this.zoomLevel = Math.max(-100, this.zoomLevel - 0.1);
  }
  zoomReset() {
    this.zoomLevel = 1;
  }
  getDescripcionAccion(accion: Accion): string {
    if (accion instanceof Audio) {
      return `Audio: `;
    } else if (accion instanceof Movimiento) {
      return `Movimiento: ${accion.direccion}`;
    } else if (accion instanceof Luz) {
      return `Luz: Color ${accion.color}, Intervalo ${accion.intervalo} ms`;
    }
    return 'Acción desconocida';
  }
}