import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAssetScreenComponent } from './assign-asset-screen.component';

describe('AssignAssetScreenComponent', () => {
  let component: AssignAssetScreenComponent;
  let fixture: ComponentFixture<AssignAssetScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignAssetScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignAssetScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
