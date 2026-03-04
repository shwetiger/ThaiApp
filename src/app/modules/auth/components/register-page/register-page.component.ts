import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError, } from 'rxjs';
import { Location } from '@angular/common';
import { FunctService } from 'src/app/shared/service/funct.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { CommonService } from 'src/app/shared/service/common.service';



@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {
  phoneValue = "";
  regularExpressionPhone = "^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$";
  emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$"
  prefix = '+95';//"+95";
  OtpSms: any;
  localOtpSms: any;
  localPhoneNumber: any;
  supportLanguages = ['en', 'my', 'th', 'zh'];
  recaptcha: boolean = false;
  SMSprovider: any;
  SMSoperatorList: any;
  Usefirebase: boolean = false;
  Operatorcodelist: any;
  MPTarraylist: any = ['4', '2', '8', '5'];
  OoredooList: any = ['9'];
  MYTELList: any = ['6'];
  TelenorList: any = ['7'];
  noregisterphone: boolean = false;
  registerModel: any;
  registerottype: any;
  registeremail: any;
  gmailResponse: any;
  isEmailExist: any;
  isValidEmail: any;
  functionName: string = 'Register OTP'
  Timer: any;

  constructor(
    private translateService: TranslateService,
    public common: CommonService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private http: HttpClient,
    private util: UtilService,
    private router: Router,
    private storage: LocalStorageService,
    private funct: FunctService,
    private _location: Location,) {
    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage'));

  }

  ngOnInit(): void {
    this.storage.clear('actionType');
    this.storage.clear('formPage');
    this.storage.clear('formPageType');
    this.prefix = this.storage.retrieve('localPhonePrefix');
    this.registeremail = this.storage.retrieve("registeremail")
    if (this.registeremail != '') {
      this.registerModel = {
        email_address: this.registeremail
      }
    }
    else {
      this.registerModel = {
        email_address: ''
      }
    }
  }

  checkPhoneNumber() {
    var prefix = this.storage.retrieve('localPhonePrefix');
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    $("#phoneErr").html("");
    if (!this.phoneValue) {
      var phoneRequired = this.translateService.instant("requiredFiled");
      phoneRequired = phoneRequired.toString().replace("@value", this.translateService.instant("phonenumbererr"));
      $("#phoneErr").html(phoneRequired);
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      return false;
    }
    if (this.phoneValue.startsWith("00")) {
      var checkNumber = this.translateService.instant("phoneInvaild");
      $("#phoneErr").html(checkNumber);
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      return false;
    }
    if (prefix == "+95") {
      if (!this.phoneValue.startsWith("09")) {
        var checkNumber = this.translateService.instant("not-allowed-phone");
        checkNumber = checkNumber.toString().replace("@number", "09");
        $("#phoneErr").html(checkNumber);
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
        return false;
      }
    }
    if (prefix == "+66") {
      if (
        !this.phoneValue.startsWith("09") &&
        !this.phoneValue.startsWith("08") &&
        !this.phoneValue.startsWith("06")
      ) {
        var checkNumber = this.translateService.instant("not-allowed-phone");
        checkNumber = checkNumber.toString().replace("@number", "06, 08, 09");
        $("#phoneErr").html(checkNumber);
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
        return false;
      }
    }
     if (prefix == "+60") {
      if (
        !this.phoneValue.startsWith("01")) {
        var checkNumber = this.translateService.instant("not-allowed-phone");
        checkNumber = checkNumber.toString().replace("@number", "01");
        $("#phoneErr").html(checkNumber);
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
        return false;
      }
    }

    let mobNumber = RegExp(this.regularExpressionPhone);// /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/;
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

  validateEmail() {
    let emailPattern = RegExp(this.emailPattern);
    if (!this.registerModel.email_address) {
      return true;
    }
    else if (!emailPattern.test(this.registerModel.email_address)) {
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      this.toastr.error("", this.translateService.instant("invalid_email"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return false;
    }
    else {
      return true;
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
      else {
        this.toastr.error("", error.error.message, {
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
    if (error.status == 406) {
      this.toastr.error("", this.translateService.instant("phoneNumberTaken"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return null;
    }
    else if (error.status == 400) {
      this.toastr.error("Bad request.", 'phone number is not correct', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return null;
    }
    return throwError(error);
  }

  getOtp() {
    this.registerottype = this.storage.retrieve('registeropttype');
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");
    if (!this.checkPhoneNumber()) return;
    const phoneNumber = this.formatPhoneNumber(this.phoneValue);
    this.OtpSms = this.storage.retrieve('localOtpSms');
    this.isValidEmail = this.validateEmail();

    if (!this.isValidEmail) return;

    this.checkEmailExistence(this.registerModel.email_address)
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        (emailExists) => {
          if (!emailExists) {
            this.handleOtpRequest(phoneNumber);
          } else {
            this.showEmailError();
          }
        }
      );
  }

  async getCountDown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.clear('Timer');
      const phoneNumber = this.formatPhoneNumber(this.phoneValue);
      let headers = new HttpHeaders();

      this.http.post(
        this.funct.ipaddress +
        'countdown/get?phoneno=' + phoneNumber +
        '&email=' + this.registerModel.email_address +
        '&type=' + this.registerottype +
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

  checkEmailExistence(email: string) {
    const headers = new HttpHeaders();
    return this.http.get<boolean>(`${this.funct.ipaddress}user/isExistEmail?email=${email}`, { headers });
  }

  handleOtpRequest(phoneNumber: string) {
    const headers = new HttpHeaders();
    this.http.get(`${this.funct.ipaddress}v1/user/getRegisterOTP?phoneNo=${phoneNumber}&type=${this.registerottype}&email=${this.registerModel.email_address}`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe(
        result => {
          this.dto.Response = result;
          if (this.dto.Response.errorCode === '000' && this.dto.Response.status === true) {
            this.processSuccessfulOtpResponse(phoneNumber);
          } else {
            this.handleOtpErrorResponse();
          }
        }
      );
  }

  async processSuccessfulOtpResponse(phoneNumber: string) {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    this.storage.store('localOtpSms', this.dto.Response);
    let requestIdList = this.storage.retrieve('requestId');
    if (requestIdList && this.dto.Response.request_id !== undefined) {
      requestIdList += ',' + this.dto.Response.request_id;
    } else if (this.dto.Response.request_id !== undefined) {
      requestIdList = this.dto.Response.request_id;
    }
    this.storage.store('requestId', requestIdList);
    this.storage.store('registeremail', this.registerModel.email);
    this.storage.store("previousPh", this.phoneValue);
    this.storage.store("previousemail", this.registerModel.email_address);
    this.OtpSms = this.storage.retrieve('localOtpSms');
    this.storage.store("formPageType", "register");
    this.storage.store("localEmail", this.registerModel.email_address)
    await this.getCountDown();
    this.router.navigate(['/login/otp'], { replaceUrl: true });
    this.handleOtpResponseStatusCode();
  }

  handleOtpResponseStatusCode() {
    if (this.dto.Response.statusCode === 200) {
      const message = this.dto.Response.body.trim();
      if (message === "Not valid OTP code" || message === "Try Again") {
        this.toastr.error("Bad request.", `OTP is not correct: ${message}`, { timeOut: 3000, positionClass: 'toast-top-center' });
      }
    }
  }

  handleOtpErrorResponse() {
    if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('180 seconds')) {
      this.handleOtpRequestTimeError();
    } else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('60 seconds')) {
      this.toastr.error("", this.translateService.instant("otp-request-time-onemin"), { timeOut: 3000, positionClass: 'toast-top-center' });
    }
  }

  handleOtpRequestTimeError() {
    this.storage.store("localEmail", this.registerModel.email_address)
    const previousPhone = this.storage.retrieve('previousPh');
    const previousEmail = this.storage.retrieve('previousemail');
    if (previousPhone !== this.phoneValue && this.registerottype !== 'email') {
      this.clearOtpAndShowError("otp-request-time");
      return;
    }
    if (previousEmail !== this.registerModel.email_address && this.registerottype === 'email') {
      this.clearOtpAndShowError("otp-request-time");
      return;
    }
    this.storage.store('registeremail', this.registerModel.email);
    this.OtpSms = this.storage.retrieve('localOtpSms');
    this.storage.store("formPageType", "register");
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    this.router.navigate(['/login/otp'], { replaceUrl: true });
  }

  clearOtpAndShowError(errorMessage: string) {
    this.storage.retrieve('localOtpSms').request_id = null;
    this.toastr.error("", this.translateService.instant(errorMessage), { timeOut: 3000, positionClass: 'toast-top-center' });
  }

  showEmailError() {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    this.toastr.error("", this.translateService.instant("email_already_used"), { timeOut: 5000, positionClass: 'toast-top-center' });
  }

  formatPhoneNumber(phoneValue: string): string {
    const prefix = this.storage.retrieve('localPhonePrefix');
    return phoneValue.startsWith("0") ? prefix + phoneValue.substring(1) : prefix + phoneValue;
  }


}
