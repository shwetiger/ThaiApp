import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { ModalDialogService } from 'ngx-modal-dialog';
import { LocationStrategy } from '@angular/common';
import { GameAccountLoginComponent } from 'src/app/shared/components/game-account-login/game-account-login.component';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { GameOpenChromeComponent } from 'src/app/shared/dialog/game-open-chrome/game-open-chrome.component';
import { GameCategoryTransferComponent } from 'src/app/shared/dialog/game-category-transfer/game-category-transfer.component';
import { GameCategoryMaintenanceComponent } from 'src/app/shared/dialog/game-category-maintenance/game-category-maintenance.component';
import { SportDialogComponent } from 'src/app/shared/dialog/sport-dialog/sport-dialog.component';
import { GameWinLoseComponent } from 'src/app/shared/dialog/game-win-lose/game-win-lose.component';
import { GameShowFreePlayComponent } from 'src/app/shared/dialog/game-show-free-play/game-show-free-play.component';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { join } from 'path';

@Component({
  selector: 'app-gamecategory',
  templateUrl: './gamecategory.component.html',
  styleUrls: ['./gamecategory.component.scss']
})
export class GamecategoryComponent implements OnInit, OnDestroy {
  @ViewChild(GameAccountLoginComponent) child: GameAccountLoginComponent;
  catId: any;
  isWebview1: boolean;
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
  launchGameResModel: any;
  launchGameModel: any;
  gameType: any;
  token: any;
  topupBalanceModalId: any;
  userProfileBalance: any;
  gameUserBalance: any;
  gameProviderList: any;
  providerName: any;
  bsModalRef: BsModalRef;
  transferAlert: BsModalRef;
  playFreeOrPlay: BsModalRef;
  maintenanceAlert: BsModalRef;
  gamecatList: any;
  slots: any;
  fishing: any;
  gameCatModel: any;
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
  catName: string;
  gameProviderId: any;
  gameName: any;
  gameUserBalanceAlert: any;
  launchTagName: any;
  gameImgProviderId: any;
  gameProviderCodeName: any;
  gameMaintenanceSlot: boolean = false;
  gameMaintenanceFishing: boolean = false;
  bothgameMaintenance: boolean = false;
  gamecatFishingList: any = [];
  gamecatSlotsList: any = [];
  maintanance: any;
  deviceId1: any;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
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
    this.blackList = history.state.blackList;
    this.deviceId = this.storage.retrieve('localDeviceId');
    this.catId = this.route.snapshot.paramMap.get("catId");
    this.maintanance = this.storage.retrieve("fishingmaintenance");
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
    this.storage.store("localGameCatId", this.catId);
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
    this.launchGameModel = {
      "gameId": "string",
      "lang": "string",
      "providerCode": "string",
      "type": "string"
    }
    if (this.maintanance == true) {
      this.bothgameMaintenance = true;
      this.getGameAlert(this.catId.toString());
      this.getAdsList();
      this.getMarqueeText();
      return;
    }
    if (this.isWebview1) {
      this.deviceId1 = "mobile";
    }

