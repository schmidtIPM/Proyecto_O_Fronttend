import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preguntas-frecuentes',
  imports: [CommonModule],
  templateUrl: './preguntas-frecuentes.component.html',
  styleUrl: './preguntas-frecuentes.component.css'
})
export class PreguntasFrecuentesComponent {
   faqs = [
    {
      pregunta: '¿Qué es O-bot?',
      respuesta: 'O-bot es un robot educativo diseñado para introducir a jóvenes en el mundo de la programación de forma accesible y entretenida. A través de una interfaz visual y tableros interactivos, los usuarios pueden aprender conceptos clave de programación y la lógica.',
      abierto: false
    },
    {
      pregunta: '¿Para qué sirven los tableros?',
      respuesta: 'Los tableros son el espacio donde se definen las instrucciones que O-bot debe seguir. Cada celda del tablero puede contener una o varias acciones, como desplazarse, reproducir sonidos o activar luces. Gracias a esto, los usuarios pueden crear recorridos y simulaciones que O-bot ejecuta con precisión.',
      abierto: false
    },
    {
      pregunta: '¿Cómo creo un nuevo tablero?',
      respuesta: ` <ol>
        <li>Accedé al creador de tableros: Desde la barra superior hacé clic en el botón <em>"Creador"</em>. <br>(Ver captura adjunta)</li>
        <li>Configurá tu tablero: Elegí nombre, tamaño y detalles. Luego hacé clic en <em>"Generar"</em>. <br>(Ver captura adjunta)</li>
        <li>Diseñá y asigná acciones: Personalizá cada celda con las acciones deseadas y diseño a tu gusto. Finalmente, guardá la creación con <em>"Guardar Tablero"</em>. <br>(Ver captura adjunta)</li>
      </ol>`,
      abierto: false
    }
  ];

  toggle(index: number): void {
    this.faqs[index].abierto = !this.faqs[index].abierto;
  }

}
