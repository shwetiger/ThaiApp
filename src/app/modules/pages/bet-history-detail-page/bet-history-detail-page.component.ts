import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { formatDate, Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";
import { CommonService } from 'src/app/shared/service/common.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'bet-history-detail',
  templateUrl: './bet-history-detail-page.component.html',
  styleUrls: ['./bet-history-detail-page.component.scss']
})
export class BetHistoryDetailPageComponent implements OnInit {
  id: any;
  type: any;
  token: any;
  historyModel: any;
  betHistoryDetailList: any;
  spinnerName: string;
  parentLink: any;
  betType: string;
  typeUrl: any;
  newType: any;
  odd: any;
  refreshLoading: boolean;
  pagefrom: any;

  constructor(
    public common: CommonService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private dto: DtoService,
    private http: HttpClient,
    private storage: LocalStorageService,
    private funct: FunctService,
    private router: Router,
    private location: Location) {
    this.betType = this.route.snapshot.paramMap.get("betType");
    if (history.state.historyModel != undefined || history.state.historyModel != null) {
      this.historyModel = history.state.historyModel;
      this.id = this.historyModel.id;
    }
    else {
      this.historyModel = this.storage.retrieve('betHistoryModel');
      this.id = this.historyModel.id;
    }
  }

  ngOnInit(): void {
    this.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.getBetHistoryDetail();
  }

  getDate() {
    var formatter = `dd-MM-yyyy \n hh:mm a`;
    if (this.historyModel.created_date == null) {
      if (this.historyModel.bet_date == null) {
        return formatDate(this.historyModel.bet_date, formatter, 'en-US');
      }
    }
    else {
      return formatDate(this.historyModel.created_date, formatter, 'en-US');
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

  getBetHistoryDetail() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    var newType = (this.betType == "2D") ? "twodbet/GetDetailList" : "threedbet/GetDetailList";
    var idName;
    if (this.betType == "2D") {
      idName = newType + "?twodbet_id" + '=' + this.id;
    } else {
      idName = newType + "?threedbet_id" + '=' + this.id;
    }
    this.http.get(this.funct.ipaddress + idName, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = result;
          this.odd = this.dto.Response.odd;
          this.betHistoryDetailList = this.dto.Response.results;
          this.storage.store("localHistoryType", this.betType);
        }
      );
  }

  getBetOdd(name) {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    let params = new HttpParams();
    params = params.set('sectionName', name);
    var type = (this.betType == "2D") ? "odd/getTwoDOdd" : "odd/getThreeDOdd";
    this.http.get(this.funct.ipaddress + type, { params: params, headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.odd = this.dto.Response.odd;
          this.refreshLoading = false;
          this.spinner.hide("refreshLoading");
        }
      );
  }

  refreshPage() {
    this.spinner.show(this.spinnerName);
    this.ngOnInit();
    setTimeout(() => {
      this.spinner.hide(this.spinnerName);
    }, 1000);
  }

}
