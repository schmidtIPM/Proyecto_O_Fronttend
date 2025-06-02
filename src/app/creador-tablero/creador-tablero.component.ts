import { Component } from '@angular/core';
import { Accion, Audio, Movimiento, Luz, Tablero, Tag } from '../models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConectionBackService } from '../conection-back.service';
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
  accionesDisponibles: string[] = ['audio', 'movimiento', 'luz'];
  idAccion = 0;
  zoomLevel = 1;
  mostrarZoom = false;
  selectedCell: { fila: number; columna: number } | null = null;
  robotPos: { fila: number; columna: number } = { fila: 0, columna: 0 };
  panelStyles = {};
  nuevaAccion: Accion | null = null;
  
  constructor(private conectionBack: ConectionBackService) {}

  generarTablero() {
    this.tableroGrid = Array.from({ length: this.filas }, () =>
      Array.from({ length: this.columnas }, () => ({ acciones: [] }))
    );
    this.robotPos = { fila: 0, columna: 0 };
    this.selectedCell = null;
    this.verificarTamanioCeldas();
    this.tableroGenerado = true;
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
  confirmarAccion(fila: number, columna: number) {
    if (this.nuevaAccion) {
      this.tableroGrid[fila][columna].acciones.push(this.nuevaAccion);
      this.nuevaAccion = null;
    }
  }
  onArchivoAudioChange(event: any) {
    const file = event.target.files[0];
    if (file && this.nuevaAccion instanceof Audio) {
      this.nuevaAccion.archivo = file;
    }
    
    if (this.selectedCell && this.nuevaAccion) {
      if (this.nuevaAccion instanceof Audio) {
        console.log("Archivo MP3 cargado:", this.nuevaAccion.archivo);
      }
      this.tableroGrid[this.selectedCell.fila][this.selectedCell.columna].acciones.push(this.nuevaAccion);
    }
    this.nuevaAccion = null;
  }
  getDireccionMovimiento(): string {
    if (this.nuevaAccion instanceof Movimiento) {
      return this.nuevaAccion.direccion || '';
    }
    return '';
  }
  setDireccionMovimiento(direccion: 'avanzar' | 'girar') {
    if (this.nuevaAccion instanceof Movimiento) {
      this.nuevaAccion.direccion = direccion;
    }
    if (this.selectedCell && this.nuevaAccion) {
      this.tableroGrid[this.selectedCell.fila][this.selectedCell.columna].acciones.push(this.nuevaAccion);
    }
    this.nuevaAccion = null;
  }
  get luz(): Luz | null {
    return this.nuevaAccion instanceof Luz ? this.nuevaAccion as Luz : null;
  }
  moverRobot(direccion: 'arriba' | 'abajo' | 'izquierda' | 'derecha') {
    const { fila, columna } = this.robotPos;
    let nuevaFila = fila;
    let nuevaColumna = columna;

    switch (direccion) {
      case 'arriba':
        nuevaFila = Math.max(0, fila - 1);
        break;
      case 'abajo':
        nuevaFila = Math.min(this.filas - 1, fila + 1);
        break;
      case 'izquierda':
        nuevaColumna = Math.max(0, columna - 1);
        break;
      case 'derecha':
        nuevaColumna = Math.min(this.columnas - 1, columna + 1);
        break;
    }

    this.robotPos = { fila: nuevaFila, columna: nuevaColumna };
  }
  guardarTablero() {
    const tags: Tag[] = [];
    let tagId = 0;
    for (let filaIndex = 0; filaIndex < this.tableroGrid.length; filaIndex++) {
      for (let columnaIndex = 0; columnaIndex < this.tableroGrid[filaIndex].length; columnaIndex++) {
        const celda = this.tableroGrid[filaIndex][columnaIndex];
        tags.push(new Tag(tagId++, celda.acciones, filaIndex, columnaIndex));
      }
    }
    const tablero = new Tablero(
      Date.now(),
      this.nombreTablero,
      this.filas,
      this.columnas,
      tags[0],
      tags
    );
    this.conectionBack.guardarTablero(tablero)
      .then(respuesta => {
        console.log('Tablero guardado correctamente:', respuesta);
        alert('Tablero guardado con éxito');
      })
      .catch(error => {
        console.error('Error al guardar el tablero:', error);
        alert('Hubo un error al guardar el tablero.');
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
      return `Audio: ${accion.archivo ? (accion.archivo instanceof File ? accion.archivo.name : accion.archivo) : 'No seleccionado'}`;
    } else if (accion instanceof Movimiento) {
      return `Movimiento: ${accion.direccion}`;
    } else if (accion instanceof Luz) {
      return `Luz: Color ${accion.color}, Intervalo ${accion.intervalo} ms`;
    }
    return 'Acción desconocida';
  }
}
