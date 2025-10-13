import { Component, HostListener, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { ModalDialogService } from 'ngx-modal-dialog';
import { LocationStrategy } from '@angular/common';
declare var $: any;
import isUAWebview from "is-ua-webview";
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { GameOpenChromeComponent } from 'src/app/shared/dialog/game-open-chrome/game-open-chrome.component';
import { GameCategoryMaintenanceComponent } from 'src/app/shared/dialog/game-category-maintenance/game-category-maintenance.component';
import { SportDialogComponent } from 'src/app/shared/dialog/sport-dialog/sport-dialog.component';
import { GameWinLoseComponent } from 'src/app/shared/dialog/game-win-lose/game-win-lose.component';
import { GameAccountLoginComponent } from 'src/app/shared/components/game-account-login/game-account-login.component';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { GameWebMobileViewComponent } from 'src/app/shared/dialog/game-web-mobile-view/game-web-mobile-view.component';
import { GameWalletInOutComponent } from 'src/app/shared/dialog/game-wallet-in-out/game-wallet-in-out.component';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})

export class GameListComponent implements OnInit, OnDestroy {

  @ViewChild(GameAccountLoginComponent) child: GameAccountLoginComponent;
  @ViewChild('searchInput') searchInput!: ElementRef;
  providerId: any;
  gameList: any;
  gameItems = [];
  adsList: any;
  marqueeText: any;
  iplookupKey: any;
  qmBlackList = [];
  countryCodeObj: any;
  countryCode: '';
  qmModel: any;
  qmListModel: any;
  localBlackList: [];
  gameAlertObject: any;
  isBlackListCountry: boolean;
  modalId: any;
  gameCode: any;
  providerCode: any;
  launchDameModel: any;
  skmGameModel: any;
  launchGameResModel: any;
  launchGameModel: any;
  gameType: any;
  gameOption: any;
  token: any;
  topupBalanceModalId: any;
  userProfileBalance: any;
  gameUserBalance: any;
  gameProviderList: any;
  providerName: any;
  bsModalRef: BsModalRef;
  transferAlert: BsModalRef;
  playFreeOrPlay: BsModalRef;
  maintenanceAlert: BsModalRef; language: any;
  isWebview1: any;
  deviceId1: any;
  GameBalanceResponse;
  data: any;
  timeLeft: number | null = null;

