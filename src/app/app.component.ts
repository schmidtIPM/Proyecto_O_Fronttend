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
  logo: string = "";
  constructor(private router: Router, private conecctionBackService: ConectionBackService) {}
  async ngOnInit() {
    const response = await this.conecctionBackService.getImagenesPagina();
    if (response && response.length > 0) {
      this.logo = response.find((file: string) => file.includes('logo')) || '';
    }
  }
  irACreador() {
    this.router.navigate(['/creador-de-tableros']);
  }
  irAHome() {
    this.router.navigate(['/']);
  }
}
