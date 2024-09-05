import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChaladdComponent } from './chaladd.component';

describe('ChaladdComponent', () => {
  let component: ChaladdComponent;
  let fixture: ComponentFixture<ChaladdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChaladdComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChaladdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
