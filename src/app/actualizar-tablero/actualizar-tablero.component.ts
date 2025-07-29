import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ConectionBackService } from '../conection-back.service';
import { Tablero, Tag, Accion, Audio, Movimiento, Luz } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MiniPaintComponent } from '../mini-paint/mini-paint.component';
import { LargeNumberLike } from 'node:crypto';
import { group } from 'node:console';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-actualizar-tablero',
  templateUrl: './actualizar-tablero.component.html',
  styleUrls: ['./actualizar-tablero.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ActualizarTableroComponent implements OnInit {
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
  tagGrid: { fondo: string | File, fila: number; columna: number }[] = []
  mostrarZoom = false;
  colores: string[] = ['#1479e4', '#A7D129', '#FF7F50'];
  showPopup = false;

  constructor(
    private route: ActivatedRoute,
    private conectionBack: ConectionBackService,
    private router: Router, private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    const id: string | null = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.conectionBack.getTableroPorId(id).then(tablero => {
      if (!tablero) {
        alert('Tablero no encontrado');
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
  onArchivoAudioChange(event: any, mainTag: boolean) {
    const file = event.target.files[0];
    if (file && this.nuevaAccion instanceof Audio) {
      this.nuevaAccion.archivo = file;
    }
    if (mainTag && this.nuevaAccion){
      this.mainTagAccions.push(this.nuevaAccion);
    } else{
      if (this.selectedCell && this.nuevaAccion) {
        this.tableroGrid[this.selectedCell.fila][this.selectedCell.columna].acciones.push(this.nuevaAccion);
      }
    }
    this.nuevaAccion = null;
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
  getDireccionMovimiento(): string {
    if (this.nuevaAccion instanceof Movimiento) {
      return this.nuevaAccion.direccion || '';
    }
    return '';
  }
  setLuz(mainTag: boolean){
    if(mainTag){
      if (this.nuevaAccion) {
        this.mainTagAccions.push(this.nuevaAccion);
      }
    }else{
      if (this.selectedCell && this.nuevaAccion) {
        this.tableroGrid[this.selectedCell.fila][this.selectedCell.columna].acciones.push(this.nuevaAccion);
      }
    }
    this.nuevaAccion = null;
  }
  setDireccionMovimiento(direccion: 'arriba' | 'abajo' | 'izquierda' | 'derecha', mainTag: boolean) {
    if (this.nuevaAccion instanceof Movimiento) {
      this.nuevaAccion.direccion = direccion;
    }
    if(mainTag && this.nuevaAccion){
      this.mainTagAccions.push(this.nuevaAccion);
    }else{
      if (this.selectedCell && this.nuevaAccion) {
        this.tableroGrid[this.selectedCell.fila][this.selectedCell.columna].acciones.push(this.nuevaAccion);
      }
    }
    this.nuevaAccion = null;
  }
  get luz(): Luz | null {
    return this.nuevaAccion instanceof Luz ? this.nuevaAccion as Luz : null;
  }
  mostrarFormularioAccion(tipo: string) {
    switch (tipo) {
      case 'audio':
        this.nuevaAccion = new Audio(this.idAccion++);
        break;
      case 'movimiento':
        this.nuevaAccion = new Movimiento(this.idAccion++);
        break;
      case 'luz':
        this.nuevaAccion = new Luz(this.idAccion++);
        break;
      default:
        this.nuevaAccion = null;
    }
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
  async reproducirAudio(base64: string | null | File) {
    if (base64 === null) {
      console.log("No hay audio.");
      return;
    } else if (typeof base64 === 'string') {
      const audio = new window.Audio(base64);
      audio.play();
    }else if (base64 instanceof File) {
      const audio = new window.Audio(URL.createObjectURL(base64));
      audio.play();
    }
  }
  onArchivoImagenChange(event: any) {
    console.log(event);
    let file;
    if (event instanceof File) {
     file = event;
    }
    else {
      file = event.target.files[0];
    }
    if (!this.selectedCell){
      this.tablero.fondo = file;
      event.target.value=null;
      return;
    }
    let listTags: Tag[] = this.tablero.listaTags;
    listTags.push(this.tablero.mainTag);
    for (var tag of listTags) {
      if(this.selectedCell?.fila == tag.fila && this.selectedCell.columna == tag.columna){
        if (file) {
          tag.fondo = file;
        }
        return;
      }
    }
    event.target.value=null;
  }
  esAudio(accion: Accion): accion is Audio {
    return accion instanceof Audio && typeof accion.archivo === 'string';
  }
  zoomIn() {
    this.zoomLevel = Math.min(100, this.zoomLevel + 0.1);
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
  zoomOut() {
    this.zoomLevel = Math.max(-100, this.zoomLevel - 0.1);
  }
  zoomReset() {
    this.zoomLevel = 1;
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
  eliminarAccion(accionAEliminar: Accion, mainTag: boolean) {
    if(mainTag){
      const acciones = this.mainTagAccions;
      const index = acciones.findIndex(acc => acc.id === accionAEliminar.id);
      if (index !== -1) {
        acciones.splice(index, 1);
      }
      this.mainTagAccions = acciones;
    }else{
      if (!this.selectedCell) return;
      const acciones = this.tableroGrid[this.selectedCell.fila][this.selectedCell.columna].acciones;
      const index = acciones.findIndex(acc => acc.id === accionAEliminar.id);
      if (index !== -1) {
        acciones.splice(index, 1);
      }
      this.tableroGrid[this.selectedCell.fila][this.selectedCell.columna].acciones = acciones;
    }
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
  guardarTablero() {
    const tags: Tag[] = [];
    for (let filaIndex = 0; filaIndex < this.tableroGrid.length; filaIndex++) {
      for (let columnaIndex = 0; columnaIndex < this.tableroGrid[filaIndex].length; columnaIndex++) {
        const celda = this.tableroGrid[filaIndex][columnaIndex];
        const tagFondo = this.tagGrid.find(t => t.fila === filaIndex && t.columna === columnaIndex);
        tags.push(new Tag(Math.floor(Math.random() * (564 - 0 + 1)) +5465, celda.acciones, filaIndex, columnaIndex, tagFondo?.fondo));
      }
    }
    let mainTag: Tag = new Tag(Math.floor(Math.random() * (564 - 0 + 1)) +5465, 
        this.mainTagAccions, -1, -1, "FFFFFF");
    const fondoFinal = this.tablero.fondo instanceof File
      ? URL.createObjectURL(this.tablero.fondo)
      : this.tablero.fondo;
    const tablero = new Tablero(
      Date.now(),
      this.tablero.nombre,
      this.tablero.filas,
      this.tablero.columnas,
      mainTag,
      tags,
      this.tablero._id,
      this.tablero.colorlineas,
      this.tablero.fondo,
      this.tablero.tamanioCelda
    );
    if(!this.tablero._id){return;}
    this.conectionBack.modificarTablero(tablero, this.tablero._id)
      .then(respuesta => {
        console.log('Tablero guardado correctamente:', respuesta);
        this.snackBar.open('Tablero guardado con éxito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.router.navigate(['/']).then(() => {
          window.location.reload();
        });
      })
      .catch(error => {
        console.error('Error al guardar el tablero:', error);
        this.snackBar.open('Hubo un error al guardar el tablero.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      });
  }
  cerrarPanel() {
    this.selectedCell = null;
  }
  paint() {
    const dialogRef = this.dialog.open(MiniPaintComponent, {
      width: '520px',
      height: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.onArchivoImagenChange(result)
    });
  }
}
