import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeofstudyComponent } from './modeofstudy.component';

describe('ModeofstudyComponent', () => {
  let component: ModeofstudyComponent;
  let fixture: ComponentFixture<ModeofstudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModeofstudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModeofstudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
