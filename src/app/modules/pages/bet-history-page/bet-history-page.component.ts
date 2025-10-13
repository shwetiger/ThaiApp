import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Location, DatePipe, formatDate } from '@angular/common';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';

@Component({
  selector: 'app-bet-history-page',
  templateUrl: './bet-history-page.component.html',
  styleUrls: ['./bet-history-page.component.scss']
})
export class BetHistoryPageComponent implements OnInit {
  pageNumber: any;
  rowsOfPage: any;
  addList: any;
  searchKey = " ";
  type: any;
  betHistoryList: any;
  isLast: boolean = false;
  token: any;
  loadingMore: any;
  loading: any;
  threedbetHistoryList: any;
  addthreedBetList: any;
  showBothHeader: any;
  twoD_Active: any = false;
  threeD_Active: any = false;
  betType: any;
  parentLink1: any;
  typeUrl: any;
  twoD_Result_Active: boolean = false;
  threeD_Result_Active: boolean = false;
  result: any = "";
  isActive: boolean = false;
  pagefrom: any;

  constructor(
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private http: HttpClient,
    private router: Router,
    private storage: LocalStorageService,
    private funct: FunctService,
    private location: Location) {
    this.type = history.state.type;
    this.betType = this.route.snapshot.paramMap.get("betType");
    this.result = history.state.result;
    this.isActive = history.state.isActive;
    this.pagefrom = history.state.pagefrom;
    if (history.state.type == null || history.state.type == undefined) {
      this.type = this.storage.retrieve("localHistoryType");
    }
    if (history.state.isActive == null || history.state.isActive == undefined) {
      this.isActive = this.storage.retrieve('localThreedIsActive');
    }
  }

  ngOnInit(): void {
    this.type = this.storage.retrieve('localHistoryType');
    if (this.betType == "2D") {
      this.type = "2D";
      this.twoD_Active = true;
      this.threeD_Active = false;
      this.showBothHeader = false;
    }
    if (this.betType == "3D") {
      this.type = "3D";
      this.twoD_Active = false;
      this.threeD_Active = true;
      this.showBothHeader = true;
      if (this.result == "3D") {
        this.threeD_Result_Active = true;
      }
      else {
        this.threeD_Result_Active = false;
      }
    }
    if (this.betType == null) {
      this.showBothHeader = true;
      if (this.type == "2D") {
        this.twoD_Active = true;
        this.threeD_Active = false;
      }
      else if (this.type == "3D") {
        this.twoD_Active = false;
        this.threeD_Active = true;
      }
    }
    this.pageNumber = 0;
    this.rowsOfPage = 200;
    this.getBetHistory(0);
    this.addList = [] ? [] : JSON.parse(localStorage.getItem('localBetHistory' + this.type));
  }

  ngOnDestroy() {
    this.storage.clear("localHistoryType");
  }

  changeResultType(resultType: String) {
    this.storage.store("localHistoryType", resultType);
    if (resultType == "2D") {
      this.isLast = false;
      this.type = resultType;
      this.pageNumber = 0;
      this.rowsOfPage = 200;
      this.getBetHistory(0);
      this.addList = [] ? [] : JSON.parse(localStorage.getItem('localBetHistory' + this.type));
      this.twoD_Active = true;
      this.threeD_Active = false;
      this.twoD_Result_Active = false;
      this.loadingMore = false;
    }
    else {
      this.isLast = false;
      this.type = resultType;
      this.pageNumber = 0;
      this.rowsOfPage = 200;
      this.getBetHistory(0);
      this.addList = [] ? [] : JSON.parse(localStorage.getItem('localBetHistory' + this.type));
      this.twoD_Active = false;
      this.threeD_Active = true;
      this.threeD_Result_Active = false;
    }
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
        timeOut: 1000,
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

  getBetHistory(pageNumber) {
    this.loadingMore = false;
    this.loading = true;
    this.spinner.show();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    let params = new HttpParams();
    var newType = (this.type == "2D") ? "twodbet/GetList" : "threedbet/GetList";
    this.pageNumber = pageNumber + 1;
    params = params.set('searchKey', this.searchKey).set('pageNumber', this.pageNumber).set('rowsOfPage', this.rowsOfPage);
    this.http.get(this.funct.ipaddress + newType, { params: params, headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.betHistoryList = this.dto.Response.results;
          this.addList = [...this.addList, ...this.betHistoryList];
          if (this.addList.length >= result.totalRows) {
            this.isLast = true;
            this.loadingMore = true;
          };
          pageNumber = this.dto.Response.results.pageNumber;
          this.loading = false;
          localStorage.setItem('localBetHistory' + this.type, JSON.stringify(this.betHistoryList));
        }
      );
  }

  getDate(date) {
    var formatter = 'dd-MM-yyyy';
    var formatter1 = 'hh:mm a';
    return formatDate(date, formatter, 'en-US') + "\n" + formatDate(date, formatter1, 'en-US');
  }

  getTimeTransformDate(date, time) {
    var formatter = 'dd-MM-yyyy';
    return formatDate(date, formatter, 'en-US') + "\n" + time;//this.changeTime(time);
  }

  betHistoryDetail(historyModel: any) {
    this.storage.store('betHistoryModel', historyModel);
    if (this.betType == null) {
      if (this.type == "2D") {
        this.router.navigate(['/twod/bet-history-detail', '2D'], { state: { historyModel: historyModel, pagefrom: this.pagefrom }, replaceUrl: false })
      }
      else {
        this.router.navigate(['/threed/bet-history-detail', '3D'], { state: { historyModel: historyModel }, replaceUrl: false })
      }
      return;
    }
    if (this.betType == "2D") {
      this.router.navigate(['/twod/bet-history-detail', '2D'], { state: { historyModel: historyModel }, replaceUrl: false })
    }
    else {
      this.router.navigate(['/threed/bet-history-detail', '3D'], { state: { historyModel: historyModel }, replaceUrl: false })
    }
  }

  changeResult(resultType: String) {
    if (resultType == "2D") {
      this.twoD_Result_Active = true;
      this.twoD_Active = true;
    }
    else {
      this.twoD_Active = false;
      this.threeD_Active = true;
      this.threeD_Result_Active = true;
    }
  }
}