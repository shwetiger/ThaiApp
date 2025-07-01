import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailOtpConfirmComponent } from './email-otp-confirm.component';

describe('EmailOtpConfirmComponent', () => {
  let component: EmailOtpConfirmComponent;
  let fixture: ComponentFixture<EmailOtpConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailOtpConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailOtpConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
