import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  password: any;
  showPass: boolean;
  showoldPass: boolean;
  showconfirmPass: boolean;
  passwordType: any;
  oldpasswordType: any;
  confirmpasswordType: any;
  newPassword: any;
  confirmPassword: any;
  changePasswordModel: any;
  token: any;
  formPage: any;
  istxtdisable: boolean = false;

  constructor(
    private translateService: TranslateService,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
    private funct: FunctService,
    private storage: LocalStorageService,
    private dto: DtoService,
    private _location: Location,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.passwordType = "password";
    this.oldpasswordType = "password";
    this.confirmpasswordType = "password"
    this.changePasswordModel = {
      oldPassword: '',
      newPassword: ''
    }
  }

  checkPassword() {
    const myanmarRegex = /[\u1000-\u109F]/;
    if (myanmarRegex.test(this.password)) {
      this.password = this.password.slice(0, -1);
    }
    if (this.password == '' || this.password == undefined || this.password == null) {
      $(".passError1").html(this.translateService.instant("curretPassisRequired"));
      return false;
    }
    if (this.password.length > 20) {
      $(".passError1").html(this.translateService.instant("charlength"));
      return false;
    }
    else {
      $(".passError1").html("");
      return true;
    }
  }

  checkNewPassword() {
    const myanmarRegex = /[\u1000-\u109F]/;
    if (myanmarRegex.test(this.newPassword)) {
      this.newPassword = this.newPassword.slice(0, -1);
    }
    if (this.newPassword == '' || this.newPassword == undefined || this.newPassword == null) {
      $(".passError2").html(this.translateService.instant("newPassisRequired"));
      return false;
    }
    if (this.newPassword.length > 20) {
      $(".passError2").html(this.translateService.instant("charlength"));
      return false;
    }
    if (this.newPassword != '' || this.newPassword != undefined || this.newPassword != null) {
      if (this.newPassword.length < 6) {
        $(".passError2").html(this.translateService.instant("reqPassSixLength"));
        return false;
      }
      if (this.newPassword.length == 0) {
        $(".passError2").html(this.translateService.instant("newPassisRequired"));
        return false;
      }
      else {
        $(".passError2").html("");
        return true;
      }
    }
    else {
      $(".passError2").html("");
      return true;
    }
  }

  checkConfirmPassword() {
    const myanmarRegex = /[\u1000-\u109F]/;
    if (myanmarRegex.test(this.confirmPassword)) {
      this.confirmPassword = this.confirmPassword.slice(0, -1);
    }
    if (this.confirmPassword == '' || this.confirmPassword == undefined || this.confirmPassword == null) {
      $(".passError3").html(this.translateService.instant("confirmPassLength"));
      return false;
    }
    if (this.confirmPassword.length > 20) {
      $(".passError3").html(this.translateService.instant("charlength"));
      return false;
    }
    if (this.confirmPassword != this.newPassword) {
      $(".passError3").html(this.translateService.instant("confirmPassIncorrect"));
      return false;
    }
    else {
      $(".passError3").html("");
      return true;
    }
  }

  showPassword(show: boolean) {
    this.showPass = show;
    if (this.showPass == true) {
      this.passwordType = "text";
    }
    else {
      this.passwordType = "password";
    }
  }

  showoldPassword(show: boolean) {
    this.showoldPass = show;
    if (this.showoldPass == true) {
      this.oldpasswordType = "text";
    }
    else {
      this.oldpasswordType = "password";
    }
  }

  showconfirmPassword(show: boolean) {
    this.showconfirmPass = show;
    if (this.showconfirmPass == true) {
      this.confirmpasswordType = "text";
    }
    else {
      this.confirmpasswordType = "password";
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
    if (error.status == 400) {
      this.toastr.error(this.translateService.instant("current_password_wrong"), '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
    if (error.status == 404) {
      this.toastr.error("User not found.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }

    return throwError(error);
  }

  changePassword() {
    let checkPass = this.checkPassword();
    let confirmPass = this.checkConfirmPassword();
    let newPass = this.checkNewPassword();
    if (!confirmPass || !newPass || !checkPass) {
      return;
    }

    this.changePasswordModel.oldPassword = this.password;
    this.changePasswordModel.newPassword = this.newPassword;
    if (this.changePasswordModel.oldPassword == this.changePasswordModel.newPassword) {
      this.toastr.error("", this.translateService.instant("oldandnewpasswordSame"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.post(this.funct.ipaddress + 'user/updatePassword', this.changePasswordModel, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          if (this.dto.Response == true) {
            this.toastr.success("", this.translateService.instant("success_message"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            this._location.back();
          }
        }
      );
  }
  enter(event) {
    event.target.blur();
  }
}
