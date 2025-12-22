import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
import { catchError } from 'rxjs/operators';
import { OtpScenario, OtpType } from 'src/app/shared/otp/models/otp-type.enum';
import { OtpService } from 'src/app/shared/otp/services/otp.service';
import { OtpStorageKeys } from 'src/app/shared/otp/models/otp-storage-keys';


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
    // 优先从统一存储键读取，如果不存在则使用默认值
    this.registerotptype = this.storage.retrieve(OtpStorageKeys.OTP_TYPE) || 
                           this.storage.retrieve('registeropttype') || 
                           OtpType.SMS;
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
        this.formPage == OtpScenario.WITHDRAW_INSERT) {
      if (this.formPage == OtpScenario.FORGET_PASSWORD) {
        this.funcionName = 'Forgot Password OTP'
      }
      if (this.formPage == OtpScenario.NEW_DEVICE) {
        this.funcionName = 'New Device OTP'
      }
      if (this.formPage == OtpScenario.WITHDRAW_INSERT) {
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
      this.storage.store(OtpStorageKeys.OTP_TYPE, this.selectedType);
      // 注册界面可以选择发送otp 类型，保存到localStorage
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
    
    // 验证 selectedType 是否为有效的 OtpType 枚举值，并转换为 OtpType
    const validOtpTypes = Object.values(OtpType);
    const otpType = (this.selectedType && validOtpTypes.includes(this.selectedType as OtpType))
      ? this.selectedType as OtpType
      : OtpType.SMS; // 如果无效，使用默认值 SMS
    
    // 将 formPage 转换为 OtpScenario
    const scenario = this.formPage as OtpScenario;
    
    this.otpService.sendOtpBySettingType({
      type: otpType,
      phoneNumber: this.phoneNumber,
      scenario: scenario,
      funcionName: this.funcionName,
      token: this.token
    })
    .subscribe({
      next: (result) => {
        // 成功处理（包括 180 seconds 的情况）
        this.changeotpprocess = true;
        this.storage.store('changeotpprocess', this.changeotpprocess);
        
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
        this._location.back();
        this.toastr.success("", this.translateService.instant("bank_accname_success"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
      },
      error: (error: Error & { is180SecondsError?: boolean }) => {
        // 错误处理（统一由新服务处理，包括 60 seconds 错误）
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");

        if (error.is180SecondsError) {
          this._location.back();
        } else {
          this.toastr.error("", error.message, {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          });
        }
      }
    });
  }

  getotptype() {
    if (this.formPage == 'register' || this.formPage == 'registerpage') {
      // 确保 selectedType 有值，如果 registerotptype 为空则使用默认值
      this.selectedType = this.registerotptype || OtpType.SMS;
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
    
    // 邮箱类型验证
    if (this.selectedType == 'email') {
      if ((this.email == undefined || this.email == '') && this.selectedType == 'email') {
        this.toastr.warning("", this.translateService.instant("emailRequired"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        this.router.navigate(['/login/register']);
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
        return;
      }
    }
    
    // 验证 selectedType 是否为有效的 OtpType 枚举值，并转换为 OtpType
    const validOtpTypes = Object.values(OtpType);
    const otpType = (this.selectedType && validOtpTypes.includes(this.selectedType as OtpType))
      ? this.selectedType as OtpType
      : OtpType.SMS; // 如果无效，使用默认值 SMS

    // 统一使用 sendRegisterOtp 方法（统一使用 getRegisterOTP API）
    this.otpService.sendRegisterOtp({
      phoneNumber: this.phoneNumber,
      email: this.email || '',
      type: otpType
    })
    .subscribe({
      next: (result) => {
               
        // 成功处理（包括 180 seconds 的情况，由新服务统一处理）
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
        this.toastr.success("", this.translateService.instant("bank_accname_success"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        this._location.back();
      },
      error: (error: Error & { is180SecondsError?: boolean }) => {
        // 错误处理（统一由新服务处理，包括 60 seconds 错误）
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
        
        if (error.is180SecondsError) {
          // 注册场景下 即使出现180限流警告，也要存储 OTP 类型，otp 页面需要根据otpType 来显示对应的倒计时
          this.storage.store(OtpStorageKeys.OTP_TYPE, otpType);
          this._location.back();
        } else {
          this.toastr.error("", error.message, {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          });
        }
      }
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

}
