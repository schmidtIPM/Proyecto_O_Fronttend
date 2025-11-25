import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface RobotDialogData {
  modo: 'crear' | 'actualizar';
}

@Component({
  standalone: true,
  selector: 'app-robot-main-tag-dialog',
  templateUrl: './robot-main-tag-dialog.component.html',
  styleUrls: ['./robot-main-tag-dialog.component.css'],
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class RobotMainTagDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<RobotMainTagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RobotDialogData
  ) {}

  get titulo(): string {
    return this.data.modo === 'actualizar'
      ? 'Tablero actualizado'
      : 'Tablero creado';
  }

  get subtitulo(): string {
    return this.data.modo === 'actualizar'
      ? 'Antes de usar el tablero actualizado, colocá el robot en la main tag del simulador.'
      : 'Antes de usar el nuevo tablero, colocá el robot en la main tag del simulador.';
  }

  aceptar() {
    this.dialogRef.close(true);
  }
}
