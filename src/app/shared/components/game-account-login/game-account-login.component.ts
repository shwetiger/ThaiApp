import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable, Subscription, throwError, timer } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, ignoreElements, retry } from 'rxjs/operators';
import { Location } from '@angular/common';
import { HandleErrorMessageService } from '../../service/handle-error-message.service';
import { CommonService } from '../../service/common.service';
import { DtoService } from '../../service/dto.service';
import { UtilService } from '../../service/util.service';
import { FunctService } from '../../service/funct.service';
import { GameWalletInOutComponent } from 'src/app/shared/dialog/game-wallet-in-out/game-wallet-in-out.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'game-account-login',
  templateUrl: './game-account-login.component.html',
  styleUrls: ['./game-account-login.component.scss']
})
export class GameAccountLoginComponent implements OnInit {
  token: any;
  userProfileModel: any;
  isUserLoggedIn;
  showAmount = true;
  showBalance: any = false;
  deviceId: any;
  providerId: any;
  gameUserBalance: any = [];
  parentLink: any;
  gameList: any;
  //test start
  bsModalRef: BsModalRef;
  data: any;
  gameproviderlist: any;
  //end test
  @Input() gameProviderId

  notiCount: number;
  constructor(
    private modalService: BsModalService,
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private http: HttpClient,
    private util: UtilService,
    private route: ActivatedRoute,
    private router: Router,
    private storage: LocalStorageService,
    private funct: FunctService,
    private _location: Location,
  ) {
    this.isUserLoggedIn = this.storage.retrieve('isUserLoggedIn');
  }
  ngOnInit(): void {
    this.common.closeLoadingSubmit = true;
    this.spinner.show('closeLoadingSubmit');
    this.storage.clear("localGameWalletTransfer");
    var localnoti = this.storage.retrieve('localNewNotiCount');
    if (localnoti != null && this.isUserLoggedIn) {
      this.notiCount = this.storage.retrieve('localNewNotiCount');
    } else {
      this.notiCount = 0;
    }
    this.gameProviderId = this.storage.retrieve('localGameProviderId');
    // this.getGameList();
    this.getGameUserBalance();
    this.deviceId = this.storage.retrieve('localDeviceId');
    this.showAmount = this.storage.retrieve('showAmount');

    this.showAmount = this.showAmount == null ? false : this.showAmount;
    // this.userProfileModel='';   
    this.token = this.storage.retrieve('token');
    if (this.token == null) {
      this.storage.store('token', "");
      this.userProfileModel = null;
      this.storage.store('isUserLoggedIn', false);
    }
    this.isUserLoggedIn = this.storage.retrieve('isUserLoggedIn');
    if (this.storage.retrieve('localShowBalance') == null) {
      this.storage.store('localShowBalance', true);
    }
    this.getUserProfile();
    this.showAmount = this.storage.retrieve('localShowBalance');
    if (!this.showAmount) {
      this.showBalance = "*****";
      return;
    }
    //test
    this.data = {
      display_name: '',
      providerId: ''
    }
  }
  loginAccount() {
    if (this.deviceId != null) {
      this.router.navigate(['/login', this.deviceId]);
      return;
    }
    this.router.navigate(['/login'])
  }
  // handleError(error: HttpErrorResponse){

  //   if(error.status == 0){
  //     this.toastr.error("", 'check your internet connection', {
  //       timeOut: 3000,
  //       positionClass: 'toast-top-center',
  //       });
  //   }

  //   if(error.status == 423)
  //   {

  //     this.toastr.error("", this.translateService.instant("youNeedLogin"), {
  //       timeOut: 3000,
  //       positionClass: 'toast-top-center',
  //       });
  //       this.storage.clear('token');
  //       this.storage.clear('isUserLoggedIn');
  //   }

  //   if(error.status == 400)
  //   {
  //      this.toastr.error("Bad request.", 'Invalid!', {
  //       timeOut: 3000,
  //       positionClass: 'toast-top-center',
  //       });
  //   }


  //   return throwError(error);
  //   }

  getUserProfile() {
    this.token = this.storage.retrieve('token');
    if (this.token != null) {
      let headers = new HttpHeaders();
      headers = headers.set('Authorization', this.token);
      this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
        .pipe(
          catchError(this.handleErrorMessage.handleError.bind(this, ''))
        )
        .subscribe(
          result => {
            this.dto.Response = {};
            this.dto.Response = result;
            this.userProfileModel = this.dto.Response;
            if (this.showAmount) {
              this.showBalance = this.userProfileModel.balance;
            }

          });
      this.spinner.hide();
    }

  }

  showPassword(show: boolean) {
    this.storage.store('showAmount', show);
    this.showAmount = show;
    this.storage.store('localShowBalance', this.showAmount);
    if (this.showAmount) {
      this.showBalance = this.userProfileModel.balance;

    }
  }

