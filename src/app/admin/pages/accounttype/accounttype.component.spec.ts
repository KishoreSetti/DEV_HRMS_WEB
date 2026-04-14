import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccounttypeComponent } from './accounttype.component';

describe('AccounttypeComponent', () => {
  let component: AccounttypeComponent;
  let fixture: ComponentFixture<AccounttypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccounttypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccounttypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
