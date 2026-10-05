import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { FunctService } from 'src/app/shared/service/funct.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";
import { CommonService } from 'src/app/shared/service/common.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { GameOpenChromeComponent } from 'src/app/shared/dialog/game-open-chrome/game-open-chrome.component';
import { DtoService } from 'src/app/shared/service/dto.service';
import { catchError, retry } from 'rxjs/operators';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { GameShowFreePlayComponent } from 'src/app/shared/dialog/game-show-free-play/game-show-free-play.component';


@Component({
  selector: 'app-game-deposit-success',
  templateUrl: './game-deposit-success.component.html',
  styleUrls: ['./game-deposit-success.component.scss']
})
export class GameDepositSuccessComponent implements OnInit {
  gameFrom: any;
  gameTo: any;
  transferAmount: any;
  gameProviderId: any;
  granParent: any;
  gameWalletTransfer: any;
  isFromGameAccountLogin: any;
  providerId: any;
  gameUserBalance: any;
  token: any;
  GameBalanceResponse: any;
  gameName: any;
  isUserLoggedIn = false;
  launchGameModel: any;
  launchGameResModel: any;
  playFreeOrPlay: BsModalRef;
  deviceId: any;
  isWebview: any;
  gamename: any;
  timeLeft: number | null = null;
  bsModalRef: BsModalRef;
  gameObj:any;
  routefrom:any;
  launchDameModel:any;
  launchCategorydata:any;
  launchTagName:any;
  launchCategorygameModel:any;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private router: Router,
    private storage: LocalStorageService,
    private _location: Location,
    private funct: FunctService,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private http: HttpClient,
    private dto: DtoService) {
    var isWebviewUser = require('is-ua-webview');
    this.isWebview = isWebviewUser(navigator.userAgent);
  }

  async ngOnInit(): Promise<void> {
    this.gameFrom = this.storage.retrieve("gameFrom");
    this.gameTo = this.storage.retrieve("gameTo");
    this.routefrom=this.storage.retrieve('routefrom');
    this.transferAmount = this.storage.retrieve("transferAmount");
    this.gameProviderId = this.storage.retrieve("localGameProviderId");
    this.providerId = this.storage.retrieve('localGamePlayProviderId');
    this.isFromGameAccountLogin = this.storage.retrieve("from-game-account-login");
    this.launchGameModel = this.storage.retrieve('localListGameLaunch');
    this.launchDameModel=this.storage.retrieve('localListDGameLaunch')
    this.gamename = this.storage.retrieve('localgamename');
    this.gameObj=this.storage.retrieve('localGameIcon');
    this.launchCategorydata=this.storage.retrieve('localLiveGameLaunch');
       this.launchCategorygameModel = {
      "gameId": "string",
      "lang": "string",
      "providerCode": "string",
      "type": "string"
    }

    if (this.isWebview) {
      this.deviceId = "mobile";
    }
    else {
      this.deviceId = '';
    }

  }

  Done(playFreeOrPlay){
    if(this.routefrom=='lowbalance')
    {
      if (this.providerId == 8 || this.providerId == 2) {
        this.showPlayFreeDialog(this.launchCategorydata);
      }
      else{
      this.showplayFreeOrplay(playFreeOrPlay);
      }
    }
    else{
      this.goToGameList();
    }
  }

  goToGameList() {
    if (this.isFromGameAccountLogin == "fg") {
      this.storage.store('notgetBal','no')
      if (this.providerId == 8 || this.providerId == 2) {
        this.router.navigate(['/game/gamecategory', this.providerId], { state: { catId: this.providerId, gameProviderId: this.providerId }, replaceUrl: true });
      }
      else {
        localStorage.setItem("from-game-account-login", null)
        this.router.navigate(['game/gameList/' + this.gameProviderId], { replaceUrl: true })
      }
    }
    else {
      this._location.back();
    }
  }

  async showplayFreeOrplay(playFreeOrPlay) {
    this.common.gameLoading = true;
    this.spinner.show("gameLoading");
    if (!this.storage.retrieve('isUserLoggedIn')) {
      this.common.gameLoading = false;
      this.spinner.hide("gameLoading")
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    // Demo Mode
    if (this.gameObj.supportdemourl) {
      this.playFreeOrPlay = this.modalService.show(playFreeOrPlay, { class: "game-play-modal modal-sm modal-dialog-centered" });
      this.common.gameLoading = false;
      this.spinner.hide("gameLoading")
      return;
    }
    this.GameBalanceResponse = this.storage.retrieve('LocalgameUserBalance')
    // Mobile handling
    if (this.deviceId === 'mobile') {
      this.showOpenChromeDialog(this.launchGameModel, this.gameProviderId[0]);
      this.common.gameLoading = false;
      this.spinner.hide("gameLoading")
      return;
    }

    if (this.gamename == 'SKM') {
      const skmurl = this.funct.ipaddress + 'shkm/SKMLogin';
      this.storage.store('localCloseGameBalance', this.GameBalanceResponse);
      this.launchSKMGame(skmurl, this.gameProviderId[0])
      return;
    }
    else {
      // Launch game
      const url =
        this.gamename === 'S6'
          ? this.funct.ipaddress + 'loginGS/launchGamesInChrome'
          : this.funct.ipaddress + 'loginGS/launchGames';

      this.storage.store('localCloseGameBalance', this.GameBalanceResponse);
      this.launchGame(url, this.gameProviderId[0]);

    }
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

  private launchSKMGame(url: string, providerId: any) {
    const headers = this.getAuthHeaders();
    this.http.post(url, this.launchGameModel, { headers })
      .pipe(catchError(this.handleErrorMessage.handleError.bind(this, '')))
      .subscribe(result => {
        this.dto.Response = result;
        if (result?.errCode === '603') {
          this.toastr.error("", result.errMsg, {
            timeOut: 1000,
            positionClass: 'toast-top-center'
          });
          return;
        }
        if (this.dto.Response.isSuccess == true) {
          this.launchGameResModel = this.dto.Response.data;
          const gamelist = this.storage.retrieve('localLaunchGameList');
          const launchTagName = this.getLaunchTagName(gamelist);
          this.storage.store('localGamePlayProviderId', providerId);
          this.storage.store('localPreviousRoute', 'gameList');
          this.storage.store('localLaunchTagName', launchTagName);
          sessionStorage.setItem('providerId', providerId);
          this.router.navigate(['/game/play'], {
            state: {
              launchUrl: this.launchGameResModel.gameUrl,
              launchTag: "openinnewtap",
              launchTagName,
              providerId
            }
          });
          this.common.gameLoading = false;
          this.spinner.hide("gameLoading")
        }
        if (this.dto.Response.isSuccess == false) {
          this.common.gameLoading = false;
          this.spinner.hide("gameLoading")
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
      });
  }


  private launchGame(url: string, providerId: any) {
    const headers = this.getAuthHeaders();
    this.http.post(url, this.launchGameModel, { headers })
      .pipe(catchError(this.handleErrorMessage.handleError.bind(this)))
      .subscribe(result => {
        this.launchGameResModel = result;

        if (result?.errCode === '603') {
          this.toastr.error("", result.errMsg, {
            timeOut: 1000,
            positionClass: 'toast-top-center'
          });
          return;
        }

        const gamelist = this.storage.retrieve('localLaunchGameList');
        const launchTagName = this.getLaunchTagName(gamelist);

        this.storage.store('localGamePlayProviderId', providerId);
        this.storage.store('localPreviousRoute', 'gameList');
        this.storage.store('localLaunchTagName', launchTagName);
        sessionStorage.setItem('providerId', providerId);

        this.router.navigate(['/game/play'], {
          state: {
            launchUrl: this.launchGameResModel.gameUrl,
            launchTag: "openinnewtap",
            launchTagName,
            providerId
          }
        });

        // this.stopLoading();
      });
  }

  private getLaunchTagName(gamelist): string {
    const language = this.storage.retrieve('localLanguage');
    let name = gamelist.name;

    if (language === 'my') name = gamelist.name_my;
    else if (language === 'th') name = gamelist.name_th;
    else if (language === 'zh') name = gamelist.name_zh;

    return this.translateService
      .instant("game-win-lose-chrome")
      .toString()
      .replace("@name", name);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.storage.retrieve('token');
    return new HttpHeaders().set('Authorization', token);
  }

   playAutoGameListLaunch(data) {
    var providerId = this.storage.retrieve("localGamePlayProviderId");
    this.launchCategorygameModel.gameId = data.providercode + "_" + data.code;
    this.launchCategorygameModel.providerCode = this.storage.retrieve('localgameCatName');
    this.launchCategorygameModel.lang = this.gameLanguage();
    this.launchCategorygameModel.type = data.type;
    this.spinner.show("smallSpinner");
    let params = new HttpParams();
    this.token = this.storage.retrieve('token');
    params = params.set('providerId', providerId);
    if (providerId == 8) {
      this.gameUserBalance = this.storage.retrieve('LocalgameUserBalance1');
      this.storage.store('LocalgameUserBalance',this.gameUserBalance);
    }
    else {
      this.gameUserBalance = this.storage.retrieve('LocalgameUserBalance2');
      this.storage.store('LocalgameUserBalance',this.gameUserBalance);
    }
      this.storage.store('localGameBalanceBefore', this.gameUserBalance);
      const headers = this.getAuthHeaders();
      this.token = this.storage.retrieve('token');
      var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (this.launchCategorygameModel.option == true) {
        this.spinner.hide("smallSpinner");
        if (this.deviceId == 'mobile') {
          this.common.gameLoading = false;
          this.spinner.hide("gameLoading");
          this.showOpenChromeDialog(data, providerId);
        }
        else {
          this.storage.store('localCloseGameBalance', this.gameUserBalance);
          this.http.post(this.funct.ipaddress + 'loginGS/launchGames', this.launchCategorygameModel, { headers: headers })
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
        if (this.deviceId == 'mobile') {
          this.common.gameLoading = false;
          this.spinner.hide("gameLoading");
          this.showOpenChromeDialog(this.launchCategorygameModel, providerId);
        }
        else {
          this.storage.store('localCloseGameBalance', this.gameUserBalance);
          this.http.post(this.funct.ipaddress + 'loginGS/launchGames', this.launchCategorygameModel, { headers: headers })
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

 play() {
    this.playFreeOrPlay.hide();
    this.common.gameLoading = true;
    this.spinner.show("gameLoading");

   // this.getUserProfile();
    this.gameUserBalance = this.storage.retrieve('LocalgameUserBalance');

    if (this.gameUserBalance == null) {
      this.bsModalRef.hide();
      this.toastr.error("", this.translateService.instant("transaction_wait_5sec"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
    this.common.gameLoading = false;
    this.spinner.hide("gameLoading");
    return;
    }
    //  this.prepareLaunchModel();
    // Mobile
    if (this.deviceId === 'mobile') {
      this.common.gameLoading = false;
      this.spinner.hide("gameLoading");
      this.showOpenChromeDialog(this.launchGameModel, this.gameProviderId[0]);
      return;
    }
    // Option game (Chrome open)
    if (this.gameObj.option === true) {
      this.common.gameLoading = false;
      this.spinner.hide("gameLoading");
      this.storage.store('localCloseGameBalance',this.gameUserBalance );
      this.launchGameRequest();
      return;
    }

    this.storage.store('localCloseGameBalance',this.gameUserBalance );
    this.launchGameRequest();
  }

   private launchGameRequest() {
    const url = this.funct.ipaddress + 'loginGS/launchGames';
    this.http.post(url, this.launchGameModel, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleErrorMessage.handleError.bind(this, '')))
      .subscribe(res => {
        this.launchGameResModel = res;
        this.common.gameLoading = false;
        this.spinner.hide("gameLoading");
        this.navigateToGame(this.launchGameResModel.gameUrl);
      });
  }

  private navigateToGame(url: string) {
    const launchTagName = this.buildLaunchTagName();
    this.storage.store('localGamePlayProviderId', this.gameProviderId[0]);
    this.storage.store('localPreviousRoute', 'gameList');
    this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
    this.storage.store('localLaunchTagName', launchTagName);
    sessionStorage.setItem('providerId', this.gameProviderId[0]);

    this.router.navigate(['/game/play'], {
      state: {
        launchUrl: url,
        launchTag: 'openinnewtap',
        launchTagName,
        providerId: this.gameProviderId[0]
      }
    });
  }

   private buildLaunchTagName(): string {
    const gamelist = this.storage.retrieve('localLaunchGameList');
    const lang = this.storage.retrieve('localLanguage');

    const name =
      lang === 'my' ? gamelist.name_my :
        lang === 'th' ? gamelist.name_th :
          lang === 'zh' ? gamelist.name_zh :
            gamelist.name;

    return this.translateService
      .instant("game-win-lose-chrome")
      .replace("@name", name);
  }

   playFree() {
    this.playFreeOrPlay.hide();
    this.spinner.show();
    let headers = new HttpHeaders();
    if (this.gamename == 'SB' || this.gamename == 'WB') {
      this.launchGameRequest();
    }
    else {
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
  }

  showPlayFreeDialog(data) {
    this.common.gameLoading = true;
    this.spinner.show("gameLoading");
    if (!this.storage.retrieve('isUserLoggedIn')) {
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
      var list = { 'providerId': this.providerId, "providerName": this.gameName, 'list': data };
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

}
