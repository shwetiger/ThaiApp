import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { CommonService } from '../../../../shared/service/common.service';

@Component({
  selector: 'app-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
  supportLanguages = ['en', 'my', 'th', 'zh'];
  searchKey: "";
  pageNumber: any;
  rowsOfPage: any;
  token: any;
  type: any;
  isLast: boolean = false;
  isLastT: boolean = false;
  isLastW: boolean = false;
  isLastGW: boolean = false;
  totalItems: any;
  addWithdrawalList: any;
  addTopupList: any;
  maintransactionHistoryList: any;
  maintransactionWithdrawalHistoryList: any;
  loadingMore: any;
  loading: any;
  historyMain: any = false;
  historyGame: any;
  mainTopup: any;
  mainWithdrawal: any;
  spinnerName: string;
  transactionSpinner: string;
  parentLink: any;
  isTopupTab = false;
  isWithdrawalTab = false;
  topuptab: any;
  withdrawaltab: any;
  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
    private funct: FunctService,
    private translateService: TranslateService,
    private storage: LocalStorageService,
    private dto: DtoService,
    private route: ActivatedRoute,
    private dataService: CommonService) {
    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage'));
    this.spinnerName = "refreshLoading";
    this.transactionSpinner = "transactionSpinner";
  }

  ngOnInit(): void {
    this.loading = false;
    this.spinner.show(this.transactionSpinner);
    this.historyMain = true;
    this.historyGame = false;
    this.mainTopup = true;
    this.isTopupTab = true;
    this.isWithdrawalTab = false;
    this.mainWithdrawal = false;
    this.rowsOfPage = 20;
    this.pageNumber = 0;
    const receivedData = this.storage.retrieve('transtype');
    if (receivedData) {
      this.type = receivedData;
      if (this.type == 'WITHDRAW') {
        this.getWithdrawalMainTransactionHistory(1, this.type)
      }
      else {
        this.getTopupMainTransactionHistory(1, this.type)
      }
    }
    else {
      this.type = 'TOPUP';
      this.getTopupMainTransactionHistory(1, this.type);
    }
    this.addTopupList = [] ? [] : JSON.parse(localStorage.getItem('maintransactionTopupHistoryList'));
    this.addWithdrawalList = [] ? [] : JSON.parse(localStorage.getItem('maintransactionWithdrawalHistoryList'));
    if (this.type == 'TOPUP') {
      this.topuptab = true;
      this.withdrawaltab = false;
    }
    else {
      this.topuptab = false;
      this.withdrawaltab = true;
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

  refreshPage(): void {
    if (this.isWithdrawalTab == true) {
      this.mainWithdrawal = true;
      this.mainTopup = false;
      this.type = 'WITHDRAW';
      this.getWithdrawalMainTransactionHistory(1, this.type)
    }
    if (this.isTopupTab == true) {
      this.mainTopup = true;
      this.mainWithdrawal = false;
      this.type = 'TOPUP';
      this.getTopupMainTransactionHistory(1, this.type);
    }
  }

  viewDetail(tranObj: any, typeOfPage: any) {
    this.router.navigate(['/wallet/transaction-history-detail'], { state: { tranObj: tranObj, typeOfPage: typeOfPage }, replaceUrl: false });
  }

  getTopupMainTransactionHistory(pageNumber, type) {
    type = "TOPUP";
    this.isTopupTab = true;
    this.isWithdrawalTab = false;
    this.mainTopup = true;
    this.mainWithdrawal = false;
    this.loadingMore = false;
    this.loading = true;
    this.spinner.show(this.transactionSpinner);
    this.spinner.show();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    let params = new HttpParams();
    this.pageNumber = 1;
    this.maintransactionHistoryList = [];
    this.addTopupList = [];
    if (this.searchKey == undefined) {
      this.searchKey = "";
    }
    params = params.set('type', type).set('searchKey', this.searchKey).set('pageNumber', this.pageNumber).set('rowsOfPage', this.rowsOfPage.toString());
    this.http.get(this.funct.ipaddress + 'transaction/GetList', { params: params, headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.loading=false;
          if (this.dto.Response.message == 'too many request') {
            this.loading =true;
            this.spinner.show(this.transactionSpinner);
            this.spinner.show();
          }
          else {
            this.maintransactionHistoryList = result.results;
            this.totalItems = result.totalRows;
            pageNumber = result.pageNumber;
           // this.spinner.hide(this.transactionSpinner);
             this.spinner.hide(this.transactionSpinner);
            this.spinner.hide();
            this.loadingMore = true;
            this.addTopupList = [...this.addTopupList, ...this.maintransactionHistoryList];;
            localStorage.setItem('maintransactionTopupHistoryList', JSON.stringify(this.addTopupList));
            if (this.addTopupList.length == 0 || this.addTopupList.length >= result.totalRows) {
              this.isLastT = true;
            }
          }
        }
      );
  }

  getTopupMainTransactionHistoryMore(pageNumber, type) {
    type = "TOPUP";
    this.loadingMore = false;
    this.loading = true;
    this.spinner.show();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    let params = new HttpParams();
    this.pageNumber = pageNumber;
    this.pageNumber = pageNumber + 1;
    params = params.set('type', type).set('searchKey', this.searchKey).set('pageNumber', this.pageNumber).set('rowsOfPage', this.rowsOfPage.toString());
    this.http.get(this.funct.ipaddress + 'transaction/GetList', { params: params, headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.maintransactionHistoryList = result.results;
          this.totalItems = result.totalRows;
          pageNumber = result.pageNumber;
          this.addTopupList = [...this.addTopupList, ...this.maintransactionHistoryList];
          if (this.addTopupList.length >= result.totalRows) {
            this.isLastT = true;
          }
          localStorage.setItem('maintransactionTopupHistoryList', JSON.stringify(this.addTopupList));
          this.loading = false;
          this.spinner.hide(this.transactionSpinner);
          this.loadingMore = true;
        }
      );
  }

  getWithdrawalMainTransactionHistory(pageNumber, type) {
    type = "WITHDRAW";
    this.isWithdrawalTab = true;
    this.isTopupTab = false;
    this.mainTopup = false;
    this.mainWithdrawal = true;
    this.loadingMore = false;
    this.loading = true;
    this.spinner.show(this.transactionSpinner);
    this.spinner.show();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    let params = new HttpParams();
    this.pageNumber = 1;
    if (this.searchKey == undefined) {
      this.searchKey = "";
    }
    this.maintransactionHistoryList = [];
    this.addWithdrawalList = [];
    params = params.set('type', type).set('searchKey', this.searchKey).set('pageNumber', this.pageNumber).set('rowsOfPage', this.rowsOfPage.toString());
    this.http.get(this.funct.ipaddress + 'transaction/GetList', { params: params, headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          if (this.dto.Response.message == 'too many request') {
           this.loading = true;
            this.spinner.show(this.transactionSpinner);
            return;
          }
          else {
            this.maintransactionHistoryList = result.results;
            this.totalItems = result.totalRows;
            pageNumber = result.pageNumber;
            this.addWithdrawalList = [...this.addWithdrawalList, ...this.maintransactionHistoryList];
            localStorage.setItem('maintransactionWithdrawalHistoryList', JSON.stringify(this.maintransactionHistoryList));
            if (this.addWithdrawalList.length == 0 || this.addWithdrawalList.length >= result.totalRows) {
              this.isLastW = true;
            }
            this.loading = false;
            this.spinner.hide(this.transactionSpinner);
            this.spinner.hide();
            this.loadingMore = true;
          }
        }
      );
  }


  getWithdrawalMainTransactionHistoryMore(pageNumber, type) {
    type = "WITHDRAW";
    this.loadingMore = false;
    this.loading = true;
    this.spinner.show(this.transactionSpinner);
    this.spinner.show();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    let params = new HttpParams();
    this.pageNumber = pageNumber + 1;
    params = params.set('type', type).set('searchKey', this.searchKey).set('pageNumber', this.pageNumber).set('rowsOfPage', this.rowsOfPage.toString());
    this.http.get(this.funct.ipaddress + 'transaction/GetList', { params: params, headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.maintransactionWithdrawalHistoryList = result.results;
          this.totalItems = result.totalRows;
          pageNumber = result.pageNumber;
          this.addWithdrawalList = [...this.addWithdrawalList, ...this.maintransactionWithdrawalHistoryList];
          localStorage.setItem('transactionHistoryList', JSON.stringify(this.addWithdrawalList));
          if (this.addWithdrawalList.length >= result.totalRows) {
            this.isLastW = true;
          }
          this.loading = false;
          this.spinner.hide(this.transactionSpinner);
          this.loadingMore = true;
        }
      );
  }

  gotoTopuppage() {
    this.router.navigate(['/wallet/top-up'], { replaceUrl: true });
  }

  goToRoute() {
    this.router.navigate(['/wallet/game-transaction-history'], { replaceUrl: true });
  }

  Gototopup() {
    this.topuptab = true;
    this.withdrawaltab = false;
    this.getTopupMainTransactionHistory(1, 'TOPUP')
  }

  Gotowithdrawal() {
    this.withdrawaltab = true;
    this.topuptab = false;
    this.getWithdrawalMainTransactionHistory(1, 'WITHDRAW')
  }

  getDescription(desc: any): string {
  if (!desc || desc === 'null' || desc === 'undefined') {
    return this.translateService.instant('withdrawal_denied_state_desc');
  }
  return desc;
}
}
