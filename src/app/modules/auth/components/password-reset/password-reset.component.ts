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
import { NavParams } from '@ionic/angular';
import { NavigationService } from 'src/app/shared/service/navigation.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { DtoService } from 'src/app/shared/service/dto.service';
declare var require: any;
@Component({
  selector: 'password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  showPass: boolean;
  showconfirmPass: boolean;
  passwordType: any;
  confirmpasswordType: any;
  registerModel: any;
  name: any;
  password: any;
  referral_code: any;
  phoneNo: any;
  appVersion: any;
  confirmPassword: any;
  phoneValue: any;
  prefix: any;
  registerKey: any = "";

  constructor(
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
    private location: Location,) {
    this.showPass = false;
    this.confirmPassword = '';
    this.passwordType = "password";
    this.confirmpasswordType = "password";
   this.registerKey=this.storage.retrieve('registerKey');
  }

  ngOnInit(): void {
    this.registerModel = {
      name: '',
      password: '',
    }
  }

  handleError(error: HttpErrorResponse) {
    if (error.status == 0) {
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
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
      this.toastr.error("Tip", 'This mobile is already registered', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return false;
    }
    return throwError(error);
  }

  resetPwd() {
    let aaa = this.checkPassword();
    let bb = this.checkConfirmPassword();
    if (!aaa || !bb) {
      return;
    }
    let headers = new HttpHeaders();
    this.prefix = this.storage.retrieve('localPhonePrefix');
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    var phoneNumber;
    if (this.phoneValue.startsWith('0')) {
      phoneNumber = this.prefix + this.phoneValue.substring(1, this.phoneValue.length);
    }
    else {
      phoneNumber = this.prefix + this.phoneValue;
    }
    this.registerModel.phone_no = phoneNumber;
    this.registerModel.password = this.password;
    this.registerModel.referral_code = '';
    this.registerModel.appVersion = require('../../../../../../package.json').version;
    if (this.registerKey == null || this.registerKey == undefined) {
      this.registerKey = "";
    }
    this.http.post(this.funct.ipaddress + 'user/setNewPassword?phoneNo=' + phoneNumber + '&password=' + this.password + '&registerKey=' + this.registerKey, { headers: headers }).subscribe(
      result => {
        this.dto.Response = result;
        if (this.dto.Response == true) {
          this.storage.store('forgetPasswordModel',this.registerModel);
          this.router.navigate(['/login/forget-password-success'], { state: { 'forgetPasswordModel': this.registerModel }, replaceUrl: true });
          return true;
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

  checkPassword() {
    const myanmarRegex = /[\u1000-\u109F]/;
    if (myanmarRegex.test(this.password)) {
      this.password = this.password.slice(0, -1);
    }
    if (this.password.trim().length > 20) {
      $("#passwordErr").html(this.translateService.instant("charlength"));
      return false;
    }
    $("#passwordErr").html('');
    if (!this.password.trim() || this.password.length < 6) {
      $("#passwordErr").html(this.translateService.instant("reqPassSixLength"));
      return false;
    }
    if (this.password && this.password.trim().length == 6) {
      $("#passwordErr").html("");
      return true;
    }
    if (this.password == '' || this.password == null || this.password == undefined) {
      var passwordRequired = this.translateService.instant("requiredFiled");
      passwordRequired = passwordRequired.toString().replace("@value", this.translateService.instant("passwordHint"));
      $("#passwordErr").html(passwordRequired);
      return false;
    }
    return true;
  }
  checkConfirmPassword() {
    const myanmarRegex = /[\u1000-\u109F]/;

    if (myanmarRegex.test(this.confirmPassword)) {
      this.confirmPassword = this.confirmPassword.slice(0, -1);
    }
    if (this.confirmPassword.trim().length > 20) {
      $("#confirmPasswordErr").html(this.translateService.instant("charlength"));
      return false;
    }
    $("#confirmPasswordErr").html('');
    if (this.password.trim() && this.password.trim().length == this.confirmPassword.trim().length && this.password.trim() == this.confirmPassword.trim()) {
      return true;
    }
    else {
      $("#confirmPasswordErr").html(this.translateService.instant("confirmPassIncorrect"));
      return false;
    }
    return true;
  }

  showPassword(show: boolean) {
    this.showPass = show;
    if (show) {
      this.passwordType = "text";
    }
    else {
      this.passwordType = "password";
    }
  }

  showconfirmPassword(show: boolean) {
    this.showconfirmPass = show;
    if (show) {
      this.confirmpasswordType = "text";
    }
    else {
      this.confirmpasswordType = "password";
    }
  }
}
