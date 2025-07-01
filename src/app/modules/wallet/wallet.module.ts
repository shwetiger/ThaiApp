import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { WalletPageComponent } from './components/wallet-page/wallet-page.component';
import { WalletRoutingModule } from './wallet-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { CommonService } from 'src/app/shared/service/common.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TopUpComponent } from './components/top-up/top-up.component';
import { TopUpSubmitComponent } from './components/top-up-submit/top-up-submit.component';
import { TopupTranscationWaitingPageComponent } from './components/topup-transcation-waiting-page/topup-transcation-waiting-page.component';
import { TutorialVideoPageComponent } from './components/tutorial-video-page/tutorial-video-page.component';
import { WithdrawComponent } from './components/withdraw/withdraw.component';
import { WithdrawPendingComponent } from './components/withdraw-pending/withdraw-pending.component';
import { WithdrawChangeAccountComponent } from './components/withdraw-change-account/withdraw-change-account.component';
import { GameWalletComponent } from './components/game-wallet/game-wallet.component';
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history.component';
import { GameTransactionHistoryComponent } from './components/game-transaction-history/game-transaction-history.component';
import { TransactionHistoryDetailComponent } from './components/transaction-history-detail/transaction-history-detail.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
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
        //console.info(`Successfully initialized '${langToSet}' language.'`);
      }, err => {
       // console.error(`Problem with '${langToSet}' language initialization.'`);
      }, () => {
        resolve(null);
      });
    });
  });
}
@NgModule({
  declarations: [
    WalletPageComponent,
    TopUpComponent,
    TopUpSubmitComponent,
    TopupTranscationWaitingPageComponent,
    TutorialVideoPageComponent,
    WithdrawComponent,
    WithdrawPendingComponent,
    WithdrawChangeAccountComponent,
    GameWalletComponent,
    TransactionHistoryComponent,
    GameTransactionHistoryComponent,
    TransactionHistoryDetailComponent,
  ],
  imports: [
    ModalModule.forRoot(),
    SharedModule,
    CommonModule,
    WalletRoutingModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: (http:HttpClient) => { return new TranslateHttpLoader(http, './assets/i18n/', '.json');},
          deps: [HttpClient]         
      }
    }),
    NgxSpinnerModule,       
    FormsModule,
    CarouselModule,
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
export class WalletModule { }
