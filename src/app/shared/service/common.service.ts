import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FunctService } from './funct.service';
import { DtoService } from './dto.service';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  isLogged: any;
  gameProviderList : any;
  token: any;
  userProfileBalance : any;
  mainWallet : any;
  subject = new Subject<string>();
  dataSubject = new BehaviorSubject<any>(null);
  refreshLoading: boolean=false;
  submitLoading: boolean=false;
  betLoading: boolean=false;
  closeLoadingSubmit: boolean= false;
  mainBananceLoadingSubmit: boolean= false;
  balanceLoading: boolean= false;
  twodCloseTimeLoading: boolean= false;
  threedCloseTimeLoading: boolean= false;
  gameLoading: boolean=false;
  data:any;
  actionType: String="";
  formPage: string="";
  loading: any = {
    apiLoading: {
      name: 'apiLoading',
      size: 'small',
      color: '#ffffff',
      type: 'ball-spin-clockwise',
      fullScreen: true
    },
    balanceLoading: {
      name: 'balanceLoading',
      size: 'small',
      color: '#32cd32',
      type: 'ball-spin-clockwise',
      fullScreen: false,
      bdColor: "rgba(0, 0, 0, 0)"
    },

    twodCloseTimeLoading: {
      name: 'twodCloseTimeLoading',
      size: 'small',
      color: '#32cd32',
      type: 'ball-spin-clockwise',
      fullScreen: false,
      bdColor: "rgba(0, 0, 0, 0)"
    },
    threedCloseTimeLoading: {
      name: 'threedCloseTimeLoading',
      size: 'small',
      color: '#32cd32',
      type: 'ball-spin-clockwise',
      fullScreen: false,
      bdColor: "rgba(0, 0, 0, 0)"
    },

     refreshLoading: {
      name: 'refreshLoading',
      size: 'medium',
      color: '#32cd32',
      type: 'ball-spin-clockwise',
      fullScreen: true
    },
     submitLoading: {
      name: 'submitLoading',
      size: 'medium',
      color: 'rgb(6,56,107)',
      type: 'ball-elastic-dots',
      fullScreen: false,
    },
    betLoading: {
      name: 'betLoading',
      size: 'small',
      color: 'rgb(6,56,107)',
      type: 'ball-spin-clockwise',
      fullScreen: false,
    },
    closeLoadingSubmit: {
      name: 'closeLoadingSubmit',
      size: 'small',
      color: '#32cd32',
      type: 'ball-spin-clockwise',
      fullScreen: false,
      bdColor: "rgba(0, 0, 0, 0)"
    },
    mainBananceLoadingSubmit: {
      name: 'mainBananceLoadingSubmit',
      size: 'small',
      color: '#001A52',
      type: 'ball-spin-clockwise',
      fullScreen: false,
      bdColor: "rgba(0, 0, 0, 0)"
    },
    gameLoading: {
      name: 'gameLoading',
      size: 'small',
      color: '#fff',
      type: 'ball-spin-clockwise',
      fullScreen: true,
      bdColor: "rgba(0, 0, 0, 0)"
    },

  };

  constructor(
    private funct: FunctService,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private http: HttpClient,
    private dto: DtoService,
    private storage: LocalStorageService) {
  }

   setData(data: any) {
    this.dataSubject.next(data);
  }

  getData() {
    return this.dataSubject.asObservable();
  }

  clearData() {
    this.dataSubject.next(null);
  }

  getCurrentData() {
    return this.dataSubject.getValue();
  }

  handleError(error: HttpErrorResponse) {
      if (error.status == 423) {
      }
      if (error.status == 400) {
        this.toastr.error("Bad request.", 'Invalid!', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
      }
    return throwError(error);
  }

  getUserProfile() {
    let params = new HttpParams();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
   this.http.get(this.funct.ipaddress + 'user/PointUserProfile', {headers: headers })
    .pipe
      (
         catchError(this.handleError.bind(this))
      )
    .subscribe(
      result => {
        this.dto.Response = {};
        this.dto.Response = result;
        this.userProfileBalance = this.dto.Response.balance;
        this.storage.store('userMainWallet', this.userProfileBalance);
      }
    );
  }

  getCloseDateTime(){
    let headers = new HttpHeaders();
    return this.http.get(this.funct.ipaddress + 'threedconfig/3d_close_time', { headers: headers } );
  }

  async getDateTime() {
    const axios = require('axios').default;
    const response = await axios.get(this.funct.ipaddress + 'value/getDateTime');
    return response.data.utc_datetime;

  }
  async convertMyanmarTime(date: any) {
    const localDate = new Date(date);
    const timeZoneOffset = new Date(date).getTimezoneOffset();
    let offsetMinutes: any;
    if (timeZoneOffset != -390) {
      if (timeZoneOffset < -390) {
        offsetMinutes = Math.abs(timeZoneOffset) - 390;
        var hours = (offsetMinutes / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);

        localDate.setHours(localDate.getHours()-rhours);
        localDate.setMinutes(localDate.getMinutes()-rminutes);
      }
      if (timeZoneOffset > -390) {
        offsetMinutes = timeZoneOffset - (-390);
        var hours = (offsetMinutes / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        localDate.setHours(localDate.getHours()+rhours);
        localDate.setMinutes(localDate.getMinutes()+rminutes);
      }
    }
    return localDate;
  }

  warningMsg(msg: string, position: string) {
    this.toastr.warning('', this.translateService.instant(msg), {
      timeOut: 1000,
      positionClass: `toast-${position}-center`,
    });
  }

  errorMsg(msg: string, position: string) {
    this.toastr.error('', this.translateService.instant(msg), {
      positionClass: `toast-${position}-center`,
      timeOut: 1000,
    });
  }

  updateFCMtoken(){
    var fcmtoken = this.storage.retrieve('localFcmtoken');
    let headers = new HttpHeaders();
    if(fcmtoken !=null && fcmtoken !=undefined && fcmtoken !=""){
      var phone_no='';
      var phoneValue=this.storage.retrieve('localPhoneValue');
      var prefix = this.storage.retrieve('localPhonePrefix');

      if((phoneValue == null || phoneValue ==undefined || phoneValue =="")){
        return;
      }
      if(phoneValue.startsWith('0'))
      {
        phone_no= prefix + phoneValue.substring(1,phoneValue.length);
      }
      else{
        phone_no= prefix + phoneValue;
      }
      var newToken={
        fcmtoken: fcmtoken,
        phone_no: phone_no
      }
      this.http.post(this.funct.ipaddress +'user/updateFcmtokenInitial', newToken, { headers: headers })
      .pipe
        (
           catchError(this.handleError.bind(this))
        )
      .subscribe(
        result => {
          this.dto.Response = result;
          return this.dto.Response;
        }
      );
    }

  }

}