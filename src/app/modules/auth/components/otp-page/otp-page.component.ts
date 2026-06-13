import { Component, OnInit, ViewChild } from '@angular/core';
import { CodeInputComponent } from 'angular-code-input';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, retry } from 'rxjs/operators';
import { Location } from '@angular/common';
import isUAWebview from "is-ua-webview";
import { FunctService } from 'src/app/shared/service/funct.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { NavigationService } from 'src/app/shared/service/navigation.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
declare var require: any;

@Component({
  selector: 'app-otp-page',
  templateUrl: './otp-page.component.html',
  styleUrls: ['./otp-page.component.scss']
})
export class OtpPageComponent implements OnInit {
  @ViewChild('codeInput') codeInput !: CodeInputComponent;
  OtpSms: any;
  otpcode: any;
  phoneNumber: any;
  time: number = 180;
  otpPhoneNumber: any;
  updateDeviceId: any;
  updateDeviceIdforfirebase: any;
  deviceId: any;
  phone_no: any;
  ipAddress: any;
  guid: any;
  request_id: any;
  code: any;
  password: any;
  token: any;
  bankAccountList = [];/*XXX*/
  localInsertAccountOtpSms: any;
  viberorsmsotptype: any;
  otpheader: any;
  otpdesciption: any;
  smstype: any;
  commonFormtype: any;
  smssender: any;
  userProfile: any;
  isclickResendButton = false;
  openUrl: any;
  checkOtpModel: { code: string; request_id: string; phone_no: string; register_key: string; };
  isWebview: boolean;
  coundDown: number;
  verify: any;
  recaptcha: boolean = false;
  SMSprovider: any;
  otptype: any;
  changeoptprocess: boolean = false;
  registerottype: any;
  emailaddress: any;
  servicePhoneList: any;
  service_transaction: any;
  otptitleshow: boolean;
  firebaseUI: boolean;
  smsUI: boolean;
  submitLoading: boolean = false;
  showResend = false;
  targetTime: any;
  intervalId: any;
  remainingSeconds: any;
  type: any;
  functionName: string;
  interval: any;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    public navigation: NavigationService,
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
    this.common.actionType = history.state.actionType;
    this.otptype = history.state.otptype;
    this.localInsertAccountOtpSms = history.state.localInsertAccountOtpSms;
    this.bankAccountList = history.state.bankAccountList;
    this.deviceId = this.storage.retrieve('localDeviceId');
    this.isWebview = isUAWebview(navigator.userAgent)
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

  async ngOnInit() {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    this.remainingSeconds = Number(this.storage.retrieve('Timer')) || 0;
    this.coundDown = this.remainingSeconds;
    this.startCountdown(this.remainingSeconds);
    this.changeoptprocess = this.storage.retrieve('changeotpprocess');
    this.registerottype = this.storage.retrieve('registeropttype');
    this.emailaddress = this.storage.retrieve('localEmail')
    this.commonFormtype = this.storage.retrieve('formPageType')
    if (this.storage.retrieve('localNewDeviceOtpSms') != null) {
      if (this.storage.retrieve('localNewDeviceOtpSms').number != null) {
        this.phoneNumber = "+" + this.storage.retrieve('localNewDeviceOtpSms').number;
      }
    }
    if (this.storage.retrieve('localInsertAccountOtpSms') != null) {
      if (this.storage.retrieve('localInsertAccountOtpSms').number != null) {
        this.phoneNumber = "+" + this.storage.retrieve('localInsertAccountOtpSms').number;
      }
    }
    if (this.storage.retrieve('localPhoneValue') != null) {
      var phone = this.storage.retrieve('localPhoneValue');
      var prefix = this.storage.retrieve('localPhonePrefix')
      if (phone.startsWith('0')) {
        this.phoneNumber = prefix + phone.substring(1, phone.length);
      }
      else {
        this.phoneNumber = prefix + phone;
      }
    }
    await this.getotptype();
    this.type =
      this.commonFormtype === 'register'
        ? this.registerottype
        : this.smstype;
    switch (this.commonFormtype) {
      case 'register':
        this.functionName = 'Register OTP'
        break;

      case 'NEWDIVICE':
        this.functionName = 'New Device OTP'
        break;

      case 'forgetPassword':
        this.functionName = 'Forgot Password OTP'
        break;

      case 'withdrawaladd':
        this.functionName = 'Withdrawal OTP'
        break;

      default:
        this.functionName = ''
    }

    this.updateDeviceId = {
      deviceId: '',
      phone_no: '',
      ipAddress: '',
      guid: '',
      request_id: 0,
      code: '',
    }
    this.updateDeviceIdforfirebase = {
      deviceId: '',
      phone_no: '',
      ipAddress: ''
    }
    this.common.actionType = this.storage.retrieve('actionType');
    this.otptype = this.storage.retrieve('otptype');
    this.verify = this.storage.retrieve('verificationCode');
    this.localInsertAccountOtpSms = this.storage.retrieve('localInsertAccountOtpSms');
    this.bankAccountList = this.storage.retrieve('localInsertBankAccountList');
    this.checkOtpModel = {
      code: '',
      request_id: '',
      phone_no: '',
      register_key: ''
    }
    this.listServicePhone();
  }

