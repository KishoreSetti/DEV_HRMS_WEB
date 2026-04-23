import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisatypeComponent } from './visatype.component';

describe('VisatypeComponent', () => {
  let component: VisatypeComponent;
  let fixture: ComponentFixture<VisatypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisatypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisatypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
