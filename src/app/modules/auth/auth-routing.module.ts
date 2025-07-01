import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InitialForgotPasswordComponent } from './components/initial-forgot-password/initial-forgot-password.component';
import { FileUploadSuccessComponent } from './components/fileupload-success/fileupload-success.component';
import { CheckingPersonalInfoComponent } from './components/checking-personal-info/checking-personal-info.component';
import { OtpPageComponent } from './components/otp-page/otp-page.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { RegistrationPageComponent } from './components/registration-page/registration-page.component';
import { ForgetPasswordSuccessPageComponent } from './components/forget-password-success-page/forget-password-success-page.component';
import { LoginVerifyPhonePageComponent } from './components/login-verify-phone-page/login-verify-phone-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { RegisterInviteCodeComponent } from './components/register-invite-code/register-invite-code.component';
import { LoginSuccessPageComponent } from './components/login-success-page/login-success-page.component';

const routes: Routes = [
  {
    path: '', component: LoginComponent
  },  
  //forget
  {
    path : 'initial-forgot-password', component: InitialForgotPasswordComponent
  },
  {
    path: 'waiting',component: FileUploadSuccessComponent
  },
  {
    path : 'forgot-password-validation',component: CheckingPersonalInfoComponent
  },
  {
    path: 'otp', component: OtpPageComponent
  },
  {
    path: 'registration', component: RegistrationPageComponent
  },
  {
    path: 'resetPassword', component: PasswordResetComponent
  }, 
  {
    path: 'forget-password-success', component: ForgetPasswordSuccessPageComponent
  },
  {
    path: 'login-verify-phone', component: LoginVerifyPhonePageComponent
  },

  {
    path: 'register', component: RegisterPageComponent
  },  
  {
    path: 'register-invite-code', component: RegisterInviteCodeComponent
  },
  {
    path: 'success', component: LoginSuccessPageComponent
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
