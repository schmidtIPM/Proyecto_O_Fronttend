import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { ConectionBackService } from './conection-back.service';
import { Tablero } from './models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Proyecto_O_Fronttend';
  tableros: Tablero[] | any;
  logo: string = "";
  totalGB: number = 0;
  libreGB: number = 0;

  constructor(
    private router: Router,
    private conecctionBackService: ConectionBackService
  ) {}

  async ngOnInit() {
    const response = await this.conecctionBackService.getImagenesPagina();
    if (response && response.length > 0) {
      this.logo = response.find((file: string) => file.includes('logo')) || '';
    }
    await this.obtenerEspacioSD();
  }

  async obtenerEspacioSD() {
    const espacio = await this.conecctionBackService.getEspacioSD();
    if (espacio) {
      this.totalGB = espacio.totalGB;
      this.libreGB = espacio.libreGB;
    }
  }

  // porcentaje de espacio usado para el slider
  get porcentajeUsado(): number {
    if (!this.totalGB) return 0;
    const usado = this.totalGB - this.libreGB;
    return Math.round((usado / this.totalGB) * 100);
  }

  irACreador() {
    this.router.navigate(['/creador-de-tableros']);
  }

  irAHome() {
    this.router.navigate(['/']);
  }

  irAPreguntas() {
    this.router.navigate(['/preguntas-frecuentes']);
  }
}
