import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetLoginDeviceDialogComponent } from './forget-login-device-dialog.component';

describe('ForgetLoginDeviceDialogComponent', () => {
  let component: ForgetLoginDeviceDialogComponent;
  let fixture: ComponentFixture<ForgetLoginDeviceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgetLoginDeviceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgetLoginDeviceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
