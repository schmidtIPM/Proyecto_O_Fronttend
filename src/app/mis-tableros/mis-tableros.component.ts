import { Component } from '@angular/core';
import { ConectionBackService } from '../conection-back.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-tableros',
  imports: [CommonModule],
  templateUrl: './mis-tableros.component.html',
  styleUrl: './mis-tableros.component.css'
})
export class MisTablerosComponent {
  constructor(private conectionBack: ConectionBackService) { }
  tableros: any[] = [];
  ngOnInit() {
    this.cargarTableros();
  }
  async cargarTableros() {
    try {
      const response = await this.conectionBack.getTablero();
      this.tableros = response;
      console.log('Tableros cargados:', this.tableros);
    } catch (error) {
      console.error('Error al cargar los tableros:', error);
    }
  }
  async eliminarTablero(id: number) {
    try {
      const response = await this.conectionBack.eliminarTablero(id);
      console.log('Tablero eliminado:', response);
      this.cargarTableros(); // Recargar la lista de tableros
    } catch (error) {
      console.error('Error al eliminar el tablero:', error);
    }
  }
}
