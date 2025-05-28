import { Component } from '@angular/core';
import { Accion, Audio, Movimiento, Luz, Tablero, Tag } from '../models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-creador-tablero',
  templateUrl: './creador-tablero.component.html',
  styleUrls: ['./creador-tablero.component.css'],
  imports: [FormsModule, CommonModule]
})
export class CreadorTableroComponent {
  filas = 3;
  columnas = 3;
  nombreTablero = 'Nuevo Tablero';
  tableroGrid: { acciones: Accion[] }[][] = [];
  accionesDisponibles: string[] = ['audio', 'movimiento', 'luz'];
  idAccion = 0;

  selectedCell: { fila: number; columna: number } | null = null;
  robotPos: { fila: number; columna: number } = { fila: 0, columna: 0 };

  generarTablero() {
    this.tableroGrid = Array.from({ length: this.filas }, () =>
      Array.from({ length: this.columnas }, () => ({ acciones: [] }))
    );
    this.robotPos = { fila: 0, columna: 0 };
    this.selectedCell = null;
  }

  seleccionarCelda(fila: number, columna: number) {
    this.selectedCell = { fila, columna };
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

  guardarTablero(): Tablero {
    const tags: Tag[] = [];
    let tagId = 0;

    for (let fila of this.tableroGrid) {
      for (let celda of fila) {
        tags.push(new Tag(tagId++, celda.acciones));
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

    console.log('Tablero generado:', tablero);
    return tablero;
  }
}
