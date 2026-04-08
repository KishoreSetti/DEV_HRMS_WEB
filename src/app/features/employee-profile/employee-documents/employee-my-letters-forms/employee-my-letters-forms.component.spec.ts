import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMyLettersFormsComponent } from './employee-my-letters-forms.component';

describe('EmployeeMyLettersFormsComponent', () => {
  let component: EmployeeMyLettersFormsComponent;
  let fixture: ComponentFixture<EmployeeMyLettersFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeMyLettersFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeMyLettersFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
