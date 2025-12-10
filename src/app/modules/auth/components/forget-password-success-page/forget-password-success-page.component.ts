import { Component, OnInit, ViewContainerRef } from '@angular/core';
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
declare var require: any;
import { DeviceUUID, Agent } from 'device-uuid';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FunctService } from 'src/app/shared/service/funct.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { ForgetLoginDeviceDialogComponent } from 'src/app/shared/dialog/forget-login-device-dialog/forget-login-device-dialog.component';
import { OtpService } from 'src/app/shared/otp/services';

@Component({
  selector: 'app-forget-password-success-page',
  templateUrl: './forget-password-success-page.component.html',
  styleUrls: ['./forget-password-success-page.component.scss']
})
export class ForgetPasswordSuccessPageComponent implements OnInit {
  loadingSubmiting: boolean = false;
  prefix: any;
  phoneValue: any;
  loginModel: any;
  oldLoginModel: any;
  bsModalRef: BsModalRef;
  updateDeviceIdforforget: any;
  constructor(
    private _location: Location,
    private modalService: BsModalService,
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
    private common: CommonService) {
    this.oldLoginModel = history.state.forgetPasswordModel;
  }

  async ngOnInit(): Promise<void> {
    this.updateDeviceIdforforget = {
      deviceId: '',
      phone_no: '',
      ipAddress: ''
    }
    this.loginModel = {
      phone_no: '',
      password: '',
      app_version: '',
      fcmtoken: 'fcmtoken',
      deviceId: '',
      ipAddress: '',
    }
    await this.getIpAddress();
  }


  handleError(error: HttpErrorResponse) {
    if (error.status == 0) {
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
    if (error.status == 304) {
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

  openNewDialog() {
    const initialState = {
      title: '',
      closeBtnName: '',
      data: this.loginModel,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(ForgetLoginDeviceDialogComponent,
      {
        class: 'modal-sm forget-login-device', initialState
      });
  }

  async goToAutoLogin() {
    let headers = new HttpHeaders();
    const registerModel = this.storage.retrieve('forgetPasswordModel');
    this.loginModel.phone_no = registerModel.phone_no;
    this.loginModel.app_version = registerModel.appVersion;
    this.loginModel.deviceId = new DeviceUUID().get();
    this.loginModel.password = registerModel.password;
    if (this.storage.retrieve('localFcmtoken') != null && this.storage.retrieve('localFcmtoken') != undefined) {
      this.loginModel.fcmtoken = this.storage.retrieve('localFcmtoken');
    }
    this.storage.store('localLoginModel', this.loginModel);
    this.http.post(this.funct.ipaddress + 'Authenticate/login', this.loginModel, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
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
              this.storage.clear('localForgetPasswordSuccess');
              this.storage.clear('forgetPasswordModel');
              this.router.navigate(['/home'], { replaceUrl: true }).then(() => {
                // Prevent browser back
                history.pushState(null, '', location.href);
                window.addEventListener('popstate', () => {
                  history.pushState(null, '', location.href);
                });
              });
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

  getIpAddress() {
    this.http.get("http://api.ipify.org/?format=json").subscribe((res: any) => {
      this.loginModel.ipAddress = res.ip;
    });
  }

  UpdateNewDeviceId() {
    this.goToAutoLogin();
  }
}