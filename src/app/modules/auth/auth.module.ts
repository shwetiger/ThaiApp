import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login/login.component';
import { CommonService } from 'src/app/shared/service/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { InitialForgotPasswordComponent } from './components/initial-forgot-password/initial-forgot-password.component';
import { FileUploadSuccessComponent } from './components/fileupload-success/fileupload-success.component';
import { CheckingPersonalInfoComponent } from './components/checking-personal-info/checking-personal-info.component';
import {OtpPageComponent } from './components/otp-page/otp-page.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { RegistrationPageComponent } from './components/registration-page/registration-page.component';
import { ForgetPasswordSuccessPageComponent } from './components/forget-password-success-page/forget-password-success-page.component';
import { LoginVerifyPhonePageComponent } from './components/login-verify-phone-page/login-verify-phone-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { RegisterInviteCodeComponent } from './components/register-invite-code/register-invite-code.component';
import { LoginSuccessPageComponent } from './components/login-success-page/login-success-page.component';
import { OtpStateService, OtpCountdownService } from 'src/app/shared/otp/services';

@NgModule({
  declarations: [
    LoginComponent,
    InitialForgotPasswordComponent,
    FileUploadSuccessComponent,
    CheckingPersonalInfoComponent,
    OtpPageComponent,
    PasswordResetComponent,
    RegistrationPageComponent,
    ForgetPasswordSuccessPageComponent,
    LoginVerifyPhonePageComponent,
    RegisterPageComponent,
    RegisterInviteCodeComponent,
    LoginSuccessPageComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule
  ],
  providers: [
    CommonService,
    OtpStateService,
    OtpCountdownService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AuthModule { }
