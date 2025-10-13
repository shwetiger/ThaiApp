import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError } from 'rxjs/operators';
import { DtoService } from '../../service/dto.service';
import { FunctService } from '../../service/funct.service';
import { GameListTransferComponent } from '../game-list-transfer/game-list-transfer.component';


@Component({
  selector: 'app-game-open-chrome',
  templateUrl: './game-open-chrome.component.html',
  styleUrls: ['./game-open-chrome.component.scss']
})
export class GameOpenChromeComponent implements OnInit {
  title: string;
  closeBtnName: string;
  @Input() data: any = [];
  @Input() providerId: any;
  token: any;
  gameUserBalance: any;
  gameLoadingone: any = false;
  gameLoadingtwo: any = false;
  isAlert: boolean;
  transferAlert: BsModalRef;
  profileUserBalance: any;
  timeLeft: number | null = null;

  constructor(
    private dto: DtoService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private http: HttpClient,
    private funct: FunctService,
    private storage: LocalStorageService,
    public bsModalRef: BsModalRef,
    private translateService: TranslateService,
    private router: Router,
    private modalService: BsModalService,) {

  }
  ngOnInit() {
    this.closeBtnName = this.translateService.instant('cancel');
    this.profileUserBalance = this.storage.retrieve('localuserMainbalance');
    // this.getGameUserBalance();
  }
  close() {
    this.bsModalRef.hide();
  }
  handleError(error: HttpErrorResponse) {
    this.spinner.hide();
    this.spinner.hide("smallSpinner");
    if (error.status == 200) {
      this.toastr.error("", this.translateService.instant("skm-lock-time"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 0) {
      this.toastr.error("", 'check your internet connection', {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      return;
    }

    if (error.status == 423 || error.status == 417) {

      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      this.storage.clear('token');
      this.storage.clear('isUserLoggedIn');
       this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    if (error.status == 400) {
      this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      return;
    }

    if (error.status == 404) {
      //  this.toastr.error("No game list.", 'Invalid!', {
      //   timeOut: 3000,
      //   positionClass: 'toast-top-center',
      //   });
      return;
    }

    if (error.status == 429) {
      //  this.toastr.error("Please contact us.", 'Invalid!', {
      //   timeOut: 3000,
      //   positionClass: 'toast-top-center',
      //   });
      return;
    }
    else {
      this.toastr.error("", error.status.toString(), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }

    //return throwError(error);
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
    await axios.get(this.funct.ipaddress + 'loginGS/getBalance', config)
      .then((res) => {
        this.gameUserBalance = res.data.balance;
        return res.data.balance;
      })
      .catch((error) => {
        if (error.response) {
        }
      });
    if (this.providerId == 14) {
      await axios.get(this.funct.ipaddress + 'shkm/getBalance', config)
        .then((res) => {
          this.gameUserBalance = res.data.data;
          return res.data.balance;
        })
        .catch((error) => {
          if (error.response) {
          }
        });
    }

  }

  showTransferDialog(data) {

    const initialState = {
      title: '',
      closeBtnName: '',
      data: data,
      backdrop: true,
      ignoreBackdropClick: true
    };

    this.bsModalRef = this.modalService.show(GameListTransferComponent,
      {
        class: 'modal-sm game-list-transfer-alert', initialState
      });
  }

  goToWebView() {
    this.gameLoadingone = true;
    this.spinner.show("gameLoadingone");
    let headers = new HttpHeaders();
    this.token = this.storage.retrieve('token');
    headers = headers.set('Authorization', this.token);
    this.gameUserBalance = this.storage.retrieve('localGameBalanceBefore');
    if (this.gameUserBalance == null || this.gameUserBalance == undefined) {
      //this.bsModalRef.hide(); 
      this.toastr.error("", this.translateService.instant("transaction_wait_5sec"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',

      });
      return;
    }
    if (this.gameUserBalance < 1000) {
      var data = {
        "id": this.providerId,
        "mainBalance": this.profileUserBalance,
        "gameBalance": this.gameUserBalance,
        "categoryId": "",
        "name": this.data.providerName,
        "LiveGameLaunch": this.data.list
      }
      this.showTransferDialog(data);
    }
    else {
      if (this.providerId == 14) {
        this.http.post(this.funct.ipaddress + 'shkm/SKMLogin', this.data, { headers: headers })
          .pipe
          (
            catchError(this.handleError.bind(this))
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
              var launchGameResModel = this.dto.Response.data;
              this.storage.store('localGamePlayProviderId', this.providerId);
              this.storage.store('localPreviousRoute', 'gameList')
              sessionStorage.setItem('providerId', this.providerId);
              var launchTagName;
              var gamelist = this.storage.retrieve('localLaunchGameList');
              let language = this.storage.retrieve('localLanguage');
              if (language == "my") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_my);
              } else if (language == "th") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_th);
              } else if (language == "zh") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_zh);
              } else {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name);
              }
              this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
              this.gameLoadingone = false;
              this.spinner.hide("gameLoadingone");
              this.bsModalRef.hide();
              this.storage.store('localCloseGameBalance', this.gameUserBalance);
              this.storage.store('localLaunchTagName', launchTagName);
              this.router.navigate(['/game/play'], {
                state: {
                  launchUrl: launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: launchTagName,
                  providerId: this.providerId
                }, replaceUrl: false
              });

            }
          );
      }
      else {
        this.http.post(this.funct.ipaddress + 'loginGS/launchGames', this.data, { headers: headers })
          .pipe
          (
            catchError(this.handleError.bind(this))
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
              var launchGameResModel = this.dto.Response;
              this.storage.store('localGamePlayProviderId', this.providerId);
              this.storage.store('localPreviousRoute', 'gameList')
              sessionStorage.setItem('providerId', this.providerId);
              var launchTagName;
              var gamelist = this.storage.retrieve('localLaunchGameList');
              let language = this.storage.retrieve('localLanguage');
              if (language == "my") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_my);
              } else if (language == "th") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_th);
              } else if (language == "zh") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_zh);
              } else {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name);
              }
              this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
              this.gameLoadingone = false;
              this.spinner.hide("gameLoadingone");
              this.bsModalRef.hide();
              this.storage.store('localCloseGameBalance', this.gameUserBalance);
              this.storage.store('localLaunchTagName', launchTagName);
              launchGameResModel.gameUrl =launchGameResModel.gameUrl.replace(/[?&]openinnewtap=1/, '');
              this.router.navigate(['/game/play'], {
                state: {
                  launchUrl: launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: launchTagName,
                  providerId: this.providerId
                }, replaceUrl: false
              });

            }
          );
      }
    }
  }

  goToChrome() {
    this.gameLoadingtwo = true;
    this.spinner.show("gameLoadingtwo");
    let headers = new HttpHeaders();
    this.token = this.storage.retrieve('token');
    headers = headers.set('Authorization', this.token);
    this.gameUserBalance = this.storage.retrieve('localGameBalanceBefore');
    if (this.gameUserBalance == null || this.gameUserBalance == undefined) {
      this.bsModalRef.hide();
      this.toastr.error("", this.translateService.instant("transaction_wait_5sec"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',

      });
      return;
    }
    if (this.gameUserBalance < 1000) {
      var data = {
        "id": this.providerId,
        "mainBalance": this.profileUserBalance,
        "gameBalance": this.gameUserBalance,
        "categoryId": "",
        "name": this.data.providerName,
        "LiveGameLaunch": this.data.list
      }
      this.showTransferDialog(data);
    }
    else {
      if (this.providerId == 14) {
        this.http.post(this.funct.ipaddress + 'shkm/SKMLoginchrome', this.data, { headers: headers })
          .pipe
          (
            catchError(this.handleError.bind(this))
          )
          .subscribe(
            async result => {
              this.dto.Response = {};
              this.dto.Response = result;
              var launchGameResModel = this.dto.Response.data;
              this.storage.store('localGamePlayProviderId', this.providerId);
              this.storage.store('localPreviousRoute', 'gameList')
              sessionStorage.setItem('providerId', this.providerId);
              var launchTagName;

              var gamelist = this.storage.retrieve('localLaunchGameList');
              let language = this.storage.retrieve('localLanguage');
              if (language == "my") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_my);
              } else if (language == "th") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_th);
              } else if (language == "zh") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_zh);
              } else {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name);
              }
              this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
              this.gameLoadingtwo = false;
              this.spinner.show("gameLoadingtwo");
              this.bsModalRef.hide();
              this.storage.store('localCloseGameBalance', this.gameUserBalance);
              this.storage.store('localLaunchTagName', launchTagName);
              this.router.navigate(['/game/play'], {
                state: {
                  launchUrl: launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: launchTagName,
                  providerId: this.providerId
                }, replaceUrl: false
              });
            }
          );
      }
      else {
        this.http.post(this.funct.ipaddress + 'loginGS/launchGamesInChrome', this.data, { headers: headers })
          .pipe
          (
            catchError(this.handleError.bind(this))
          )
          .subscribe(
            async result => {
              this.dto.Response = {};
              this.dto.Response = result;
              var launchGameResModel = this.dto.Response;
              this.storage.store('localGamePlayProviderId', this.providerId);
              this.storage.store('localPreviousRoute', 'gameList')
              sessionStorage.setItem('providerId', this.providerId);
              var launchTagName;

              var gamelist = this.storage.retrieve('localLaunchGameList');
              let language = this.storage.retrieve('localLanguage');
              if (language == "my") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_my);
              } else if (language == "th") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_th);
              } else if (language == "zh") {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name_zh);
              } else {
                launchTagName = this.translateService.instant("game-win-lose-chrome");
                launchTagName = launchTagName.toString().replace("@name", gamelist.name);
              }
              this.storage.store('localOpenNewTap', this.storage.retrieve('localGameBalanceBefore'));
              this.gameLoadingtwo = false;
              this.spinner.show("gameLoadingtwo");
              this.bsModalRef.hide();
              this.storage.store('localCloseGameBalance', this.gameUserBalance);
              this.storage.store('localLaunchTagName', launchTagName);
              this.router.navigate(['/game/play'], {
                state: {
                  launchUrl: launchGameResModel.gameUrl, launchTag: "openinnewtap", launchTagName: launchTagName,
                  providerId: this.providerId
                }, replaceUrl: false
              });
            }
          );
      }
    }
  }

}