  onCodeCompleted(i: number) {
    this.otpcode = i;
    this.validateOtp();
  }

  validateOtp() {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    if (!this.otpcode || this.otpcode.length < 6) {
      $("#passErr").html(this.translateService.instant("otp_required"));
      return false;
    }
    else {
      $("#passErr").html("");
      return true;
    }
  }

  // startCountdown(seconds) {
  //   let counter = seconds;
  //   const interval = setInterval(() => {
  //     this.coundDown = counter;
  //     counter--;
  //     if (counter < -1) {
  //       clearInterval(interval);
  //       this.coundDown = counter;
  //     }
  //     this.storage.store("Timer", this.coundDown)
  //   }, 1000);
  // }

  startCountdown(seconds: number) {
    // 🔹 expire time (milliseconds)
    const expireAt = Date.now() + seconds * 1000;
    // 🔹 storage ထဲမှာ expireAt ကိုသိမ်း (app restart / background အတွက်)
    this.storage.store('expireAt', expireAt);

    this.interval = setInterval(() => {

      const now = Date.now();

      const remainingSeconds = Math.max(
        -1,
        Math.floor((expireAt - now) / 1000)
      );

      this.coundDown = remainingSeconds;
      this.storage.store('Timer', remainingSeconds);

      if (remainingSeconds <= -1) {
        clearInterval(this.interval);
        this.coundDown = remainingSeconds;
      }

    }, 1000);
  }

