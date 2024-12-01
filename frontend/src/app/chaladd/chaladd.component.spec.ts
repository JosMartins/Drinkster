import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChalAddComponent } from './chaladd.component';

describe('ChaladdComponent', () => {
  let component: ChalAddComponent;
  let fixture: ComponentFixture<ChalAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChalAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChalAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
