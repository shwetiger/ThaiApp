import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginDeviceDialogComponent } from './login-device-dialog.component';

describe('LoginDeviceDialogComponent', () => {
  let component: LoginDeviceDialogComponent;
  let fixture: ComponentFixture<LoginDeviceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginDeviceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginDeviceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
