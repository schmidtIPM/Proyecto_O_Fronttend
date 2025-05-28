import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Proyecto_O_Fronttend';

  constructor(private router: Router) {}

  navegarAMisTableros() {
    this.router.navigate(['/misTableros']);
    console.log('Navegando a mis tableros');
  }
}