  getPhoneNumber(phone_no: any) {
    if (phone_no != null) {
      return phone_no = phone_no.substring(1, 3).toString() +
        phone_no.substring(3, 6).toString() + "*****" + phone_no.substring(phone_no.length - 2, phone_no.length).toString();
      // return phone_no ="*******" +
      //     phone_no.substring(
      //       phone_no.length - 4,phone_no.length).toString();
    }
  }

  async getGameUserBalance() {
    this.gameUserBalance = [];
    this.token = this.storage.retrieve('token');
    for (let i = 0; i < this.gameProviderId.length; i++) {
      let config = {
        headers: { 'Authorization': this.token },
        params: { 'providerId': this.gameProviderId[i] },
      }
      const axios = require('axios').default;
      if (this.gameProviderId == 14) {
        this.gameUserBalance = [];
        await axios.get(this.funct.ipaddress + 'shkm/getBalanceV1', config)
          .then((res) => {
            this.isUserLoggedIn = true;
            this.gameUserBalance.push({ providerId: this.gameProviderId[i], balance: parseInt(res.data.balance), dataUrl: res.data.dataUrl, name: res.data.display_name });
            this.common.closeLoadingSubmit = false;
            this.spinner.hide('closeLoadingSubmit');
            return res.data.balance;

          })
          .catch((error) => {
            this.common.closeLoadingSubmit = false;
            this.spinner.hide('closeLoadingSubmit');
            if (error.response) {

              return
            }
          });
      }
      else {
        let attempt = 0;
        const maxRetry = 3;

        while (attempt < maxRetry) {
          try {
            const res = await axios.get(this.funct.ipaddress + 'loginGS/getBalanceV129', config);

            if (res.data.isSuccess === false && res.data.message === 'The request is too fast, please wait 5 seconds before operating again') {
              this.common.closeLoadingSubmit = true;

              this.spinner.show('closeLoadingSubmit');
              console.warn("Too fast, retrying in 1 second...");
              await new Promise(resolve => setTimeout(resolve, 2500)); // wait 1 second
              attempt++;
              continue; // retry
            }

            this.isUserLoggedIn = true;
            this.gameUserBalance.push({
              providerId: this.gameProviderId[i],
              balance: parseInt(res.data.data.balance),
              dataUrl: res.data.data.dataUrl,
              name: res.data.data.display_name
            });
            break; // exit retry loop if successful
          } catch (error) {
            console.error("API error:", error);
            break; // don't retry on network or server error
          } finally {
            this.common.closeLoadingSubmit = false;
            this.spinner.hide('closeLoadingSubmit');
            this.storage.store('LocalgameUserBalance', JSON.stringify(this.gameUserBalance));
          }
        }
      }

    }

  }

  selectGameListId(providerId, name, tranfer) {
    this.storage.store('localGameProviderId', this.gameProviderId);
    this.router.navigate(['/game/wallet'], { state: { providerType: providerId, gameName: name, gameType: tranfer }, replaceUrl: false });
  }

  gameTransfer(providerId: number, providerName: string, action: string) {

    this.getGameProviderList().subscribe((result: any) => {
      this.gameproviderlist = result;

      const data = this.gameproviderlist.find(x => x.id === parseInt(providerId.toString(), 10));
      if (data?.isMaintenance) {
        this.toastr.error("", this.translateService.instant("transfer_maintenance_alert"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }

      this.storage.store('localGameProviderId', this.gameProviderId);
      this.data.display_name = providerName;
      this.data.providerId = providerId;
      const list = { list: this.data, tranfer: action };
      this.showGameInOutDialog(list);
    });
  }

  getGameProviderList(): Observable<any> {
    const headers = new HttpHeaders();
    return this.http.get(this.funct.ipaddress + 'gameProvider/getGameProviderList', { headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      );
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
  //end of test mh

  goToNotiList() {
    this.router.navigate(['/noti'], { replaceUrl: false });
  }
  changeName() {
    var name = this.userProfileModel?.name;
    if (name != null && name.length > 30) {
      name = name.substring(0, 20) + " ...";
      return name;
    }
    else {
      return name;
    }
  }

  goToProfileDetail() {
    this.router.navigate(['/me-page/profile-edit'], { replaceUrl: false })
  }

  async getGameList() {
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('providerId', this.gameProviderId[0]);
    this.http.get(this.funct.ipaddress + 'loginGS/GetGsGameList', { headers: headers, params: params })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        async result => {

          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = {};
          this.dto.Response = result;
          this.gameList = this.dto.Response;
          this.storage.store('localgameList' + this.providerId, this.gameList);

        }
      );
  }
  // }
}
