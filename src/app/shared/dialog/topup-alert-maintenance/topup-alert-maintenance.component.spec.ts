import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopupAlertMaintenanceComponent } from './topup-alert-maintenance.component';

describe('TopupAlertMaintenanceComponent', () => {
  let component: TopupAlertMaintenanceComponent;
  let fixture: ComponentFixture<TopupAlertMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopupAlertMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopupAlertMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
