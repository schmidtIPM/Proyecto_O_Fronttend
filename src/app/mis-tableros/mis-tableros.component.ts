import { Component } from '@angular/core';
import { ConectionBackService } from '../conection-back.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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
}
