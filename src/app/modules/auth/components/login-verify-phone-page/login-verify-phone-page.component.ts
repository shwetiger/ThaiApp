import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { Location } from '@angular/common';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { getJSON } from 'jquery';

@Component({
  selector: 'app-login-verify-phone-page',
  templateUrl: './login-verify-phone-page.component.html',
  styleUrls: ['./login-verify-phone-page.component.scss']
})
export class LoginVerifyPhonePageComponent implements OnInit {

  active: string;
  supportLanguages = ['en', 'my', 'th', 'zh'];
  albumList: any;
  loginModel: any;
  phone_no: any;
  password: any;
  app_version: any;
  fcmtoken: any;
  deviceId: any;
  ipAddress: any;
  token: any;
  prefix = '+95';//"+95";
  localRegisterCountryCode: any;
  regularExpression: any;
  activeLang: any;
  actionType: any;
  phoneNumber: any;
  prefixPhoneNumber: any;
  modalId: any;
  newDeviceOtpSms: any;
  updateDeviceId: any;
  recaptcha: boolean = false;
  SMSprovider: any;
  SMSoperatorList: any;
  Usefirebase: boolean = false;
  Operatorcodelist: any;
  MPTarraylist: any = ['4', '2', '8', '5'];
  OoredooList: any = ['9'];
  MYTELList: any = ['6']
  TelenorList: any = ['7']
  phoneValue = history.state.phoneNumber;
  regularExpressionPhone = "^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$";
  smstype: any;
  functionName:string ='New Device OTP'
  Timer:any;
  emailaddress:any;

  constructor(
    public common: CommonService,
    private handleErrorMessage: HandleErrorMessageService,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private http: HttpClient,
    private util: UtilService,
    private router: Router,
    private storage: LocalStorageService,
    private funct: FunctService,
    private _location: Location,) {
    this.actionType = history.state.actionType;
    this.phoneNumber = history.state.phoneNumber;
    this.translateService.addLangs(this.supportLanguages);
    if (this.storage.retrieve('localLanguage') == null || this.storage.retrieve('localLanguage') == '') {
      this.storage.store('localLanguage', 'en');
      this.activeLang = this.storage.store('localLanguage', 'en');
    }
    else {
      this.translateService.setDefaultLang(this.storage.retrieve('localLanguage'));
      this.activeLang = this.storage.retrieve('localLanguage');
    }
  }

  ngOnInit(): void {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    var fcmtoken = this.storage.retrieve('localFcmtoken');
    var fcm;
    if (fcmtoken != null) {
      fcm = fcmtoken;
    }
    else {
      fcm = 'fcmtoken';
    }
    this.loginModel = {
      phone_no: '',
      password: '',
      app_version: '',
      fcmtoken: fcm,
      deviceId: '',
      ipAddress: ''
    }
    this.updateDeviceId = {
      deviceId: '',
      phone_no: '',
      ipAddress: ''
    }
    this.prefix = this.storage.retrieve('localPhonePrefix');
    this.getIpAddress();
    this.getsmstype();
  }

  getIpAddress() {
    this.http.get("http://api.ipify.org/?format=json").subscribe((res: any) => {
      this.loginModel.ipAddress = res.ip;
    });
  }

  checkPhoneNumber() {
    $("#phoneErr").html("");
    var prefix = this.storage.retrieve('localPhonePrefix');
    if (this.phoneValue.length == 0) {
      var phoneRequired = this.translateService.instant("requiredFiled");
      phoneRequired = phoneRequired.toString().replace("@value", this.translateService.instant("phonenumbererr"));
      $("#phoneErr").html(phoneRequired);
      return false;
    }

    if (prefix == "+95") {
      if (!this.phoneValue.startsWith("0")) {
        var checkNumber = this.translateService.instant("not-allowed-phone");
        checkNumber = checkNumber.toString().replace("@number", "09");
        $("#phoneErr").html(checkNumber);
        return false;
      }
    }
    if (prefix == "+66") {
      if (!this.phoneValue.startsWith("0")) {
        var checkNumber = this.translateService.instant("not-allowed-phone");
        checkNumber = checkNumber.toString().replace("@number", "06, 08, 09");
        $("#phoneErr").html(checkNumber);
        return false;
      }
    }

    let mobNumber = RegExp(this.regularExpressionPhone); // /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/;

    if (!mobNumber.test(this.phoneValue)) {
      $("#phoneErr").html(this.translateService.instant("phoneInvaild"));
      return false;
    }
    else {
      $("#phoneErr").html("");
      return true;
    }
  }

