import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConectionBackService } from '../conection-back.service';
import { Tablero, Tag, Accion, Audio, Movimiento, Luz } from '../models';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-actualizar-tablero',
  templateUrl: './actualizar-tablero.component.html',
  styleUrls: ['./actualizar-tablero.component.css'],
  imports: [CommonModule]

})
export class ActualizarTableroComponent implements OnInit {
  tablero: Tablero | null = null;
  tableroGrid: { acciones: Accion[] }[][] = [];
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private conectionBack: ConectionBackService
  ) {}

  ngOnInit(): void {
    const id: string | null = (this.route.snapshot.paramMap.get('id'));
    if (id === null) return;

    this.conectionBack.getTableroPorId(id).then(tablero => {
      this.tablero = tablero;
      if (tablero !== null) {
        this.procesarTablero(tablero);
      }
      this.cargando = false;
    }).catch(error => {
      console.error('Error al cargar tablero:', error);
      this.cargando = false;
    });
  }

  procesarTablero(tablero: Tablero) {
    const grid: { acciones: Accion[] }[][] = Array.from({ length: tablero.filas }, () =>
      Array.from({ length: tablero.columnas }, () => ({ acciones: [] }))
    );

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

  getDescripcionAccion(accion: Accion): string {
    if (accion instanceof Audio) {
      return `Audio: ${accion.archivo ? (accion.archivo instanceof File ? accion.archivo.name : accion.archivo) : 'No archivo'}`;
    } else if (accion instanceof Movimiento) {
      return `Movimiento: ${accion.direccion}`;
    } else if (accion instanceof Luz) {
      return `Luz: ${accion.color}, ${accion.intervalo}ms`;
    }
    return 'Acción desconocida';
  }
}
