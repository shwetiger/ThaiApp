import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, retry } from 'rxjs/operators';
//import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-default-opt-setting',
  templateUrl: './default-opt-setting.component.html',
  styleUrls: ['./default-opt-setting.component.scss']
})
export class DefaultOptSettingComponent implements OnInit {
  token: any;
  selectedType: any;
  smstypeRequest: any;
  phoneNumber: any;
  changeotpprocess: boolean = false;
  email: any;
  gmailResponse: any;
  registerotptype: any;
  formPage: any;
  emailsender: any;
  emaildescription: any;
  submitLoading: boolean = false;
  smsArray: string[] = [];
  smstypestring: any;
  smspohshow: any;
  vibershow: any;
  emailshow: any;
  phonenodescription: any;
  phonesender: any;
  Usefirebase: any;
  SMSoperatorList: any;
  MPTarraylist: any = ['4', '2', '8', '5'];
  OoredooList: any = ['9'];
  MYTELList: any = ['6'];
  TelenorList: any = ['7'];
  recaptcha: any;
  prefix = '+95';//"+95";
  functionName: any;
  Timer: any;

  constructor(public common: CommonService,
    private handleErrorMessage: HandleErrorMessageService,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private http: HttpClient,
    private storage: LocalStorageService,
    private funct: FunctService,
    private route: ActivatedRoute,
    private _location: Location,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.registerotptype = this.storage.retrieve('registeropttype')
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.common.submitLoading = false;
    this.spinner.hide('submitLoading')
    this.prefix = this.storage.retrieve('localPhonePrefix');
    this.route.queryParams.subscribe(params => {
      this.phoneNumber = params['phoneNumber'];
    });
    this.route.queryParams.subscribe(params => {
      this.formPage = params['formPage'];
    });
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
    });
    this.getotptype();
    this.getsmstype();
    this.functionName = 'Register OTP'
  }

  async onSubmit() {
    this.common.submitLoading = true;
    this.spinner.show('submitLoading');
    switch (this.formPage) {
      case 'forgetPassword':
      case 'NEWDIVICE':
      case 'withdrawaladd':
        this.handleOtpPages();
        break;

      case 'register':
        this.getregisterOtp();
        break;

      case 'registerpage':
        this.Saveregisteropttype();
        break;
      case 'withdrawaladdinitial':
        this.SaveOtptype();
        break;
      default:
        this.SaveOtptype();
        break;
    }
  }


  private handleOtpPages() {
    const functionNameMap: any = {
      forgetPassword: 'Forgot Password OTP',
      NEWDIVICE: 'New Device OTP',
      withdrawaladd: 'Withdrawal OTP'
    };
    this.functionName = functionNameMap[this.formPage];
    this.SaveOtptypeandgetotp();
  }


  Saveregisteropttype() {
    if ((this.email == undefined || this.email == '') && this.selectedType == 'email') {
      this.toastr.warning("", this.translateService.instant("emailRequired"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      this._location.back();
    }
    else {
      this.storage.store("registeropttype", this.selectedType)
      this.storage.store("formPageType", "register")
      this.storage.store("registeremail", this.email)
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      this.toastr.success("", this.translateService.instant("bank_accname_success"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      this._location.back();
    }
  }

  SaveOtptype() {
    this.token = this.storage.retrieve('token');
    const headers = new HttpHeaders();
    let phoneValue = this.storage.retrieve('localPhoneValue');

    if (!phoneValue) {
      phoneValue = this.storage.retrieve('tgphnumber');
    }
    const phoneNumber = this.formatPhoneNumber(phoneValue, this.prefix);
    this.http.post(this.funct.ipaddress + 'user/setUserSmsType?type=' + this.selectedType + '&phone_no=' + phoneNumber, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, this.formPage))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.changeotpprocess = true;
          this.storage.store('changeotpprocess', this.changeotpprocess);
          this.common.submitLoading = false;
          this.spinner.hide("submitLoading");
          this._location.back();
          if (this.dto.Response == true) {
            this.toastr.success("", this.translateService.instant("bank_accname_success"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }

        }
      );
  }

  getGmailOTP() {
    this.token = this.storage.retrieve('token');
    const headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'v1/user/getemailotp?email=' + this.email, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.changeotpprocess = true;
          this.storage.store('changeotpprocess', this.changeotpprocess);
          this._location.back();
          this.common.submitLoading = false;
          this.spinner.hide("submitLoading");
          if (this.dto.Response == true) {
            this.toastr.success("", this.translateService.instant("bank_accname_success"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }
        }
      );
  }

  SaveOtptypeandgetotp(): void {
    this.token = this.storage.retrieve('token');
    const url =
      `${this.funct.ipaddress}v1/user/setusersmstypeAndGetOTP` +
      `?type=${this.selectedType}` +
      `&phone_no=${this.phoneNumber}` +
      `&funcionName=${this.functionName}`;

    this.common.submitLoading = true;
    this.http.post<any>(url, {}, { headers: new HttpHeaders() })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, this.formPage))
      )
      .subscribe(response => {
        this.dto.Response = response;
        if (this.isSuccessResponse(response)) {
          this.handleSuccess(response);
          return;
        }

        if (this.isCooldownError(response, '180 seconds')) {
          this.handleCooldownSuccess();
          return;
        }

        if (this.isCooldownError(response, '60 seconds')) {
          this.toastr.error(
            '',
            this.translateService.instant('otp-request-time'),
            { timeOut: 3000, positionClass: 'toast-top-center' }
          );
        }

        this.stopLoading();
      });
  }


  private isSuccessResponse(res: any): boolean {
    return res?.errorCode === '000' && res?.status === true;
  }

  private isCooldownError(res: any, time: string): boolean {
    return res?.status === 'Error' && res?.message?.includes(time);
  }

  private async handleSuccess(res: any): Promise<void> {
    this.storage.store('localOtpSms', res);
    this.storage.store('localNewDeviceOtpSms', res);
    this.storage.store('localInsertAccountOtpSms', res);

    this.updateRequestId(res.request_id);

    await this.getCountDown();

    this.changeotpprocess = true;
    this.storage.store('changeotpprocess', true);

    this.stopLoading();
    this._location.back();

    this.toastr.success(
      '',
      this.translateService.instant('bank_accname_success'),
      { timeOut: 3000, positionClass: 'toast-top-center' }
    );
  }

  private async handleCooldownSuccess(): Promise<void> {
    this.stopLoading();
    await this.getCountDown();
    this._location.back();

    this.toastr.success(
      '',
      this.translateService.instant('bank_accname_success'),
      { timeOut: 3000, positionClass: 'toast-top-center' }
    );
  }

  private updateRequestId(requestId?: string): void {
    if (!requestId) return;

    const existing = this.storage.retrieve('requestId');
    const updated = existing ? `${existing},${requestId}` : requestId;
    this.storage.store('requestId', updated);
  }

  getotptype() {
    let phoneValue = this.storage.retrieve('localPhoneValue');

    if (!phoneValue) {
      phoneValue = this.storage.retrieve('tgphnumber');
    }
    const phoneNumber = this.formatPhoneNumber(phoneValue, this.prefix);
    if (this.formPage == 'register' || this.formPage == 'registerpage') {
      this.selectedType = this.registerotptype;
      if (this.phoneNumber == "" || this.phoneNumber == undefined || this.phoneNumber == null) {
        this.phonesender = '***254';
        this.phonenodescription = this.translateService.instant("sub_otpdesciption1");
        this.phonenodescription = this.phonenodescription.toString().replace("@phonenumber", this.phonesender);
      }
      else {
        const lastThreeDigits = this.phoneNumber.toString().slice(-3);
        this.phonesender = '***' + lastThreeDigits;
        this.phonenodescription = this.translateService.instant("sub_otpdesciption1");
        this.phonenodescription = this.phonenodescription.toString().replace("@phonenumber", this.phonesender);
      }

      if (this.email == "" || this.email == undefined || this.email == null) {
        this.emailsender = '****@gmail.com';
        this.emaildescription = this.translateService.instant("sub_otpdesciption3");
        this.emaildescription = this.emaildescription.toString().replace("@email", this.emailsender);
      }
      else {
        this.emailsender = this.email;
        this.emaildescription = this.translateService.instant("sub_otpdesciption3");
        this.emaildescription = this.emaildescription.toString().replace("@email", this.emailsender);
      }
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }
    else {
      this.token = this.storage.retrieve('token');
      let headers = new HttpHeaders();
      this.http.get(this.funct.ipaddress + 'user/userSmsType?phone_no=' + phoneNumber, { headers: headers })
        .pipe(
          catchError(this.handleErrorMessage.handleError.bind(this, ''))
        )
        .subscribe(
          result => {
            this.dto.Response = result;
            this.selectedType = this.dto.Response.smstype;
            this.common.refreshLoading = false;
            this.spinner.hide("refreshLoading");
            if (this.phoneNumber == "" || this.phoneNumber == undefined || this.phoneNumber == null) {
              this.phonesender = '***254';
              this.phonenodescription = this.translateService.instant("sub_otpdesciption1");
              this.phonenodescription = this.phonenodescription.toString().replace("@phonenumber", this.phonesender);
            }
            else {
              const lastThreeDigits = this.phoneNumber.toString().slice(-3);
              this.phonesender = '***' + lastThreeDigits;
              this.phonenodescription = this.translateService.instant("sub_otpdesciption1");
              this.phonenodescription = this.phonenodescription.toString().replace("@phonenumber", this.phonesender);
            }
            if (this.dto.Response.email != '' && this.dto.Response.email != null) {
              this.emailsender = this.dto.Response.email;
            }
            else {
              this.emailsender = '****@gmail.com';
            }
            this.emaildescription = this.translateService.instant("sub_otpdesciption3");
            this.emaildescription = this.emaildescription.toString().replace("@email", this.emailsender);
          });
    }
  }

  getregisterOtp() {
    this.startLoading();

    if (this.selectedType === 'email' && !this.email) {
      this.showWarning('emailRequired');
      this.stopLoading();
      this.router.navigate(['/login/register']);
      return;
    }

    let params = new HttpParams()
      .set('phoneNo', this.phoneNumber)
      .set('type', this.selectedType);

    // email ကို email type ဖြစ်မှသာ ထည့်
    if (this.selectedType === 'email') {
      params = params.set('email', this.email);
    }

    const url = `${this.funct.ipaddress}v1/user/getRegisterOTP`;

    this.http.get(url, { params })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(res => {
        this.handleRegisterOtpResponse(res);
        this.stopLoading();
      });
  }


  private startLoading() {
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");
  }

  private stopLoading() {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
  }

  private async handleRegisterOtpResponse(response: any) {
    // this.dto.Response = response;
    await this.getCountDown();
    if (response.errorCode === '000' && response.status === true) {
      this.stopLoading();
      if (this.selectedType === 'email') {
        response.to = this.email;
      }
      this.storage.store('localOtpSms', response);
      this.storage.store("registeropttype", this.selectedType);
      this.storeRequestId(response.request_id);
      this.toastr.success(
        "",
        this.translateService.instant("bank_accname_success"),
        { timeOut: 3000, positionClass: 'toast-top-center' }
      );

      this._location.back();
      return;
    }

    // ⏱ 180 seconds case
    if (response.status === 'Error' && response.message?.includes('180 seconds')) {
      this.storage.store("registeropttype", this.selectedType);
      this._location.back();
      return;
    }

    // ⛔ 60 seconds case
    if (response.status === 'Error' && response.message?.includes('60 seconds')) {
      this.toastr.error(
        "",
        this.translateService.instant("otp-request-time"),
        { timeOut: 3000, positionClass: 'toast-top-center' }
      );
      return;
    }

    this.handleOtpBodyError(response);
  }

  private handleOtpBodyError(response: any) {
    if (response.statusCode === 200 && response.body) {
      const msg = response.body.toString().trim();
      if (msg === "Not valid OTP code") {
        this.toastr.error("Bad request.", "OTP is not correct", {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
      }
      if (msg === "Try Again") {
        this.toastr.error("Bad request.", msg, {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
      }
    }
  }

  private storeRequestId(requestId?: string) {
    if (!requestId) return;
    let list = this.storage.retrieve('requestId');
    list = list ? `${list},${requestId}` : requestId;
    this.storage.store('requestId', list);
  }

  private showWarning(translateKey: string) {
    this.toastr.warning(
      "",
      this.translateService.instant(translateKey),
      {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      }
    );
  }

  async getCountDown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.clear('Timer');
      let headers = new HttpHeaders();
      this.http.post(
        this.funct.ipaddress +
        'countdown/get?phoneno=' + this.phoneNumber +
        '&email=' + this.emailsender +
        '&type=' + this.selectedType +
        '&functionName=' + this.functionName,
        {},
        { headers: headers }
      )
        .pipe(catchError(this.handleErrorMessage.handleError.bind(this, '')))
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
    let headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'user/getsmstype', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.smstypestring = this.dto.Response;
          if (this.smstypestring.includes('sms_poh')) {
            this.smspohshow = true;
          }
          if (this.smstypestring.includes('vmg_viber')) {
            this.vibershow = true;
          }
          if (this.smstypestring.includes('email')) {
            this.emailshow = true;
          }
        });
  }

  // private formatPhoneNumber(phone: string, prefix: string): string {
  //   return phone.startsWith('0')
  //     ? prefix + phone.substring(1)
  //     : prefix + phone;
  // }
  private formatPhoneNumber(phone: string, prefix: string): string {
  if (!phone) return '';

  return phone.startsWith(prefix)
    ? phone
    : prefix + (phone.startsWith('0') ? phone.slice(1) : phone);
}
}
