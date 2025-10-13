import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Location, LocationStrategy } from '@angular/common';
import isUAWebview from "is-ua-webview";
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { AppVersionService } from 'src/app/shared/service/app-version.service';

declare var require: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  token: any;
  userProfileModel: any;
  isUserLoggedIn = false;
  version: any;
  deviceId: any;
  isWebview: any;
  phoneNumber: any;
  total_points: any;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private Location: LocationStrategy,
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
    private versionService: AppVersionService,) {
    var isWebviewUser = require('is-ua-webview');
    this.isWebview = isWebviewUser(navigator.userAgent);
  }

  ngOnInit(): void {
    this.storage.clear('localThreedIsActive');
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.isUserLoggedIn = this.storage.retrieve('isUserLoggedIn');
   // this.version = require('../../../../../../package.json').version;
     this.versionService.currentVersion$.subscribe(v => {
      this.version = v;
    });
    if (!this.isUserLoggedIn || this.isUserLoggedIn == null || this.isUserLoggedIn == undefined) {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }
    else {
      this.getUserProfile();
    }
    if (this.isWebview) {
      this.deviceId = "mobile";
    }
    else {
      this.deviceId = this.storage.retrieve('localDeviceId');
    }
  }

  loginAccount() {
    if (this.deviceId != null) {
      this.router.navigate(['/login', this.deviceId], { state: { parentLink: "/me-page" }, replaceUrl: false });
      return;
    }
    this.router.navigate(['/login'], { state: { parentLink: "/me-page" }, replaceUrl: false })
  }

  getUserProfile() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = {};
          this.dto.Response = result;
          this.total_points = this.dto.Response.point_wallet + this.dto.Response.referral_point_wallet;
          this.isUserLoggedIn = true;
          this.userProfileModel = this.dto.Response;
          this.phoneNumber = this.dto.Response.phone_no;
          this.getPhoneNumber();
          this.isUserLoggedIn = this.storage.retrieve('isUserLoggedIn');
        });
  }

  getPhoneNumber() {
    if (this.userProfileModel.phone_no != null) {
      this.userProfileModel.phone_no = this.userProfileModel.phone_no.substring(1, 3).toString() +
        this.userProfileModel.phone_no.substring(3, 6).toString() + "*****" + this.userProfileModel.phone_no.substring(this.userProfileModel.phone_no.length - 2, this.userProfileModel.phone_no.length).toString();
    }
  }

  goToResult() {
    this.router.navigate(['/me-page/result'], { state: { type: 'all' }, replaceUrl: false });
  }

  bankAccounts() {
    this.router.navigate(['/me-page/withdrawl-account-list'], { replaceUrl: false });
  }

  PointHistory() {
    this.router.navigate(['/me-page/points-history'], { replaceUrl: false });
  }

  betHistory() {
    this.storage.store("localHistoryType", "2D")
    this.router.navigate(['/me-page/bet-history'], { state: { type: '2D', pagefrom: 'mepage' }, replaceUrl: false });
  }

  refreshPage() {
    if (!this.isUserLoggedIn || this.isUserLoggedIn == null || this.isUserLoggedIn == undefined) {
      this.common.refreshLoading = true;
      this.spinner.show("refreshLoading");
      setTimeout(() => {
        this.common.refreshLoading = false;
        this.spinner.hide("refreshLoading");
      }, 1000);
    }
    else {
      this.ngOnInit();
      setTimeout(() => {
        this.common.refreshLoading = false;
        this.spinner.hide("refreshLoading");
      }, 3000);
    }
  }

  changeName() {
    var name = this.userProfileModel.name;
    if (name != null && name.length > 30) {
      name = name.substring(0, 20) + " ...";
      return name;
    }
    else {
      return name;
    }
  }

  gotofeedback() {
    this.router.navigate(['/me-page/feedback'], { state: { type: 'feedback' }, replaceUrl: false });
  }

}
