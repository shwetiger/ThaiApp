import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { NavigationService } from './service/navigation.service';
import { DtoService } from './service/dto.service';
import { UtilService } from './service/util.service';
import { FunctService } from './service/funct.service';
import { CommonService } from './service/common.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoginDeviceDialogComponent } from './dialog/login-device-dialog/login-device-dialog.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AccountLoginComponent } from './components/account-login/account-login.component';
import { AppNavigationBarComponent} from './components/navigation-bar/navigation.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { LogoutComponent } from './components/logout/logout.component';
import { NotRefreshAppbarComponent } from './components/not-refresh-appbar/not-refresh-appbar.component';
import { AdsSliderComponent } from './components/ads-slider/ads-slider.component';
import { AppPhonePickerComponent } from './components/app-phone-picker/app-phone-picker.component';
import { LanguagePageComponent } from './components/language-page/language-page.component';
import { AppbarComponent } from './components/appbar/appbar.component';
import { BetSectionDialogComponent } from './dialog/bet-section-dialog/bet-section-dialog.component';
import { ThreedCloseTimeComponent } from './components/threed-close-time/threed-close-time.component';
import { ThreedResultComponent } from './components/threed-result/threed-result.component';
import { TimeAgoExtendsPipePipe, SafeUrlPipe, FormatTimePipe, ThreedFormatTimePipe, ListPipe} from './pipes/common.pipe';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { BsDropdownConfig, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CodeInputModule } from 'angular-code-input';
import { TwodCloseTimeComponent } from './components/twod-close-time/twod-close-time.component';
import { TwodLiveComponent } from './components/twod-live/twod-live.component';
import { ForgetLoginDeviceDialogComponent } from './dialog/forget-login-device-dialog/forget-login-device-dialog.component';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { TwodResultPageComponent } from './components/twod-result-page/twod-result-page.component';
import { WalletAccountPageComponent } from './components/wallet-account-page/wallet-account-page.component';
import { ModalDialogModule } from 'ngx-modal-dialog';
import { TopupAlertMaintenanceComponent } from './dialog/topup-alert-maintenance/topup-alert-maintenance.component';
import { NotAppbarComponent } from './components/not-appbar/not-appbar.component';
import { GameWalletInOutComponent } from './dialog/game-wallet-in-out/game-wallet-in-out.component';
import { GameAccountLoginComponent } from './components/game-account-login/game-account-login.component';
import { GameShowFreePlayComponent } from './dialog/game-show-free-play/game-show-free-play.component';
import { GameOpenChromeComponent } from './dialog/game-open-chrome/game-open-chrome.component';
import { GameCategoryTransferComponent } from './dialog/game-category-transfer/game-category-transfer.component';
import { GameCategoryMaintenanceComponent }  from './dialog/game-category-maintenance/game-category-maintenance.component';
import { GameListTransferComponent } from './dialog/game-list-transfer/game-list-transfer.component';
import { GameWinLoseComponent } from './dialog/game-win-lose/game-win-lose.component';
import { SportDialogComponent } from './dialog/sport-dialog/sport-dialog.component';
import { MaintenanceTimeComponent } from './components/maintenance-time/maintenance-time.component';
import { GameWebMobileViewComponent } from './dialog/game-web-mobile-view/game-web-mobile-view.component';
import { QrViewDialogComponent } from './dialog/qr-view-dialog/qr-view-dialog.component';
import { AppSplashScreenAdsComponent } from './components/app-splash-screen-ads/app-splash-screen-ads.component';
import { BetSectionColsedComponent } from './dialog/bet-section-colsed/bet-section-colsed.component';

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
  exports: [
    AppNavigationBarComponent,
    AccountLoginComponent,
    LoginDeviceDialogComponent,
    PageHeaderComponent,
    LogoutComponent,
    NotRefreshAppbarComponent,
    AdsSliderComponent,
    AppPhonePickerComponent,
    LanguagePageComponent,
    AppbarComponent,
    TwodCloseTimeComponent,
    TwodLiveComponent,
    ForgetLoginDeviceDialogComponent,
    BetSectionDialogComponent,
    ThreedCloseTimeComponent,
    ThreedResultComponent,
    TwodResultPageComponent,
    WalletAccountPageComponent,
    TopupAlertMaintenanceComponent,
    NotAppbarComponent,
    GameWalletInOutComponent,
    GameAccountLoginComponent,
    GameShowFreePlayComponent,
    GameOpenChromeComponent,
    GameCategoryTransferComponent,
    GameCategoryMaintenanceComponent,
    GameListTransferComponent,
    GameWinLoseComponent,
    SportDialogComponent,

    MaintenanceTimeComponent,
    AppSplashScreenAdsComponent,

    TimeAgoExtendsPipePipe,
    FormatTimePipe,
    ThreedFormatTimePipe,
    SafeUrlPipe,
    ListPipe

  ],
  declarations: [
    AppNavigationBarComponent,
    AccountLoginComponent,
    LoginDeviceDialogComponent,
    PageHeaderComponent,
    LogoutComponent,
    NotRefreshAppbarComponent,
    AdsSliderComponent,
    AppPhonePickerComponent,
    LanguagePageComponent,
    AppbarComponent,
    TwodCloseTimeComponent,
    TwodLiveComponent,
    ForgetLoginDeviceDialogComponent,
    BetSectionDialogComponent,
    ThreedCloseTimeComponent,
    ThreedResultComponent,
    TwodResultPageComponent,
    WalletAccountPageComponent,
    TopupAlertMaintenanceComponent,
    NotAppbarComponent,
    GameWalletInOutComponent,
    GameAccountLoginComponent,
    GameShowFreePlayComponent,
    GameOpenChromeComponent,
    GameCategoryTransferComponent,
    GameCategoryMaintenanceComponent,
    GameListTransferComponent,
    GameWinLoseComponent,
    SportDialogComponent,
    TimeAgoExtendsPipePipe,
    FormatTimePipe,
    ThreedFormatTimePipe,
    SafeUrlPipe,
    MaintenanceTimeComponent,
    ListPipe,
    GameWebMobileViewComponent,
    QrViewDialogComponent,
    AppSplashScreenAdsComponent,
    BetSectionColsedComponent,
  ],
  imports: [
    ModalModule.forRoot(),
    ModalDialogModule,
    FormsModule,
    CommonModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: (http:HttpClient) => { return new TranslateHttpLoader(http, './assets/i18n/', '.json');},
          deps: [HttpClient]
      }
    }),
    CarouselModule,
    NgxSpinnerModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    NgxWebstorageModule.forRoot(),
    BsDropdownModule,
    CodeInputModule,
    ModalModule,
    CommonModule,

  ],
  providers: [
    NavigationService,
    DtoService,
    UtilService,
    FunctService,
    CommonService,
    BsDropdownConfig,
    BsModalService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true
    }
  ],

})
export class SharedModule { }