  getOtp(): void {
    this.common.submitLoading = true;
    this.spinner.show('submitLoading');
    if (!this.checkPhoneNumber()) {
      this.stopLoading();
      return;
    }
    const phoneValue = this.storage.retrieve('localPhoneValue');
    if (!phoneValue) {
      this.stopLoading();
      return;
    }
    const phoneNumber = this.formatPhoneNumber(phoneValue, this.prefix);
    this.http
      .get<any>(
        `${this.funct.ipaddress}v1/user/getNewDeviceOTP?phoneNo=${phoneNumber}`
      )
      .pipe(catchError(this.handleErrorMessage.handleError.bind(this, '')))
      .subscribe(response => {
        this.stopLoading();
        this.dto.Response = response;
        if (response?.errorCode === '000' && response?.status === true) {
          this.handleSuccessOTP(response);
          return;
        }
        if (response?.status === 'Error') {
          this.handleErrorOTP(response);
        }
      });
  }


  private formatPhoneNumber(phone: string, prefix: string): string {
    return phone.startsWith('0')
      ? prefix + phone.substring(1)
      : prefix + phone;
  }

  private stopLoading(): void {
    this.common.submitLoading = false;
    this.spinner.hide('submitLoading');
  }

  private async handleSuccessOTP(response: any): Promise<void> {
    this.storage.store('localNewDeviceOtpSms', response);
     let requestIdList = this.storage.retrieve('requestId');
    if (requestIdList) {
      requestIdList += ',' + response.request_id;
    } else {
      requestIdList = response.request_id;
    }
    this.storage.store('requestId', requestIdList);
    await this.getCountDown();
    this.storage.store('actionType', 'NEWDIVICE');
    this.storage.store('formPageType', 'NEWDIVICE');
    this.router.navigate(
      ['/login/otp'],
      {
        replaceUrl: true
      }
    );
    if (response.statusCode !== 200 || !response.body) {
      return;
    }
    const message = response.body.toString().trim();
    if (message === 'Not valid OTP code') {
      this.toastr.error('Bad request.', 'OTP is not correct', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }

    if (message === 'Try Again') {
      this.toastr.error('Bad request.', message, {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
  }

  private async handleErrorOTP(response: any): Promise<void> {
    const message: string = response.message || '';
    if (message.includes('180 seconds')) {
      await this.getCountDown();
      this.router.navigate(
        ['/login/otp'],
        {
          replaceUrl: true
        }
      );
      return;
    }

    if (message.includes('60 seconds')) {
      this.toastr.error(
        '',
        this.translateService.instant('otp-request-time-onemin'),
        {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        }
      );
      this.storage.clear('Timer');
    }
  }

  async getCountDown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.clear('Timer');
      const phoneNumber = this.formatPhoneNumber(this.phoneValue, this.prefix);
      let headers = new HttpHeaders();
      this.http.post(
        this.funct.ipaddress +
        'countdown/get?phoneno=' + phoneNumber +
        '&email=' + this.emailaddress +
        '&type=' + this.smstype +
        '&functionName=' + this.functionName,
        {},
        { headers: headers }
      )
        .pipe(catchError(this.handleErrorMessage.handleError.bind(this, '')))
        .subscribe({
          next: (result: any) => {
            this.dto.Response = result;
            if (this.dto.Response.status === 'Success') {
              const data = this.dto.Response.data;
              this.Timer = data.remainingSeconds;
              this.storage.store('Timer', this.Timer);
            }

            resolve();
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }

  selectLang(lang: string) {
    this.translateService.use(lang);
    this.storage.store('localLanguage', lang);
    this.active = 'active';
  }

  GetSMSProvider() {
    this.http.get(this.funct.ipaddress + 'user/getSMSProvider')
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.SMSprovider = this.dto.Response.message;
          this.storage.store('SMSprovider', this.SMSprovider);
        });
  }

  getsmstype() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    const phoneValue = this.storage.retrieve('localPhoneValue');
    const phoneNumber = this.formatPhoneNumber(phoneValue, this.prefix);
    this.http.get(this.funct.ipaddress + 'user/userSmsType?phone_no=' +phoneNumber, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.emailaddress=this.dto.Response.email;
          this.smstype = this.dto.Response.smstype;
        });
  }
}
