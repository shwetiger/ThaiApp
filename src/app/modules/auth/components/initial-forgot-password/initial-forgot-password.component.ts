import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { Location } from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { Router, ActivatedRoute } from '@angular/router';
declare var window: any;

@Component({
  selector: 'app-initial-forgot-password',
  templateUrl: './initial-forgot-password.component.html',
  styleUrls: ['./initial-forgot-password.component.scss']
})
export class InitialForgotPasswordComponent implements OnInit {

  OtpSms: any;
  localOtpSms: any;
  prefix = "+95";
  phoneValue: any = "";
  regularExpressionPhone = "^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$";
  localRegisterCountryCode: any;
  forgetPasswordModalRef: BsModalRef;
  recaptcha: boolean = false;
  SMSprovider: any;
  SMSoperatorList: any;
  Usefirebase: boolean = false;
  Operatorcodelist: any;
  MPTarraylist: any = ['4', '2', '8', '5'];
  OoredooList: any = ['9'];
  MYTELList: any = ['6']
  TelenorList: any = ['7']
  formPage: any;
  istxtdisable: boolean = false;
  smstype: any;
  functionName: string = 'Forgot Password OTP';
  Timer: any;
  emailaddress: any;
  phoneNumber: any;

  constructor(
    private modalService: BsModalService,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private http: HttpClient,
    private util: UtilService,
    private router: Router,
    private storage: LocalStorageService,
    private funct: FunctService,
    private location: Location,
    public common: CommonService,
    private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.formPage = params['formPage'];
    });
  }

  ngOnInit(): void {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    this.prefix = this.storage.retrieve('localPhonePrefix');

    if (window.Telegram?.WebApp.initData) {
      this.phoneValue = this.storage.retrieve('tglocalphone');
      this.phoneValue = '0' + this.phoneValue.substring(3);

    }
    else {
      this.phoneValue = this.storage.retrieve('localPhoneValue');
    }
    this.storage.clear("formPageType")
    this.getsmstype();
    this.storage.clear('actionType');
    if (this.formPage == 'changepwdpage') {
      this.istxtdisable = true;
    }
  }

  handleError(error: HttpErrorResponse) {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    if (error.status == 0) {
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }

    if (error.status == 403) {
      if (error.error.message == 'so_close') {
        this.toastr.error("", this.translateService.instant("otp-request-time"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      if (error.error.message == 'over_limited.') {
        this.toastr.error("", this.translateService.instant("otp-request-time-ten"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });

        return;
      }

      if (error.error.message == 'temporary_blocked') {
        this.toastr.error("", this.translateService.instant("tem_block"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
    }
    if (error.status == 423) {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      this.storage.clear('token');
      this.storage.clear('isUserLoggedIn');
      this.router.navigate(['/login'], { replaceUrl: true });
    }
    if (error.status == 400) {
      this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
    if (error.status == 404) {
      this.toastr.error("", this.translateService.instant("accountNotExist"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
  }

  checkPhoneNumber() {
    $("#phoneErr").html("");
    var prefix = this.storage.retrieve('localPhonePrefix');
    if (!this.phoneValue || this.phoneValue.length === 0) {
      var phoneRequired = this.translateService.instant("requiredFiled");
      phoneRequired = phoneRequired.toString().replace("@value", this.translateService.instant("phonenumbererr"));
      $("#phoneErr").html(phoneRequired);
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      return false;
    }
    if (prefix == "+95") {
      if (!this.phoneValue.startsWith("0")) {
        var checkNumber = this.translateService.instant("not-allowed-phone");
        checkNumber = checkNumber.toString().replace("@number", "09");
        $("#phoneErr").html(checkNumber);
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
        return false;
      }
    }
    if (prefix == "+66") {
      if (!this.phoneValue.startsWith("0")) {
        var checkNumber = this.translateService.instant("not-allowed-phone");
        checkNumber = checkNumber.toString().replace("@number", "06, 08, 09");
        $("#phoneErr").html(checkNumber);
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
        return false;
      }
    }
    let mobNumber = RegExp(this.regularExpressionPhone);
    if (!mobNumber.test(this.phoneValue)) {
      $("#phoneErr").html(this.translateService.instant("phoneInvaild"));
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      return false;
    }
    else {
      $("#phoneErr").html("");
      return true;
    }
  }

  forgetPasswordModal(forgetPassword: TemplateRef<any>) {
    let checkPhone = this.checkPhoneNumber();
    if (!checkPhone) {
      return;
    }
    var phoneNumber;
    this.prefix = this.storage.retrieve('localPhonePrefix');

      if (this.phoneValue.startsWith('0')) {
        phoneNumber = this.prefix + this.phoneValue.substring(1, this.phoneValue.length);
      }
      else {
        phoneNumber = this.prefix + this.phoneValue;
      }

    const forgetPasswordModal = {
      number: phoneNumber,
    };
    this.forgetPasswordModalRef = this.modalService.show(forgetPassword, {
      initialState: forgetPasswordModal,
      class: "forgetPassword-class modal-sm"
    });
  }

  HideAlert() {
    this.forgetPasswordModalRef.hide();
  }


  async submit() {
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");
    this.updateFCMtoken();

    const checkPhone = this.checkPhoneNumber();
    if (!checkPhone) {
      return;
    }

    this.prefix = this.storage.retrieve('localPhonePrefix');
      if (this.phoneValue.startsWith("0")) {
        this.phoneNumber = this.prefix + this.phoneValue.substring(1);
      } else {
        this.phoneNumber = this.prefix + this.phoneValue;
      }
    this.OtpSms = this.storage.retrieve('localOtpSms') || [];
    try {
      await this.getsmstype();
      await this.ForgotPasswordBankSlipCheck();
    } catch (err) {
      console.error(err);
    }
  }

  updateFCMtoken() {
    var token = this.storage.retrieve('localFcmtoken');
    let headers = new HttpHeaders();
    var phone_no = '';
    var phoneValue =this.phoneValue;
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
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
        }
      );
  }


  async ForgotPasswordBankSlipCheck(): Promise<void> {
    return new Promise((resolve, reject) => {
      let checkPhone = this.checkPhoneNumber();
      if (!checkPhone) {
        resolve();
        return;
      }

      let phoneNumber;
      this.prefix = this.storage.retrieve('localPhonePrefix');

      if (!this.phoneValue) {
        resolve();
        return;
      }
      phoneNumber = this.phoneValue.startsWith("0")
        ? this.prefix + this.phoneValue.substring(1)
        : this.prefix + this.phoneValue;

      this.http.get(
        this.funct.ipaddress +
        'userforgotpassword/ForgotPasswordBankSlipCheck?phoneNo=' + phoneNumber
      )
        .pipe(
          catchError(this.handleError.bind(this))
        )
        .subscribe({
          next: async (result: any) => {
            try {
              this.dto.Response = result;
              if (!this.dto.Response) {
                this.common.submitLoading = false;
                this.spinner.hide("submitLoading");
                resolve();
                return;
              }
              switch (this.dto.Response.requestFlag) {
                case true:
                  await this.getForgotPasswordOTP();
                  break;
                case false:
                  switch (this.dto.Response.requestStatus) {
                    case 0:
                      this.router.navigate(['/login/waiting'], { replaceUrl: false });
                      break;

                    case 1:
                    case 2:
                    default:
                      await this.getForgotPasswordOTP();
                      break;

                    case -1:
                      if (this.dto.Response.status == "INACTIVE" &&
                        this.dto.Response.failCount < 3) {

                        this.toastr.error("", this.translateService.instant("user_not_acceptable"), {
                          timeOut: 3000,
                          positionClass: 'toast-top-center',
                        });

                        this.common.submitLoading = false;
                        this.spinner.hide("submitLoading");
                      } else {
                        let activeMinute = this.translateService.instant("login-active-minutes");
                        activeMinute = activeMinute.toString().replace("@time", 5);

                        this.toastr.error("", activeMinute, {
                          timeOut: 3000,
                          positionClass: 'toast-top-center',
                        });
                      }
                      break;

                    case 3:
                    case 4:
                      this.router.navigate(['/login/forgot-password-validation'], {
                        replaceUrl: false
                      });
                      break;
                  }
                  break;
              }

              resolve();

            } catch (err) {
              reject(err);
            }
          },
          error: (err) => reject(err)
        });

    });
  }



  async getForgotPasswordOTP(): Promise<void> {
    return new Promise((resolve, reject) => {

      if (!this.checkPhoneNumber()) {
        resolve();
        return;
      }

      const phoneValue =this.phoneValue;
      const prefix = this.storage.retrieve('localPhonePrefix');
      if (!phoneValue || !prefix) {
        resolve();
        return;
      }

      const phoneNumber = this.formatPhoneNumber(phoneValue, prefix);
      this.OtpSms = this.storage.retrieve('localOtpSms') || [];

      this.http
        .get<any>(
          `${this.funct.ipaddress}v1/user/getForgotPassowrdOTP?phoneNo=${phoneNumber}`
        )
        .pipe(
          catchError(this.handleError.bind(this))
        )
        .subscribe({
          next: (response) => {
            this.dto.Response = response;
            if (response?.status === true) {
              this.handleSuccessResponse(response);
            } else if (response?.status === 'Error') {
              this.handleErrorResponse(response);
            }
            resolve();
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }

  private formatPhoneNumber(phone: string, prefix: string): string {
    return phone.startsWith('0')
      ? prefix + phone.substring(1)
      : prefix + phone;
}

  private async handleSuccessResponse(response: any): Promise<void> {
    this.storage.store('localOtpSms', response);
    this.storage.store('otptype', 'smsotp');
    this.storage.store('formPageType', 'forgetPassword');
    let requestIdList = this.storage.retrieve('requestId');
    if (requestIdList) {
      requestIdList += ',' + response.request_id;
    } else {
      requestIdList = response.request_id;
    }
    this.storage.store('requestId', requestIdList);
    await this.getCountDown();
    this.router.navigate(['/login/otp'], { replaceUrl: true });
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

  private async handleErrorResponse(response: any): Promise<void> {
    const message: string = response.message || '';
    if (message.includes('180 seconds')) {
      if (!this.storage.retrieve('localOtpSms')) {
        this.common.submitLoading = false;
        this.spinner.hide('submitLoading');
        this.toastr.error(
          '',
          this.translateService.instant('otp-request-time'),
          {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          }
        );
        this.storage.clear('Timer');
        return;
      }
      await this.getCountDown();
      this.storage.store('formPageType', 'forgetPassword');
      this.router.navigate(['/login/otp'], { replaceUrl: true });
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
      const prefix = this.storage.retrieve('localPhonePrefix');
      const phoneNumber = this.formatPhoneNumber(this.phoneValue, prefix);
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
        .pipe(catchError(this.handleError.bind(this)))
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

  getsmstype() {
    let phoneNumber;
    this.prefix = this.storage.retrieve('localPhonePrefix');
    if (this.phoneValue == null || this.phoneValue == undefined || this.phoneValue == "") {
      return;
    }
    if (this.phoneValue.startsWith("0")) {
      phoneNumber = this.prefix + this.phoneValue.substring(
        1, this.phoneValue.length);
    }
    else {
      phoneNumber = this.prefix + this.phoneValue;
    }
    let headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'user/userSmsType?phone_no=' + phoneNumber, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.smstype = this.dto.Response.smstype;
          this.emailaddress = this.dto.Response.email;
        });
  }

  goBack() {
    this.location.back();
  }

  async onNextClick() {
    try {
      await this.getsmstype();
      await this.getForgotPasswordOTP();
      await this.getCountDown();
      this.router.navigate(
        ['/login/otp'],
        {
          replaceUrl: true
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  goDefaultOtp() {
    if (!this.phoneValue || this.phoneValue.trim() === '') {
      this.toastr.error(
        '',
        this.translateService.instant('withdrawal_wave_shop_phone_hint'),
        {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        }
      );
      return;
    }

    this.router.navigate(
      ['/me-page/default-otp'],
      {
        queryParams: {
          phoneNumber: this.phoneValue
        }
      }
    );
  }
}

function JSONEncoder() {
  throw new Error('Function not implemented.');
}

function urlencode(phoneNumber: string) {
  throw new Error('Function not implemented.');
}

