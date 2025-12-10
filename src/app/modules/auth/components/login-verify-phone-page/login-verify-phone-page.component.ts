import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError } from 'rxjs/operators';
import { Location } from '@angular/common';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { OtpService } from 'src/app/shared/otp/services';
@Component({
  selector: 'app-login-verify-phone-page',
  templateUrl: './login-verify-phone-page.component.html',
  styleUrls: ['./login-verify-phone-page.component.scss']
})
export class LoginVerifyPhonePageComponent implements OnInit {

  active: string;
  supportLanguages = ['en', 'my', 'th', 'zh'];
  albumList: any;
  loginModel: any;
  phone_no: any;
  password: any;
  app_version: any;
  fcmtoken: any;
  deviceId: any;
  ipAddress: any;
  token: any;

  prefix = '+95';//"+95";
  localRegisterCountryCode: any;
  regularExpression: any;
  activeLang: any;

  actionType: any;
  phoneNumber: any;
  prefixPhoneNumber: any;
  modalId: any;
  newDeviceOtpSms: any;
  updateDeviceId: any;

  phoneValue = history.state.phoneNumber;
  regularExpressionPhone = "^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$";
  smstype: any;

  constructor(
    public common: CommonService,
    private handleErrorMessage: HandleErrorMessageService,
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
    private otpService: OtpService) {
    
    this.actionType = history.state.actionType;
    this.phoneNumber = history.state.phoneNumber;
    this.translateService.addLangs(this.supportLanguages);

    if (this.storage.retrieve('localLanguage') == null || this.storage.retrieve('localLanguage') == '') {
      this.storage.store('localLanguage', 'en');
      this.activeLang = this.storage.store('localLanguage', 'en');
    }
    else {
      this.translateService.setDefaultLang(this.storage.retrieve('localLanguage'));
      this.activeLang = this.storage.retrieve('localLanguage');
    }
  }

  ngOnInit(): void {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    var fcmtoken = this.storage.retrieve('localFcmtoken');
    var fcm;
    if (fcmtoken != null) {
      fcm = fcmtoken;
    }
    else {
      fcm = 'fcmtoken';
    }
    this.loginModel = {
      phone_no: '',
      password: '',
      app_version: '',
      fcmtoken: fcm,
      deviceId: '',
      ipAddress: ''
    }
    this.updateDeviceId = {
      deviceId: '',
      phone_no: '',
      ipAddress: ''
    }
    this.prefix = this.storage.retrieve('localPhonePrefix');
    this.getIpAddress();
    this.getsmstype();
  }

  getIpAddress() {
    this.http.get("http://api.ipify.org/?format=json").subscribe((res: any) => {
      this.loginModel.ipAddress = res.ip;
    });
  }

  checkPhoneNumber() {
    $("#phoneErr").html("");
    var prefix = this.storage.retrieve('localPhonePrefix');
    if (this.phoneValue.length == 0) {
      var phoneRequired = this.translateService.instant("requiredFiled");
      phoneRequired = phoneRequired.toString().replace("@value", this.translateService.instant("phonenumbererr"));
      $("#phoneErr").html(phoneRequired);
      return false;
    }

    if (prefix == "+95") {
      if (!this.phoneValue.startsWith("0")) {
        var checkNumber = this.translateService.instant("not-allowed-phone");
        checkNumber = checkNumber.toString().replace("@number", "09");
        $("#phoneErr").html(checkNumber);
        return false;
      }
    }
    if (prefix == "+66") {
      if (!this.phoneValue.startsWith("0")) {
        var checkNumber = this.translateService.instant("not-allowed-phone");
        checkNumber = checkNumber.toString().replace("@number", "06, 08, 09");
        $("#phoneErr").html(checkNumber);
        return false;
      }
    }

    let mobNumber = RegExp(this.regularExpressionPhone); // /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/;

    if (!mobNumber.test(this.phoneValue)) {
      $("#phoneErr").html(this.translateService.instant("phoneInvaild"));
      return false;
    }
    else {
      $("#phoneErr").html("");
      return true;
    }
  }

