import { Component, OnInit, Pipe, PipeTransform ,PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from 'ngx-webstorage';
import { TranslateService } from '@ngx-translate/core';
import { LocationStrategy } from '@angular/common';
import isUAWebview from "is-ua-webview";
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements OnInit {
  servicePhoneList: any;
  localservicePhoneList: any;
  service_transaction: any;
  service_error: any;
  customer_service: any;
  deviceId: any;
  openUrl: any;
  isWebview: any;
  showBackButton: any;
  isWebviewforPh:boolean;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private Location: LocationStrategy,
    private translateService: TranslateService,
    private dto: DtoService,
    private funct: FunctService,
    private http: HttpClient,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private storage: LocalStorageService,
   ) {
    this.isWebviewforPh = /(wv|Android.*Version\/[0-9].*Chrome\/[0-9].*Mobile Safari\/[0-9].*)/.test(navigator.userAgent)
            || !!window['cordova']
            || window.matchMedia('(display-mode: standalone)').matches;
    this.showBackButton = 1;
    this.deviceId = this.storage.retrieve('localDeviceId');
    this.isWebview = isUAWebview(navigator.userAgent)
    if (navigator.userAgent.indexOf("Mi") != -1 && this.isWebview) {
      this.openUrl = "";
    }
    if (this.deviceId != null || this.isWebview) {
      this.openUrl = "?openinnewtap=1";
    }
    else {
      this.openUrl = "";
    }
  }

  ngOnInit(): void {
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.service_transaction = 0;
    this.service_error = 0;
    this.customer_service = 0;
    this.listServicePhone();
    this.servicePhoneList = this.storage.retrieve('localservicePhoneList');

  }
  replaceData(openUrl) {

  }

  listServicePhone() {
    this.service_transaction = 0;
    this.service_error = 0;
    this.customer_service = 0;
    this.spinner.show();
    let headers = new HttpHeaders();
    this.servicePhoneList = [];
    this.servicePhoneList = this.storage.retrieve('localservicePhoneList');
    if (this.servicePhoneList != null) {
      this.servicePhoneList = this.storage.retrieve('localservicePhoneList');
      for (let i = 0; i < this.servicePhoneList.length; i++) {
        if (this.servicePhoneList[i].title == 'service_transaction') {
          ++this.service_transaction;
        }
        if (this.servicePhoneList[i].title == 'service_error') {
          ++this.service_error;
        }
        if (this.servicePhoneList[i].title == 'customer_service') {
          ++this.customer_service;
        }
      }
    }
    this.http.get(this.funct.ipaddress + 'service/listService?status=active', { headers: headers})
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = {};
          this.dto.Response = result;
          this.servicePhoneList = this.dto.Response;
          this.service_transaction = 0;
          this.service_error = 0;
          this.customer_service = 0;
          for (let i = 0; i < this.servicePhoneList.length; i++) {
            if (this.servicePhoneList[i].title == 'service_transaction') {
              ++this.service_transaction;
            }
            if (this.servicePhoneList[i].title == 'service_error') {
              ++this.service_error;
            }
            if (this.servicePhoneList[i].title == 'customer_service') {
              ++this.customer_service;
            }
          }
          this.storage.store('localservicePhoneList', this.servicePhoneList);
          this.spinner.hide();
        }
      );
  }

  refreshPage() {
    this.ngOnInit();
    setTimeout(() => {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 1000);
  }
  
openViberFallback(viber:any) {
  // Viber official fallback link
  window.location.href = "https://invite.viber.com/?g2=" + viber;
}

}
