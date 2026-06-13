import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { DtoService } from '../../service/dto.service';
import { FunctService } from '../../service/funct.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Stream } from 'stream';




@Component({
  selector: 'app-threed-result',
  templateUrl: './threed-result.component.html',
  styleUrls: ['./threed-result.component.scss']
})
export class ThreedResultComponent implements OnInit {

  token: any;
  resultList: Array<any> = [];
  pageNumber: any;
  rowsOfPage: any;
  isLast: boolean = false;
  query: any;
  showliveVideo: SafeResourceUrl
  showlivelink: any;
  watchlivevideo: any;
  isWebview: any;
  deviceId: any;
  issafariView: any;
  loading: any;
  /*XXX*/
  //spinnerName :string;
  constructor(
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private funct: FunctService,
    private toastr: ToastrService,
    private dto: DtoService,
    private router: Router,
    private storage: LocalStorageService,
    private sanitizer: DomSanitizer,
  ) {
    var isWebviewUser = require('is-ua-webview');
    this.isWebview = isWebviewUser(navigator.userAgent);
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      this.issafariView = true;
    }
    else {
      this.issafariView = false;
    }
    //  Parse.initialize(environment.keyApplicationId, environment.jsKey); //PASTE HERE YOUR Back4App APPLICATION ID AND YOUR JavaScript KEY
    // (Parse as any).serverURL =  environment.keyParseServerUrl;
    // (Parse as any).liveQueryServerURL = environment.keyLiveQueryUrl;
    // this.query = new Parse.Query('ThreeDResult');
    this.showlivelink = history.state.showlivelink;
    if (this.showlivelink) {
      this.storage.store('localshowlink', this.showlivelink);
    }

    this.pageNumber = 0;
    this.rowsOfPage = 40;
    /*XXX*/
    // this.spinnerName = "threedresultLoading";

  }

  ngOnInit(): void {
    if (this.isWebview) {
      this.deviceId = "mobile";

    }
    this.showlivelink = this.storage.retrieve('localshowlink');

    if (this.showlivelink == true) {
      this.getthreedliveLink();
    }
    this.resultList = [];
    this.getThreedResult(0);
    //this.getThreeResult();
  }



  getthreedliveLink() {
    let headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'threedconfig/Get3dLiveLiveLink', { headers: headers })
      .pipe
      (
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          const livelink = 'https://www.facebook.com/plugins/video.php?href=' + this.dto.Response.liveLink;
          this.showliveVideo = this.sanitizer.bypassSecurityTrustResourceUrl(livelink);
          this.watchlivevideo = this.dto.Response.liveLink;
        }
      );
  }

  handleDoubleClick(event: MouseEvent) {
    // Prevent default behavior of the double-click event
    event.preventDefault();
    // Optionally, you can stop the event from propagating to parent elements
    event.stopPropagation();
  }
  async getThreeResult() {
    var response = await this.query.find();
    var data = await this.query.find();
    if (data != null && data != "") {
      response.forEach(e => {
        var item = {
          date: e.get('date'),
          number: e.get('number'),
        };
        this.resultList.push(item);
      });
      this.resultList.sort((a, b) => new Date(b.date).getTime() > new Date(a.date).getTime() ? 1 : -1)
    }
  }
  getDate(date) {
    var formatter = 'dd-MM-yyyy';
    return formatDate(date, formatter, 'en_US');
  }

  handleError(error: HttpErrorResponse) {

    if (error.status == 400) {
      this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
    return throwError(error);
  }
  getThreedResult(pageNumber) {
    this.loading = true;
    this.spinner.show();
    //this.spinner.show(this.spinnerName);
    let params = new HttpParams();
    let headers = new HttpHeaders();

    this.pageNumber = pageNumber + 1;
    params = params.set('searchKey', "").set('pageNumber', this.pageNumber).set('rowsOfPage', this.rowsOfPage);
    this.http.get(this.funct.ipaddress + 'result/GetList3dResult', { params: params, headers: headers })
      .pipe
      (
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.resultList = result.results;
          if (this.resultList.length >= result.totalRows) {
            this.isLast = true;
            this.loading = false;
            this.spinner.hide();
          };
          this.loading = false;
          this.spinner.hide();

        }
      );
  }

  openlive() {
    this.watchlivevideo = this.watchlivevideo + '?openinnewtap=1'
    window.open(this.watchlivevideo, '_blank');
  }

}
