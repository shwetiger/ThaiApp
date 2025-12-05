import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'; // 引入 OnDestroy 以便组件销毁时清理倒计时
import { CodeInputComponent } from 'angular-code-input';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { Location } from '@angular/common';
import isUAWebview from "is-ua-webview";
import { FunctService } from 'src/app/shared/service/funct.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { NavigationService } from 'src/app/shared/service/navigation.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';
declare var require: any;

@Component({
  selector: 'app-otp-page',
  templateUrl: './otp-page.component.html',
  styleUrls: ['./otp-page.component.scss']
})
export class OtpPageComponent implements OnInit, OnDestroy {
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

  // 倒计时相关
  targetTime: Date | null = null; // 记录后端短信的绝对到期时间
  intervalId: any = null; // 当前激活的倒计时 interval 引用
  remainingSeconds: number = 0; // 用强类型 number 控制倒计时
  private readonly expiresAtKey: string = 'OtpExpiresAt'; // 缓存绝对到期时间，离开页面后可精准恢复剩余秒数

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
    private _location: Location,
    private afAuth: AngularFireAuth,) {
    this.common.actionType = history.state.actionType;
    this.otptype = history.state.otptype;
    /*call local inert bank acc otp sms*/
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

  ngOnInit(): void {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    // 读取缓存前做数值校验，避免 NaN/负数污染倒计时
    const cachedExpiresAt = this.toNumber(this.storage.retrieve(this.expiresAtKey));
    if (cachedExpiresAt && cachedExpiresAt > Date.now()) {
      this.targetTime = new Date(cachedExpiresAt);
      this.remainingSeconds = Math.max(0, Math.trunc((cachedExpiresAt - Date.now()) / 1000));
      this.persistExpiresAt(this.targetTime);
    } else {
      if (cachedExpiresAt) {
        this.clearPersistedExpires();
      }
      const cachedTimer = this.toNumber(this.storage.retrieve('Timer')); // 读取并过滤缓存的剩余秒数
      this.remainingSeconds = cachedTimer ?? 0; // 缓存无效时默认 0 防止 NaN
      if (cachedTimer == null) { // 没有可靠缓存时重新计算 targetTime
        if (this.commonFormtype == 'NEWDIVICE') {
          const startAt = new Date(this.storage.retrieve('localNewDeviceOtpSms').start_at);     // Backend start time
          const expiredAt = new Date(this.storage.retrieve('localNewDeviceOtpSms').expired_at);
          const totalDurationMs = expiredAt.getTime() - startAt.getTime();
          this.targetTime = new Date(Date.now() + totalDurationMs);
        }
        else if (this.commonFormtype == 'withdrawaladd') {
          const startAt = new Date(this.storage.retrieve('localInsertAccountOtpSms').start_at);     // Backend start time
          const expiredAt = new Date(this.storage.retrieve('localInsertAccountOtpSms').expired_at);
          const totalDurationMs = expiredAt.getTime() - startAt.getTime();
          this.targetTime = new Date(Date.now() + totalDurationMs);
          // this.targetTime = new Date(this.storage.retrieve('localInsertAccountOtpSms').expired_at)
        }
        else {
          const startAt = new Date(this.storage.retrieve('localOtpSms').start_at);     // Backend start time
          const expiredAt = new Date(this.storage.retrieve('localOtpSms').expired_at);
          const totalDurationMs = expiredAt.getTime() - startAt.getTime();
          this.targetTime = new Date(Date.now() + totalDurationMs);
          //this.targetTime = new Date(this.storage.retrieve('localOtpSms').expired_at)
        }
        this.persistExpiresAt(this.targetTime);
      }
      else { // 有缓存时直接沿用剩余秒数启动倒计时
        this.targetTime = new Date(Date.now() + this.remainingSeconds * 1000); // 当前时刻 + 缓存秒数
        this.persistExpiresAt(this.targetTime);
      }
    }
    this.changeoptprocess = this.storage.retrieve('changeotpprocess');
    this.registerottype = this.storage.retrieve('registeropttype');
    this.emailaddress = this.storage.retrieve('localEmail')
    this.commonFormtype = this.storage.retrieve('formPageType')
    this.checkResendTime(); // 启动新的倒计时循环
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

    this.checkOtpModel = {
      code: '',
      request_id: '',
      phone_no: '',
      register_key: ''
    }
    this.GetSMSProvider();
    this.getotptype();
    this.listServicePhone();
  }

  // checkResendTime() {
  //   if (this.targetTime != null) {
  //     this.intervalId = setInterval(() => {
  //       const now = new Date().getTime();
  //       const target = this.targetTime.getTime();
  //       const distance = target - now;
  //       this.remainingSeconds = Math.floor(distance / 1000);
  //       this.storage.store("Timer", this.remainingSeconds)
  //       if (distance <= 0) {
  //         this.showResend = true;
  //         this.remainingSeconds = 0;
  //         clearInterval(this.intervalId);
  //       }

  //     }, 1000);
  //   }
  // }

  checkResendTime() { // 统一维护 resend 倒计时
    if (!this.targetTime) { // 没有目标时间时不启动 interval
      this.stopInterval(); // 防止遗留旧 interval
      return; // 直接返回等待新 OTP
    }
    this.stopInterval(); // 启动前先停掉旧 interval
    // 倒计时的唯一入口，确保只存在一个 interval，避免多实例写入负数
    this.intervalId = setInterval(() => { // 启动新的倒计时循环
      if (!this.targetTime) { // 运行期间若 targetTime 被清理则立即停止
        this.stopInterval(); // 停止写入
        return; // 退出当前 tick
      }
      const distance = this.targetTime.getTime() - Date.now(); // 计算剩余毫秒数
      if (distance <= 0) {
        // 时间到立即收敛到 0，避免继续递减成 -1/-2
        this.remainingSeconds = 0; // UI 与缓存都固定在 0
        this.showResend = true; // 打开重发按钮
        this.persistTimer(this.remainingSeconds); // 将结果写回缓存
        this.stopInterval(); // 清除 interval 防止继续递减
        return; // 不再执行后续逻辑
      }
      this.remainingSeconds = Math.max(0, Math.trunc(distance / 1000)); // 始终写入非负整数秒
      this.persistTimer(this.remainingSeconds); // 同步本地缓存供刷新使用
    }, 1000);
  }


  startCountdown(seconds: number) {
    this.persistExpiresAt(null); // Firebase OTP 独立于短信倒计时，清掉主倒计时的绝对时间
    let counter = Math.max(0, Math.trunc(seconds)); // Firebase 渠道也强制使用非负整数
    const interval = setInterval(() => { // 独立的 interval 控制 coundDown
      this.coundDown = counter; // 更新 UI 上显示的剩余秒数
      this.persistTimer(this.coundDown); // 与主倒计时共享同一缓存
      counter--; // 每次 tick 递减 1 秒
      if (counter < 0) {
        // Firebase 分支也保持 0 下限，防止共用的 Timer 被写成负数
        clearInterval(interval); // 关闭该 interval，防止继续递减
        this.coundDown = 0; // 超过边界后固定到 0
        this.persistTimer(this.coundDown); // 缓存中也写入 0
      }
    }, 1000);
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

  checkOtp() {
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");

    setTimeout(() => {
      this.storage.clear("changeoptprocess");
      let checkOPTINput = this.validateOtp();
      if (!checkOPTINput) {
        return;
      }
      if (this.common.actionType == "insertAccount") {
        if (this.localInsertAccountOtpSms.request_id != null) {
          this.token = this.storage.retrieve('token');
          let headers = new HttpHeaders();
          headers = headers.set('Authorization', this.token);
          this.OtpSms = [];
          this.http.get(this.funct.ipaddress + 'transaction/withdrawcheckOTP?code=' + this.otpcode + '&request_id=' + this.localInsertAccountOtpSms.request_id, { headers: headers })
            .pipe(
              catchError(this.handleErrorMessage.handleError.bind(this, 'otp'))
            )
            .subscribe(
              result => {
                // this.common.submitLoading = false;
                // this.spinner.hide("submitLoading");
                this.dto.Response = result;
                this.OtpSms = this.dto.Response;
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
                          if (insertAccount == 'insertAccount') {
                            this.router.navigate(['/wallet/withdraw-change-acc'], { replaceUrl: true }).then(() => {
                              // Prevent browser back
                              history.pushState(null, '', location.href);
                              window.addEventListener('popstate', () => {
                                history.pushState(null, '', location.href);
                              });
                            });
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
        if (this.storage.retrieve('localOtpSms').request_id != null) {
          let headers = new HttpHeaders();
          this.OtpSms = [];
          const localOtpSms = this.storage.retrieve('localOtpSms');
          var phone_no = this.storage.retrieve('localOtpSms').to;
          var request_id = this.storage.retrieve('localOtpSms').request_id;
          var code = this.otpcode;
          var link;
          if (this.commonFormtype == "forgetPassword") {
            this.token = this.storage.retrieve('token');
            headers = headers.set('Authorization', this.token);
            link = 'user/checkOTPXXx?phone_no=' + phone_no + '&code=' + code + '&request_id=' + request_id;
          }
          else {
            link = 'user/checkOTP?phone_no=' + phone_no + '&code=' + code + '&request_id=' + request_id + '&smstype=' + this.registerottype;

          }
          this.http.get(this.funct.ipaddress + link, { headers: headers })
            .pipe(
              catchError(this.handleErrorMessage.handleError.bind(this, 'otp'))
            )
            .subscribe(
              result => {
                this.dto.Response = result;
                this.OtpSms = this.dto.Response;
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
                      var registerKey = this.funct.encrypt();
                      this.router.navigate(['/login/resetPassword'], { state: { registerKey: registerKey }, replaceUrl: true });
                    } else {
                      var registerKey = this.funct.encrypt();

                      // this.storage.clear('registeropttype');
                      this.router.navigate(['/login/registration'], { state: { registerKey: registerKey }, replaceUrl: true });
                    }
                    return true;
                  }
                  else {
                    this.toastr.error("Tip", 'OTP is not correct', {
                      timeOut: 3000,
                      positionClass: 'toast-top-center',
                    });
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
    }, 1000);
  }

  getOtp() {
    this.resetCountdownState(180); // 重发前统一重置倒计时为 180 秒
    this.commonFormtype = this.storage.retrieve('formPageType')
    if (this.commonFormtype == "forgetPassword") {
      this.ResendOtp("user/getForgotPassowrdOTP?phoneNo=");
      return
    }
    if (this.common.actionType == "insertAccount") {
      this.ResendWithdrawOtp();
      return;
    }
    else {
      this.ResendOtp("user/getRegisterOTP?phoneNo=");
      return
    }
  }

  ResendWithdrawOtp() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.storage.store('localInsertBankAccountList', this.bankAccountList); //store for next otp page
    this.http.get(this.funct.apaddressv1 + 'transaction/getWithdrawOTP', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.localInsertAccountOtpSms = this.dto.Response;
          // this.targetTime = new Date(this.localInsertAccountOtpSms.expired_at);
          const startAt = new Date(this.localInsertAccountOtpSms.start_at);     // Backend start time
          const expiredAt = new Date(this.localInsertAccountOtpSms.expired_at);
          const totalDurationMs = expiredAt.getTime() - startAt.getTime();
          this.targetTime = new Date(Date.now() + totalDurationMs);
        this.persistExpiresAt(this.targetTime);
          this.checkResendTime();
        }
      );

  }

  getNewOtp() {
    this.resetCountdownState(180); // 新设备流程也复位倒计时，避免复用旧值
    this.codeInput.reset();
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");

    const headers = new HttpHeaders();

    this.http.get(this.funct.ipaddress + 'user/getRegisterDeviceOTP?phoneNo=' + this.phoneNumber, { headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(result => {
        this.dto.Response = result;
        if (this.dto.Response?.expired_at) {
          const startAt = new Date(this.dto.Response.start_at);     // Backend start time
          const expiredAt = new Date(this.dto.Response.expired_at);
          const totalDurationMs = expiredAt.getTime() - startAt.getTime();
          this.targetTime = new Date(Date.now() + totalDurationMs);
          this.persistExpiresAt(this.targetTime);
          this.checkResendTime();
        } else {
          // console.warn('No expires_date in response!');
          return;
        }
        // this.checkResendTime();
        this.storage.store('localNewDeviceOtpSms', this.dto.Response);
        if (this.dto.Response.statusCode === 200) {
          const bodyMsg = this.dto.Response.body?.toString()?.trim();
          if (bodyMsg === "Not valid OTP code") {
            this.toastr.error("Bad request.", 'OTP is not correct', {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return;
          }
          if (bodyMsg === "Try Again") {
            this.toastr.error("Bad request.", bodyMsg, {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return;
          }
        }
      });
  }


  getNewDeviceOtp() {
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");
    let headers = new HttpHeaders();
    this.updateDeviceId.phone_no = this.storage.retrieve('localLoginModel').phone_no;
    this.updateDeviceId.ipAddress = this.storage.retrieve('localLoginModel').ipAddress;
    this.updateDeviceId.guid = this.storage.retrieve('localNewDeviceOtpSms').guid;
    this.updateDeviceId.request_id = String(this.storage.retrieve('localNewDeviceOtpSms').request_id);
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
            } if (this.dto.Response.code == 10) {
              this.common.submitLoading = false;
              this.spinner.hide("submitLoading");
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
              // this.router.navigate(['/home'], { replaceUrl: true }).then(() => {
              //   // Prevent browser back
              //   history.pushState(null, '', location.href);
              //   window.addEventListener('popstate', () => {
              //     history.pushState(null, '', location.href);
              //   });
              // });

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
              // history.go(-4);
              // this.router.navigate(['/home'], { replaceUrl: true }).then(() => {
              //   // Prevent browser back
              //   history.pushState(null, '', location.href);
              //   window.addEventListener('popstate', () => {
              //     history.pushState(null, '', location.href);
              //   });
              // });

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

  ResendOtp(url) {
    let headers = new HttpHeaders();
    this.http.get(this.funct.apaddressv1 + url + this.phoneNumber, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.storage.store('localOtpSms', this.dto.Response);
          const startAt = new Date(this.storage.retrieve('localOtpSms').start_at);     // Backend start time
          const expiredAt = new Date(this.storage.retrieve('localOtpSms').expired_at);
          const totalDurationMs = expiredAt.getTime() - startAt.getTime();
          this.targetTime = new Date(Date.now() + totalDurationMs);
          //  this.targetTime = new Date(this.storage.retrieve('localOtpSms').expired_at)
          this.persistExpiresAt(this.targetTime);
          this.checkResendTime();
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
          }
        }
      );
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
            this.toastr.error("Tip", this.dto.Response.message.toString(), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return false;
          }
        }
      );
  }

  handleClick() {
    if (this.coundDown >= 0) {
      this.common.submitLoading = true;
      this.spinner.show("submitLoading");
      this.commonFormtype = this.storage.retrieve('formPage');
      var credentials = firebase.auth.PhoneAuthProvider.credential(this.verify, this.otpcode);
      firebase.auth().signInWithCredential(credentials)
        .then((response) => {
          if (this.commonFormtype == "forgetPassword") {
            var registerKey = this.funct.encrypt();
            this.router.navigate(['/login/resetPassword'], { state: { registerKey: registerKey }, replaceUrl: true });
            return;
          }
          if (this.common.actionType == "insertAccount") {
            this.InsertWithdrawalAccount();
            return;
          }
          else {
            var registerKey = 'CfD3JNRXpafVf36oZZKJjqIch8QyDq81sv0IyuVR4m9y7hswwjuzkTr8AwRt6uVD';
            this.router.navigate(['/login/registration'], { state: { registerKey: registerKey }, replaceUrl: true });
            return;
          }
        }).catch((error) => {
          this.common.submitLoading = false;
          this.spinner.hide("submitLoading");
          if (error.code == 'auth/invalid-verification-code') {
            this.toastr.error("", this.translateService.instant('invalid-otp-code'),
              {
                timeOut: 2000,
                positionClass: 'toast-bottom-center',
              });
          }
          else {
            this.toastr.error("", error.message,
              {
                timeOut: 2000,
                positionClass: 'toast-bottom-center',
              });
          }
        }
        );
    }
    else {
      this.toastr.error("", this.translateService.instant('otp-token-expired'),
        {
          timeOut: 2000,
          positionClass: 'toast-bottom-center',
        })
    }
  }

  UpdateDeviceIdwithfirebase() {
    if (this.coundDown >= 0) {
      this.common.submitLoading = true;
      this.spinner.show("submitLoading");
      var credentials = firebase.auth.PhoneAuthProvider.credential(this.verify, this.otpcode);
      firebase.auth().signInWithCredential(credentials)
        .then((response) => {
          this.UpdateNewDeviceId();
        }).catch((error) => {
          this.common.submitLoading = false;
          this.spinner.hide("submitLoading");
          if (error.code == 'auth/invalid-verification-code') {
            this.toastr.error("", this.translateService.instant('invalid-otp-code'),
              {
                timeOut: 2000,
                positionClass: 'toast-bottom-center',
              });
          }
          else {
            this.toastr.error("", error.message,
              {
                timeOut: 2000,
                positionClass: 'toast-bottom-center',
              });
          }
        }
        );
    }
    else {
      this.toastr.error("", this.translateService.instant('otp-token-expired'),
        {
          timeOut: 2000,
          positionClass: 'toast-bottom-center',
        })
    }
  }

  signInWithPhoneNumber() {
    this.recaptcha = true;
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container'); // Make sure you have an element with id 'recaptcha-container'
    this.afAuth.signInWithPhoneNumber(this.phoneNumber, appVerifier)
      .then(confirmationResult => {
        this.storage.clear('verificationCode');
        this.verify = confirmationResult.verificationId
        appVerifier.clear()
        this.recaptcha = false;
        this.startCountdown(this.time);
      })
      .catch(error => {
        this.toastr.error("", error.message,
          {
            timeOut: 2000,
            positionClass: 'toast-bottom-center',
          });
        console.error('Phone authentication error', error.message);
      });
  }

   // 组件销毁时及时清理 interval
  ngOnDestroy(): void {
    this.stopInterval();
  }

  // 停止倒计时
  private stopInterval(): void { 
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private resetCountdownState(seconds: number = 0): void { // 重置倒计时及缓存
    this.stopInterval(); // 首先停掉正在运行的 interval
    this.showResend = false; // 收起“重发”按钮
    const safeSeconds = Math.max(0, Math.trunc(seconds)); // 过滤输入，确保是合法整数
    this.remainingSeconds = safeSeconds; // 更新 UI 显示
    this.targetTime = safeSeconds > 0 ? new Date(Date.now() + safeSeconds * 1000) : null; // 重建目标时间
    this.persistExpiresAt(this.targetTime); // 记录绝对到期时间，离开页面能精准恢复
    this.persistTimer(this.remainingSeconds); // 同步写入缓存
  }

  private persistTimer(value: number): void { // 安全地写入本地存储
    const safeValue = Number.isFinite(value) && value >= 0 ? Math.trunc(value) : 0; // 如果非法就回落到 0
    this.storage.store('Timer', safeValue); // 保存当前剩余秒数
  }

  private toNumber(value: any): number | null { // 解析缓存时统一做合法性校验
    // 所有入口统一做数值过滤，防止字符串/NaN 混入
    const num = Number(value); // 尝试将任意类型转换为数值
    if (!Number.isFinite(num) || num < 0) { // 非有限或负数一律视为无效
      return null; // 通过 null 指示需要重新计算
    }
    return Math.trunc(num); // 只返回整数部分
  }

   // 缓存绝对到期时间方便恢复
  private persistExpiresAt(target: Date | null): void {
    if (target) {
      this.storage.store(this.expiresAtKey, target.getTime());
    } else {
      this.clearPersistedExpires();
    }
  }

  private clearPersistedExpires(): void { // 移除失效的到期时间缓存
    this.storage.clear(this.expiresAtKey);
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
        });
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
            // this._location.back();
            //  this.router.navigate(['/wallet/withdraw-change-acc'], { replaceUrl: false });
            this.storage.store('successmsg', 'withdrawalsuccess');
            this.router.navigate(['/wallet/withdraw-change-acc'], { replaceUrl: true }).then(() => {
              // Prevent browser back
              history.pushState(null, '', location.href);
              window.addEventListener('popstate', () => {
                history.pushState(null, '', location.href);
              });
            });
          }
          else {
            this.storage.store('successmsg', 'withdrawalsuccess');
            this.router.navigate(['/wallet/withdraw-change-acc'], { replaceUrl: true }).then(() => {
              history.pushState(null, '', location.href);
              window.addEventListener('popstate', () => {
                history.pushState(null, '', location.href);
              });
            });
          }
        }
      );
    this.storage.clear('localInsertAccountOtpSms');
    return true;
  }

  getotptype() {
    if (this.commonFormtype == 'register') {
      if (this.registerottype == "vmg_viber") {
        this.storage.clear("localotptype");
        this.storage.store("localotptype", "Viber");
        this.smssender = this.phoneNumber;
      }
      else if (this.registerottype == 'email') {
        this.storage.clear("localotptype")
        this.storage.store("localotptype", 'Email')
        this.smssender = this.emailaddress;
      }
      else {
        this.storage.clear("localotptype")
        this.storage.store("localotptype", 'SMS')
        this.smssender = this.phoneNumber;
      }
      this.viberorsmsotptype = this.storage.retrieve('localotptype');
      this.otpheader = this.translateService.instant("otpheader");
      this.otpheader = this.otpheader.toString().replace("@type", this.viberorsmsotptype);
      this.otpdesciption = this.translateService.instant("otpdescription");
      this.otpdesciption = this.otpdesciption.toString().replace("@type", this.viberorsmsotptype);
      // if (this.registerottype == 'sms_poh' && this.otptype == 'firebaseotp') {
      //   this.firebaseUI = true;
      // }
      // else {
      //   this.smsUI = true;
      // }
    }
    else {
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
            if (this.smstype == "vmg_viber") {
              this.storage.clear("localotptype")
              this.smssender = this.phoneNumber;
              this.storage.store("localotptype", 'Viber')
            }
            else if (this.smstype == 'email') {
              this.smssender = this.dto.Response.email;
              this.storage.clear("localotptype")
              this.storage.store("localotptype", 'Email')

            }
            else {
              this.storage.clear("localotptype")
              this.storage.store("localotptype", 'SMS')
              this.smssender = this.phoneNumber;
            }
            this.viberorsmsotptype = this.storage.retrieve('localotptype');
            this.otpheader = this.translateService.instant("otpheader");
            this.otpheader = this.otpheader.toString().replace("@type", this.viberorsmsotptype);
            this.otpdesciption = this.translateService.instant("otpdescription");
            this.otpdesciption = this.otpdesciption.toString().replace("@type", this.viberorsmsotptype);
            // if (this.smstype == 'sms_poh' && this.otptype == 'firebaseotp') {
            //   this.firebaseUI = true;
            // }
            // else {
            //   this.smsUI = true;
            // }
            return;
          });
    }
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