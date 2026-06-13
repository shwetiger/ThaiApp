import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Location } from '@angular/common';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { ZawgyiDetector } from '@myanmartools/ng-zawgyi-detector';

@Component({
  selector: 'app-register-invite-code',
  templateUrl: './register-invite-code.component.html',
  styleUrls: ['./register-invite-code.component.scss']
})
export class RegisterInviteCodeComponent implements OnInit {
  token: any;
  otpVerifyToken: any;
  refModel: any;
  loadingSubmiting: any;
  loadingSubmitingOne: any;
  regularExpression = "^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$";
  regularExpressionPhone = "^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$";
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
    private location: Location,
    private route: ActivatedRoute,
    private readonly _zawgyiDetector: ZawgyiDetector) {
    this.refModel = this.storage.retrieve('registerModel');
  }

  ngOnInit(): void {
    if (this.refModel) {
      this.storage.store('registerModel', this.refModel);
    }
    const lang = this.storage.retrieve('localLanguage') || 'en';
    this.translateService.setDefaultLang('en');
    this.translateService.use(lang);
  }

  onRefChange() {
    this.storage.store('registerModel', this.refModel);
  }

  checkPhoneNumber() {
    if (!this.refModel.referral_phone_no) {
      $("#phoneErr").html("");
      return true;
    }
    const pattern = new RegExp(this.regularExpressionPhone);
    if (!pattern.test(this.refModel.referral_phone_no)) {
      $("#phoneErr").html(this.translateService.instant("phoneInvaild"));
      return false;
    }
    $("#phoneErr").html("");
    return true;
  }

  handleError(error: HttpErrorResponse) {
  // console.log("Error>>>>" + JSON.stringify(error));
    this.loadingSubmiting = false;
    this.spinner.hide("loadingSubmiting");
    this.loadingSubmitingOne = false;
    this.spinner.hide("loadingSubmitingOne");

    if (error.status == 0) {
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 400 && error.error.message == 'The email address is already used by another user') {
      this.toastr.error("", this.translateService.instant("email_already_used"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 423) {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      this.storage.clear('token');
      this.storage.clear('isUserLoggedIn');
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    if (error.status == 400) {
      if (error.error.errors.registerKey == "Register Key is required") {
        this.toastr.error("", 'Illegal register', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      else {
        this.toastr.error("Invalid Referral Code.", 'Invalid!', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
    }
    if (error.status == 403) {
      if (error.error.message == ' Invite code/agent code  does not exist!') {
        this.toastr.error("", this.translateService.instant("invalid_invitecode"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      if (error.error.message == " Invite mobile number does not exist!") {
        this.toastr.error("", this.translateService.instant("invalid_ref_phoneno"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      else {
        this.toastr.error("", error.error.message.toString(), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
    }
  }

  registerInviteCode(inviteCode: boolean) {
    if (inviteCode) {
      this.loadingSubmitingOne = true;
      this.spinner.show("loadingSubmitingOne");
      if (this.refModel.referral_code && this.refModel.referral_code.includes(' ')) {
        this.toastr.error("", this.translateService.instant('invalid_invitecode'), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        this.loadingSubmitingOne = false;
        this.spinner.hide("loadingSubmitingOne");
        return;
      }
      if (
        (this.refModel.referral_phone_no && this.refModel.referral_phone_no.includes(' '))) {
        this.toastr.error("", this.translateService.instant('phoneInvaild'), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        this.loadingSubmitingOne = false;
        this.spinner.hide("loadingSubmitingOne");
        return;
      }

      if (this.refModel.referral_code == '' &&
        (this.refModel.referral_phone_no == undefined || this.refModel.referral_phone_no == '')) {
        this.toastr.error("", this.translateService.instant('only_refcode_alert'), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        this.loadingSubmitingOne = false;
        this.spinner.hide("loadingSubmitingOne");
        return;
      }
    } else {
      this.refModel.referral_code = '';
      this.loadingSubmiting = true;
      this.spinner.show("loadingSubmiting");
    }
    this.token = this.storage.retrieve('token');
    this.otpVerifyToken = this.storage.retrieve('otpVerifyToken');
    this.refModel.otpVerifyToken = this.otpVerifyToken;
    let headers = new HttpHeaders().set('Authorization', this.token);
    this.http.post(this.funct.ipaddress + 'v2/authenticate/register', this.refModel, { headers })
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe(result => {
        this.dto.Response = result;
        this.storage.clear('localEmail');
        if (this.dto.Response.status == "Success") {
          this.loadingSubmiting = false;
          this.spinner.hide("loadingSubmiting");
          this.loadingSubmitingOne = false;
          this.spinner.hide("loadingSubmitingOne");
          this.storage.clear('registeropttype');
          this.storage.store('loginModel', this.refModel);
          this.router.navigate(['/login/success'], {
            state: { 'loginModel': this.refModel },
            replaceUrl: true
          });
        } else {
          this.toastr.error("Tip", this.dto.Response.message.toString(), {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          });
          return false;
        }
      });
  }
}
