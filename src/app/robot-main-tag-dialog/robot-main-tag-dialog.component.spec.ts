import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotMainTagDialogComponent } from './robot-main-tag-dialog.component';

describe('RobotMainTagDialogComponent', () => {
  let component: RobotMainTagDialogComponent;
  let fixture: ComponentFixture<RobotMainTagDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RobotMainTagDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RobotMainTagDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
