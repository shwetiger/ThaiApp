
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from "ngx-spinner";
import { LocalStorageService, NgxWebstorageModule } from 'ngx-webstorage';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { SharedModule } from './shared/shared.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CodeInputModule } from 'angular-code-input';
import { AlertModule, AlertConfig } from 'ngx-bootstrap/alert';
import { ModalDialogModule } from 'ngx-modal-dialog';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { BsDropdownModule,BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { Injector, APP_INITIALIZER } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LOCATION_INITIALIZED } from '@angular/common';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { CommonService } from './shared/service/common.service';
import { PageNotfoundComponent } from './modules/pages/page-notfound/page-notfound.component';
import { NotiDetailWithoutIdComponent }from './modules/pages/noti-detail-without-id/noti-detail-without-id.component';
import { ZawgyiDetectorModule } from '@myanmartools/ng-zawgyi-detector';
import { AngularFireModule } from "@angular/fire";
import { firebase } from '../environments/firebase';
import { FacebookModule } from 'ngx-facebook';
import { AppSplashScreenAdsComponent } from './shared/components/app-splash-screen-ads/app-splash-screen-ads.component';

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
    AppComponent,
    NotiDetailWithoutIdComponent,
    PageNotfoundComponent
  ],
  imports: [     
    CommonModule,   
    TimepickerModule.forRoot(),
    BsDropdownModule,
    ModalModule.forRoot(),
    AlertModule,
    ModalDialogModule,
    CodeInputModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (http:HttpClient) => { return new TranslateHttpLoader(http, './assets/i18n/', '.json');},
          deps: [HttpClient]         
      }
    }),
    CarouselModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgxSpinnerModule,
    HttpClientModule,
    NgxWebstorageModule.forRoot(),
    IonicModule,
    NgxSpinnerModule,
    BsDatepickerModule.forRoot(),
    SharedModule,
    ZawgyiDetectorModule,
    AngularFireModule.initializeApp(firebase.firebaseConfig),
    FacebookModule.forRoot()
  ],
  providers: [
    DatePipe,
    AlertConfig,
    BsModalService,
    BsDropdownConfig,
    CommonService,
    BsDatepickerConfig,
   {
    provide: APP_INITIALIZER,
    useFactory: appInitializerFactory,
    deps: [TranslateService, Injector],
    multi: true
  }
  ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }

