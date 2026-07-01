import { AfterViewInit, Component, Inject, Input, OnInit, Renderer2, OnDestroy, ElementRef, HostListener, ViewContainerRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { Location } from '@angular/common';
import { DeviceUUID, Agent } from 'device-uuid';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { NavigationService } from 'src/app/shared/service/navigation.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { LoginDeviceDialogComponent } from 'src/app/shared/dialog/login-device-dialog/login-device-dialog.component';
import { DOCUMENT, PlatformLocation } from '@angular/common';
import { AppVersionService } from 'src/app/shared/service/app-version.service';
declare var require: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  lang: any;
  phoneValue = "";
  regularExpressionPhone = "^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$";
  standalone: true;
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
  errorMessage: any;
  regExpressionList: any;
  registerCountryCode: any;
  CountryCodeActive: any;
  selectedIndex: any;
  imageUrl = "assets/img/my_flag.png";
  prefix = "+95";
  showPass: boolean;
  passwordType: any;
  localRegisterCountryCode: any;
  activeLang: any;
  deviceInfo = null;
  isUserLoggedIn: any;
  localDeviceId: any;
  bsModalRef: BsModalRef;
  parentLink: any;
  submitLoading: boolean = false;
  isKeyboardVisible = false;
  oncelogin: any;
  version: string | null = null;
  passErr: string = '';
  phoneErr: string = '';
  tg: any;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isKeyboardVisible = window.innerHeight < window.innerWidth;
  }

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    private modalService: BsModalService,
    public common: CommonService,
    public navigation: NavigationService,
    private viewRef: ViewContainerRef, private translateService: TranslateService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private http: HttpClient, private util: UtilService,
    private router: Router, private storage: LocalStorageService,
    private funct: FunctService, private _location: Location,
    private renderer: Renderer2, private el: ElementRef,
    private platformLocation: PlatformLocation,
    private versionService: AppVersionService,
    @Inject(DOCUMENT) private document: any) {
    this.parentLink = history.state.parentLink;
    this.translateService.addLangs(this.supportLanguages);
    var currentLang = this.translateService.currentLang;
    if (currentLang) {
      this.storage.store('localLanguage', currentLang);
      this.activeLang = currentLang;
      return;
    }
    if (this.storage.retrieve('localLanguage') == null || this.storage.retrieve('localLanguage') == '' || this.storage.retrieve('localLanguage') == undefined) {
      this.storage.store('localLanguage', 'en');
      this.activeLang = this.storage.store('localLanguage', 'en');

    }
    else {
      this.translateService.setDefaultLang(this.storage.retrieve('localLanguage'));
      this.activeLang = this.storage.retrieve('localLanguage');
    }
  }

  async ngOnInit(): Promise<void> {
    this.storage.clear('localPhoneValue');
    this.versionService.currentVersion$.subscribe(v => {
      this.version = v;
    });
    this.prefix = this.storage.retrieve('localPhonePrefix');
    this.passwordType = "password";
    this.localDeviceId = this.storage.retrieve('localDeviceId');
    this.fcmtoken = this.storage.retrieve('localFcmtoken');
    this.storage.clear('registeropttype');
    this.storage.store('registeropttype', 'sms_poh')
    if (this.fcmtoken == null || this.fcmtoken == undefined) {
      this.fcmtoken = "fcmtoken";
    }
    this.loginModel = {
      phone_no: '',
      password: '',
      app_version: '',
      fcmtoken: this.fcmtoken,
      deviceId: '',
      ipAddress: '',
    }
    this.getIpAddress();
  }


  updateFCMtoken() {
    var token = this.storage.retrieve('localFcmtoken');
    let headers = new HttpHeaders();
    var phone_no = '';
    var phoneValue = this.storage.retrieve('localPhoneValue');
    var prefix = this.storage.retrieve('localPhonePrefix');

    if ((phoneValue == null || phoneValue == undefined || phoneValue == "")) {
      return;
    }
    if (phoneValue.startsWith('0')) {
      phone_no = prefix + phoneValue.substring(1, phoneValue.length);
    }
    else {
      phone_no = prefix + phoneValue;
    }
    var newToken = {
      fcmtoken: token,
      phone_no: phone_no
    }
    this.http.post(this.funct.ipaddress + 'user/updateFcmtokenInitial', newToken, { headers: headers })
      .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
        }
      );
  }

  checkPhoneNumber(): boolean {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");

    this.phoneErr = '';

    const prefix = this.storage.retrieve('localPhonePrefix');
    this.phoneValue = this.storage.retrieve('localPhoneValue');

    if (!this.phoneValue || this.phoneValue.length === 0) {
      var phoneRequired = this.translateService.instant("requiredFiled");
      phoneRequired = phoneRequired.toString().replace("@value", this.translateService.instant("phonenumbererr"));
      $("#phoneErr").html(phoneRequired);
      return false;
    }

    // Myanmar (+95) phone number validation
    if (prefix === '+95' && !this.phoneValue.startsWith('0')) {
      this.translateService.get('not-allowed-phone').subscribe(res => {
        this.phoneErr = res.replace('@number', '09');
      });
      return false;
    }

    // Thailand (+66) phone number validation
    if (prefix === '+66' && !this.phoneValue.startsWith('0')) {
      this.translateService.get('not-allowed-phone').subscribe(res => {
        this.phoneErr = res.replace('@number', '06, 08, 09');
      });
      return false;
    }

    const mobNumber = new RegExp(this.regularExpressionPhone);
    if (!mobNumber.test(this.phoneValue)) {
      this.translateService.get('phoneInvaild').subscribe(res => this.phoneErr = res);
      return false;
    }
    this.phoneErr = '';
    return true;
  }

  checkPassword(): boolean {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    const myanmarRegex = /[\u1000-\u109F]/;
    if (myanmarRegex.test(this.loginModel.password)) {
      this.loginModel.password = this.loginModel.password.slice(0, -1);
    }

    this.passErr = '';

    if (this.loginModel.password.trim().length < 6) {
      this.translateService.get('reqPassLength').subscribe(res => this.passErr = res);
      return false;
    }

    if (this.loginModel.password.length > 20) {
      this.translateService.get('charlength').subscribe(res => this.passErr = res);
      return false;
    }

    if (this.loginModel.password.length === 6) {
      this.passErr = '';
      return true;
    }
    if (!this.loginModel.password) {
      this.translateService.get(['requiredFiled', 'passwordHint']).subscribe(translations => {
        let passwordRequired = translations['requiredFiled'].replace('@value', translations['passwordHint']);
        this.passErr = passwordRequired;
      });
      return false;
    }
    return true;
  }

  getIpAddress() {
    this.http.get("http://api.ipify.org/?format=json").subscribe((res: any) => {
      this.loginModel.ipAddress = res.ip;
    });
  }

  async login() {
    this.storage.clear('localLanguageIndex');
    this.oncelogin = 1;
    let phCheck = this.checkPhoneNumber();
    let pwdCheck = this.checkPassword();
    if (pwdCheck == false || phCheck == false) {
      return;
    }
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");
    const userAgent = navigator.userAgent;
    let headers = new HttpHeaders().set('User-Agent', userAgent);
    this.loginModel.phone_no = this.phoneValue;
    this.loginModel.app_version = require('../../../../../../package.json').version;
    this.loginModel.deviceId = new DeviceUUID().get();
    this.storage.store('localLoginModel', this.loginModel);
    var secretKey = this.funct.secretKey;
    this.prefix = this.storage.retrieve('localPhonePrefix');
    if (this.phoneValue.startsWith('0')) {
      this.loginModel.phone_no = this.prefix + this.phoneValue.substring(1, this.phoneValue.length);
    }
    else {
      this.loginModel.phone_no = this.prefix + this.phoneValue;
    }
    await this.getIpAddress();
    this.updateFCMtoken();
    this.http.post(this.funct.ipaddress + 'Authenticate/login', this.loginModel, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          if (this.dto.Response.status != 'Error') {
            var token = result["token"];
            if (token != null) {
              this.util.isLogged = true;
              this.dto.token = "Bearer " + token + "";
              this.storage.store('token', this.dto.token);
              this.storage.store('isUserLoggedIn', this.util.isLogged);
              this.storage.clear('localLoginModel');
              this.common.submitLoading = false;
              this.spinner.hide("submitLoading");
              this.router.navigate(['/home'], { replaceUrl: true }).then(() => {
                history.replaceState(null, '', location.href);
                window.addEventListener('popstate', () => {
                  history.replaceState(null, '', location.href);
                });
              });
            }
          }
          else {
            this.common.submitLoading = false;
            this.spinner.hide("submitLoading");
            this.toastr.error(this.dto.Response.message, 'Invalid!', {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }
        }
      );

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

  openNewDialog() {
    const initialState = {
      title: '',
      closeBtnName: '',
      data: this.loginModel,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(LoginDeviceDialogComponent,
      {
        class: 'modal-sm login-device', initialState
      });
  }

  selectLang(lang: string) {
    if (!lang) lang = 'en';
    this.activeLang = lang;
    this.translateService.use(lang);
    this.storage.store('localLanguage', lang);
    this.storage.store('localLanguageIndex', lang);

    if (this.passErr) {
      this.checkPassword();
      this.checkPhoneNumber();
    }
  }

  async getSMS() {
    let config = {
      params: { 'toPhnumber': this.storage.retrieve('localLoginModel').phone_no },
    }
    const axios = require('axios').default;
    await axios.get(this.funct.ipaddress + 'user/sendLoginMsg', config)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        if (error.response) {
        }
      });
  }
  enter(event) {
    event.target.blur();
  }

  openTelegramBot() {
    window.open(
      'https://t.me/Thaisinapp_bot?openinnewtap=1'
    );
    //    window.open(
    //     'https://t.me/Thaisinofficial_bot?openinnewtap=1'
    //   );
  }
}
