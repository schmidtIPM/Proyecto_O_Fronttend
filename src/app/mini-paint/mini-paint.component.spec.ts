import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniPaintComponent } from './mini-paint.component';

  describe('MiniPaintComponent', () => {
  let component: MiniPaintComponent;
  let fixture: ComponentFixture<MiniPaintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniPaintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniPaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
