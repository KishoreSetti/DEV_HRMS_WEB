import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrPayslipComponent } from './hr-payslip.component';

describe('HrPayslipComponent', () => {
  let component: HrPayslipComponent;
  let fixture: ComponentFixture<HrPayslipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HrPayslipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrPayslipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
