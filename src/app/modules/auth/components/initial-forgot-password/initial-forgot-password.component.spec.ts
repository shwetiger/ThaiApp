import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialForgotPasswordComponent } from './initial-forgot-password.component';

describe('InitialForgotPasswordComponent', () => {
  let component: InitialForgotPasswordComponent;
  let fixture: ComponentFixture<InitialForgotPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InitialForgotPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InitialForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