    else {
      this.deviceId1 = '';
    }
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.isUserLoggedIn = this.storage.retrieve('isUserLoggedIn');
    this.deviceId = this.storage.retrieve('localDeviceId');
    this.getAdsList();
    this.getMarqueeText();
    this.getUserProfile();
    this.createGSGameMember();
    var gameId = this.storage.retrieve("localGamePlayProviderId");
    if (gameId != null && gameId != undefined) {
      if (gameId == 8) {
        $('#slots').css({ 'display': 'block !important' });
        $('#fishing').css({ 'display': 'none !important' });
        this.getSlotsGameCategory(gameId);
      } else {
        $('#slots').css({ 'display': 'none !important' });
        $('#fishing').css({ 'display': 'block !important' });
        this.getFishingGameCategory(gameId);
      }
    } else {
      $('#slots').css({ 'display': 'block !important' });
      $('#fishing').css({ 'display': 'none !important' });
      this.getSlotsGameCategory(8);
    }
    this.closeGameBalance = this.storage.retrieve('localCloseGameBalance');
    if (this.closeGameBalance != 0 && this.closeGameBalance != undefined && this.closeGameBalance != null) {
      this.storage.clear('localCloseGameBalance');
      this.gameWinLoseDialog(this.closeGameBalance, this.storage.retrieve("localGamePlayProviderId"));
    }
    if (this.storage.retrieve("localLiveGameLaunch") != null && this.storage.retrieve("localLiveGameLaunch") != undefined) {
    }
  }

  ngOnDestroy(): void {
    this.storage.clear('localgameAlertText');
  }

  playAutoGameListLaunch(data) {
    var providerId = this.storage.retrieve("localGamePlayProviderId");
    this.launchGameModel.gameId = data.providercode + "_" + data.code;
    this.launchGameModel.providerCode = this.gameProviderCodeName;
    this.launchGameModel.lang = this.gameLanguage();
    this.launchGameModel.type = data.type;
    this.spinner.show("smallSpinner");
    let params = new HttpParams();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    params = params.set('providerId', providerId);
    this.getUserProfile();
    if (providerId == 8) {
      this.gameUserBalance = this.storage.retrieve('LocalgameUserBalance1');
    }
    else {
      this.gameUserBalance = this.storage.retrieve('LocalgameUserBalance2');
    }
    if (this.gameUserBalance < 1000) {
      this.common.gameLoading = false;
      this.spinner.hide("gameLoading");
      var transferData = {
        "id": providerId,
        "mainBalance": this.userProfileBalance,
        "gameBalance": this.gameUserBalance,
        "categoryId": "",
        "name": this.gameProviderCodeName,
        "LiveGameLaunch": data
      };
      this.showTransferDialog(transferData);
      return;
    }
    else {
      this.storage.store('localGameBalanceBefore', this.gameUserBalance);
      let headers = new HttpHeaders();
      this.token = this.storage.retrieve('token');
      headers = headers.set('Authorization', this.token);
      var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (this.launchGameModel.option == true) {
        this.spinner.hide("smallSpinner");
        if (this.deviceId1 == 'mobile') {
          this.common.gameLoading = false;
          this.spinner.hide("gameLoading");
          this.showOpenChromeDialog(data, providerId);
        }
        else {
          this.storage.store('localCloseGameBalance', this.gameUserBalance);
          this.http.post(this.funct.ipaddress + 'loginGS/launchGames', this.launchGameModel, { headers: headers })
            .pipe
            (
              catchError(this.handleErrorMessage.handleError.bind(this, ''))
            )
            .subscribe(
              async result => {
                this.spinner.hide("smallSpinner");
                this.dto.Response = result;
                this.launchGameResModel = this.dto.Response;
                this.storage.store('localGamePlayProviderId', providerId);
                this.storage.store('localPreviousRoute', 'gameList')
                sessionStorage.setItem('providerId', providerId);
                if (this.launchGameResModel.parameters == "openinnewtap") {
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
                  this.router.navigate(['/game-play'], {
                    state: {
                      launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                      providerId: providerId
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
          this.showOpenChromeDialog(this.launchGameModel, providerId);
        }
        else {
          this.storage.store('localCloseGameBalance', this.gameUserBalance);
          this.http.post(this.funct.ipaddress + 'loginGS/launchGames', this.launchGameModel, { headers: headers })
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
                this.storage.store('localGamePlayProviderId', providerId);
                this.storage.store('localPreviousRoute', 'gameList')
                sessionStorage.setItem('providerId', providerId);
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
                this.router.navigate(['/game/play'], {
                  state: {
                    launchUrl: this.launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: this.launchTagName,
                    providerId: providerId
                  }, replaceUrl: false
                });
              }

            );
        }
      }
    }

    // });
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

  loginAccount() {
    if (this.deviceId != null) {
      this.router.navigate(['/login', this.deviceId]);
      return;
    }
    this.router.navigate(['/login'])
  }

  refreshPage(): void {
    let login = this.storage.retrieve('isUserLoggedIn');
    if (!login) {
      setTimeout(() => {
        this.common.refreshLoading = false;
        this.spinner.hide("refreshLoading");
      }, 1000);
      return;
    }
    this.closeGameBalance = undefined;
    if (this.searchKey != null || this.searchKey != undefined || this.searchKey != "") {
      this.searchKey = "";
    }
    this.ngOnInit();
    this.child.getGameUserBalance();
    setTimeout(() => {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 1000);
    return;
  }

  ngAfterViewInit() {
    this.isClose = false;
  }

  getSlotsGameCategory(id) {
    if (this.maintanance == true) {
      this.bothgameMaintenance = true;
      this.getGameAlert(this.catId.toString());
      this.fishing = false;
      this.slots = true;
      return;
    }
    this.storage.store('localGamePlayProviderId', id);
    this.gameMaintenanceFishing = false;
    this.gameImgProviderId = id;
    setTimeout(() => {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 1000);

    $('#fishing').css({ 'display': 'none !important' });
    this.fishing = false;
    this.slots = true;
    let headers = new HttpHeaders();
    let params = new HttpParams();
    this.gamecatFishingList = [];
    params = params.set('providerId', id);
    this.http.get(this.funct.ipaddress + 'loginGs/GetCqFishingGameList', { params: params, headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.gamecatSlotsList = this.dto.Response.gsGameList;
          this.gameProviderCodeName = this.dto.Response.name;
          if (this.dto.Response.isMaintenance == true) {
            this.gameMaintenanceSlot = true;
            this.getGameAlert(id.toString());
          }
          else {
            this.gameMaintenanceSlot = false;
          }
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
        }
      );
  }

  getFishingGameCategory(id) {
    if (this.maintanance == true) {
      this.bothgameMaintenance = true;
      this.getGameAlert(this.catId.toString());
      this.fishing = true;
      this.slots = false;
      return;
    }
    this.storage.store('localGamePlayProviderId', id);
    this.gameMaintenanceSlot = false;
    this.gameImgProviderId = id;
    setTimeout(() => {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 1000);
    $('#slots').css({ 'display': 'none !important' });
    this.fishing = true;
    this.slots = false;
    this.gamecatSlotsList = [];
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('providerId', id);
    this.http.get(this.funct.ipaddress + 'loginGs/GetCqFishingGameList', { params: params, headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.gamecatFishingList = this.dto.Response.gsGameList;
          this.gameProviderCodeName = this.dto.Response.name;
          if (this.dto.Response.isMaintenance == true) {
            this.gameMaintenanceFishing = true;
            this.getGameAlert(id.toString());
          }
          else {
            this.gameMaintenanceFishing = false;
          }
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
        }
      );
  }

  getAdsList() {
    this.adsList = this.storage.retrieve('localadsList');
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('gameProviderId', this.catId);
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
        }
      );
  }

  getMarqueeText() {
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('providerId', this.catId);
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
        }
      );
  }

  getGameAlert(id) {
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('providerId', id);
    this.http.get(this.funct.ipaddress + 'GameAlert/GetAlertByXxxx', { params: params, headers: headers })
      .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.gameAlertObject = this.dto.Response;
          this.showGameCategoryDialog(this.gameAlertObject);
        }
      );
  }

  showGameCategoryDialog(data) {
    const initialState = {
      title: '',
      closeBtnName: '',
      data: data,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(GameCategoryMaintenanceComponent,
      {
        class: 'modal-sm game-categort-maintenance-alert', initialState
      });
  }

  showSportDialog(data) {
    if (this.gameProviderId != null || this.gameProviderId != undefined) {
      this.storage.store('localGameProviderId', this.gameProviderId);
    }
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

  showTransferDialog(data) {
    if (this.gameProviderId != null || this.gameProviderId != undefined) {
      this.storage.store('localGameProviderId', this.gameProviderId);
    }
    const initialState = {
      title: '',
      closeBtnName: '',
      data: data,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(GameCategoryTransferComponent,
      {
        class: 'modal-sm game-categort-transfer-alert', initialState
      });
  }

  getUserProfile() {
    if (!this.isUserLoggedIn) {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      this.router.navigate(['/login'], { replaceUrl: true });
      return;

    }
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
        }
      );
  }

  createGSGameMember() {
    if (!this.isUserLoggedIn) {
      return;
    }
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
    let language = this.storage.retrieve('localLanguage');
    if (language == "my") {
      return data.name != null ? data.name_my : data.name;
    } else if (language == "th") {
      return data.name_th != null ? data.name_th : data.name;
    } else if (language == "zh") {
      return data.name_zh != null ? data.name_zh : data.name;
    } else {
      return data.name;
    }
  }

  changeLanguageGameAlert(data: any) {
    let language = this.storage.retrieve('localLanguage');
    if (language == "my") {
      return data.description_my != null ? data.description_my : data.description_en;
    } else if (language == "th") {
      return data.description_th != null ? data.description_th : data.description_en;
    } else if (language == "zh") {
      return data.description_zh != null ? data.description_zh : data.description_en;
    } else {
      return data.description_en;
    }
  }

  gameLanguage() {
    let language = this.storage.retrieve('localLanguage');
    if (language == "my") {
      return language + "_" + "MM";
    } else if (language == "th") {
      return language + "_" + "TH"
    } else if (language == "zh") {
      return language + "_" + "CN"
    }
    else if (language == "en") {
      return language + "_" + "US"
    }
    else {
      return language + "_" + "US"
    }
  }

  gameWinLoseDialog(balance, id) {
    var data = {
      gameBalance: balance,
      providerId: id.toString(),
      list: this.storage.retrieve("localLaunchGameList")
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


  //add
  showPlayFreeDialog(data) {
    this.common.gameLoading = true;
    this.spinner.show("gameLoading");
    if (!this.isUserLoggedIn) {
      this.common.gameLoading = false;
      this.spinner.hide("gameLoading");
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.storage.store('localLaunchGameList', data);
    if (data.isdemourl != null && data.isdemourl == true) {
      var list = { 'providerId': this.gameImgProviderId, "providerName": this.gameProviderCodeName, 'list': data };
      const initialState = {
        title: '',
        closeBtnName: '',
        data: list,
        backdrop: true,
        ignoreBackdropClick: true
      };
      this.common.gameLoading = false;
      this.spinner.hide("gameLoading");
      this.bsModalRef = this.modalService.show(GameShowFreePlayComponent,
        { class: 'modal-sm game-list-play-free-alert', initialState });
    }
    else {
      this.playAutoGameListLaunch(data);
    }
  }
}


