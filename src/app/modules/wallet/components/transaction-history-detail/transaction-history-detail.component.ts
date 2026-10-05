import { Component, OnInit, Pipe, PipeTransform, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import isUAWebview from "is-ua-webview";
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { Location } from '@angular/common';
import { CommonService } from '../../../../shared/service/common.service';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-transaction-history-detail',
  templateUrl: './transaction-history-detail.component.html',
  styleUrls: ['./transaction-history-detail.component.scss']
})
export class TransactionHistoryDetailComponent implements OnInit {
  reqObj: any;
  typeOfPage: any;
  servicePhoneList: any;
  transaction_detail_desc: any;
  parentLink: any;
  token: any;
  tranObj: any;
  isSpinner = true;
  isWebview: any;
  deviceId: any;
  openUrl: string;
  type: any;
  paymentLogoBase64: string = '';
  typeOftrans: any;
  downloadLink: any;
  code: any;

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent) {
    this.isSpinner = false;
  }

  constructor(
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private toastr: ToastrService,
    private funct: FunctService,
    private http: HttpClient,
    private translateService: TranslateService,
    private router: Router, private route: ActivatedRoute,
    private storage: LocalStorageService,
    private _location: Location,
    private dataService: CommonService) {
    // this.reqObj = history.state.tranObj;
    this.reqObj = this.storage.retrieve('reqObj');
    this.typeOfPage = this.storage.retrieve('typeOfPage');
    this.typeOftrans = this.storage.retrieve('typeOftrans');
    this.parentLink = history.state.parentLink;

    this.deviceId = this.storage.retrieve('localDeviceId');
    this.isWebview = isUAWebview(navigator.userAgent);
    if (this.deviceId != null || this.isWebview) {
      this.openUrl = "?openinnewtap=1";
    }
    else {
      this.openUrl = "";
    }
  }

  ngOnInit() {
    this.storage.clear('transtype');
    this.reqObj = this.storage.retrieve('reqObj');
    this.isWebview = isUAWebview(navigator.userAgent)
    this.listServicePhone();
    if (this.typeOfPage == 0) {
      this.isSpinner = true;
      this.getTransactionDetail();
    }
    if (this.typeOfPage == 1) {
      this.isSpinner = true;

      this.getGameTransactionDetail();
    }
    this.servicePhoneList = this.storage.retrieve("localservicePhoneList");
    this.transaction_detail_desc = this.translateService.instant("transaction_detail_desc");
    this.transaction_detail_desc = this.transaction_detail_desc.toString().replace("@time", '10');
  }



  goBack() {
    this.storage.store('transtype', this.tranObj.type);
    this._location.back();
  }
  goMainPage() {
    this._location.back();
    // if(this.typeOfPage == 0)
    // {
    //   this.router.navigate(['/history'],{replaceUrl: true});
    //   this.navigation.goBack();
    // }
    // if(this.typeOfPage == 1)
    // {
    //   this.router.navigate(['/game-transaction-history'],{replaceUrl: true});
    //   this.navigation.goBack();
    // }
  }

  getTransactionDetail() {
    this.spinner.show("spinnerName1");
    this.token = this.storage.retrieve('token');
    let params = new HttpParams();
    let config = {
      headers: { 'Authorization': this.token },
    }
    const axios = require('axios').default;
    axios.get(this.funct.ipaddress + 'transaction/Detail?tranId=' + this.reqObj.id, config)
      .then((res) => {
        this.tranObj = res.data;
        this.storage.store('transtype', this.tranObj.type);
        this.spinner.hide("spinnerName1");
        this.isSpinner = false;
        return res.data;
      })
      .catch((error) => {
        this.spinner.hide("spinnerName1");
        if (error.response) {
          return;
        }
      });
  }

  getGameTransactionDetail() {
    this.spinner.show("spinnerName1");
    this.token = this.storage.retrieve('token');
    let config = {
      headers: { 'Authorization': this.token },
      params: { 'source': this.reqObj.source },
    }
    const axios = require('axios').default;
    axios.get(this.funct.ipaddress + 'loginGS/GamTransactionDetail?tranId=' + this.reqObj.id, config)
      .then((res) => {
        this.spinner.hide("spinnerName1");
        this.tranObj = res.data;
        this.storage.store('transtype', this.tranObj.type);
        this.isSpinner = false;
        return res.data;
      })
      .catch((error) => {
        this.spinner.hide("spinnerName1");
        if (error.response) {
          (error.response.data);
        }
      });
  }

  handleError(error: HttpErrorResponse) {
    this.spinner.hide("spinnerName1");
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
    if (error.status == 400) {
      this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
    return throwError(error);
  }
  gotoTopuppage() {
    this.router.navigate(['/wallet/top-up'], { replaceUrl: true });
  }

  listServicePhone() {
    let headers = new HttpHeaders();
    this.servicePhoneList = [];
    this.http.get(this.funct.ipaddress + 'service/listService', { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.servicePhoneList = this.dto.Response;
        }
      );
  }

  downloadReceiptwithchrome() {
    this.spinner.show("spinnerName1");
    this.token = this.storage.retrieve('token');
    const lang = (localStorage.getItem('ngx-webstorage|locallanguage') || 'en').replace(/"/g, '');
    const config = {
      headers: {
        Authorization: this.token
      },
      params: {
        tranId: this.reqObj.id,
        lang: lang
      },
      responseType: 'blob'
    };

    const axios = require('axios').default;

    axios.get(
      this.funct.ipaddress + 'receipt/image',
      config
    )
      .then((res) => {
        const blob = new Blob([res.data], { type: 'image/png' });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `Receipt_${this.reqObj.id}.png`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.spinner.hide("spinnerName1");
      })
      .catch((error) => {
        this.spinner.hide("spinnerName1");
      });
  }

  downloadReceipt() {
    this.spinner.show("spinnerName1");

    this.token = this.storage.retrieve('token');
    const lang = (localStorage.getItem('ngx-webstorage|locallanguage') || 'en')
      .replace(/"/g, '');

    const config = {
      headers: {
        Authorization: this.token
      }
    };

    const body = null;

    const axios = require('axios').default;

    axios.post(
      this.funct.ipaddress + 'receipt/image/code?tranId=' + this.reqObj.id + '&lang=' + lang,
      body,
      config
    )
      .then((res) => {
        this.spinner.hide("spinnerName1");

        if (res.data.status === 'Success') {
          this.downloadLink = res.data.data.downloadUrl;
          this.code = res.data.data.code;
          const ua = navigator.userAgent;

          const isTelegramAndroid =
            /Telegram-Android/i.test(ua) && /Android/i.test(ua);

          const isWebView = /\bwv\b/.test(ua);
          if(isTelegramAndroid)
          {
            window.open(this.downloadLink,'_blank')
          }
          else if (isWebView) {
            window.open(this.downloadLink + '?openinnewtap=1', '_blank');
          } else {
            this.downloadReceiptwithchrome();
          }

        } 
      })
      .catch((error) => {
        this.spinner.hide("spinnerName1");
      });
  }


  async shareReceipt() {
    const element = document.getElementById('receipt');

    if (!element) {
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#fff'
      });

      const blob: Blob | null = await new Promise(resolve =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) {
        return;
      }

      const file = new File([blob], 'transaction-detail.png', {
        type: 'image/png'
      });

      if ((navigator as any).canShare?.({ files: [file] })) {

        await (navigator as any).share({
          title: 'Transaction Receipt',
          text: 'Transaction Detail',
          files: [file]
        });

      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transaction-detail.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    }
  }


}




@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) { }
  transform(url) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
