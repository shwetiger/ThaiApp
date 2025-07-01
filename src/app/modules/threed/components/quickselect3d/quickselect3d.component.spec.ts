import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Quickselect3dComponent } from './quickselect3d.component';

describe('Quickselect3dComponent', () => {
  let component: Quickselect3dComponent;
  let fixture: ComponentFixture<Quickselect3dComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Quickselect3dComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Quickselect3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
