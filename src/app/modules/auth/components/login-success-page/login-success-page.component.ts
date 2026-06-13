import { Component, OnInit } from '@angular/core';
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
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
@Component({
  selector: 'app-login-success-page',
  templateUrl: './login-success-page.component.html',
  styleUrls: ['./login-success-page.component.scss']
})
export class LoginSuccessPageComponent implements OnInit {

  loadingSubmiting: boolean = false;
  prefix: any;
  phoneValue: any;
  loginModel: any;
  oldLoginModel: any;
  token: any;
  deviceId: any;

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
    private _location: Location,) {
   this.oldLoginModel=this.storage.retrieve('loginModel')

  }

  async ngOnInit(): Promise<void> {
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

  async goToAutoLogin() {
    this.loadingSubmiting = true;
    this.spinner.show("loadingSubmiting");
    let headers = new HttpHeaders();
    this.loginModel.phone_no = this.oldLoginModel.phone_no;
    this.loginModel.app_version = require('../../../../../../package.json').version;
    this.loginModel.deviceId = new DeviceUUID().get();
    this.storage.store('localDeviceId', this.loginModel.deviceId)
    this.loginModel.password = this.oldLoginModel.password;
    if (this.storage.retrieve('localFcmtoken') != null && this.storage.retrieve('localFcmtoken') != undefined) {
      this.loginModel.fcmtoken = this.storage.retrieve('localFcmtoken');
    }
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
              this.storage.store('token', token);
              this.storage.store('isUserLoggedIn', this.util.isLogged);
              this.storage.clear('localLoginModel');
              this.storage.clear('localNewNotiCount');
              this.deviceId = this.storage.retrieve('localDeviceId');
              this.router.navigate(['/home', this.deviceId], { replaceUrl: true });
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
}