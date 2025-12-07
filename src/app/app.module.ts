
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Injector, APP_INITIALIZER } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DatePipe, LOCATION_INITIALIZED } from '@angular/common';

// 路由
import { AppRoutingModule } from './app-routing.module';

// 组件
import { AppComponent } from './app.component';
import { PageNotfoundComponent } from './modules/pages/page-notfound/page-notfound.component';
import { NotiDetailWithoutIdComponent } from './modules/pages/noti-detail-without-id/noti-detail-without-id.component';

// 第三方模块
import { IonicModule } from '@ionic/angular';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ServiceWorkerModule } from '@angular/service-worker';

// 环境配置
import { environment } from '../environments/environment';

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
    // Angular 核心模块（根模块必须）
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    
    // 路由
    AppRoutingModule,
    
    // 全局配置模块（forRoot 只在根模块调用，创建单例服务）
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (http:HttpClient) => { return new TranslateHttpLoader(http, './assets/i18n/', '.json');},
          deps: [HttpClient]         
      }
    }),
    ToastrModule.forRoot(),
    NgxWebstorageModule.forRoot(),
    ModalModule.forRoot(),
    
    // UI 组件库
    IonicModule,
    NgxSpinnerModule,  // NotiDetailWithoutIdComponent 需要
    
    // PWA
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        
  ],
  providers: [
    DatePipe,
    BsModalService,
    BsDropdownConfig,
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

