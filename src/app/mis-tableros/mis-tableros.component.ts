import { Component } from '@angular/core';
import { ConectionBackService } from '../conection-back.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Tablero,} from '../models';

@Component({
  selector: 'app-mis-tableros',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-tableros.component.html',
  styleUrl: './mis-tableros.component.css'
})
export class MisTablerosComponent {
  constructor(
    private conectionBack: ConectionBackService,
    private router: Router,
  ) {}

  tableros: any[] = [];
  celdasVacias = Array(9); 

  ngOnInit() {
    this.cargarTableros();
  }
  getFondoTablero(tablero: Tablero) {
    const fondo = tablero.fondo;

    if (!fondo) return {};

    if (typeof fondo === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(fondo)) {
      return {
        'background-color': fondo
      };
    }

    const url = typeof fondo === 'string'
      ? (fondo.startsWith('http') ? fondo : this.safeEncodeUrl(fondo))
      : URL.createObjectURL(fondo);

    return {
      'background-image': `url('${url}')`,
      'background-size': 'cover',
      'background-position': 'center'
    };
}

  async cargarTableros() {
    try {
      const response = await this.conectionBack.getTablero();
      if (!response || response.length === 0) {
        this.tableros = [];
        return;
      }
      this.tableros = response;
      console.log('Tableros cargados:', this.tableros);
    } catch (error) {
      console.error('Error al cargar los tableros:', error);
    }
  }

  reproducirAudio(base64: string) {
    const audio = new Audio(base64);
    audio.play();
  }

  async eliminarTablero(id: number) {
    try {
      const response = await this.conectionBack.eliminarTablero(id);
      console.log('Tablero eliminado:', response);
      this.cargarTableros(); 
    } catch (error) {
      console.error('Error al eliminar el tablero:', error);
    }
  }

  irAEditarTablero(id: string) {
    this.router.navigate(['/actualizador-de-tableros', id]);
  }

  irASimularTablero(id: string) {
    this.router.navigate(['/tablero', id]);
  }
  safeEncodeUrl(url: string): string {
    // Si ya contiene % seguido de 2 hex, asumimos que está codificada
    return /%[0-9A-Fa-f]{2}/.test(url) ? url : encodeURI(url);
  }
  actualizarFavorito(tablero: Tablero) {
    if (!tablero._id) {
      console.error('El tablero no tiene un _id definido.');
      return;
    }
    this.conectionBack.updateFav(tablero._id, !tablero.favoritos)
      .then(response => {
        tablero.favoritos = !tablero.favoritos;
        console.log('Tablero actualizado:', response);
      })
      .catch(error => {
        console.error('Error al actualizar el tablero:', error);
      });
  }

  readonly CARD_WIDTH_PX = 300;
  currentIndex = 0;

  getVisibleCount(): number {
    return Math.min(5, this.tableros.length);
  }

  


  siguiente() {
    const maxIndex = this.tableros.length - this.getVisibleCount();
    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
    }
  }

  anterior() {
   if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  favoritosIndex = 0;

  get tablerosFavoritos(): any[] {
    return this.tableros.filter(t => t.favoritos);
  }

  anteriorFavoritos() {
    if (this.favoritosIndex > 0) {
      this.favoritosIndex--;
    }
  }

  siguienteFavoritos() {
    const maxIndex = this.tablerosFavoritos.length - this.getVisibleCount();
    if (this.favoritosIndex < maxIndex) {
      this.favoritosIndex++;
    }
  }

 

}
