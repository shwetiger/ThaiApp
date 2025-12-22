import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { OtpService } from 'src/app/shared/otp/services';
import { OtpStorageKeys, OtpType } from 'src/app/shared/otp/models';

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
    private router: Router,
    private storage: LocalStorageService,
    private funct: FunctService,
    private otpService: OtpService) {
    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage'));

  }

  ngOnInit(): void {
    this.storage.clear('actionType');
    this.storage.clear('formPage');
    this.storage.clear('formPageType');
    this.prefix = this.storage.retrieve('localPhonePrefix');
    this.registeremail = this.storage.retrieve(OtpStorageKeys.REGISTER_EMAIL); // 恢复email
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
          .pipe( catchError(this.handleError.bind(this)) )
          .subscribe(
            result => {
              this.dto.Response = result;
              this.isEmailExist = this.dto.Response;
              
              if (this.isEmailExist == false) {
                this.storage.store("localEmail", this.registerModel.email_address);
                
                // 使用 OtpService 发送 OTP
                this.otpService.sendRegisterOtp({
                  phoneNumber: phoneNumber,
                  email: this.registerModel.email_address || '',
                  type: this.storage.retrieve('registeropttype') || OtpType.SMS
                })
                .subscribe({
                  next: () => {
                      this.common.submitLoading = false;
                      this.spinner.hide("submitLoading");
                      this.storage.store(OtpStorageKeys.REGISTER_EMAIL, this.registerModel.email_address);            
                      this.router.navigate(['/login/otp'], { replaceUrl: true });
                  },
                  error: (error: Error & { is180SecondsError?: boolean }) => {
                    this.common.submitLoading = false;
                    this.spinner.hide("submitLoading");
                    if (error.is180SecondsError) {
                      this.storage.store(OtpStorageKeys.REGISTER_EMAIL, this.registerModel.email_address);
                      this.router.navigate(['/login/otp'], { replaceUrl: true });
                    } else {
                      this.toastr.error("", error.message, {
                        timeOut: 3000,
                        positionClass: 'toast-top-center',
                      });
                    }    
                  }
                });
              } else {
                this.common.submitLoading = false;
                this.spinner.hide("submitLoading");
                this.toastr.error("", this.translateService.instant("email_already_used"), {
                  timeOut: 5000,
                  positionClass: 'toast-top-center',
                });
              }
            });
      }
  }
}
