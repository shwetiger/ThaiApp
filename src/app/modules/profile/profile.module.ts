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


export function appInitializerFactory(translate: TranslateService, injector: Injector,) {
  return () => new Promise<any>((resolve: any) => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {
      let lang=localStorage.getItem('ngx-webstorage|locallanguage');
      let langToSet;
      if(lang == null){
        langToSet = 'my';
      }
      else{
        langToSet=lang.toString().replace(/['"]+/g, '')
      }    
      translate.setDefaultLang(langToSet);
      translate.use(langToSet).subscribe(() => {
      }, err => {
      }, () => {
        resolve(null);
      });
    });
  });
}
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
    FormsModule, 
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: (http:HttpClient) => { return new TranslateHttpLoader(http, './assets/i18n/', '.json');},
          deps: [HttpClient]         
      }
    }),
    ModalModule.forRoot(),
    NgxSpinnerModule,
    ReactiveFormsModule,
    CodeInputModule,
  ],
  providers: [
    CommonService,   
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true
    }
    
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ProfileModule { }
