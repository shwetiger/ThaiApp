import { Component, OnInit, ViewChild } from '@angular/core';
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
declare var require: any;

@Component({
  selector: 'app-email-otp-confirm',
  templateUrl: './email-otp-confirm.component.html',
  styleUrls: ['./email-otp-confirm.component.scss']
})
export class EmailOtpConfirmComponent implements OnInit {
  @ViewChild('codeInput') codeInput !: CodeInputComponent;
  otpcode: any;
  token: any;
  request_Id: any;
  emailaddress: any;
  emailotpdesc: any;
  coundDown: number;
  time: number = 180;
  emailModel: any;
  interval: any;

  constructor(private handleErrorMessage: HandleErrorMessageService,
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
  ) { }

  ngOnInit(): void {
    this.request_Id = this.storage.retrieve("emailrequestId");
    this.emailaddress = this.storage.retrieve("emailaddress");
    this.emailotpdesc = this.translateService.instant("emailotp_description");
    this.emailotpdesc = this.emailotpdesc.toString().replace("@email", this.emailaddress);
    this.time = this.storage.retrieve('Timer');
    this.emailModel = {
      email_address: ''
    }
    if (this.time == null) {
      this.time = 180;
    }
    this.startCountdown(this.time);
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


  SaveEmail() {
    if (this.otpcode == undefined) {
      $("#passErr").html(this.translateService.instant("otp_required"));
      return false;
    }
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    let params = new HttpParams()
      .set('email', this.emailaddress)
      .set('request_id', String(this.storage.retrieve('emailrequestId'))) // Convert `request_id` to a string
      .set('code', String(this.otpcode));
    this.http.get(this.funct.ipaddress + 'user/updateuseremail', { params: params, headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.common.submitLoading = false;
          this.spinner.hide("submitLoading");
          if (this.dto.Response.status == true) {
            this.toastr.success("", this.translateService.instant("bank_accname_success"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            this._location.back();
          }
          else {
            if(this.dto.Response.message=='Invalid OTP Token')
            {
              this.toastr.error("", this.translateService.instant("invalid-otp-code"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return;
            }
            if(this.dto.Response.message=='The OTP Token has expired')
            {
              this.toastr.error("", this.translateService.instant("otp-token-expired"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return;
            }
            this.toastr.error("", this.dto.Response.message, {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }

        }
      );
  }

  getOtp() {
    this.codeInput.reset();
    this.time = 180;
    this.startCountdown(this.time);
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.emailModel.email_address=this.emailaddress;
    let params = new HttpParams();
    params = params.set("email", this.emailModel.email_address.trim());
    this.http.get(this.funct.ipaddress + 'v1/user/getemailotp?email=' + this.emailModel.email_address, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, 'emailRequired'))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          if (this.dto.Response.status == true) {
              this.request_Id = parseInt(this.dto.Response.request_id as string, 10);
              let requestIdList = this.storage.retrieve('emailrequestId');
              if (requestIdList && this.dto.Response.request_id !== undefined) {
                requestIdList += ',' + this.dto.Response.request_id;
              } else if (this.dto.Response.request_id !== undefined) {
                requestIdList = this.request_Id;
              }
              this.storage.store('emailrequestId', requestIdList);
            this.otpcode = this.dto.Response.code;
            this.common.submitLoading = false;
            this.spinner.hide("submitLoading");
          }
          else {
            this.toastr.success("", this.translateService.instant("bank_accname_success"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }
        }
      );
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
}
