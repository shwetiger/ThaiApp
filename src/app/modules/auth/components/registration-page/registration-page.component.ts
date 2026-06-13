import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { throwError } from 'rxjs';
import { Location } from '@angular/common';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
declare var require: any;
@Component({
  selector: 'app-registration-page',
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.scss']
})
export class RegistrationPageComponent implements OnInit {

  showPass: boolean;
  showcomfirmPass: boolean;
  passwordType: any;
  confirmpasswordType: any;
  registerModel: any;
  name: any = "";
  password: any;
  referral_code: any;
  phoneNo: any;
  appVersion: any;
  confirmPassword: any;
  phoneValue: any;
  prefix: any;
  registerKey: any = "";
  email_address: any;
  registerottype: any;
  constructor(
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
    this.showcomfirmPass = false;
    this.confirmPassword = '';
    this.passwordType = "password";
    this.confirmpasswordType = "password"
    this.registerKey = this.storage.retrieve('registerKey');
    this.email_address = this.storage.retrieve("localEmail")
  }

  ngOnInit(): void {
    this.prefix = this.storage.retrieve('localPhonePrefix');
    this.email_address = this.storage.retrieve("localEmail")
    this.registerottype = this.storage.retrieve('registeropttype');
    this.registerModel = {
      name: '',
      password: '',
      registerKey: '',
      email: '',
      smstype: ''
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

  register() {
    let aaa = this.checkPassword();
    let bb = this.checkConfirmPassword();
    let ccc = this.checkName();
    if (!aaa || !bb || !ccc) {
      return;
    }
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    if (this.phoneValue.startsWith('0')) {
      this.registerModel.phone_no = this.prefix + this.phoneValue.substring(1, this.phoneValue.length);
    }
    else {
      this.registerModel.phone_no = this.prefix + this.phoneValue;
    }
    this.registerModel.name = this.name;
    this.registerModel.password = this.password;
    this.registerModel.referral_code = '';
    this.registerModel.appVersion = require('../../../../../../package.json').version;
    this.registerModel.registerKey = this.registerKey;
    this.registerModel.phone_no = this.registerModel.phone_no;
    this.registerModel.email = this.email_address;
    this.registerModel.smstype = this.registerottype;
    this.storage.store('registerModel', this.registerModel);
    this.router.navigate(['/login/register-invite-code'], { state: { registerModel: this.registerModel }, replaceUrl: true });
  }

  checkName() {
    $("#nameErr").html('');
    var name = this.name.trim();
    if (!name || name.length < 1) {
      var afff = this.translateService.instant("requiredFiled");
      afff = afff.toString().replace("@value", this.translateService.instant("namehint"));
      $("#nameErr").html(afff);
      return false;
    }
    else {
      $("#nameErr").html("");
      return true;
    }
  }

  checkPassword() {
    const myanmarRegex = /[\u1000-\u109F]/;
    if (myanmarRegex.test(this.password)) {
      this.password = this.password.slice(0, -1);
    }
    $("#passwordErr").html('');
    if (!this.password || this.password.trim().length < 6) {
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
    if (this.password.length > 20) {
      $("#passwordErr").html(this.translateService.instant("charlength"));
      return false;
    }
    return true;
  }

  checkConfirmPassword() {
    const myanmarRegex = /[\u1000-\u109F]/;
    if (myanmarRegex.test(this.confirmPassword)) {
      this.confirmPassword = this.confirmPassword.slice(0, -1);
    }
    $("#confirmPasswordErr").html('');
    if (this.password && this.password.trim().length == this.confirmPassword.trim().length && this.password.trim() == this.confirmPassword.trim()) {
      return true;
    }
    if (this.password.length > 20) {
      $("#confirmPasswordErr").html(this.translateService.instant("charlength"));
      return false;
    }
    else {
      $("#confirmPasswordErr").html(this.translateService.instant("confirmPassIncorrect"));
      return false;
    }
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

  showComfrimPassword(show: boolean) {
    this.showcomfirmPass = show;
    if (show) {
      this.confirmpasswordType = "text";
    }
    else {
      this.confirmpasswordType = "password";
    }
  }

  enter(event) {
    event.target.blur();
  }

  checkInput(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value;
  const trimmedLength = value.replace(/\s/g, '').length;
  let charArray = Array.from(value);
  if (charArray.length > 25) {
    charArray = charArray.slice(0, 25);
  }

  const newValue = charArray.join('');

  this.name = newValue;
  input.value = newValue;

  this.updateNameError(newValue.length, trimmedLength);
}

  checkKey(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const charArray = Array.from(input.value);

    const allowedKeys = [
      'Backspace', 'Delete',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Home', 'End'
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (charArray.length >= 25) {
      event.preventDefault();
    }
  }

  updateNameError(length: number, trimmedLength: number) {
  if (trimmedLength === 0 && length > 0) {
    let msg = this.translateService.instant("requiredFiled");
    msg = msg.toString().replace("@value", this.translateService.instant("namehint"));
    $("#nameErr").html(msg);
  }
  else if (length === 0) {
    $("#nameErr").html("");
  }
  else if (length >= 25) {
    let msg = this.translateService.instant("requiredFiled");
    msg = msg.toString().replace("@value", this.translateService.instant("namehint"));
    $("#nameErr").html(msg);
  }
  else {
    $("#nameErr").html("");
  }
}
}
