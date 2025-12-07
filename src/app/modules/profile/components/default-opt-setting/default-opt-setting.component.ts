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
import { OtpScenario, OtpDisplayType } from 'src/app/modules/auth/components/otp-page/models/otp-type.enum';
import { OtpService } from 'src/app/modules/auth/components/otp-page/services/otp-service';
import { OtpStorageKeys } from 'src/app/modules/auth/components/otp-page/models/otp-storage-keys';


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
  formPage;
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
  prefix = '+95';//"+95";
  funcionName: any;

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
    private otpService: OtpService) {
  }

  ngOnInit(): void {
    this.registerotptype = this.storage.retrieve('registeropttype')
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.common.submitLoading=false;
    this.spinner.hide('submitLoading')
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
    this.funcionName = 'Register OTP'
  }

  onSubmit() {
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");
    // 兼容新旧场景标识
    if (this.formPage == OtpScenario.FORGET_PASSWORD || this.formPage == OtpScenario.NEW_DEVICE || 
        this.formPage == OtpScenario.WITHDRAW_INSERT || this.formPage == OtpScenario.WITHDRAWAL_ADD) {
      if (this.formPage == OtpScenario.FORGET_PASSWORD) {
        this.funcionName = 'Forgot Password OTP'
      }
      if (this.formPage == OtpScenario.NEW_DEVICE) {
        this.funcionName = 'New Device OTP'
      }
      if (this.formPage == OtpScenario.WITHDRAW_INSERT || this.formPage == OtpScenario.WITHDRAWAL_ADD) {
        this.funcionName = 'Withdrawal OTP'
      }
      this.SaveOtptypeandgetotp();
    }
    else if (this.formPage == 'register') {
      this.getregisterOtp();
    }
    else if (this.formPage == 'registerpage') {
      this.Saveregisteropttype();
    }
    else {
      this.SaveOtptype();
    }
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
    this.http.post(this.funct.ipaddress + 'user/setUserSmsType?type=' + this.selectedType + '&phone_no=' + this.phoneNumber, { headers: headers })
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
    this.http.get(this.funct.apaddressv1 + 'user/getemailotp?email=' + this.email, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          console.log("OtpResponse4>>>>>"+JSON.stringify(this.dto.Response));
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

  SaveOtptypeandgetotp() {
    this.token = this.storage.retrieve('token');
    const headers = new HttpHeaders();
    this.http.post(this.funct.apaddressv1 + 'user/setusersmstypeAndGetOTP?type=' + this.selectedType + '&phone_no=' + this.phoneNumber + '&funcionName=' + this.funcionName, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, this.formPage))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          console.log("OtpResponse1>>>>>"+JSON.stringify(this.dto.Response));
          if (this.dto.Response.errorCode === '000' && this.dto.Response.status === true) {
            // 合并 request_ids，避免覆盖已有的 request_id
            const displayType = this.otpService.convertToDisplayType(this.selectedType);
            const enhancedResponse = this.otpService.enhanceResponseWithRequestIds(
              OtpStorageKeys.OTP_RESPONSE,
              this.dto.Response,
              displayType
            );
            this.storage.store('localOtpSms', enhancedResponse);
            this.storage.store('localNewDeviceOtpSms', enhancedResponse);
            this.storage.store('localInsertAccountOtpSms', enhancedResponse);
            this.storage.clear("Timer");          
            this.changeotpprocess = true;
            this.storage.store('changeotpprocess', this.changeotpprocess);
            this.common.submitLoading = false;
            this.spinner.hide("submitLoading");
            this._location.back();
            this.toastr.success("", this.translateService.instant("bank_accname_success"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }

          else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('180 seconds')) {
            this.common.submitLoading = false;
            this.spinner.hide("submitLoading");
            this._location.back();
            this.toastr.success("", this.translateService.instant("bank_accname_success"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }

          else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('60 seconds')) {
            this.toastr.error("", this.translateService.instant("otp-request-time"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            this.storage.clear('Timer');
            return null;
          }

        }
      );
  }

  getotptype() {
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
      this.http.get(this.funct.ipaddress + 'user/userSmsType?phone_no=' + this.phoneNumber, { headers: headers })
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
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");
    let headers = new HttpHeaders();
    if (this.selectedType == 'email') {
      if ((this.email == undefined || this.email == '') && this.selectedType == 'email') {
        this.toastr.warning("", this.translateService.instant("emailRequired"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        this.router.navigate(['/login/register']);
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
      }
      else {
        this.http.get(this.funct.apaddressv1 + 'user/getRegisterOTP?phoneNo=' + this.phoneNumber + '&type=' + this.selectedType + '&email=' + this.email, { headers: headers })
          .pipe(
            catchError(this.handleErrorMessage.handleError.bind(this, ''))
          )
          .subscribe(
            result => {
              this.dto.Response = result;
              console.log("OtpResponse2>>>>>"+JSON.stringify(this.dto.Response));
              this.gmailResponse = this.dto.Response;
              if (this.dto.Response.errorCode === '000' && this.dto.Response.status === true) {
                this.gmailResponse.to = this.email;
                this.common.submitLoading = false;
                this.spinner.hide("submitLoading");
                this.storage.clear("Timer");
                this.spinner.hide("submitLoading");
                this.storage.store("registeropttype", this.selectedType);
                // 合并 request_ids，避免覆盖已有的 request_id
                const displayType = this.otpService.convertToDisplayType(this.selectedType);
                const enhancedResponse = this.otpService.enhanceResponseWithRequestIds(
                  OtpStorageKeys.OTP_RESPONSE,
                  this.gmailResponse,
                  displayType
                );
                this.storage.store('localOtpSms', enhancedResponse);
                this._location.back();
                this.toastr.success("", this.translateService.instant("bank_accname_success"), {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
              }
              else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('180 seconds')) {
                this.storage.store("registeropttype", this.selectedType)
                this._location.back();
              }

              else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('60 seconds')) {
                this.toastr.error("", this.translateService.instant("otp-request-time"), {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
                this.storage.clear('Timer');
                return null;
              }
            }
          );
      }
    }
    else {
      this.http.get(this.funct.apaddressv1 + 'user/getRegisterOTPNew?phoneNo=' + this.phoneNumber + '&type=' + this.selectedType, { headers: headers })
        .pipe(
          catchError(this.handleErrorMessage.handleError.bind(this, ''))
        )
        .subscribe(
          result => {
            this.dto.Response = {};
            this.dto.Response = result;
            console.log("OtpResponse3>>>>>"+JSON.stringify(this.dto.Response));
            if (this.dto.Response.errorCode === '000' && this.dto.Response.status === true) {
              this.common.submitLoading = false;
              this.spinner.hide("submitLoading");
              // 合并 request_ids，避免覆盖已有的 request_id
              const displayType = this.otpService.convertToDisplayType(this.selectedType);
              const enhancedResponse = this.otpService.enhanceResponseWithRequestIds(
                OtpStorageKeys.OTP_RESPONSE,
                this.dto.Response,
                displayType
              );
              this.storage.store('localOtpSms', enhancedResponse);
              this.storage.store("registeropttype", this.selectedType);
              this.storage.clear("Timer");
              this.toastr.success("", this.translateService.instant("bank_accname_success"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
              });
              this._location.back();
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
              }
            }

            else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('180 seconds')) {
              this.storage.store("registeropttype", this.selectedType)
              this._location.back();
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
              }
            }

            else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('60 seconds')) {
              this.toastr.error("", this.translateService.instant("otp-request-time"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
              });
              this.storage.clear('Timer');
              return null;
            }

          }
        );
    }
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

}
