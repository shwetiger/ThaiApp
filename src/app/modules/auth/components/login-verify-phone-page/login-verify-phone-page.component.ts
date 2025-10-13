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
import { AngularFireAuth } from '@angular/fire/auth';

import firebase from 'firebase';
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
    private _location: Location,
    private afAuth: AngularFireAuth,) {

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
    this.GetSMSProvider();
    this.getSMSOperators();
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

  getOtp() {
    if (this.Usefirebase == true && this.smstype == 'sms_poh') {
      this.signInWithPhoneNumber();
    }
    else {
      this.common.submitLoading = true;
      this.spinner.show("submitLoading");
      let phCheck = this.checkPhoneNumber();
      if (phCheck == false) {
        return;
      }
      this.phoneValue = this.storage.retrieve('localPhoneValue');
      let phoneNumber;
      if (this.phoneValue.startsWith("0")) {
        phoneNumber = this.prefix + this.phoneValue.substring(
          1, this.phoneValue.length);
      }
      if (!this.phoneValue.startsWith("0")) //XXXX 
      {
        phoneNumber = this.prefix + this.phoneValue;
      }
      let headers = new HttpHeaders();
      this.http.get(this.funct.ipaddress + 'user/getNewDeviceOTP?phoneNo=' + phoneNumber, { headers: headers })
        .pipe(
          catchError(this.handleErrorMessage.handleError.bind(this, ''))
        )
        .subscribe(
          result => {
            this.common.submitLoading = false;
            this.spinner.hide("submitLoading");
            this.dto.Response = result;
            if (this.dto.Response.errorCode === '000' && this.dto.Response.status === true) {
              this.storage.store('localNewDeviceOtpSms', this.dto.Response);
              this.newDeviceOtpSms = this.storage.retrieve('localNewDeviceOtpSms');
              this.storage.store("otptype", 'smsotp');
              this.storage.store("actionType", 'NEWDIVICE')
              this.storage.clear("Timer");
              this.storage.store("formPageType", 'NEWDIVICE');
              this.router.navigate(['/login/otp'], { state: { actionType: 'NEWDIVICE', otptype: 'smsotp' }, replaceUrl: true });
              if (this.dto.Response.statusCode == 200) {
                if (this.dto.Response.body.split('').trim() == "Not valid OTP code") {
                  this.toastr.error("Bad request.", 'OTP is not correct', {
                    timeOut: 3000,
                    positionClass: 'toast-top-center',
                  });
                  return null;
                }
                if (this.dto.Response.body.split('').trim() == "Try Again") {
                  this.toastr.error("Bad request.", this.dto.Response.body.toString(), {
                    timeOut: 3000,
                    positionClass: 'toast-top-center',
                  });
                  return null;
                }
                return this.newDeviceOtpSms;
              }
            }
            else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('180 seconds')) {
              this.router.navigate(['/login/otp'], { state: { actionType: 'NEWDIVICE', otptype: 'smsotp' }, replaceUrl: true });
            }
            else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('60 seconds')) {
              this.toastr.error("", this.translateService.instant("otp-request-time-onemin"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
              });
              this.storage.clear('Timer');
              return null;
            }

          }
        );
    }
  }

  selectLang(lang: string) {
    this.translateService.use(lang);
    this.storage.store('localLanguage', lang);
    this.active = 'active';
  }

  UpdateNewDeviceId() {
    let headers = new HttpHeaders();
    this.updateDeviceId.phone_no = this.storage.retrieve('localLoginModel').phone_no;
    this.updateDeviceId.ipAddress = this.storage.retrieve('localLoginModel').ipAddress;
    this.updateDeviceId.deviceId = this.storage.retrieve('localLoginModel').deviceId;
    this.http.post(this.funct.ipaddress + 'user/updateDeviceIdforFirebaseMessing', this.updateDeviceId, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, 'otp'))
      )
      .subscribe(
        result => {
          this.common.submitLoading = false;
          this.spinner.hide("submitLoading");
          this.dto.Response = result;
          if (this.dto.Response.status == 401) {
            if (this.dto.Response.code == 0) {
              this.toastr.error("", this.translateService.instant('invalid-otp-code'),
                {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-center',
                });
              return;
            } if (this.dto.Response.code == 10) {
              this.toastr.error("", this.translateService.instant('otp-token-expired'),
                {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-center',
                });
              return;
            }
          }

          var loginDevice = this.storage.retrieve('localForgetLoginDevice');
          if (this.dto.Response.status == "Success") {
            if (loginDevice == 'loginDevice') {
              this.goToAutoLogin();
              this.storage.clear('localForgetLoginDevice');
            }
            else {
              this.storage.clear('localNewDeviceOtpSms');
              this.autoLogin();
              return;
            }
          }
          else {
            this.toastr.error("Tip", this.dto.Response.message.toString(), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return false;
          }
        }
      );
  }

  autoLogin() {
    var autoLoginModal = this.storage.retrieve('localLoginModel');
    let headers = new HttpHeaders();
    this.http.post(this.funct.ipaddress + 'Authenticate/login', autoLoginModal, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        async result => {
          this.dto.Response = result;
          if (this.dto.Response.status != 'Error') {
            var token = result["token"];
            if (token != null) {
              this.util.isLogged = true;
              this.dto.token = "Bearer " + token + "";
              this.storage.store('token', this.dto.token);
              this.storage.store('isUserLoggedIn', this.util.isLogged);
              this.storage.clear('localLoginModel');
              this._location.back();
              this._location.back();

            }
          }
          else {
            this.spinner.hide();
            this.toastr.error('', this.dto.Response.message, {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }
        }
      );
  }

  async goToAutoLogin() {
    let headers = new HttpHeaders();
    var loginModel = this.storage.retrieve('localLoginModel');
    this.http.post(this.funct.ipaddress + 'Authenticate/login', loginModel, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.storage.clear('localLoginModel');
          this.dto.Response = result;
          if (this.dto.Response.status != 'Error') {
            var token = result["token"];
            if (token != null) {
              this.util.isLogged = true;
              this.dto.token = "Bearer " + token + "";
              this.storage.store('token', this.dto.token);
              this.storage.store('isUserLoggedIn', this.util.isLogged);
              this.storage.clear('localLoginModel');
              this._location.back();
              this._location.back();
              this._location.back();
            }
          }
          else {
            this.toastr.error(this.dto.Response.message, 'Invalid!', {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }
        }
      );
  }

  signInWithPhoneNumber() {
    this.recaptcha = true;
    let phCheck = this.checkPhoneNumber();
    if (phCheck == false) {
      return;
    }
    this.phoneValue = this.storage.retrieve('localPhoneValue');

    let phoneNumber;
    if (this.phoneValue.startsWith("0")) {
      phoneNumber = this.prefix + this.phoneValue.substring(
        1, this.phoneValue.length);
    }
    if (!this.phoneValue.startsWith("0")) //XXXX 
    {
      phoneNumber = this.prefix + this.phoneValue;
    }
    // const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container'); // Make sure you have an element with id 'recaptcha-container'
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
      }
    });
    this.afAuth.signInWithPhoneNumber(phoneNumber, appVerifier)
      .then(confirmationResult => {
        this.storage.store('verificationCode', confirmationResult.verificationId)
        this.storage.store("otptype", 'firebaseotp');
        this.storage.store("actionType", 'NEWDIVICE')
        this.storage.clear("Timer");
        this.storage.store("formPageType", 'NEWDIVICE');
        this.router.navigate(['/login/otp'], { state: { actionType: 'NEWDIVICE', otptype: 'firebaseotp' }, replaceUrl: true });
      })
      .catch(error => {
        this.recaptcha = false;
        this.toastr.error("", error.message,
          {
            timeOut: 2000,
            positionClass: 'toast-bottom-center',
          });
        console.error('Error verifying phone number:', error);
      });
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

  getSMSOperators() {
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    var phoneno = this.phoneValue.substring(2, this.phoneValue.length);
    this.http.get(this.funct.ipaddress + 'user/getSMSOperators')
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.SMSoperatorList = this.dto.Response;
          if (this.SMSoperatorList != undefined || this.SMSoperatorList != null || this.SMSoperatorList != "") {
            for (let i = 0; i < this.SMSoperatorList.length; i++) {
              if (this.SMSoperatorList[i].operatorType == "MPT") {
                for (let i = 0; i < this.MPTarraylist.length; i++)
                  if (phoneno.startsWith(this.MPTarraylist[i])) {
                    this.Usefirebase = true;
                  }
              }
              else if (this.SMSoperatorList[i].operatorType == "Ooredoo") {
                for (let i = 0; i < this.OoredooList.length; i++)
                  if (phoneno.startsWith(this.OoredooList[i])) {
                    this.Usefirebase = true;
                  }
              }
              else if (this.SMSoperatorList[i].operatorType == "MYTEL") {
                for (let i = 0; i < this.MYTELList.length; i++)
                  if (phoneno.startsWith(this.MYTELList[i])) {
                    this.Usefirebase = true;
                  }
              }
              else if (this.SMSoperatorList[i].operatorType == "Telenor") {
                for (let i = 0; i < this.TelenorList.length; i++)
                  if (phoneno.startsWith(this.TelenorList[i])) {
                    this.Usefirebase = true;
                  }
              }
            }
          }
          else {
            return;
          }
        });
  }

  getsmstype() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'user/userSmsType?phone_no=' + this.phoneNumber, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.smstype = this.dto.Response.smstype;
        });
  }
}
