import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { ThreedRoutingModule } from './threed-routing.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { CommonService } from 'src/app/shared/service/common.service';
import { ThreedInitialPageComponent } from './components/threed-initial-page/threed-initial-page.component';
import { ThreedBetComponent } from './components/threed-bet/threed-bet.component';
import { ThreedchancePageComponent } from './components/threedchance-page/threedchance-page.component';
import { Quickselect3dComponent } from './components/quickselect3d/quickselect3d.component';
import { DreamBookPageComponent } from './components/dream-book-page/dream-book-page.component';
import { ThreedBetFinalConfirmPageComponent } from './components/threed-bet-final-confirm-page/threed-bet-final-confirm-page.component';
import { ThreedBetConfirmPageComponent } from './components/threed-bet-confirm-page/threed-bet-confirm-page.component';
import { BetHistoryPageComponent } from '../pages/bet-history-page/bet-history-page.component';
import { BetHistoryDetailPageComponent } from '../pages/bet-history-detail-page/bet-history-detail-page.component';
import { TwoDThreeDWinnerComponent } from '../pages/two-dthree-dwinner/two-dthree-dwinner.component';

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
    ThreedInitialPageComponent,
    ThreedBetComponent,
    ThreedchancePageComponent,
    Quickselect3dComponent,
    DreamBookPageComponent,
    ThreedBetFinalConfirmPageComponent,
    ThreedBetConfirmPageComponent,
  ],
  imports: [
    CommonModule,
    ThreedRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: (http:HttpClient) => { return new TranslateHttpLoader(http, './assets/i18n/', '.json');},
          deps: [HttpClient]         
      }
    }),
    NgxSpinnerModule,   
    ModalModule,
    FormsModule,
  ],
  providers: [
    BsModalService,
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
export class ThreedModule { }
