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
    private router: Router 
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
    console.log(tablero.colorlineas);
    const url = typeof fondo === 'string' ? fondo : URL.createObjectURL(fondo);
    return {
      'background-image': `url(${url})`,
      'background-size': 'cover',
      'background-position': 'center'
    };
  }
  async cargarTableros() {
    try {
      const response = await this.conectionBack.getTablero();
      this.tableros = response;
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

}
