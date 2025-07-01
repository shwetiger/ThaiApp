import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceTimeComponent } from './maintenance-time.component';

describe('MaintenanceTimeComponent', () => {
  let component: MaintenanceTimeComponent;
  let fixture: ComponentFixture<MaintenanceTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintenanceTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