  getOtp() {
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");

    let phCheck = this.checkPhoneNumber();
    if (phCheck == false) {
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      return;
    }

    this.phoneValue = this.storage.retrieve('localPhoneValue');
    let phoneNumber: string;
    if (this.phoneValue.startsWith("0")) {
      phoneNumber = this.prefix + this.phoneValue.substring(1, this.phoneValue.length);
    } else {
      phoneNumber = this.prefix + this.phoneValue;
    }
     
    // 使用 OtpService 发送新设备 OTP（不需要 token）
    this.otpService.sendNewDeviceOtp({
      phoneNumber: phoneNumber
    })
    .subscribe({
      next: () => {
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
        this.router.navigate(['/login/otp'], { replaceUrl: true });
      },
      error: (error: Error & { is180SecondsError?: boolean }) => {
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");

        if (error.is180SecondsError) { 
          this.router.navigate(['/login/otp'], { replaceUrl: true });
        } else {
          this.toastr.error("", error.message, {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          });
        }
        
      }
    });
  }

  selectLang(lang: string) {
    this.translateService.use(lang);
    this.storage.store('localLanguage', lang);
    this.active = 'active';
  }

  UpdateNewDeviceId() {
    let headers = new HttpHeaders();
    this.updateDeviceId.phone_no = this.storage.retrieve('localLoginModel').phone_no;
    this.updateDeviceId.ipAddress = this.storage.retrieve('localLoginModel').ipAddress;
    this.updateDeviceId.deviceId = this.storage.retrieve('localLoginModel').deviceId;
    this.http.post(this.funct.ipaddress + 'user/updateDeviceId', this.updateDeviceId, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, 'otp'))
      )
      .subscribe(
        result => {
          this.common.submitLoading = false;
          this.spinner.hide("submitLoading");
          this.dto.Response = result;
          if (this.dto.Response.status == 401) {
            if (this.dto.Response.code == 0) {
              this.toastr.error("", this.translateService.instant('invalid-otp-code'),
                {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-center',
                });
              return;
            } if (this.dto.Response.code == 10) {
              this.toastr.error("", this.translateService.instant('otp-token-expired'),
                {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-center',
                });
              return;
            }
          }

          var loginDevice = this.storage.retrieve('localForgetLoginDevice');
          if (this.dto.Response.status == "Success") {
            if (loginDevice == 'loginDevice') {
              this.goToAutoLogin();
              this.storage.clear('localForgetLoginDevice');
            }
            else {
              this.storage.clear('localNewDeviceOtpSms');
              this.autoLogin();
              return;
            }
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

  autoLogin() {
    var autoLoginModal = this.storage.retrieve('localLoginModel');
    let headers = new HttpHeaders();
    this.http.post(this.funct.ipaddress + 'Authenticate/login', autoLoginModal, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        async result => {
          this.dto.Response = result;
          if (this.dto.Response.status != 'Error') {
            var token = result["token"];
            if (token != null) {
              this.util.isLogged = true;
              this.dto.token = "Bearer " + token + "";
              this.storage.store('token', this.dto.token);
              this.storage.store('isUserLoggedIn', this.util.isLogged);
              this.storage.clear('localLoginModel');
              this._location.back();
              this._location.back();

            }
          }
          else {
            this.spinner.hide();
            this.toastr.error('', this.dto.Response.message, {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }
        }
      );
  }

  async goToAutoLogin() {
    let headers = new HttpHeaders();
    var loginModel = this.storage.retrieve('localLoginModel');
    this.http.post(this.funct.ipaddress + 'Authenticate/login', loginModel, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.storage.clear('localLoginModel');
          this.dto.Response = result;
          if (this.dto.Response.status != 'Error') {
            var token = result["token"];
            if (token != null) {
              this.util.isLogged = true;
              this.dto.token = "Bearer " + token + "";
              this.storage.store('token', this.dto.token);
              this.storage.store('isUserLoggedIn', this.util.isLogged);
              this.storage.clear('localLoginModel');
              this._location.back();
              this._location.back();
              this._location.back();
            }
          }
          else {
            this.toastr.error(this.dto.Response.message, 'Invalid!', {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }
        }
      );
  }

  getsmstype() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'user/userSmsType?phone_no=' + this.phoneNumber, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.smstype = this.dto.Response.smstype;
        });
  }
}
