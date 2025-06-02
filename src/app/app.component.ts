import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { ConectionBackService } from './conection-back.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Proyecto_O_Fronttend';

  constructor(private router: Router) {}

  irACreador() {
    this.router.navigate(['/creador-de-tableros']);
  }

  irAActualizar(id: string) {
    this.router.navigate(['/actualizador-de-tableros', id]);
  }

  irAHome() {
    this.router.navigate(['/']);
  }
}