  getCountDown() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.post(this.funct.ipaddress + 'countdown/get?phoneno=' + this.phoneNumber + '&email=' + this.smssender + '&type=' + this.type + '&functionName=' + this.functionName, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, 'otp'))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          if (this.dto.Response.status === 'Success') {
            const data = this.dto.Response.data;
            this.remainingSeconds = data.remainingSeconds;
            this.startCountdown(this.remainingSeconds)
          }
        })
  }

  SubmitOtp() {
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");
    this.storage.clear("changeoptprocess");
    let checkOPTINput = this.validateOtp();
    if (!checkOPTINput) {
      return;
    }
    if (this.common.actionType == "insertAccount") {
      if (this.localInsertAccountOtpSms.request_id != null) {
        this.request_id = this.storage.retrieve('requestId')
        this.token = this.storage.retrieve('token');
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', this.token);
        this.OtpSms = [];
        this.http.get(this.funct.ipaddress + 'transaction/withdrawcheckOTP?code=' + this.otpcode + '&request_id=' + this.request_id, { headers: headers })
          .pipe(
            catchError(this.handleErrorMessage.handleError.bind(this, 'otp'))
          )
          .subscribe(
            result => {
              this.dto.Response = result;
              this.OtpSms = this.dto.Response;
              this.common.submitLoading = false;
              this.spinner.hide("submitLoading");
              if (this.dto.Response.status == 401) {
                if (this.dto.Response.code == 0) {
                  this.toastr.error("", this.translateService.instant('invalid-otp-code'),
                    {
                      timeOut: 3000,
                      positionClass: 'toast-bottom-center',
                    });
                  return;
                }
                if (this.dto.Response.code == 11) {
                  this.common.submitLoading = false;
                  this.spinner.hide("submitLoading");
                  this.toastr.error("", this.translateService.instant('otp-token-expired'),
                    {
                      timeOut: 3000,
                      positionClass: 'toast-bottom-center',
                    });
                  return;
                }
              }
              if (this.OtpSms != null) {
                if (this.OtpSms.status == true) {
                  this.http.post(this.funct.ipaddress + 'userbankaccount/insertuserBankAccount', this.bankAccountList, { headers: headers })
                    .pipe(
                      catchError(this.handleErrorMessage.handleError.bind(this, ''))
                    )
                    .subscribe(
                      result => {
                        this.dto.Response = result;
                        this.toastr.success("", this.translateService.instant('bankacc_addsuccess'),
                          {
                            timeOut: 3000,
                            positionClass: 'toast-top-center',
                          });
                        this.storage.store('otpSms', "insert");
                        this.storage.store('successmsg', 'withdrawalsuccess');
                        var insertAccount = this.storage.retrieve("localInsertAccount");
                        this.storage.clear("localInsertAccount");
                        this.storage.clear('localInsertAccountOtpSms');
                        this.storage.clear('bankAccountList');
                        this.storage.clear('requestId');
                        if (insertAccount == 'insertAccount') {
                          this.router.navigate(['/wallet/withdraw-change-acc'], { replaceUrl: true });
                        }
                        else {
                          history.go(-2);
                        }
                      }
                    );
                  this.storage.clear('localInsertAccountOtpSms');
                  return true;
                }
                else if (this.OtpSms.status == 401) {
                  this.toastr.error("", 'The OTP Token has expired',
                    {
                      timeOut: 3000,
                      positionClass: 'toast-top-center',
                    });
                  return false;
                }
                else if (this.OtpSms.status == 'Error' && this.OtpSms.message == 'too many request') {
                  this.toastr.error("", this.translateService.instant('transaction_wait_5sec'),
                    {
                      timeOut: 3000,
                      positionClass: 'toast-top-center',
                    });
                  return false;
                }
                else {
                  this.toastr.error("", 'OTP is not correct',
                    {
                      timeOut: 3000,
                      positionClass: 'toast-top-center',
                    });
                  return false;
                }
              }
            }
          );
      }
      return;
    }
    if (this.otpcode != null && this.otpcode.length == 6) {
      if (this.storage.retrieve('localOtpSms') != null) {
        if (this.storage.retrieve('localOtpSms').request_id != null) {
          let headers = new HttpHeaders();
          this.OtpSms = [];
          const localOtpSms = this.storage.retrieve('localOtpSms');
          // var phone_no = this.storage.retrieve('localOtpSms').to;
          var phone_no = this.phoneNumber;
          var request_id = this.request_id = this.storage.retrieve('requestId')
          var code = this.otpcode;
          var link;
          if (this.commonFormtype == "forgetPassword") {
            this.token = this.storage.retrieve('token');
            headers = headers.set('Authorization', this.token);
            link = this.funct.ipaddress + 'v1/user/checkOTPXXx?phone_no=' + phone_no + '&email=' + this.smssender + '&code=' + code + '&request_id=' + request_id + '&smstype=' + this.smstype;
          }
          else {
            link = this.funct.ipaddress + 'v2/user/checkOTP?phone_no=' + phone_no + '&email=' + this.emailaddress + '&code=' + code + '&request_id=' + request_id + '&smstype=' + this.registerottype;
          }
          this.http.get(link, { headers: headers })
            .pipe(
              catchError(this.handleErrorMessage.handleError.bind(this, 'otp'))
            )
            .subscribe(
              result => {
                this.dto.Response = result;
                this.OtpSms = this.dto.Response;
                this.common.submitLoading = false;
                this.spinner.hide("submitLoading");
                this.storage.store('otpVerifyToken', this.dto.Response.otpVerifyToken)
                this.storage.clear("registeremail")
                if (this.dto.Response.status == 401) {
                  if (this.dto.Response.code == 0) {
                    this.toastr.error("", this.translateService.instant('invalid-otp-code'),
                      {
                        timeOut: 3000,
                        positionClass: 'toast-bottom-center',
                      });
                    return;
                  } if (this.dto.Response.code == 11) {
                    this.toastr.error("", this.translateService.instant('otp-token-expired'),
                      {
                        timeOut: 3000,
                        positionClass: 'toast-bottom-center',
                      });
                    return;
                  }
                }
                if (this.OtpSms != null) {
                  if (this.OtpSms.status == true) {
                    this.commonFormtype = this.storage.retrieve('formPageType')
                    if (this.commonFormtype == "forgetPassword") {
                      this.storage.clear('localOtpSms');
                      this.storage.clear('requestId');
                      var registerKey = this.funct.encrypt();
                      this.storage.store('registerKey', registerKey)
                      this.router.navigate(['/login/resetPassword'], { state: { registerKey: registerKey }, replaceUrl: true });
                    } else {
                      this.storage.clear('localOtpSms');
                      this.storage.clear('requestId');
                      var registerKey = this.funct.encrypt();
                      this.storage.store('registerKey', registerKey)
                      this.router.navigate(['/login/registration'], { state: { registerKey: registerKey }, replaceUrl: true });
                    }
                    return true;
                  }
                  else {
                    // this.toastr.error("Tip", 'OTP is not correct', {
                    //   timeOut: 3000,
                    //   positionClass: 'toast-top-center',
                    // });
                    return false;
                  }
                }
              }
            );
        }
        else {
          this.toastr.error("", this.translateService.instant('invalid-otp-code'), {
            timeOut: 3000,
            positionClass: 'toast-bottom-center',
          });
          return false;
        }
      }

      else {
        this.toastr.error("", this.translateService.instant('invalid-otp-code'), {
          timeOut: 3000,
          positionClass: 'toast-bottom-center',
        });
        return false;
      }

    }

  }

  getOtp() {
    this.coundDown = 180;
    this.codeInput.reset();
    this.commonFormtype = this.storage.retrieve('formPageType')
    if (this.commonFormtype == "forgetPassword") {
      this.ResendOtp("v1/user/getForgotPassowrdOTP?phoneNo=");
      return
    }
    if (this.common.actionType == "insertAccount") {
      this.ResendWithdrawOtp();
      return;
    }
    else {
      this.ResendRegisOtp();
      return
    }
  }

  ResendWithdrawOtp() {
    this.token = this.storage.retrieve('token');

    let headers = new HttpHeaders().set('Authorization', this.token);
    this.storage.store('localInsertBankAccountList', this.bankAccountList);

    // this.common.submitLoading = true;
    // this.spinner.show('submitLoading');

    this.http
      .get(
        `${this.funct.ipaddress}v1/transaction/getWithdrawOTP`,
        { headers }
      )
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, '')),
        finalize(() => {
          this.common.submitLoading = false;
          this.spinner.hide('submitLoading');
        })
      )
      .subscribe({
        next: (result: any) => {
          this.dto.Response = result;
          this.localInsertAccountOtpSms = this.dto.Response;
          if (this.dto.Response?.expired_at) {
            this.storage.store('localInsertAccountOtpSms', this.dto.Response);
            let requestIdList = this.storage.retrieve('requestId');
            if (this.dto.Response.request_id) {
              requestIdList = requestIdList
                ? `${requestIdList},${this.dto.Response.request_id}`
                : this.dto.Response.request_id;
              this.storage.store('requestId', requestIdList);
            }
            this.getCountDown();
            this.showResend = false;
            if (this.dto.Response.statusCode === 200) {
              const bodyMsg = this.dto.Response.body?.toString()?.trim();

              if (bodyMsg === 'Not valid OTP code') {
                this.toastr.error(
                  'OTP is not correct',
                  'Bad request.',
                  {
                    timeOut: 3000,
                    positionClass: 'toast-top-center'
                  }
                );
                return;
              }

              if (bodyMsg === 'Try Again') {
                this.toastr.error(
                  bodyMsg,
                  'Bad request.',
                  {
                    timeOut: 3000,
                    positionClass: 'toast-top-center'
                  }
                );
                return;
              }
            }
          }
          else if (
            this.dto.Response?.status === 'Error' &&
            this.dto.Response.message?.includes('180 seconds')
          ) {
            this.showResend = false;
          }
          else {
            this.showResend = true;
          }
        },

        error: () => {
          clearInterval(this.intervalId);
          this.intervalId = null;
          this.coundDown = -1;
          this.showResend = true;
        }
      });
  }


  getNewOtp() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.showResend = false;
    this.coundDown = 180;
    this.codeInput.reset();

    // this.common.submitLoading = true;
    // this.spinner.show('submitLoading');

    const headers = new HttpHeaders();

    this.http
      .get(
        `${this.funct.ipaddress}v1/user/getRegisterDeviceOTP?phoneNo=${this.phoneNumber}`,
        { headers }
      )
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, '')),
        finalize(() => {
          this.common.submitLoading = false;
          this.spinner.hide('submitLoading');
        })
      )
      .subscribe({
        next: (result: any) => {
          this.dto.Response = result;
          if (this.dto.Response?.expired_at) {
            this.storage.store('localNewDeviceOtpSms', this.dto.Response);
            let requestIdList = this.storage.retrieve('requestId');
            if (this.dto.Response.request_id) {
              requestIdList = requestIdList
                ? `${requestIdList},${this.dto.Response.request_id}`
                : this.dto.Response.request_id;
              this.storage.store('requestId', requestIdList);
            }
            this.getCountDown();
            this.showResend = false;
            if (this.dto.Response.status === 200) {
              const bodyMsg = this.dto.Response.body?.toString()?.trim();

              if (bodyMsg === 'Not valid OTP code') {
                this.toastr.error(
                  'OTP is not correct',
                  'Bad request.',
                  {
                    timeOut: 3000,
                    positionClass: 'toast-top-center'
                  }
                );
                return;
              }

              if (bodyMsg === 'Try Again') {
                this.toastr.error(
                  bodyMsg,
                  'Bad request.',
                  {
                    timeOut: 3000,
                    positionClass: 'toast-top-center'
                  }
                );
                return;
              }
            }
          }
          else if (
            this.dto.Response?.status === 'Error' &&
            this.dto.Response.message?.includes('180 seconds')
          ) {
            this.getCountDown();
            this.showResend = false;
          }
          else {
            this.showResend = true;
          }
        },
        error: () => {
          clearInterval(this.intervalId);
          this.intervalId = null;
          this.coundDown = -1;
          this.showResend = true;
        }
      });
  }


  SubmitNewDeviceOtp() {
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");
    let headers = new HttpHeaders();
    this.updateDeviceId.phone_no = this.storage.retrieve('localLoginModel').phone_no;
    this.updateDeviceId.ipAddress = this.storage.retrieve('localLoginModel').ipAddress;
    this.updateDeviceId.guid = this.storage.retrieve('localNewDeviceOtpSms').guid;
    this.updateDeviceId.request_id = String(this.storage.retrieve('requestId'));
    this.updateDeviceId.code = this.otpcode;
    this.updateDeviceId.deviceId = this.storage.retrieve('localLoginModel').deviceId;
    this.http.post(this.funct.ipaddress + 'user/updateDeviceId', this.updateDeviceId, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, 'otp'))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          if (this.dto.Response.status == 401) {
            if (this.dto.Response.code == 0) {
              this.common.submitLoading = false;
              this.spinner.hide("submitLoading");
              this.toastr.error("", this.translateService.instant('invalid-otp-code'),
                {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-center',
                });
              return;
            } if (this.dto.Response.code == 10 || this.dto.Response.code == 11) {
              this.common.submitLoading = false;
              this.spinner.hide("submitLoading");
              this.toastr.error("", this.translateService.instant('otp-token-expired'),
                {
                  timeOut: 2000,
                  positionClass: 'toast-top-center',
                });
              return;
            }
          }
          var loginDevice = this.storage.retrieve('localForgetLoginDevice');
          if (this.dto.Response.status == "Success") {
            if (loginDevice == 'loginDevice') {
              this.storage.clear('localNewDeviceOtpSms');
              this.storage.clear('requestId');
              this.goToAutoLogin();
              this.storage.clear('localForgetLoginDevice');
            }
            else {
              this.storage.clear('localNewDeviceOtpSms');
              this.storage.clear('requestId');
              this.autoLogin();
              return;
            }
          }
          else {
            this.common.submitLoading = false;
            this.spinner.hide("submitLoading");
            // this.toastr.error("Tip", this.dto.Response.message.toString(), {
            //   timeOut: 3000,
            //   positionClass: 'toast-top-center',
            // });
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
              this.router.navigate(['/home'], { replaceUrl: true }).then(() => {
                history.replaceState(null, '', location.href); // replaceState is safer
                window.addEventListener('popstate', () => {
                  history.replaceState(null, '', location.href);  // prevent navigation
                });
              });
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

  async getSMS() {
    let config = {
      params: { 'toPhnumber': this.storage.retrieve('localLoginModel').phone_no },
    }
    const axios = require('axios').default;
    await axios.get(this.funct.ipaddress + 'user/sendLoginMsg', config)
      .then((res) => {
        return res;
      })
      .catch((error) => {
      });
  }

  updateFCMtoken() {
    var token = this.storage.retrieve('localFcmtoken');
    let headers = new HttpHeaders();
    var phone_no = '';
    var phoneValue = this.storage.retrieve('localPhoneValue');
    var prefix = this.storage.retrieve('localPhonePrefix');
    if ((phoneValue == null || phoneValue == undefined || phoneValue == "")) {
      return;
    }
    if (phoneValue.startsWith('0')) {
      phone_no = prefix + phoneValue.substring(1, phoneValue.length);
    }
    else {
      phone_no = prefix + phoneValue;
    }
    var newToken = {
      fcmtoken: token,
      phone_no: phone_no
    }
    this.http.post(this.funct.ipaddress + 'user/updateFcmtokenInitial', newToken, { headers: headers })
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
              this.router.navigate(['/home'], { replaceUrl: true }).then(() => {
                history.replaceState(null, '', location.href); // replaceState is safer
                window.addEventListener('popstate', () => {
                  history.replaceState(null, '', location.href);  // prevent navigation
                });
              });
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

  ResendRegisOtp() {
    const headers = new HttpHeaders();

    // this.common.submitLoading = true;
    // this.spinner.show('submitLoading');

    this.http
      .get(
        `${this.funct.ipaddress}v1/user/getRegisterOTP?phoneNo=${this.phoneNumber}&type=${this.registerottype}&email=${this.emailaddress}`,
        { headers }
      )
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, '')),
        finalize(() => {
          this.common.submitLoading = false;
          this.spinner.hide('submitLoading');
        })
      )
      .subscribe({
        next: (result: any) => {
          this.dto.Response = result;
          if (this.dto.Response.errorCode === '000') {
            this.storage.store('localOtpSms', this.dto.Response);
            this.getCountDown();
            this.showResend = false;
            let requestIdList = this.storage.retrieve('requestId');
            if (this.dto.Response.request_id) {
              requestIdList = requestIdList
                ? `${requestIdList},${this.dto.Response.request_id}`
                : this.dto.Response.request_id;
              this.storage.store('requestId', requestIdList);
            }
          }
          else if (
            this.dto.Response.status === 'Error' &&
            this.dto.Response.message?.includes('180 seconds')
          ) {
            console.log('Waiting 180 seconds to resend OTP...');
          }
          else {
            this.showResend = true;
          }
        },
        error: err => {
          clearInterval(this.intervalId);
          this.intervalId = null;
          this.coundDown = -1;
          this.showResend = true;
        }
      });
  }


  ResendOtp(url: string) {
    const headers = new HttpHeaders();
    this.http
      .get(`${this.funct.ipaddress}${url}${this.phoneNumber}`, { headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, '')),
        finalize(() => {
          this.common.submitLoading = false;
          this.spinner.hide('submitLoading');
        })
      )
      .subscribe({
        next: (result: any) => {
          this.dto.Response = result;
          if (this.dto.Response?.status === true) {
            this.storage.store('localOtpSms', this.dto.Response);
            let requestIdList = this.storage.retrieve('requestId');
            if (this.dto.Response.request_id) {
              requestIdList = requestIdList
                ? `${requestIdList},${this.dto.Response.request_id}`
                : this.dto.Response.request_id;
              this.storage.store('requestId', requestIdList);
            }
            this.getCountDown();
            this.showResend = false;
            const bodyText = this.dto.Response.body?.toString()?.trim();

            if (bodyText === 'Not valid OTP code') {
              this.toastr.error(
                'OTP is not correct',
                'Bad request.',
                {
                  timeOut: 3000,
                  positionClass: 'toast-top-center'
                }
              );
              return;
            }

            if (bodyText === 'Try Again') {
              this.toastr.error(
                bodyText,
                'Bad request.',
                {
                  timeOut: 3000,
                  positionClass: 'toast-top-center'
                }
              );
              return;
            }
          }
          else if (
            this.dto.Response?.status === 'Error' &&
            this.dto.Response.message?.includes('180 seconds')
          ) {
            this.showResend = true;
          }
          else {
            this.showResend = true;
          }
        },
        error: () => {
          clearInterval(this.intervalId);
          this.intervalId = null;
          this.coundDown = -1;
          this.showResend = true;
        }
      });
  }

  UpdateNewDeviceId() {
    let headers = new HttpHeaders();
    this.updateDeviceIdforfirebase.phone_no = this.storage.retrieve('localLoginModel').phone_no;
    this.updateDeviceIdforfirebase.ipAddress = this.storage.retrieve('localLoginModel').ipAddress;
    this.updateDeviceIdforfirebase.deviceId = this.storage.retrieve('localLoginModel').deviceId;
    this.http.post(this.funct.ipaddress + 'user/updateDeviceIdforFirebaseMessing', this.updateDeviceIdforfirebase, { headers: headers })
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
            return false;
          }
        }
      );
  }



  InsertWithdrawalAccount() {
    let headers = new HttpHeaders();
    this.token = this.storage.retrieve('token');
    headers = headers.set('Authorization', this.token);
    this.http.post(this.funct.ipaddress + 'userbankaccount/insertuserBankAccount', this.bankAccountList, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.toastr.success("", this.translateService.instant('bankacc_addsuccess'),
            {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          this.storage.store('otpSms', "insert");
          var insertAccount = this.storage.retrieve("localInsertAccount");
          this.storage.clear("localInsertAccount");
          if (insertAccount == 'insertAccount') {
            this.storage.store('successmsg', 'withdrawalsuccess');
            this.router.navigate(['/wallet/withdraw-change-acc'], { replaceUrl: true })
          }
          else {
            this.storage.store('successmsg', 'withdrawalsuccess');
            this.router.navigate(['/wallet/withdraw-change-acc'], { replaceUrl: true })
          }
        }
      );
    this.storage.clear('localInsertAccountOtpSms');
    return true;
  }

  async getotptype() {
    if (this.commonFormtype === 'register') {

      const typeMap: Record<string, { label: string; sender: string }> = {
        vmg_viber: { label: 'Viber', sender: this.phoneNumber },
        email: { label: 'Email', sender: this.emailaddress }
      };

      const config = typeMap[this.registerottype] || {
        label: 'SMS',
        sender: this.phoneNumber
      };

      this.storage.clear('localotptype');
      this.storage.store('localotptype', config.label);
      this.smssender = config.sender;
      this.setOtpText();
      return;
    }

    try {
      const result: any = await this.http
        .get(
          this.funct.ipaddress +
          'user/userSmsType?phone_no=' +
          this.phoneNumber
        )
        .toPromise();
      this.smstype = result.smstype;
      const typeMap: Record<string, { label: string; sender: string }> = {
        vmg_viber: { label: 'Viber', sender: this.phoneNumber },
        email: { label: 'Email', sender: result.email }
      };

      const config = typeMap[this.smstype] || {
        label: 'SMS',
        sender: this.phoneNumber
      };

      this.storage.clear('localotptype');
      this.storage.store('localotptype', config.label);
      this.smssender = config.sender;

      this.setOtpText();

    } catch (error) {
      this.handleErrorMessage.handleError('', error);
    }
  }

  setOtpText() {
    this.viberorsmsotptype = this.storage.retrieve('localotptype');
    this.otpheader = this.translateService
      .instant('otpheader')
      .toString()
      .replace('@type', this.viberorsmsotptype);
    this.otpdesciption = this.translateService
      .instant('otpdescription')
      .toString()
      .replace('@type', this.viberorsmsotptype);
  }

  listServicePhone() {
    this.service_transaction = 0;
    this.spinner.show();
    let headers = new HttpHeaders();
    this.servicePhoneList = [];
    this.servicePhoneList = this.storage.retrieve('localservicePhoneList');
    if (this.servicePhoneList != null) {
      this.servicePhoneList = this.storage.retrieve('localservicePhoneList');
      for (let i = 0; i < this.servicePhoneList.length; i++) {
        if (this.servicePhoneList[i].title == 'service_transaction') {
          ++this.service_transaction;
        }
      }
    }
    this.http.get(this.funct.ipaddress + 'service/listService?otp_page_show=true', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = {};
          this.dto.Response = result;
          this.servicePhoneList = this.dto.Response;
          this.otptitleshow = this.servicePhoneList.some(servicePhoneObj =>
            servicePhoneObj.title === 'customer_service' && servicePhoneObj.otp_page_show === true
          );
          this.service_transaction = 0;
          for (let i = 0; i < this.servicePhoneList.length; i++) {
            if (this.servicePhoneList[i].title == 'customer_service') {
              ++this.service_transaction;
            }
          }
          this.spinner.hide();
        }
      );
  }

  goBack() {
    this._location.back();
  }
}