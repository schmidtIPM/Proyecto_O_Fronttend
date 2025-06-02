import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CreadorTableroComponent } from './creador-tablero.component';
import { Accion, Audio, Movimiento, Luz } from '../models';

describe('CreadorTableroComponent', () => {
  let component: CreadorTableroComponent;
  let fixture: ComponentFixture<CreadorTableroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreadorTableroComponent],
      imports: [FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CreadorTableroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería generar un tablero con las filas y columnas especificadas', () => {
    component.filas = 2;
    component.columnas = 3;
    component.generarTablero();
    expect(component.tableroGrid.length).toBe(2);
    expect(component.tableroGrid[0].length).toBe(3);
  });

  it('debería agregar una acción tipo audio a una celda', () => {
    component.filas = 1;
    component.columnas = 1;
    component.generarTablero();

    component.agregarAccion(0, 0, 'audio');
    const acciones = component.tableroGrid[0][0].acciones;

    expect(acciones.length).toBe(1);
    expect(acciones[0]).toBeInstanceOf(Audio);
  });

  it('debería agregar una acción tipo movimiento a una celda', () => {
    component.filas = 1;
    component.columnas = 1;
    component.generarTablero();

    component.agregarAccion(0, 0, 'movimiento');
    const acciones = component.tableroGrid[0][0].acciones;

    expect(acciones.length).toBe(1);
    expect(acciones[0]).toBeInstanceOf(Movimiento);
  });

  it('debería agregar una acción tipo luz a una celda', () => {
    component.filas = 1;
    component.columnas = 1;
    component.generarTablero();

    component.agregarAccion(0, 0, 'luz');
    const acciones = component.tableroGrid[0][0].acciones;

    expect(acciones.length).toBe(1);
    expect(acciones[0]).toBeInstanceOf(Luz);
  });

  it('debería crear un tablero válido con Tags al guardar', () => {
    component.filas = 2;
    component.columnas = 2;
    component.generarTablero();

    component.agregarAccion(0, 0, 'audio');
    component.agregarAccion(1, 1, 'movimiento');

    const tablero = component.guardarTablero();

  });
});
