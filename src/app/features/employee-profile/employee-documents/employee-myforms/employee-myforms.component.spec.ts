import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMyformsComponent } from './employee-myforms.component';

describe('EmployeeMyformsComponent', () => {
  let component: EmployeeMyformsComponent;
  let fixture: ComponentFixture<EmployeeMyformsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeMyformsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeMyformsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
