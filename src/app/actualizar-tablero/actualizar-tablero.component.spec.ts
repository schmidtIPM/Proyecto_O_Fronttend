import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarTableroComponent } from './actualizar-tablero.component';

describe('ActualizarTableroComponent', () => {
  let component: ActualizarTableroComponent;
  let fixture: ComponentFixture<ActualizarTableroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarTableroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualizarTableroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
