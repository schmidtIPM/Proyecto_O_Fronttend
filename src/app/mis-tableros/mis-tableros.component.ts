import { Component } from '@angular/core';
import { ConectionBackService } from '../conection-back.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Tablero } from '../models';

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
  window.addEventListener('resize', () => {
    this.getVisibleCount(); 
  });
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
      console.log(this.tableros);
    } catch (error) {
      console.error('Error al cargar los tableros:', error);
    }
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
  const width = window.innerWidth;
  if (width <= 480) return 1;
  if (width <= 768) return 2;
  if (width <= 992) return 3;
  if (width <= 1200) return 4;
  return 5;
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
  get tablerosPredeterminados(): any[] {
    return this.tableros.filter(t => t.predeterminado);
  }
  get tablerosNomales(): any[] {
    return this.tableros.filter(t =>!t.predeterminado); 
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
  currentIndexPred = 0;
  siguientePred() {
    const maxIndex = this.tablerosPredeterminados.length - this.getVisibleCount();
    if (this.currentIndexPred < maxIndex) this.currentIndexPred++;
  }
  anteriorPred() {
    if (this.currentIndexPred > 0) this.currentIndexPred--;
  }
}
