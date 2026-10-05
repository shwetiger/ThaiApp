import { Component, OnInit, ViewChild, ChangeDetectorRef,NgZone  } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocationStrategy } from '@angular/common';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { AccountLoginComponent } from 'src/app/shared/components/account-login/account-login.component';
import { AppVersionService } from 'src/app/shared/service/app-version.service';
declare var window: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild(AccountLoginComponent) child: AccountLoginComponent;
  gameProviderList: any;
  localgameProviderList: any;
  notiCount: any;
  deviceId: any;
  loading: any;
  fcmToken: any;
  token: any;
  browserVersion: any;
  fcmtokenCheck: any;
  isUserLogin: boolean = false;
  smsprovider: any;
  maintenance: any;
  isWebview: any;
  deviceId1: any;
  version: string | null = null;
  tg: any;
  isTelegramLoggingIn = false;
  isAppReady = false;
  private telegramLoginStarted = false;
 // private homeInitialized = false;

  constructor(
    public handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private Location: LocationStrategy, private route: ActivatedRoute,
    private translateService: TranslateService,
    private router: Router,
    private dto: DtoService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private storage: LocalStorageService,
    private funct: FunctService,
    private cdr: ChangeDetectorRef,
    private versionService: AppVersionService,
    private ngZone: NgZone,) {
    // this.deviceId = this.route.snapshot.paramMap.get("deviceId");
    this.fcmToken = this.route.snapshot.paramMap.get("fcmToken");
    var isWebviewUser = require('is-ua-webview');
    this.isWebview = isWebviewUser(navigator.userAgent);
    if (this.fcmToken != null) {
      this.storage.store('localFcmtoken', this.fcmToken);
    }
    this.isUserLogin = this.storage.retrieve('isUserLoggedIn');
  }

  private isTelegramWebApp(): boolean {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      return false;
    }

    return !!webApp.platform;
  }

  async ngOnInit(): Promise<void> {
    this.storage.clear('notgetBal');
     await this.checkTelegramLogin();
      this.initializeHomeData();
      this.isAppReady = true;
    // if (this.homeInitialized) {
    //   return;
    // }
    // this.homeInitialized = true;

  //   try {
  //     const state = history.state;
  //     if (state.navigationId == 1) {
  //       const userAgent = navigator.userAgent;
  //       if (userAgent.includes("Telegram")) {
  //         const initData = await this.waitForTelegramInitData();
  //         if (initData) {
  //           await this.telegramLogin(initData);
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     console.error('Telegram initialization error', err);
  //   } finally {
  //     this.initializeHomeData();
  //     this.isAppReady = true;
  //   }
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async waitForTelegramInitData(
    maxRetries = 15,
    delayMs = 750
  ): Promise<any> {

    for (let i = 0; i < maxRetries; i++) {
      const initData = this.getTelegramInitData();
      if (initData) {
        return initData;
      }

      await this.wait(delayMs);
    }

    throw new Error('Telegram init data is not available');
  }

  initializeHomeData() {
    this.versionService.currentVersion$.subscribe(v => {
      this.version = v;
    });

    this.storage.clear('fishingmaintenance');
    this.storage.clear('localCloseGameBalance');

    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");

    const lan = this.storage.retrieve('localLanguage');

    this.deviceId1 = this.isWebview ? 'mobile' : 'chrome';

    this.clearLocationHistory();

    if (!lan) {
      this.storage.store('localLanguage', "my");
    }

    this.storage.store("localDeviceId", this.deviceId);

    this.getGameProviderList();

    this.notiCount = this.storage.retrieve("localNotiCount");

    this.isUserLogin = this.storage.retrieve('isUserLoggedIn');
    if (this.isUserLogin) {
      this.updateUsedTime();
      this.updateFCMtoken();
      this.getAllNoti();
    }
    this.storage.clear('localadsList');
    this.storage.clear('localmarqueeText');
    this.storage.clear("localNotiList");

    this.closeMaintenance();
  }


  // async telegramLogin(initData: string): Promise<void> {
  //   this.storage.clear("token");
  //   if (this.telegramLoginStarted) {
  //     return;
  //   }

  //   if (this.storage.retrieve('token')) {
  //     this.isUserLogin = true;
  //     return;
  //   }

  //   this.telegramLoginStarted = true;

  //   this.common.submitLoading = true;
  //   this.spinner.show("submitLoading");

  //   try {

  //     const res: any = await this.http.post(
  //       this.funct.ipaddress + "tg/webappLogin",
  //       { initData: initData }
  //     ).toPromise();

  //     if (res && res.token) {
  //       this.storage.store("token", res.token);
  //       this.storage.store("isUserLoggedIn", true);
  //       this.token = res.token;
  //       this.isUserLogin = true;

  //     }

  //   } catch (err) {

  //     console.error(err);

  //   } finally {

  //     this.spinner.hide("submitLoading");
  //     this.common.submitLoading = false;

  //     this.telegramLoginStarted = false;
  //   }
  // }

  async telegramLogin(): Promise<boolean> {

  const tg = (window as any).Telegram?.WebApp;

  if (!tg?.initDataUnsafe?.user) {
    return false;
  }

  tg.ready();
  const user = tg.initDataUnsafe.user;

  const telegramLoginModel = {

    initData: tg.initData,

    telegram_id: user.id,

    username: user.username || '',

    first_name: user.first_name||  '',

    app_version: 'tg_bot'
  };

  this.spinner.show('refreshLoading');
  return new Promise<boolean>((resolve, reject) => {

    this.http.post(
      this.funct.ipaddress + 'tg/webappLogin',
      telegramLoginModel
    ).subscribe({

      next: async (result: any) => {

        this.spinner.hide('refreshLoading');

        console.log(
          'Telegram login response:',
          result
        );

        if (
          result &&
          result.status !== 'Error' &&
          result.token
        ) {

          this.token ='Bearer ' + result.token;
          this.isUserLogin = true;
          try {
            await this.ngZone.run(async () => {
              this.isUserLogin = true;
              this.spinner.hide('refreshLoading');
              this.common.refreshLoading=false;

             await this.storage.store("token",this.token);

              await this.storage.store(
                'isUserLoggedIn',
                true
              );

              await this.storage.store(
                'telegram_id',
                String(user.id)
              );

              this.cdr.detectChanges();
            });
            resolve(true);

          } catch (error) {

            console.error(
              'Telegram storage error:',
              error
            );

            resolve(false);
          }

        } else {

          console.log(
            'Telegram login failed'
          );

          resolve(false);
        }
      },

      error: (error) => {

        this.spinner.hide('refreshLoading');

        console.error(
          'Telegram login API error:',
          error
        );

        reject(error);
      }
    });
  });
}


  async checkTelegramLogin(): Promise<boolean> {

  const tg = (window as any).Telegram?.WebApp;

  if (!tg) {
    console.log('Telegram WebApp not found');
    return false;
  }

  tg.ready();

  const user = tg.initDataUnsafe?.user;

  if (!user) {
    console.log('Telegram user not found');
    return false;
  }

  const currentTelegramId = String(user.id);

  console.log(
    'Telegram user:',
    currentTelegramId
  );

  try {
    const loginSuccess = await this.telegramLogin();
    if (loginSuccess) {

      this.isUserLogin = true;

      await this.storage.store(
        'isUserLoggedIn',
        true
      );

      await this.storage.store(
        'telegram_id',
        currentTelegramId
      );

      this.cdr.detectChanges();

      return true;
    }

    this.isUserLogin = false;

    return false;

  } catch (error) {

    console.error(
      'checkTelegramLogin error:',
      error
    );

    this.isUserLogin = false;
    return false;
  }
}

  private getTelegramInitData(): string | null {
    const telegram = (window as any).Telegram;

    if (!telegram?.WebApp) {
      return null;
    }

    const initData = telegram.WebApp.initData;

    if (!initData) {
      return null;
    }

    return initData;
  }
  finishTelegramLogin() {

    this.common.submitLoading = false;

    this.spinner.hide("submitLoading");

    this.isTelegramLoggingIn = false;
  }


  getAllNoti() {
    let userlogin = this.storage.retrieve('isUserLoggedIn');
    if (userlogin) {
      this.token = this.storage.retrieve('token');
      let headers = new HttpHeaders();
      headers = headers.set('Authorization', this.token);
      this.http.get(this.funct.ipaddress + 'notification/GetNotificationList', { headers: headers })
        .pipe(
          catchError(this.handleErrorMessage.handleError.bind(this, ''))
        )
        .subscribe(
          async result => {
            this.common.refreshLoading = false;
            this.spinner.hide("refreshLoading");
            this.dto.Response = result;
            if (this.dto.Response.length > 0) {
              this.storage.store('localNotiList', this.dto.Response);
              var newcount = 0;
              this.dto.Response.forEach(e => {
                if (e.status == 0) {
                  newcount++;
                }
              });
              this.storage.store('localNewNotiCount', newcount);
              this.notiCount = this.storage.retrieve('localNewNotiCount');
            }
          }
        );
    }
  }

  closeMaintenance() {
    this.http.get(this.funct.ipaddress + 'gameProvider/closeMaintenance')
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
        });
  }

  createSKMGameMember() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.post(this.funct.ipaddress + 'shkm/SKMRegister', null, { headers: headers })
      .pipe
      (
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
        }
      );
  }

  handleError(error: HttpErrorResponse) {
    this.spinner.hide('loadingSubmiting');
    this.spinner.hide("refreshLoading");
    if (error.status == 0) {
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 423) {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      this.storage.clear('token');
      this.storage.clear('isUserLoggedIn');
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    if (error.status == 400) {
      this.toastr.error("Invalid parameters.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }

    if (error.status == 404) {
      this.toastr.error("", this.translateService.instant("incorrectPassword"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 406) {
      this.router.navigate(['/game/deposit-error', '406'], { replaceUrl: true });
      return;
    }
    if (error.status == 700) {
      this.router.navigate(['/game/deposit-error', '700'], { replaceUrl: true });
      return;
    }
    this.toastr.error("", error.status.toString(), {
      timeOut: 3000,
      positionClass: 'toast-top-center',
    });
    return;
  }


  goToNotiList() {
    this.router.navigate(['/noti-list'], { replaceUrl: false });
  }

  getGameProviderList() {
    let headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'gameProvider/getGameProviderList', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = result;
          this.gameProviderList = this.dto.Response;
          this.storage.store('localgameProviderList', this.gameProviderList);
        }
      );
  }

  changeLanguageTitle(data: any) {
    let language = this.storage.retrieve('localLanguage');
    if (language == "my") {
      return data.name_my != null ? data.name_my : data.name_en;
    } else if (language == "th") {
      return data.name_th != null ? data.name_th : data.name_en;
    } else if (language == "zh") {
      return data.name_zh != null ? data.name_zh : data.name_en;
    } else {
      return data.name_en;
    }
  }

  twodPage() {
    if (!this.isUserLogin) {
      this.getLogin();
      return;
    }
    this.storage.clear('localSectionId');
    this.storage.clear('localSectionName');
    this.storage.clear('localSection');
    this.storage.clear("localCloseWeekend");
    this.storage.clear("localCloseHoliday");
    this.router.navigate(['/twod'], { replaceUrl: false });
  }

  threedPage() {
    if (!this.isUserLogin) {
      this.getLogin();
      return;
    }
    this.router.navigate(['/threed'], { replaceUrl: false });
  }

  downloadPage() {
    this.router.navigate(['/download'], { replaceUrl: false });
  }

  refreshPage() {
    this.ngOnInit();
    // window.location.reload();
    this.child.getUserProfile();
    setTimeout(() => {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 1000);
  }

  goToGame(id, categoryname, maintenance) {
    this.isUserLogin = this.storage.retrieve('isUserLoggedIn');
    if (!this.isUserLogin) {
      this.getLogin();
      return;
    }
    this.storage.clear('localGameProviderId');
    this.storage.clear('localGameCatName');
    this.storage.clear("localGameCatId");
    this.storage.clear('localProviderType');
    this.storage.clear('localProviderId');
    if (categoryname == "Fishing") {
      this.storage.clear("localGamePlayProviderId");
      if (maintenance == true) {
        this.storage.store('localGameProviderId', [8, 2]);
        this.storage.store('fishingmaintenance', maintenance)
      }
      else {
        this.storage.store('localGameProviderId', [8, 2]);
      }
      this.router.navigate(['/game/gamecategory', id], { state: { catId: id, catName: categoryname, gameProviderId: id }, replaceUrl: false });
    } else {
      this.storage.clear("localGameCatId");
      this.storage.store('localGameProviderId', [id]);
      this.router.navigate(['/game/gameList', id], { state: { catName: categoryname }, replaceUrl: false });
    }
  }

  updateFCMtoken() {
    var token = this.storage.retrieve('localFcmtoken');
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    var newToken = {
      fcmtoken: token
    }
    this.http.post(this.funct.ipaddress + 'user/updateFcmtoken', newToken, { headers: headers })
      .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = result;
          this.fcmtokenCheck = this.dto.Response;
        }
      );
  }

  updateUsedTime() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'Authenticate/updateUsedTime', { headers: headers })
      .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = result;
        }
      );
  }

  getLogin() {
    if (!this.isUserLogin) {
      this.router.navigate(['login'], { replaceUrl: false });
    }
  }

  clearLocationHistory() {
    if (window.history && window.history.pushState) {
      window.history.replaceState({}, document.title, window.location.href);
    }
  }

}
