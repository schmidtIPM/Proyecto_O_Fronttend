import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuladorTableroComponent } from './simulador-tablero.component';

describe('SimuladorTableroComponent', () => {
  let component: SimuladorTableroComponent;
  let fixture: ComponentFixture<SimuladorTableroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladorTableroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimuladorTableroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
