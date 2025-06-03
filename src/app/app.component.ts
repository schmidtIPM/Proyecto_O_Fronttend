import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { ConectionBackService } from './conection-back.service';
import { Tablero } from './models';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Proyecto_O_Fronttend';
  tableros: Tablero[] | any;
  constructor(private router: Router, private conecctionBackService: ConectionBackService) {}
  
  irACreador() {
    this.router.navigate(['/creador-de-tableros']);
  }
  async irAActualizar() {
    const response = await this.conecctionBackService.getTablero();
    this.tableros = response;
    this.router.navigate(['/actualizador-de-tableros', this.tableros[0]._id]);
  }
  async irASimular() {
    const response = await this.conecctionBackService.getTablero();
    this.tableros = response;
    this.router.navigate(['/tablero', this.tableros[0]._id]);
  }
  irAHome() {
    this.router.navigate(['/']);
  }
}
