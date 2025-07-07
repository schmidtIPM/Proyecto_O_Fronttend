import { Component, ElementRef, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreadorTableroComponent } from '../creador-tablero/creador-tablero.component';
    import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';



@Component({
  selector: 'app-mini-paint',
  templateUrl: './mini-paint.component.html',
  styleUrls: ['./mini-paint.component.css'],
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule]
})
export class MiniPaintComponent implements AfterViewInit {

  constructor(
        public dialogRef: MatDialogRef<MiniPaintComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
      ) {}

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  colorActual = '#000000';
  ultimoColor = '';
  private ctx!: CanvasRenderingContext2D | null;
  private drawing = false;
  grosorLapiz: number = 5;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 400;
  }

  startDrawing(event: MouseEvent) {
    this.drawing = true;
    this.draw(event);
  }

  endDrawing() {
    this.drawing = false;
    this.ctx?.beginPath();
  }

  draw(event: MouseEvent) {
    if (!this.drawing || !this.ctx) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.ctx.lineWidth = this.grosorLapiz;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.colorActual;

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  usarBorrador() {
    this.ultimoColor = this.colorActual;
    this.colorActual = '#FFFFFF';
  }

  usarLapiz() {
    this.colorActual = this.ultimoColor; 
  }

  rellenarCanvas() {
    const canvas = this.canvasRef.nativeElement;
    if (this.ctx || this.ctx) {
      this.ctx.fillStyle = this.colorActual;
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  /* guardarComoImagen() {
    const canvas = this.canvasRef.nativeElement;

    canvas.toBlob((blob) => {
    if (blob) {
      const file = new File([blob], 'canvas.png', { type: 'image/png' });
      this.dialogRef.close(file); // pasás solo el File
    }
      this.onCloseClick(fakeEvent);
    }, 'image/png');
  } */

  onCloseClick(): void {
    const canvas = this.canvasRef.nativeElement;

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'canvas.png', { type: 'image/png' });
        this.dialogRef.close(file); // pasás solo el File
      }
    }, 'image/png');
  }

  
}
