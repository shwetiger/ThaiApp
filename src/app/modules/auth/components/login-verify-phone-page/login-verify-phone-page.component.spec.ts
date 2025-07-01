import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginVerifyPhonePageComponent } from './login-verify-phone-page.component';

describe('LoginVerifyPhonePageComponent', () => {
  let component: LoginVerifyPhonePageComponent;
  let fixture: ComponentFixture<LoginVerifyPhonePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginVerifyPhonePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginVerifyPhonePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
