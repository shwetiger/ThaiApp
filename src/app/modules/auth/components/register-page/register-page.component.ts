import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Location } from '@angular/common';
import { FunctService } from 'src/app/shared/service/funct.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';

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
    private _location: Location,
    private afAuth: AngularFireAuth,) {
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

    this.GetSMSProvider();
    this.getSMSOperators();
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
    if (this.Usefirebase == true && this.registerottype == 'sms_poh') {
      this.getregisterotpfirebase();
    }
    else {
      this.common.submitLoading = true;
      this.spinner.show("submitLoading");
      let checkPhone = this.checkPhoneNumber();
      if (!checkPhone) {
        return;
      }
      let phoneNumber;
      this.prefix = this.storage.retrieve('localPhonePrefix');
      if (this.phoneValue.startsWith("0")) {
        phoneNumber = this.prefix + this.phoneValue.substring(
          1, this.phoneValue.length);
      }
      else {
        phoneNumber = this.prefix + this.phoneValue;
      }
      this.OtpSms = [];
      this.OtpSms = this.storage.retrieve('localOtpSms');
      this.registerottype = this.storage.retrieve('registeropttype');
      this.isValidEmail = this.validateEmail();
      if (this.isValidEmail == true) {
        let headers = new HttpHeaders();
        this.http.get(this.funct.ipaddress + 'user/isExistEmail?email=' + this.registerModel.email_address, { headers: headers })
          .pipe(
            catchError(this.handleError.bind(this))
          )
          .subscribe(
            result => {
              this.dto.Response = result;
              this.isEmailExist = this.dto.Response;
              this.common.submitLoading = false;
              this.spinner.hide("submitLoading");
              if (this.isEmailExist == false) {
                this.storage.store("localEmail", this.registerModel.email_address)
                this.http.get(this.funct.apaddressv1 + 'user/getRegisterOTP?phoneNo=' + phoneNumber + '&type=' + this.registerottype + '&email=' + this.registerModel.email_address, { headers: headers })
                  .pipe(
                    catchError(this.handleError.bind(this))
                  )
                  .subscribe(
                    result => {
                      this.dto.Response = {};
                      this.dto.Response = result;
                      if (this.dto.Response.errorCode === '000' && this.dto.Response.status === true) {
                        this.common.submitLoading = false;
                        this.spinner.hide("submitLoading");
                        this.storage.store('localOtpSms', this.dto.Response);
                        this.storage.store('registeremail', this.registerModel.email)
                        this.storage.store("previousPh", this.phoneValue);
                         this.storage.store("previousemail", this.registerModel.email);
                        this.OtpSms = this.storage.retrieve('localOtpSms');
                        this.storage.store("formPageType", "register")
                        this.storage.store("otptype", 'smsotp');
                        this.storage.clear("Timer");
                        this.router.navigate(['/login/otp'], { state: { otptype: 'smsotp' }, replaceUrl: true });
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
                          return this.OtpSms;
                        }
                      }
                      else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('180 seconds')) {
                        const previosPh = this.storage.retrieve('previousPh');
                        const previousemail=this.storage.retrieve('previousemail');
                        if (previosPh != this.phoneValue && this.registerottype!='email') {
                          this.storage.retrieve('localOtpSms').request_id = null;
                          this.toastr.error("", this.translateService.instant("otp-request-time"), {
                            timeOut: 3000,
                            positionClass: 'toast-top-center',
                          });
                          return null;
                        }
                        if (previousemail != this.registerModel.email_address && this.registerottype=='email') {
                          this.storage.retrieve('localOtpSms').request_id = null;
                          this.toastr.error("", this.translateService.instant("otp-request-time"), {
                            timeOut: 3000,
                            positionClass: 'toast-top-center',
                          });
                          return null;
                        }
                        this.storage.store('registeremail', this.registerModel.email)
                        this.OtpSms = this.storage.retrieve('localOtpSms');
                        this.storage.store("formPageType", "register")
                        this.storage.store("otptype", 'smsotp');
                        this.common.submitLoading = false;
                        this.spinner.hide("submitLoading");
                        this.router.navigate(['/login/otp'], { state: { otptype: 'smsotp' }, replaceUrl: true });
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

              else {
                this.common.submitLoading = false;
                this.spinner.hide("submitLoading");
                this.toastr.error("", this.translateService.instant("email_already_used"), {
                  timeOut: 5000,
                  positionClass: 'toast-top-center',
                });
                return;
              }
            });
      }
    }
  }

  getregisterotpfirebase() {
    let checkPhone = this.checkPhoneNumber();
    if (!checkPhone) {
      return;
    }
    let phoneNumber;
    this.prefix = this.storage.retrieve('localPhonePrefix');
    if (this.phoneValue.startsWith("0")) {
      phoneNumber = this.prefix + this.phoneValue.substring(
        1, this.phoneValue.length);
    }
    else {
      phoneNumber = this.prefix + this.phoneValue;
    }
    let headers = new HttpHeaders();
    this.OtpSms = [];
    this.OtpSms = this.storage.retrieve('localOtpSms');
    this.http.get(this.funct.ipaddress + 'user/CheckRegisterPhone?phoneNo=' + phoneNumber, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          if (this.dto.Response.Status == 'Succes') {
            this.storage.store("formPageType", "register")
            this.storage.store("localEmail", this.registerModel.email_address)
            this.signInWithPhoneNumber();
            return;
          }
          else {
            return;
          }
        });
  }

  signInWithPhoneNumber() {
    let phCheck = this.checkPhoneNumber();
    if (phCheck == false) {
      return;
    }

    this.recaptcha = true;
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    let phoneNumber;

    if (this.phoneValue.startsWith("0")) {
      phoneNumber = this.prefix + this.phoneValue.substring(1);
    } else {
      phoneNumber = this.prefix + this.phoneValue;
    }

    // 👉 Invisible reCAPTCHA integration
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
      }
    });

    this.afAuth.signInWithPhoneNumber(phoneNumber, appVerifier)
      .then(confirmationResult => {
        this.storage.store('verificationCode', confirmationResult.verificationId);
        this.storage.store("otptype", 'firebaseotp');
        this.storage.clear("Timer");
        this.router.navigate(['/login/otp'], { state: { otptype: 'firebaseotp' }, replaceUrl: true });
      })
      .catch(error => {
        this.recaptcha = false;
        this.toastr.error("", error.message, {
          timeOut: 2000,
          positionClass: 'toast-bottom-center',
        });
        console.error('Phone authentication error', error.message);
      });
  }


  GetSMSProvider() {
    this.http.get(this.funct.ipaddress + 'user/getSMSProvider')
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.SMSprovider = this.dto.Response.message;
        });
  }

  getSMSOperators() {
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    var phoneno = this.phoneValue.substring(2, this.phoneValue.length);
    this.http.get(this.funct.ipaddress + 'user/getSMSOperators')
      .pipe(
        catchError(this.handleError.bind(this))
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
}
