import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { GameListComponent } from './components/game-list/game-list.component';
import { GameRoutingModule } from './game-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonService } from 'src/app/shared/service/common.service';
import { GamecategoryComponent } from './components/gamecategory/gamecategory.component';
import { FormsModule } from '@angular/forms';
import { GameWinLosePageComponent } from './components/game-win-lose-page/game-win-lose-page.component';
import { GameWalletComponent } from './components/game-wallet/game-wallet.component';
import { GameDepositSuccessComponent } from './components/game-deposit-success/game-deposit-success.component';
import { GameDepositErrorComponent } from './components/game-deposit-error/game-deposit-error.component';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { CountryBlackListComponent } from './components/country-black-list/country-black-list.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ToastrModule } from 'ngx-toastr';

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
    GameListComponent,
    GamecategoryComponent,
    GameWinLosePageComponent,
    GameWalletComponent,
    GameDepositSuccessComponent,
    GameDepositErrorComponent,    
    CountryBlackListComponent,
  ], 
  
  imports: [
    SharedModule,
    CommonModule,
    GameRoutingModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: (http:HttpClient) => { return new TranslateHttpLoader(http, './assets/i18n/', '.json');},
          deps: [HttpClient]         
      }
    }),
    NgxSpinnerModule, 
    FormsModule, 
    ModalModule,
    CarouselModule,
    ToastrModule.forRoot(),    
  ],
  providers: [
    BsModalService,
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
export class GameModule { }
