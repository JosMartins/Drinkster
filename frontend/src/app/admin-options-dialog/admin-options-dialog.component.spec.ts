import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOptionsDialogComponent } from './admin-options-dialog.component';

describe('AdminOptionsDialogComponent', () => {
  let component: AdminOptionsDialogComponent;
  let fixture: ComponentFixture<AdminOptionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOptionsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
