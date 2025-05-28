import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisTablerosComponent } from './mis-tableros.component';

describe('MisTablerosComponent', () => {
  let component: MisTablerosComponent;
  let fixture: ComponentFixture<MisTablerosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisTablerosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisTablerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
