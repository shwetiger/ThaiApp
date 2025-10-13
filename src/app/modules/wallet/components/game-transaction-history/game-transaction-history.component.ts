import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpHeaders ,HttpErrorResponse,HttpParams} from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { CommonService } from '../../../../shared/service/common.service';

@Component({
  selector: 'app-game-transaction-history',
  templateUrl: './game-transaction-history.component.html',
  styleUrls: ['./game-transaction-history.component.scss']
})
export class GameTransactionHistoryComponent implements OnInit {
  supportLanguages = ['en','my','th','zh'];
  searchKey:"";
  pageNumber:any;
  rowsOfPage:any;
  token:any;
  type : any;
  isLast:boolean=true;
  isLastGW : boolean = true;
  gametransactionHistoryList : any; 
  gametransactionWithdrawalHistoryList : any;
  totalItems : any;
  addList:any;
  addWithGameList : any;
  addWithdrawalList : any;
  addTopupList : any;
  maintransactionHistoryList : any;
  maintransactionWithdrawalHistoryList : any;

  loadingMore: any;
  loading: any;
  historyGame: any=false;
  historyMain: any;
  gameTopup: any;
  gameWithdrawal: any;
  spinnerName : string;
  transactionSpinner : string;
  parentLink: any;
  isWithdrawalTab = false;
  isTopupTab = false;
  gametopuptab:any;
  gamewithdrawaltab:any;

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
    private dataService:CommonService) {
     this.spinnerName = "refreshLoading";
     this.transactionSpinner = "transactionSpinner";
    
     }

  ngOnInit(): void {
    this.historyGame=true;
    this.historyMain=false;
    this.isTopupTab = true;
    this.isWithdrawalTab = false;
    this.gameTopup=true;
    this.gameWithdrawal=false;
    this.rowsOfPage = 20;
    this.pageNumber = 0;
    const receivedData = this.storage.retrieve('transtype');
    if (receivedData) {
      this.type=receivedData;
      if(this.type=='WITHDRAWAL')
      {
         this.getGameWithdrawTransactionHistory(0, this.type)
      }
      else{
         this.getTopupGameTransactionHistory(0,this.type);
      }
    }
    else{
    this.type='DEPOSIT';
    this.getTopupGameTransactionHistory(0,this.type);
    }
    
    this.addList =[]?[]: JSON.parse(localStorage.getItem('transactionHistoryList'));
    this.addWithGameList = []?[]: JSON.parse(localStorage.getItem('gameWithtransactionHistoryList'));
    if(this.type=='DEPOSIT')
      {
        this.gametopuptab=true;
        this.gamewithdrawaltab=false;
      }
      else
      {
        this.gametopuptab=false;
        this.gamewithdrawaltab=true;
      }
  }

  refreshPage(): void
  {
    if(this.isWithdrawalTab == true)
    {
      this.gameWithdrawal = true;
      this.gameTopup = false;
      this.type = 'WITHDRAWAL';
      this.getGameWithdrawTransactionHistory(0, this.type)
    }
    if(this.isTopupTab == true)
    {
      this.gameTopup = true;
      this.gameWithdrawal = false;
      this.type = 'DEPOSIT';
      this.getTopupGameTransactionHistory(0,this.type);
    }
  }

  handleError(error: HttpErrorResponse){
    if(error.status == 0){
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    
    if(error.status == 423)
    {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        this.storage.clear('token');
        this.storage.clear('isUserLoggedIn');
         this.router.navigate(['/login'], { replaceUrl: true });
    }
    if(error.status == 400)
    {
       this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    return throwError(error);
  }

  getTopupGameTransactionHistory(pageNumber,type)
  {
    type='DEPOSIT';
    this.isTopupTab = true;
    this.isWithdrawalTab  = false;
    this.gameTopup=true;
    this.gameWithdrawal=false;

    this.loadingMore= false;
    this.loading= true;
    this.spinner.show(this.transactionSpinner);
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    let params = new HttpParams();
    this.pageNumber = 1;
    this.gametransactionHistoryList = [];
    this.addList = [];
    params = params.set('searchKey', this.searchKey).set('pageNumber',this.pageNumber).set('rowsOfPage', this.rowsOfPage.toString()).set('type',type);
    this.http.get( this.funct.ipaddress+'loginGS/getGameUserTransaction', { params: params,headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
     )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.gametransactionHistoryList = result.results;
          this.totalItems = result.totalRows;
          pageNumber = result.pageNumber;
          this.addList = [...this.addList, ...this.gametransactionHistoryList];
          localStorage.setItem('transactionHistoryList', JSON.stringify(this.addList));
          if(this.addList.length == 0 || this.addList.length >= result.totalRows)
          {
            this.isLast = true;
          }
          this.loading= false;
          this.loadingMore= true;
          this.spinner.hide(this.transactionSpinner);
        }
      );
  }
 
  getTopupGameTransactionHistoryMore(pageNumber,type)
  {
    type='DEPOSIT';
    this.loadingMore= false;
    this.loading= true;
    this.spinner.show(this.transactionSpinner);

    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    let params = new HttpParams();
    this.pageNumber = pageNumber + 1;
    params = params.set('searchKey', this.searchKey).set('pageNumber',this.pageNumber).set('rowsOfPage', this.rowsOfPage.toString()).set('type',type);
    this.http.get( this.funct.ipaddress+'loginGS/getGameUserTransaction', { params: params,headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
     )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.gametransactionHistoryList = result.results;
          this.totalItems = result.totalRows;
          pageNumber = result.pageNumber;
          this.addList = [...this.addList, ...this.gametransactionHistoryList];
          if( this.addList.length >= result.totalRows)
          {
            this.isLast=true;
          };
          localStorage.setItem('transactionHistoryList', JSON.stringify(this.addList));
          this.loading= false;
          this.loadingMore= true;
          this.spinner.hide(this.transactionSpinner);
        }
      );
  }

  getGameWithdrawTransactionHistory(pageNumber,type)
  {
    type="WITHDRAWAL";
    this.isWithdrawalTab = true;
    this.isTopupTab = false;
    this.gameTopup=false;
    this.gameWithdrawal=true;
    this.loadingMore= false;
    this.loading= true;
    this.spinner.show(this.transactionSpinner);
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    let params = new HttpParams();
    this.pageNumber = 1;
    this.gametransactionWithdrawalHistoryList = [];
    this.addWithGameList = [];
    params = params.set('searchKey', this.searchKey).set('pageNumber',this.pageNumber).set('rowsOfPage', this.rowsOfPage.toString()).set('type',type);
    this.http.get( this.funct.ipaddress+'loginGS/getGameUserTransaction', { params: params,headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
     )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.gametransactionWithdrawalHistoryList = result.results;
          this.totalItems = result.totalRows;
          pageNumber = result.pageNumber;
          this.addWithGameList = [...this.addWithGameList, ...this.gametransactionWithdrawalHistoryList];
          localStorage.setItem('gameWithtransactionHistoryList', JSON.stringify(this.addWithGameList));
          if(this.addWithGameList.length == 0 || this.addWithGameList.length >= result.totalRows)
          {
            this.isLastGW = true;
          }
          this.loading= false;
          this.loadingMore= true;
          this.spinner.hide(this.transactionSpinner)
        }
      );
  }

  getGameWithdrawTransactionHistoryMore(pageNumber,type)
  {
   
    type="WITHDRAWAL";
    this.loadingMore= false;
    this.loading= true;
    this.spinner.show(this.transactionSpinner);
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    let params = new HttpParams();
    this.pageNumber = pageNumber + 1;
    params = params.set('searchKey', this.searchKey).set('pageNumber',this.pageNumber).set('rowsOfPage', this.rowsOfPage.toString()).set('type',type);
    this.http.get( this.funct.ipaddress+'loginGS/getGameUserTransaction', { params: params,headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
     )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.gametransactionWithdrawalHistoryList = result.results;
          this.totalItems = result.totalRows;
          pageNumber = result.pageNumber;
          this.addWithGameList = [...this.addList, ...this.gametransactionWithdrawalHistoryList];
          if( this.addWithGameList.length >= result.totalRows)
          {
            this.isLastGW=true;
          };
          localStorage.setItem('gameWithtransactionHistoryList', JSON.stringify(this.addWithGameList));
          this.loading= false;
          this.loadingMore= true;
          this.spinner.hide(this.transactionSpinner);
        }
        
      );
  }

  viewDetail(tranObj, typeOfPage)
  {  
     this.router.navigate(['/wallet/transaction-history-detail'],{state: {tranObj:tranObj,typeOfPage:1},replaceUrl: false});
  }

  goToRoute(){
    this.storage.clear('transtype')
    this.router.navigate(['/wallet/history'], {replaceUrl: true});
  }

  Gotogametopup()
  {
    this.gametopuptab=true;
    this.gamewithdrawaltab=false;
    this.getTopupGameTransactionHistory(this.pageNumber,'DEPOSIT')
  }
  Gotogamewithdrawal()
  {
    this.gamewithdrawaltab=true;
    this.gametopuptab=false;
    this.getGameWithdrawTransactionHistory(this.pageNumber,'WITHDRAWAL')
  }

  getTopupGameTransactionHistorytab(pageNumber,type)
  {
    this.storage.clear('transtype');
    type='DEPOSIT';
    this.isTopupTab = true;
    this.isWithdrawalTab  = false;
    this.gameTopup=true;
    this.gameWithdrawal=false;

    this.loadingMore= false;
    this.loading= true;
    this.spinner.show(this.transactionSpinner);
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    let params = new HttpParams();
    pageNumber = 1;
    this.gametransactionHistoryList = [];
    this.addList = [];
    params = params.set('searchKey', this.searchKey).set('pageNumber',this.pageNumber).set('rowsOfPage', this.rowsOfPage.toString()).set('type',type);
    this.http.get( this.funct.ipaddress+'loginGS/getGameUserTransaction', { params: params,headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
     )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.gametransactionHistoryList = result.results;
          this.totalItems = result.totalRows;
          this.pageNumber = result.pageNumber;
          this.addList = [...this.addList, ...this.gametransactionHistoryList];
          localStorage.setItem('transactionHistoryList', JSON.stringify(this.addList));
          if(this.addList.length == 0 || this.addList.length >= result.totalRows)
          {
            this.isLast = true;
          }
          this.loading= false;
          this.loadingMore= true;
          this.spinner.hide(this.transactionSpinner);
        }
      );
  }
}
