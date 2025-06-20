import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ConectionBackService } from '../conection-back.service';
import { Tablero, Tag, Accion, Audio, Movimiento, Luz } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selectedCell: { fila: number; columna: number } | null = null;
  panelStyles: any = {};
  nuevaAccion: Accion | null = null;
  idAccion = 0;
  constructor(
    private route: ActivatedRoute,
    private conectionBack: ConectionBackService,
    private router: Router
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
  setLuz(color : string, intervalo: number){
    if (this.selectedCell && this.nuevaAccion) {
      if (this.nuevaAccion instanceof Luz) {
        console.log("Luz cargada:", this.nuevaAccion.color);
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
  setDireccionMovimiento(direccion: 'arriba' | 'abajo' | 'izquierda' | 'derecha') {
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
    } else if (typeof base64 === 'string') {
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
  eliminarAccion(accionAEliminar: Accion) {
    if (!this.selectedCell) return;

    const acciones = this.tableroGrid[this.selectedCell.fila][this.selectedCell.columna].acciones;
    const index = acciones.findIndex(acc => acc.id === accionAEliminar.id);
    if (index !== -1) {
      acciones.splice(index, 1);
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
    this.prepararArchivosDesdeBase64(this.tablero);
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
      this.tablero.nombre,
      this.tablero.filas,
      this.tablero.columnas,
      tags[0],
      tags,
    );
    this.conectionBack.modificarTablero(tablero, this.tablero.id)
      .then(respuesta => {
        console.log('Tablero guardado correctamente:', respuesta);
        alert('Tablero guardado con éxito');
      })
      .catch(error => {
        console.error('Error al guardar el tablero:', error);
        alert('Hubo un error al guardar el tablero.');
      });
  }
  base64ToFile(base64: string, filename: string, mime: string = 'audio/mpeg'): File {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mime });
    return new File([blob], filename, { type: mime });
  }
  prepararArchivosDesdeBase64(tablero: Tablero): void {
    const tags = [tablero.mainTag, ...tablero.listaTags];
    for (const tag of tags) {
      tag.listaAcciones = tag.listaAcciones.map(accion => {
        if (accion.tipo === 'audio' && typeof (accion as any).archivo === 'string' && (accion as any).archivo.startsWith('data:')) {
          console.log("Archivo MP3 encontrado:", (accion as any).archivo);
          const nombre = `audio.mp3`;
          (accion as any).archivo = this.base64ToFile((accion as any).archivo, nombre);
        }
        return accion;
      });
    }
  }

}
