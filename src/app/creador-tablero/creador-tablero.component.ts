import { Component } from '@angular/core';
import { Accion, Audio, Movimiento, Luz, Tablero, Tag } from '../models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConectionBackService } from '../conection-back.service';
import { ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MiniPaintComponent } from '../mini-paint/mini-paint.component';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-creador-tablero',
  templateUrl: './creador-tablero.component.html',
  styleUrls: ['./creador-tablero.component.css'],
  imports: [FormsModule, CommonModule]
})
export class CreadorTableroComponent {
  filas = 3;
  tableroGenerado = false;
  columnas = 3;
  nombreTablero = 'Nuevo Tablero';
  tableroGrid: { acciones: Accion[] }[][] = [];
  mainTagAccions: Accion[] = [];
  tagGrid: { fondo: string | File, fila: number; columna: number }[] = [];
  accionesDisponibles: string[] = ['audio', 'movimiento', 'luz'];
  idAccion = 0;
  zoomLevel = 1;
  mostrarZoom = false;
  selectedCell: { fila: number; columna: number } | null = null;
  panelStyles = {};
  nuevaAccion: Accion | null = null;
  colorLineasTablero: string = "A7D129";
  fondoTablero: string | File = "FFFFFF";
  colores: string[] = ['#1479e4', '#A7D129', '#FF7F50'];
  showPopup = false;
  tamanioCelda = 10;

  constructor(private conectionBack: ConectionBackService, private dialog: MatDialog, private router: Router, private snackBar: MatSnackBar) {}