  @ViewChild('maintenanceAlert', { static: false })
  templatemaintenanceAlert: TemplateRef<any>;
  config = {
    animated: true
  };
  isAlert: boolean;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    items: 1,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplaySpeed: 2000,
    navSpeed: 100,
    autoHeight: true,
    navText: ['', ''],
    responsive: {
      400: {
        items: 1
      },
    },
  }
  searchKey: any;
  isUserLoggedIn = false;
  blackList: any = false;
  deviceId: any;
  closeGameBalance: any;
  checkWindow = false;
  fbAuthWindow: any;
  isClose = false;
  granParent: any;
  gameLink: string;
  parentLink: any;
  isWebview: boolean;
  openUrl: string;
  gameProviderId: any;
  gameName: any;
  launchTagName: any;
  isChrome: boolean;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private renderer: Renderer2,
    private Location: LocationStrategy,
    private modalService1: ModalDialogService,
    private viewRef: ViewContainerRef,
    private translateService: TranslateService,
    private modalService: BsModalService,
    private storage: LocalStorageService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private http: HttpClient,
    private dto: DtoService,
    private router: Router,
    private route: ActivatedRoute,
    private funct: FunctService) {
    var isWebviewUser = require('is-ua-webview');
    this.isWebview1 = isWebviewUser(navigator.userAgent);
    this.isChrome = /Chrome/.test(navigator.userAgent)
    this.isWebview = isUAWebview(navigator.userAgent); //navigator.userAgent     
    this.blackList = history.state.blackList;
    this.deviceId = this.storage.retrieve('localDeviceId');
    this.providerId = this.route.snapshot.paramMap.get("providerId");
    if (navigator.userAgent.indexOf("Mi") != -1 && this.isWebview) {
      this.openUrl = "";
    }
    if (this.deviceId != null || this.isWebview) {
      this.openUrl = "?openinnewtap=1";
    }
    else {
      this.openUrl = "";
    }
  }

  ngOnInit(): void {
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.storage.clear('localGamePlayProviderId');
    this.providerId = this.route.snapshot.paramMap.get("providerId");
    if (this.isWebview1) {
      this.deviceId1 = "mobile";
    }
    else {
      this.deviceId1 = '';
    }
    this.language = this.storage.retrieve('localLanguage');
    this.isUserLoggedIn = this.storage.retrieve('isUserLoggedIn');
    this.closeGameBalance = this.storage.retrieve('localCloseGameBalance');
    if (this.closeGameBalance != 0 && this.closeGameBalance != undefined && this.closeGameBalance != null) {
      this.storage.clear('localCloseGameBalance');
      this.gameWinLoseDialog(this.closeGameBalance, this.providerId);
    }
    this.deviceId = this.storage.retrieve('localDeviceId');
    this.storage.store('localproviderId', this.providerId);
    this.getGameUserBalance();
    this.getAdsList();
    this.getMarqueeText();
    this.getGameList();
    this.getGameAlert();
    this.createGSGameMember();
    this.createSKMGameMember();
    this.data = {
      display_name: '',
      providerId: ''
    }
    if (!this.blackList) {
      this.getBlackListCountry();
    }

    this.qmModel =
    {
      "id": 0,
      "countryName": "",
      "countryName_mm": "",
      "countryName_zh": "",
      "countryName_th": "",
      "countryCode2Digit": "",
      "countryCode3Digit": "",
      "currentipAddress": "",
      "currentLocation": "",
      "currentLocation_mm": "",
      "currentLocation_th": "",
      "currentLocation_zh": "",
      "currentCountryCode": ""
    };
    this.qmListModel = {
      "qmBlackList": [],
      "currentLocation": "",
      "requestCountryCode": "",
      "requestIpAddress": "",
      "ipLookupKey": ""
    }
    this.launchDameModel = {
      "gcode": "string",
      "gpcode": "string",
      "lang": "string"
    }
    this.skmGameModel = {
      "lang": "string"
    }
    this.launchGameModel = {
      "gameId": "string",
      "lang": "string",
      "providerCode": "string",
      "type": "string"
    }
    this.gameProviderList = this.storage.retrieve('localgameProviderList');
    this.getGameCalculate();
  }

  ngOnDestroy(): void {
    this.storage.clear('localgameAlertText');
  }

  AutoGameListLaunch() {
    var data = this.storage.retrieve("localListGameLaunch");
    var view = this.storage.retrieve("view");
    if (view == 'mobileview') {
      if (data != null && data != undefined) {
        this.storage.clear("localListGameLaunch");
        this.storage.clear('view');
        this.playAutoGameListLaunchformobileview(data);
      }
    }
    else {
      if (data != null && data != undefined) {
        this.storage.clear("localListGameLaunch");
        this.storage.clear('view');
        this.playAutoGameListLaunch(data);
      }
    }
  }

  playAutoGameListLaunch(launchGameModel) {
    this.gameOption = this.storage.retrieve('localGameOption');
    this.common.gameLoading = true;
    this.spinner.show("gameLoading");
    let params = new HttpParams();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    params = params.set('providerId', this.providerId);
    this.getUserProfile();
    this.http.get(this.funct.ipaddress + 'loginGS/getBalance', { params: params, headers: headers })
      .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          if (this.dto.Response.balance < 1000) {
            return;
          }
          else {
            let headers = new HttpHeaders();
            this.token = this.storage.retrieve('token');
            headers = headers.set('Authorization', this.token);
            if (this.gameOption == true) {
              this.storage.clear('localGameOption');
              this.common.gameLoading = false;
              this.spinner.hide("gameLoading");
              if (this.deviceId1 == 'mobile') {
                this.showOpenChromeDialog(launchGameModel, this.providerId);
              }
              else {
                this.storage.store('localCloseGameBalance', this.dto.Response.balance);
                this.http.post(this.funct.ipaddress + 'loginGS/launchGames', launchGameModel, { headers: headers })
                  .pipe
                  (
                    catchError(this.handleErrorMessage.handleError.bind(this, ''))
                  )
                  .subscribe(
                    async result => {
                      this.common.gameLoading = false;
                      this.spinner.hide("gameLoading");
                      this.dto.Response = result;
                      this.launchGameResModel = this.dto.Response;
                      this.gameUserBalance = this.storage.retrieve('localGameBalanceBefore');
                      this.storage.store('localGamePlayProviderId', this.providerId);
                      this.storage.store('localPreviousRoute', 'gameList')
                      sessionStorage.setItem('providerId', this.providerId);
                      var gamelist = this.storage.retrieve('localLaunchGameList');
                      let language = this.storage.retrieve('localLanguage');
                      if (language == "my") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_my);
                      } else if (language == "th") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_th);
                      } else if (language == "zh") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_zh);
                      } else {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name);
                      }
                      this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
                      this.storage.store('localLaunchTagName', this.launchTagName);
                      this.router.navigate(['/game/play'], {
                        state: {
                          launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                          providerId: this.providerId
                        }, replaceUrl: false
                      });
                    }
                  );
                this.checkAndReloadIfTelegramWebView();
              }
              return;
            }
            else {
              this.storage.store('localCloseGameBalance', this.dto.Response.balance);
              this.http.post(this.funct.ipaddress + 'loginGS/launchGames', launchGameModel, { headers: headers })
                .pipe
                (
                  catchError(this.handleErrorMessage.handleError.bind(this, ''))
                )
                .subscribe(
                  async result => {
                    this.common.gameLoading = false;
                    this.spinner.hide("gameLoading");
                    this.dto.Response = result;
                    this.launchGameResModel = this.dto.Response;
                    this.gameUserBalance = await this.getGameUserBalance();
                    this.storage.store('localGamePlayProviderId', this.providerId);
                    this.storage.store('localPreviousRoute', 'gameList')
                    sessionStorage.setItem('providerId', this.providerId);
                    var gamelist = this.storage.retrieve('localLaunchGameList');
                    let language = this.storage.retrieve('localLanguage');
                    if (language == "my") {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_my);
                    } else if (language == "th") {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_th);
                    } else if (language == "zh") {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_zh);
                    } else {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name);
                    }
                    this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
                    this.storage.store('localLaunchTagName', this.launchTagName);
                    this.router.navigate(['/game/play'], {
                      state: {
                        launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                        providerId: this.providerId
                      }, replaceUrl: false
                    });
                  }
                );
            }
          }
        }
      );
  }

  checkAndReloadIfTelegramWebView() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Telegram")) {
      setTimeout(() => {
        if (!document.readyState || document.readyState === 'loading') {
          window.location.reload();
        }
      }, 1000);
    }
  }

  playAutoGameListLaunchformobileview(launchGameModel) {
    this.gameOption = this.storage.retrieve('localGameOption');
    this.common.gameLoading = true;
    this.spinner.show("gameLoading");
    let params = new HttpParams();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    params = params.set('providerId', this.providerId);
    this.getUserProfile();
    this.http.get(this.funct.ipaddress + 'loginGS/getBalance', { params: params, headers: headers })
      .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          if (this.dto.Response.balance < 1000) {
            return;
          }
          else {
            let headers = new HttpHeaders();
            this.token = this.storage.retrieve('token');
            headers = headers.set('Authorization', this.token);
            if (this.gameOption == true) {
              this.storage.clear('localGameOption');
              this.common.gameLoading = false;
              this.spinner.hide("gameLoading");
              if (this.deviceId1 == 'mobile') {
                this.showOpenChromeDialog(launchGameModel, this.providerId);
              }
              else {
                this.storage.store('localCloseGameBalance', this.dto.Response.balance);
                this.http.post(this.funct.ipaddress + 'loginGS/launchGames', launchGameModel, { headers: headers })
                  .pipe
                  (
                    catchError(this.handleErrorMessage.handleError.bind(this, ''))
                  )
                  .subscribe(
                    async result => {
                      this.common.gameLoading = false;
                      this.spinner.hide("gameLoading");
                      this.dto.Response = result;
                      this.launchGameResModel = this.dto.Response;
                      this.gameUserBalance = await this.getGameUserBalance();
                      this.storage.store('localGamePlayProviderId', this.providerId);
                      this.storage.store('localPreviousRoute', 'gameList')
                      sessionStorage.setItem('providerId', this.providerId);
                      var gamelist = this.storage.retrieve('localLaunchGameList');
                      let language = this.storage.retrieve('localLanguage');
                      if (language == "my") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_my);
                      } else if (language == "th") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_th);
                      } else if (language == "zh") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_zh);
                      } else {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name);
                      }
                      this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
                      this.storage.store('localLaunchTagName', this.launchTagName);
                      this.router.navigate(['/game/play'], {
                        state: {
                          launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                          providerId: this.providerId
                        }, replaceUrl: false
                      });
                    }
                  );
              }
              return;
            }
            else {
              this.storage.store('localCloseGameBalance', this.dto.Response.balance);
              this.http.post(this.funct.ipaddress + 'loginGS/launchGameswithMobileView', launchGameModel, { headers: headers })
                .pipe
                (
                  catchError(this.handleErrorMessage.handleError.bind(this, ''))
                )
                .subscribe(
                  async result => {
                    this.common.gameLoading = false;
                    this.spinner.hide("gameLoading");
                    this.dto.Response = result;
                    this.launchGameResModel = this.dto.Response;
                    this.gameUserBalance = await this.getGameUserBalance();
                    this.storage.store('localGamePlayProviderId', this.providerId);
                    this.storage.store('localPreviousRoute', 'gameList')
                    sessionStorage.setItem('providerId', this.providerId);
                    var gamelist = this.storage.retrieve('localLaunchGameList');
                    let language = this.storage.retrieve('localLanguage');
                    if (language == "my") {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_my);
                    } else if (language == "th") {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_th);
                    } else if (language == "zh") {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_zh);
                    } else {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name);
                    }
                    this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
                    this.storage.store('localLaunchTagName', this.launchTagName);
                    this.router.navigate(['/game/play'], {
                      state: {
                        launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                        providerId: this.providerId
                      }, replaceUrl: false
                    });
                  }
                );
            }
          }
        }
      );
  }

  getGameCalculate() {
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      var opennewtap = this.storage.retrieve('localOpenNewTap');
      if (opennewtap != null && opennewtap != "") {
        var GamePlayResult = {
          balanceBefore: 0,
          postBalance: 0,
          providerId: "",
          differentAmount: 0,
          status: "",
          signature: ""
        }
        this.providerId = this.storage.retrieve('localProviderId');
        var gameBalanceBefore = opennewtap;
        this.token = this.storage.retrieve('token');
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', this.token);
        GamePlayResult.balanceBefore = gameBalanceBefore;
        GamePlayResult.postBalance = gameBalanceBefore;
        GamePlayResult.providerId = this.providerId.toString();
        this.http.post(this.funct.ipaddress + 'loginGS/DoBalanceCloseGame', GamePlayResult, { headers: headers })
          .pipe
          (
            catchError(this.handleErrorMessage.handleError.bind(this, ''))
          )
          .subscribe(
            result => {
              this.dto.Response = result;
              this.storage.clear('localOpenNewTap');
              window.location.reload();
            }
          );
      }
    }
  }

  loginAccount() {
    if (this.deviceId != null) {
      this.router.navigate(['/login', this.deviceId]);
      return;
    }
    this.router.navigate(['/login'])
  }

  refreshPage(): void {
    this.closeGameBalance = undefined;
    if (this.searchKey != null || this.searchKey != undefined || this.searchKey != "") {
      this.searchKey = "";
    }
    this.ngOnInit();
    setTimeout(() => {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 2000);
  }

  goBack() {
    if (this.deviceId != null) {
      this.router.navigate(['/home', this.deviceId]);
      return;
    }
    this.router.navigate(['/home'])
  }

  ngAfterViewInit() {
    this.isClose = false;
  }

  search() {
    this.gameItems = [];
    if (this.searchKey == null || this.searchKey.length == 0) {
      this.gameItems = this.gameList.gsGameList;
      return;
    }
    const searchKeyLower = this.searchKey.toLowerCase();
    this.gameList.gsGameList.forEach(element => {
      if (element.name == null || element.name === "" || element.name === undefined) {
        return;
      }
      if (
        element.name.toLowerCase().includes(searchKeyLower) ||
        (element.name_my && element.name_my.toLowerCase().includes(searchKeyLower)) ||
        (element.name_th && element.name_th.toLowerCase().includes(searchKeyLower)) ||
        (element.name_zh && element.name_zh.toLowerCase().includes(searchKeyLower))
      ) {
        this.gameItems.push(element);
      }
    });
  }

  onEnter() {
    this.searchInput.nativeElement.blur();
  }

  async getGameList() {
    this.gameList = this.storage.retrieve('localgameList' + this.providerId);
    if (this.gameList != null && this.gameList.gsGameList != null) {
      this.gameItems = this.gameList.gsGameList;
    } else {
      this.gameItems = [];
    }
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('providerId', this.providerId);
    this.http.get(this.funct.ipaddress + 'loginGS/GetGsGameList', { params: params, headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        async result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.gameList = this.dto.Response;
          if (this.gameList != null && this.gameList.gsGameList != null) {
            this.gameItems = this.gameList.gsGameList;
            this.providerName = this.gameList.name;
          } else {
            this.gameItems = [];
          }
          this.storage.store('localgameList' + this.providerId, this.gameList);
          if (this.gameList.isMaintenance == true) {
            await this.getGameAlertText();
            var data = this.storage.retrieve('localgameAlertText');
            if (data != null && data != undefined) {
              this.showGameListMaintenanceDialog(data);
            }
          }
        }
      );
  }

  getAdsList() {
    this.adsList = this.storage.retrieve('localadsList');
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('gameProviderId', this.providerId);
    this.http.get(this.funct.ipaddress + 'ads/GetAdsList', { params: params, headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.adsList = this.dto.Response;
          this.storage.store('localadsList', this.adsList);
          return;
        }
      );
  }

  getGSgamelist() {
    this.adsList = this.storage.retrieve('localadsList');
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('gameProviderId', this.providerId);
    this.http.get(this.funct.ipaddress + 'loginGS/insertGsGame', { params: params, headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          let aaarry = this.dto.Response.games
          let filteredArray = aaarry.filter(item => item.type === 1);
          this.storage.store('localadsList', this.adsList);
          return;
        }
      );
  }

  getMarqueeText() {
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('providerId', this.providerId);
    this.http.get(this.funct.ipaddress + 'marquee/getMarqueeText', { params: params, headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.marqueeText = this.dto.Response;
          this.storage.store('localmarqueeText', this.marqueeText);
          return;
        }
      );
  }

  getBlackListCountry() {
    let headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'loginGS/GetMyCountryCode', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.qmListModel = this.dto.Response;
          this.iplookupKey = this.qmListModel.ipLookupKey;
          this.storage.store('localcountryBlackList', this.qmListModel.qmBlackList);
          this.http.get("https://ipapi.co/json?key=" + this.iplookupKey, { headers: headers })
            .pipe(
              catchError(this.handleErrorMessage.handleError.bind(this, ''))
            )
            .subscribe(
              countryCodeResult => {
                this.countryCodeObj = countryCodeResult;
                this.countryCode = this.countryCodeObj.country_code;
                for (var i in this.qmListModel.qmBlackList) {
                  if (this.countryCode == this.qmListModel.qmBlackList[i].countryCode2Digit) {
                    this.isBlackListCountry = true;
                    break;
                  }
                  else {
                    this.isBlackListCountry = false;
                  }
                }
                if (this.isBlackListCountry == true) {
                  this.router.navigate(['/game/country-black-list'], { replaceUrl: true });
                }
              }
            );
        }
      );
  }

  getGameAlert() {
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('providerId', this.providerId);
    this.http.get(this.funct.ipaddress + 'GameAlert/GetAlertByXxxx', { params: params, headers: headers })
      .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.gameAlertObject = this.dto.Response;
          this.storage.store('localgameAlertText', this.gameAlertObject);
        }
      );
  }

  async getGameAlertText() {
    let config = {
      params: { 'providerId': this.providerId },
    }
    const axios = require('axios').default;
    await axios.get(this.funct.ipaddress + 'GameAlert/GetAlertByXxxx', config)
      .then((res) => {
        this.storage.store('localgameAlertText', res.data);
        return res.data;
      })
      .catch((error) => {
        return null;
      });
  }

  async showplayFreeOrplay(playFreeOrPlay: TemplateRef<any>, transferAlert: TemplateRef<any>, isdemourl, gameCode, providerCode, gameObj) {
    this.common.gameLoading = true;
    this.spinner.show("gameLoading");
    await this.getGameUserBalance();
    this.storage.store('localGameIcon', gameObj);
    this.storage.store('localLaunchGameList', gameObj);
    let login = this.storage.retrieve('isUserLoggedIn');
    if (!login) {
      this.common.gameLoading = false;
      this.spinner.hide("gameLoading");
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    this.gameType = gameObj.type;
    this.gameOption = gameObj.option;
    this.storage.store('localGameOption', this.gameOption);
    this.providerCode = gameObj.providercode;
    this.gameCode = gameCode;
    if (this.gameList.name == 'SB' || this.gameList.name == 'WB') {
      this.common.gameLoading = false;
      this.spinner.hide("gameLoading");
      if (this.gameList.name == 'WB') {
        this.launchGameModel.gameId = this.providerCode + "_" + this.gameCode;
        this.launchGameModel.providerCode = this.providerName;
        this.launchGameModel.lang = this.gameLanguage();
        this.launchGameModel.type = this.gameType;
        this.showMobileorWebViewDialog(this.launchGameModel, this.providerId);
      }
      else {
        this.storage.store('localCloseGameBalance', this.gameUserBalance);
        this.common.gameLoading = false;
        this.spinner.hide("gameLoading");
        this.launchGameModel.gameId = this.providerCode + "_" + this.gameCode;
        this.launchGameModel.providerCode = this.providerName;
        this.launchGameModel.lang = this.gameLanguage();
        this.launchGameModel.type = this.gameType;
        let headers = new HttpHeaders();
        this.token = this.storage.retrieve('token');
        headers = headers.set('Authorization', this.token);
        var url = this.funct.ipaddress + 'loginGS/launchGames';
        this.http.post(url, this.launchGameModel, { headers: headers })
          .pipe
          (
            catchError(this.handleErrorMessage.handleError.bind(this, ''))
          )
          .subscribe(
            async result => {
              this.dto.Response = {};
              this.dto.Response = result;
              this.launchGameResModel = this.dto.Response;
              this.common.gameLoading = false;
              this.spinner.hide("gameLoading");
              this.storage.store('localGamePlayProviderId', this.providerId);
              this.storage.store('localPreviousRoute', 'gameList')
              sessionStorage.setItem('providerId', this.providerId);
              var gamelist = this.storage.retrieve('localLaunchGameList');
              let language = this.storage.retrieve('localLanguage');
              if (language == "my") {
                this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_my);
              } else if (language == "th") {
                this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_th);
              } else if (language == "zh") {
                this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_zh);
              } else {
                this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name);
              }
              this.storage.store('localCloseGameBalance', this.gameUserBalance);
              this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
              this.storage.store('localLaunchTagName', this.launchTagName);
              this.router.navigate(['/game/play'], {
                state: {
                  launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                  providerId: this.providerId
                }, replaceUrl: false
              });
            }
          );
      }
    }
    else {
      if (isdemourl != null && isdemourl == true) {
        this.playFreeOrPlay = this.modalService.show(playFreeOrPlay,
          {
            class: "game-play-modal modal-sm"
          });
        this.common.gameLoading = false;
        this.spinner.hide("gameLoading");
      }
      else {
        this.spinner.hide();
        this.gameUserBalance = this.storage.retrieve('localGameBalanceBefore')
        if (this.gameUserBalance < 1000) {
          this.launchGameModel.gameId = this.providerCode + "_" + this.gameCode;
          this.launchGameModel.providerCode = this.providerName;
          this.launchGameModel.lang = this.gameLanguage();
          this.launchGameModel.type = this.gameType;
          this.common.gameLoading = false;
          this.spinner.hide("gameLoading");
          this.transferAlert = this.modalService.show(transferAlert,
            {
              class: "game-play-now-modal modal-sm"
            });
          return;
        }
        else {
          this.common.gameLoading = false;
          this.spinner.hide("gameLoading");
          this.launchGameModel.gameId = this.providerCode + "_" + this.gameCode;
          this.launchGameModel.providerCode = this.providerName;
          this.launchGameModel.lang = this.gameLanguage();
          this.launchGameModel.type = this.gameType;
          let headers = new HttpHeaders();
          this.token = this.storage.retrieve('token');
          headers = headers.set('Authorization', this.token);
          if (gameObj.option == true) {
            if (this.deviceId1 == 'mobile') {
              this.showOpenChromeDialog(this.launchGameModel, this.providerId);
            }
            else {

              this.storage.store('localCloseGameBalance', this.gameUserBalance);
              this.common.gameLoading = false;
              this.spinner.hide("gameLoading");
              this.launchGameModel.gameId = this.providerCode + "_" + this.gameCode;
              this.launchGameModel.providerCode = this.providerName;
              this.launchGameModel.lang = this.gameLanguage();
              this.launchGameModel.type = this.gameType;
              let headers = new HttpHeaders();
              this.token = this.storage.retrieve('token');
              headers = headers.set('Authorization', this.token);
              var url = this.funct.ipaddress + 'loginGS/launchGames';
              this.http.post(url, this.launchGameModel, { headers: headers })
                .pipe
                (
                  catchError(this.handleErrorMessage.handleError.bind(this, ''))
                )
                .subscribe(
                  async result => {
                    this.dto.Response = {};
                    this.dto.Response = result;
                    this.launchGameResModel = this.dto.Response;
                    this.common.gameLoading = false;
                    this.spinner.hide("gameLoading");
                    this.storage.store('localGamePlayProviderId', this.providerId);
                    this.storage.store('localPreviousRoute', 'gameList')
                    sessionStorage.setItem('providerId', this.providerId);
                    var gamelist = this.storage.retrieve('localLaunchGameList');
                    let language = this.storage.retrieve('localLanguage');
                    if (language == "my") {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_my);
                    } else if (language == "th") {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_th);
                    } else if (language == "zh") {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_zh);
                    } else {
                      this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                      this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name);
                    }
                    this.storage.store('localCloseGameBalance', this.gameUserBalance);
                    this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
                    this.storage.store('localLaunchTagName', this.launchTagName);
                    this.router.navigate(['/game/play'], {
                      state: {
                        launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                        providerId: this.providerId
                      }, replaceUrl: false
                    });
                  }
                );
              this.checkAndReloadIfTelegramWebView();
            }
            return;
          }
          else {
            if (this.deviceId1 == 'mobile') {
              this.showOpenChromeDialog(this.launchGameModel, this.providerId);
            }
            else {
              this.storage.store('localCloseGameBalance', this.gameUserBalance);
              if (this.gameList.name == 'SKM') {
                this.http.post(this.funct.ipaddress + 'shkm/SKMLogin', this.launchGameModel, { headers: headers })
                  .pipe
                  (
                    catchError(this.handleErrorMessage.handleError.bind(this, ''))
                  )
                  .subscribe(
                    async result => {
                      this.dto.Response = {};
                      this.dto.Response = result;
                      if (this.dto.Response.isSuccess == false) {
                        const rawData = this.dto.Response.data;
                        const timeLeftMatch = rawData.match(/timeLeft\s*=\s*(\d+)/);
                        if (timeLeftMatch && timeLeftMatch[1]) {
                          this.timeLeft = parseInt(timeLeftMatch[1], 10);
                        }
                        var waitmessage = this.translateService.instant('skm-lock-time');
                        waitmessage = waitmessage.toString().replace("@time", this.timeLeft);
                        this.toastr.error("", waitmessage, {
                          timeOut: 1000,
                          positionClass: 'toast-top-center',
                        });
                        return;
                      }
                      this.launchGameResModel = this.dto.Response.data;
                      this.common.gameLoading = false;
                      this.spinner.hide("gameLoading");
                      this.storage.store('localGamePlayProviderId', this.providerId);
                      this.storage.store('localPreviousRoute', 'gameList')
                      sessionStorage.setItem('providerId', this.providerId);
                      var gamelist = this.storage.retrieve('localLaunchGameList');
                      let language = this.storage.retrieve('localLanguage');
                      if (this.dto.Response.errCode == '603') {
                        this.toastr.error("", this.dto.Response.errMsg, {
                          timeOut: 1000,
                          positionClass: 'toast-top-center',
                        });
                        this.storage.clear('localCloseGameBalance');
                        return;
                      }
                      if (language == "my") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_my);
                      } else if (language == "th") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_th);
                      } else if (language == "zh") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_zh);
                      } else {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name);
                      }

                      this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
                      this.storage.store('localLaunchTagName', this.launchTagName);
                      this.router.navigate(['/game/play'], {
                        state: {
                          launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                          providerId: this.providerId
                        }, replaceUrl: false
                      });
                    }
                  );
              }
              else {
                var url = this.providerName != 'S6' ? this.funct.ipaddress + 'loginGS/launchGames' : this.funct.ipaddress + 'loginGS/launchGamesInChrome';
                this.http.post(url, this.launchGameModel, { headers: headers })
                  .pipe
                  (
                    catchError(this.handleErrorMessage.handleError.bind(this, ''))
                  )
                  .subscribe(
                    async result => {
                      this.dto.Response = {};
                      this.dto.Response = result;
                      this.launchGameResModel = this.dto.Response;
                      this.common.gameLoading = false;
                      this.spinner.hide("gameLoading");
                      this.storage.store('localGamePlayProviderId', this.providerId);
                      this.storage.store('localPreviousRoute', 'gameList')
                      sessionStorage.setItem('providerId', this.providerId);
                      if (this.dto.Response.errCode == '603') {
                        this.toastr.error("", this.dto.Response.errMsg, {
                          timeOut: 1000,
                          positionClass: 'toast-top-center',
                        });
                        this.storage.clear('localCloseGameBalance');
                        return;
                      }
                      var gamelist = this.storage.retrieve('localLaunchGameList');
                      let language = this.storage.retrieve('localLanguage');
                      if (language == "my") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_my);
                      } else if (language == "th") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_th);
                      } else if (language == "zh") {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_zh);
                      } else {
                        this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                        this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name);
                      }
                      this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
                      this.storage.store('localLaunchTagName', this.launchTagName);
                      this.router.navigate(['/game/play'], {
                        state: {
                          launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                          providerId: this.providerId
                        }, replaceUrl: false
                      });
                    }
                  );
              }
            }
          }
        }
      }
    }
  }

  HidePlayFreeOrPlayAlert() {
    this.playFreeOrPlay.hide();
  }

  async getGameUserBalance() {
    let params = new HttpParams();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    params = params.set('providerId', this.providerId);
    let config = {
      headers: { 'Authorization': this.token },
      params: { 'providerId': this.providerId },
    }
    const axios = require('axios').default;
    if (this.providerId == 14) {
      await axios.get(this.funct.ipaddress + 'shkm/getBalance', config)
        .then((res) => {
          this.isUserLoggedIn = true;
          this.gameUserBalance = res.data.data;
          this.storage.store('localGameBalanceBefore', this.gameUserBalance);
          return res.data.data;
        })
        .catch((error) => {
          this.isUserLoggedIn = false;
          if (error.response) {
          }
        });
    }
    else {
      await axios.get(this.funct.ipaddress + 'loginGS/getBalance', config)
        .then((res) => {
          const parsedData = JSON.parse(res.data.data);
          this.GameBalanceResponse = parsedData;
          this.gameUserBalance = parsedData.balance;
          this.gameName = res.data.name;
          this.storage.store('localGameBalanceBefore', this.gameUserBalance);
          return res.data.balance;
        })
        .catch((error) => {
          this.isUserLoggedIn = false;
          if (error.response) {
          }
        });
    }
  }

  play(transferAlert: TemplateRef<any>) {
    this.playFreeOrPlay.hide();
    this.common.gameLoading = true;
    this.spinner.show("gameLoading");
    let params = new HttpParams();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    params = params.set('providerId', this.providerId);
    this.getUserProfile();
   // this.gameUserBalance = this.storage.retrieve('localGameBalanceBefore')
    const gameBalanceData = JSON.parse(this.storage.retrieve('LocalgameUserBalance') || '[]');
    this.gameUserBalance = gameBalanceData[0].balance;
    if (this.gameUserBalance == null || this.gameUserBalance == undefined) {
      this.bsModalRef.hide();
      this.toastr.error("", this.translateService.instant("transaction_wait_5sec"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (this.gameUserBalance < 1000) {
      this.launchGameModel.gameId = this.providerCode + "_" + this.gameCode;
      this.launchGameModel.providerCode = this.providerName;
      this.launchGameModel.lang = this.gameLanguage();
      this.launchGameModel.type = this.gameType;
      this.common.gameLoading = false;
      this.spinner.hide("gameLoading");
      this.isAlert = true;
      this.transferAlert = this.modalService.show(transferAlert,
        {
          class: "game-play-now-modal modal-sm",
          ignoreBackdropClick: true,
          keyboard: false
        });
    }
    else {
      this.launchGameModel.gameId = this.providerCode + "_" + this.gameCode;
      this.launchGameModel.providerCode = this.providerName;
      this.launchGameModel.lang = this.gameLanguage();
      this.launchGameModel.type = this.gameType;
      let headers = new HttpHeaders();
      this.token = this.storage.retrieve('token');
      headers = headers.set('Authorization', this.token);
      if (this.gameOption == true) {
        this.common.gameLoading = false;
        this.spinner.hide("gameLoading");
        if (this.deviceId1 == 'mobile') {
          this.showOpenChromeDialog(this.launchGameModel, this.providerId);
        }
        else {
          this.storage.store('localCloseGameBalance', this.dto.Response.balance);
          var url = this.funct.ipaddress + 'loginGS/launchGames';
          this.http.post(url, this.launchGameModel, { headers: headers })
            .pipe
            (
              catchError(this.handleErrorMessage.handleError.bind(this, ''))
            )
            .subscribe(
              async result => {
                this.common.gameLoading = false;
                this.spinner.hide("gameLoading");
                this.dto.Response = result;
                this.launchGameResModel = this.dto.Response;
                this.storage.store('localGamePlayProviderId', this.providerId);
                this.storage.store('localPreviousRoute', 'gameList')
                sessionStorage.setItem('providerId', this.providerId);
                if (this.launchGameResModel.parameters == "openinnewtap" || this.launchGameResModel.parameters != "openinnewtap") {
                  var gamelist = this.storage.retrieve('localLaunchGameList');
                  let language = this.storage.retrieve('localLanguage');
                  if (language == "my") {
                    this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                    this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_my);
                  } else if (language == "th") {
                    this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                    this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_th);
                  } else if (language == "zh") {
                    this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                    this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_zh);
                  } else {
                    this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                    this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name);
                  }
                  this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
                  this.storage.store('localLaunchTagName', this.launchTagName);
                  this.router.navigate(['/game/play'], {
                    state: {
                      launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                      providerId: this.providerId
                    }, replaceUrl: false
                  });
                }
              }
            );
        }
        return;
      }
      else {
        if (this.deviceId1 == 'mobile') {
          this.common.gameLoading = false;
          this.spinner.hide("gameLoading");
          this.showOpenChromeDialog(this.launchGameModel, this.providerId);
        }
        else {
          this.storage.store('localCloseGameBalance', this.dto.Response.balance);
          var url = this.funct.ipaddress + 'loginGS/launchGames';
          this.http.post(url, this.launchGameModel, { headers: headers })
            .pipe
            (
              catchError(this.handleErrorMessage.handleError.bind(this, ''))
            )
            .subscribe(
              async result => {
                this.common.gameLoading = false;
                this.spinner.hide("gameLoading");
                this.dto.Response = result;
                this.launchGameResModel = this.dto.Response;
                this.gameUserBalance = await this.getGameUserBalance();
                this.storage.store('localGamePlayProviderId', this.providerId);
                this.storage.store('localPreviousRoute', 'gameList')
                sessionStorage.setItem('providerId', this.providerId);
                if (this.launchGameResModel.parameters == "openinnewtap" || this.launchGameResModel.parameters != "openinnewtap") {
                  var gamelist = this.storage.retrieve('localLaunchGameList');
                  let language = this.storage.retrieve('localLanguage');
                  if (language == "my") {
                    this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                    this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_my);
                  } else if (language == "th") {
                    this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                    this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_th);
                  } else if (language == "zh") {
                    this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                    this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name_zh);
                  } else {
                    this.launchTagName = this.translateService.instant("game-win-lose-chrome");
                    this.launchTagName = this.launchTagName.toString().replace("@name", gamelist.name);
                  }
                  this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
                  this.storage.store('localLaunchTagName', this.launchTagName);
                  this.router.navigate(['/game/play'], {
                    state: {
                      launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                      providerId: this.providerId
                    }, replaceUrl: false
                  });
                }
              }
            );
        }
      }
    }
  }

  showGameListMaintenanceDialog(data) {
    const initialState = {
      title: '',
      closeBtnName: '',
      data: data,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(GameCategoryMaintenanceComponent,
      {
        class: ' modal-sm game-categort-maintenance-alert', initialState
      });
  }

  showOpenChromeDialog(data, provierId) {
    const initialState = {
      title: '',
      closeBtnName: '',
      data: data,
      providerId: provierId,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(GameOpenChromeComponent,
      {
        class: 'modal-sm game-open-chrome-alert', initialState
      });
  }

  showMobileorWebViewDialog(data, provierId) {
    const initialState = {
      title: '',
      closeBtnName: '',
      data: data,
      providerId: provierId,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(GameWebMobileViewComponent,
      {
        class: 'modal-sm game-web-mobile-alert', initialState
      });
  }

  HideAlert() {
    this.transferAlert.hide();
  }

  goToWallet() {
    this.transferAlert.hide();
    this.storage.store("localListGameLaunch", this.launchGameModel);
    this.data.display_name = this.providerName;
    this.data.providerId = this.providerId;
    const list = { list: this.data, tranfer: 'in' };
    this.showGameInOutDialog(list);
  }

  showGameInOutDialog(data) {
    const initialState = {
      title: '',
      data: data,
      closeBtnName: '',
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.storage.store("from-game-account-login", "fg")
    this.bsModalRef = this.modalService.show(GameWalletInOutComponent, { class: 'modal-sm game-in-out-alert', initialState });
  }

  playFree() {
    this.playFreeOrPlay.hide();
    this.spinner.show();
    this.launchDameModel.gcode = this.gameCode;
    this.launchDameModel.gpcode = this.providerCode;
    this.skmGameModel.lang = "my_MM";
    this.launchDameModel.lang = "my_MM";
    let headers = new HttpHeaders();
    this.http.post(this.funct.ipaddress + 'loginGS/launchDGames', this.launchDameModel, { headers: headers })
      .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this, 'error'))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.launchGameResModel = this.dto.Response;
          this.spinner.hide();
          if (this.launchGameResModel != null) {
            window.open(this.launchGameResModel.gameUrl, '_blank'); /*launch demo game*/
          }
        }
      );
  }

  getUserProfile() {
    let params = new HttpParams();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
      .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.userProfileBalance = this.dto.Response.balance;
          this.storage.store('localuserMainbalance', this.userProfileBalance)
        }
      );
  }

  createGSGameMember() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.post(this.funct.ipaddress + 'loginGS/gscreatePlayer', null, { headers: headers })
      .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
        }
      );
  }

  changeLanguage(data: any) {
    let lang = this.storage.retrieve('localLanguage');
    this.language = lang;
    if (lang == "my") {
      return data.name_my != null ? data.name_my : data.name;
    } else if (lang == "th") {
      return data.name_th != null ? data.name_th : data.name;
    } else if (lang == "zh") {
      return data.name_zh != null ? data.name_zh : data.name;
    } else {
      return data.name;
    }
  }

  changeLanguageGameAlert(data: any) {
    var lang = this.storage.retrieve('localLanguage');
    if (lang == "my") {
      return data.description_my != null ? data.description_my : data.description_en;
    } else if (lang == "th") {
      return data.description_th != null ? data.description_th : data.description_en;
    } else if (lang == "zh") {
      return data.description_zh != null ? data.description_zh : data.description_en;
    } else {
      return data.description_en;
    }
  }

  gameLanguage() {
    var lang = this.storage.retrieve('localLanguage');
    if (lang == "my") {
      return lang + "_" + "MM";
    } else if (lang == "th") {
      return lang + "_" + "TH"
    } else if (lang == "zh") {
      return lang + "_" + "CN"
    }
    else if (lang == "en") {
      return lang + "_" + "US"
    }
    else {
      return lang + "_" + "US"
    }
  }

  gameWinLoseDialog(balance, id) {
    var data = {
      gameBalance: balance,
      providerId: id.toString(),
      list: this.storage.retrieve('localLaunchGameList')
    }
    const initialState = {
      title: '',
      closeBtnName: '',
      data: data,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(GameWinLoseComponent,
      {
        class: 'modal-sm game-list-win-lose-alert', initialState
      });
  }

  showSportDialog(data) {
    const initialState = {
      title: '',
      closeBtnName: '',
      data: data,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(SportDialogComponent,
      {
        class: 'modal-sm game-sport-alert', initialState
      });
  }

  createSKMGameMember() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.post(this.funct.ipaddress + 'shkm/SKMRegister', null, { headers: headers })
      .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
        }
      );
  }
}

