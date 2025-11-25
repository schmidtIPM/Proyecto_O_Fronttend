import { Component, HostListener } from '@angular/core';
import { ConectionBackService } from '../conection-back.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Tablero } from '../models';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-mis-tableros',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule, ButtonModule],
  templateUrl: './mis-tableros.component.html',
  styleUrls: ['./mis-tableros.component.css']
})
export class MisTablerosComponent {
  responsiveOptions = [
    {breakpoint: '2640px', numVisible: 6, numScroll: 1},
    {breakpoint: '2280px', numVisible: 5, numScroll: 1},
    {breakpoint: '1920px', numVisible: 4, numScroll: 1},
    {breakpoint: '1560px', numVisible: 3, numScroll: 1},
    {breakpoint: '1200px', numVisible: 2, numScroll: 1},
    {breakpoint: '840px', numVisible: 1, numScroll: 1}
  ];

  estrella: string = "";
  estrellaAmarilla: string = "";
  constructor(
    private conectionBack: ConectionBackService,
    private router: Router,
  ) {}

  currentNumVisible = 3;

  @HostListener('window:resize')
  onResize() {
    this.updateCurrentNumVisible();
  }

  private updateCurrentNumVisible() {
    const width = window.innerWidth;

    if (width <= 840)       this.currentNumVisible = 1;
    else if (width <= 1200) this.currentNumVisible = 2;
    else if (width <= 1560) this.currentNumVisible = 3;
    else if (width <= 1920) this.currentNumVisible = 4;
    else if (width <= 2280) this.currentNumVisible = 5;
    else                    this.currentNumVisible = 6;
  }

  tableros: any[] = [];
  celdasVacias = Array(9); 
  async ngOnInit() {
    this.updateCurrentNumVisible();
    this.cargarTableros();
    const response = await this.conectionBack.getImagenesPagina();
    if (response && response.length > 0) {
      this.estrellaAmarilla = response.find((file: string) => file.includes('estrellaAmarilla.png')) || '';
      this.estrella = response.find((file: string) => file.includes('estrella.png')) || '';
    }
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
  async eliminarTablero(id: string) {
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
    if (!tablero.id) {
      console.error('El tablero no tiene un _id definido.');
      return;
    }
    this.conectionBack.updateFav(tablero.id.toString(), !tablero.favorito)
      .then(response => {
        tablero.favorito = !tablero.favorito;
        console.log('Tablero actualizado:', response);
      })
      .catch(error => {
        console.error('Error al actualizar el tablero:', error);
      });
  }
  favoritoIndex = 0;
  get tablerosFavoritos(): any[] {
    return this.tableros.filter(t => t.favorito);
  }
  get tablerosPredeterminados(): any[] {
    return this.tableros.filter(t => t.predeterminado);
  }
  get tablerosNomales(): any[] {
    return this.tableros.filter(t =>!t.predeterminado); 
  }
}
