import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { CodeInputModule } from 'angular-code-input';
import { ProfileRoutingModule } from './profile-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonService } from 'src/app/shared/service/common.service';
import { ProfileComponent } from './components/profile/profile.component';
import { FeedbackPageComponent } from './components/feedback-page/feedback-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { InviteCodeComponent } from './components/invite-code/invite-code.component';
import { WithdrawMyAccontComponent } from  './components/withdraw-my-accont/withdraw-my-accont.component';
import { ResultComponent } from '../pages/result/result.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ProfileEditPageComponent } from './components/profile-edit-page/profile-edit-page.component';
import { UserGuideComponent } from './components/user-guide/user-guide.component';
import { DefaultOptSettingComponent } from './components/default-opt-setting/default-opt-setting.component';
import { EmailAddressComponent } from './components/email-address/email-address.component';
import { EmailOtpConfirmComponent } from './components/email-otp-confirm/email-otp-confirm.component';
import { PointsHistoryComponent } from './components/points-history/points-history.component';

@NgModule({
  declarations: [ 
    ProfileComponent, 
    FeedbackPageComponent,
    InviteCodeComponent,
    WithdrawMyAccontComponent,
    ResultComponent,
    ChangePasswordComponent,
    ProfileEditPageComponent,
    UserGuideComponent,
    DefaultOptSettingComponent,
    EmailAddressComponent,
    EmailOtpConfirmComponent,
    PointsHistoryComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  providers: [
    CommonService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ProfileModule { }
