import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConectionBackService } from '../conection-back.service';
import { PregFrecuente } from '../interfaces';

@Component({
  selector: 'app-preguntas-frecuentes',
  imports: [CommonModule],
  templateUrl: './preguntas-frecuentes.component.html',
  styleUrl: './preguntas-frecuentes.component.css'
})

export class PreguntasFrecuentesComponent implements OnInit {
  faqs: PregFrecuente[] = [];

  constructor(private conectionService: ConectionBackService, private router: Router) {}
  
  async ngOnInit(): Promise<void> {
    await this.cargarPreguntasFrecuentes();
  }

  async cargarPreguntasFrecuentes(): Promise<void> {
    try {
      this.faqs = await this.conectionService.getPregFrecuentes();
    } catch (error) {
      console.error('Error al cargar preguntas frecuentes:', error);
      // Fallback a preguntas por defecto si falla la carga
      this.router.navigate(['/']);
    }
  }
  

  toggle(index: number): void {
    (this.faqs[index] as any).abierto = !(this.faqs[index] as any).abierto;
  }

}