  generarTablero() {
    this.tableroGrid = Array.from({ length: this.filas }, () =>
      Array.from({ length: this.columnas }, () => ({ acciones: [] }))
    );
    this.selectedCell = null;
    this.verificarTamanioCeldas();
    this.tableroGenerado = true;
  }
  esAudio(accion: Accion): accion is Audio {
    return accion instanceof Audio && typeof accion.archivo === 'string';
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
  async reproducirAudio(base64: string | null | File) {
    if (base64 === null) {
      console.log("No hay audio.");
      return;
    } else if (typeof base64 === 'string') {
      const audio = new window.Audio(base64);
      audio.play();
    } else if (base64 instanceof File) {
      const audio = new window.Audio(URL.createObjectURL(base64));
      audio.play();
    }
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
  agregarAccion(fila: number, columna: number, tipo: string) {
    let accion: Accion;
    switch (tipo) {
      case 'audio':
        accion = new Audio(this.idAccion++);
        break;
      case 'movimiento':
        accion = new Movimiento(this.idAccion++);
        break;
      case 'luz':
        accion = new Luz(this.idAccion++);
        break;
      default:
        return;
    }

    this.tableroGrid[fila][columna].acciones.push(accion);
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
      this.fondoTablero = file;
      event.target.value=null;
      return;
    }
    for (var tag of this.tagGrid) {
      if(this.selectedCell?.fila == tag.fila && this.selectedCell.columna == tag.columna){
        if (file) {
          tag.fondo = file;
        }
        return;
      }
    }
    if (this.selectedCell && file) {
      this.tagGrid.push({
        fondo: file,
        fila: this.selectedCell.fila,
        columna: this.selectedCell.columna
      });
    }
    event.target.value=null;
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
  guardarTablero() {
    const tags: Tag[] = [];
    for (let filaIndex = 0; filaIndex < this.tableroGrid.length; filaIndex++) {
      for (let columnaIndex = 0; columnaIndex < this.tableroGrid[filaIndex].length; columnaIndex++) {
        const celda = this.tableroGrid[filaIndex][columnaIndex];
        const tagFondo = this.tagGrid.find(t => t.fila === filaIndex && t.columna === columnaIndex);
        let fondoTag = tagFondo?.fondo;
        if(fondoTag == null){fondoTag = "FFFFFF";}
        tags.push(new Tag(Math.floor(Math.random() * (564 - 0 + 1)) +5465, celda.acciones, filaIndex, columnaIndex, fondoTag));
      }
    }
    let mainTag: Tag = new Tag(Math.floor(Math.random() * (564 - 0 + 1)) +5465, 
        this.mainTagAccions, -1, -1, "FFFFFF");
    const tablero = new Tablero(
      Date.now(),
      this.nombreTablero,
      this.filas,
      this.columnas,
      mainTag,
      tags,
      undefined,
      this.colorLineasTablero,
      this.fondoTablero,
      this.tamanioCelda
    );
    console.log(tablero);
    this.conectionBack.guardarTablero(tablero)
      .then(respuesta => {
        console.log('Tablero guardado correctamente:', respuesta);
        this.router.navigate(['/']).then(() => {
          //window.location.reload();
          this.snackBar.open('Tablero guardado con éxito', 'Cerrar', { 
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
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
  verificarTamanioCeldas() {
    setTimeout(() => {
      const unaCelda = document.querySelector('.celda') as HTMLElement;
      if (unaCelda) {
        const { width, height } = unaCelda.getBoundingClientRect();
        this.mostrarZoom = this.columnas > 6 || this.filas > 5;
      }
    }, 0);
  }
  zoomIn() {this.zoomLevel = Math.min(100, this.zoomLevel + 0.1);}
  zoomOut() {this.zoomLevel = Math.max(-100, this.zoomLevel - 0.1);}
  zoomReset() {this.zoomLevel = 1;}
  updateZoom() {
    const wrapper = document.querySelector('.tablero-wrapper') as HTMLElement;
    if (wrapper) {
      wrapper.style.transform = `scale(${this.zoomLevel})`;
    }
  }
  getDescripcionAccion(accion: Accion): string {
    if (accion instanceof Audio) {
      return `𝗔𝘂𝗱𝗶𝗼: ${accion.archivo ? (accion.archivo instanceof File ? accion.archivo.name : accion.archivo) : 'No seleccionado'}`;
    } else if (accion instanceof Movimiento) {
      return `𝗠𝗼𝘃𝗶𝗺𝗶𝗲𝗻𝘁𝗼: ${accion.direccion.charAt(0).toUpperCase() + accion.direccion.slice(1)}`;
    } else if (accion instanceof Luz) {
      return `𝗟𝘂𝘇: Color ${accion.color.toUpperCase()}, Intervalo ${accion.intervalo} ms`;
    }
    return 'Acción desconocida';
  }  
  isFilePath(fondo: string): boolean {
    return /\.(png|jpg|jpeg|gif|webp)$/i.test(fondo);
  }
  getEstiloCelda(fila: number, columna: number): any {
    const tag = this.tagGrid.find(t => t.fila === fila && t.columna === columna);
    if (tag && tag.fondo) {
      if(tag.fondo instanceof File){
        const url = typeof tag.fondo === 'string' ? tag.fondo : URL.createObjectURL(tag.fondo);
        return {
          'background-image': `url(${url})`,
          'background-size': 'cover',
          'background-position': 'center',
          'border-color': this.colorLineasTablero
        };
      }else if(this.isFilePath(tag.fondo)){
        return {
          'background-image': `url(${tag.fondo})`,
          'background-size': 'cover',
          'background-position': 'center',
          'border-color': this.colorLineasTablero
        };
      }else{
        return {
          'background-color': `${tag.fondo}`,
          'background-size': 'cover',
          'background-position': 'center',
          'border-color': this.colorLineasTablero
        };
      }
    }
    return {
      'background': 'transparent',
      'border-color': this.colorLineasTablero
    };
  }
  getFondoTablero() {
    const fondo = this.fondoTablero;
    if (!fondo) return {};
    if (typeof fondo === 'string'){
      if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(fondo)) {
        return {
          'background-image': `url(${this.fondoTablero})`,
          'background-size': 'cover',
          'background-repeat': 'no-repeat'
        };
      }else{
        return {
          'background-color': fondo
        };
      }
    }
    const url = typeof fondo === 'string' ? fondo : URL.createObjectURL(fondo);
    console.log(this.fondoTablero, "entre aca");
    return {
      'background-image': `url(${url})`,
      'background-size': 'cover',
      'background-repeat': 'no-repeat'
    };
  }
  paint() {
    const dialogRef = this.dialog.open(MiniPaintComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '42rem',
      height: '32rem'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.onArchivoImagenChange(result)
    });
  }
}