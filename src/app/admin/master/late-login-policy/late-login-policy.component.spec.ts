import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LateLoginPolicyComponent } from './late-login-policy.component';

describe('LateLoginPolicyComponent', () => {
  let component: LateLoginPolicyComponent;
  let fixture: ComponentFixture<LateLoginPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LateLoginPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LateLoginPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
