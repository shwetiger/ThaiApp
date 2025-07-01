import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Router , ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
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
@Component({
  selector: 'app-transaction-history-detail',
  templateUrl: './transaction-history-detail.component.html',
  styleUrls: ['./transaction-history-detail.component.scss']
})
export class TransactionHistoryDetailComponent implements OnInit {
  reqObj : any;
  typeOfPage : any;
  servicePhoneList : any;
  transaction_detail_desc: any;
  parentLink: any;
  token:any;
  tranObj : any;
  isSpinner = true;
  isWebview: any;
  deviceId: any;
  openUrl: string;
  type:any;
  constructor( 
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private toastr: ToastrService,
    private funct: FunctService,
    private http: HttpClient,
    private translateService: TranslateService,
    private router: Router,private route: ActivatedRoute,
    private storage: LocalStorageService,
    private _location: Location,
    private dataService: CommonService) { 
    this.reqObj = history.state.tranObj;
    this.typeOfPage =  history.state.typeOfPage;
    this.parentLink=history.state.parentLink;

    this.deviceId=this.storage.retrieve('localDeviceId');
    this.isWebview=isUAWebview(navigator.userAgent);      
      if(this.deviceId !=null || this.isWebview){
          this.openUrl="?openinnewtap=1";
      }
      else{
        this.openUrl="";
      }
  }

  ngOnInit()
  {
    this.listServicePhone();
    if(this.typeOfPage == 0)
    {
      this.isSpinner = true;
     
     this.getTransactionDetail();
    }
    if(this.typeOfPage == 1)
    {
      this.isSpinner = true;
     
      this.getGameTransactionDetail();
    }
    this.servicePhoneList = this.storage.retrieve("localservicePhoneList");
    this.transaction_detail_desc=this.translateService.instant("transaction_detail_desc");    
    this.transaction_detail_desc=  this.transaction_detail_desc.toString().replace("@time", '10');
  }

  goBack(){
    this.dataService.setData({ message: this.tranObj.type });
    this._location.back();
  }
  goMainPage()
  {
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

  getTransactionDetail()
  {
    this.spinner.show("spinnerName1");
    this.token = this.storage.retrieve('token'); 
    let params = new HttpParams();
    let config = {
      headers: {'Authorization': this.token},      
    }
  
    const axios = require('axios').default;
     axios.get(this.funct.ipaddress + 'transaction/Detail?tranId='+this.reqObj.id, config )
    .then((res) => {  
        this.tranObj =  res.data;
        console.log("Detail>>>"+JSON.stringify(this.tranObj))
        this.spinner.hide("spinnerName1"); 
        this.isSpinner = false;
        return res.data;
    })
    .catch((error) => {    
      this.spinner.hide("spinnerName1");
      if (error.response)
      {
        console.log(error.response.data);
      }
    });
  }

  getGameTransactionDetail()
  {
    this.spinner.show("spinnerName1");
    this.token = this.storage.retrieve('token'); 
    let config = {
      headers: {'Authorization': this.token}, 
      params: {'source': this.reqObj.source},   
    }
    const axios = require('axios').default;
    axios.get(this.funct.ipaddress + 'loginGS/GamTransactionDetail?tranId='+this.reqObj.id, config )
    .then((res) => {   
      this.spinner.hide("spinnerName1");  
        this.tranObj =  res.data;
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

  handleError(error: HttpErrorResponse)
  {
    this.spinner.hide("spinnerName1");
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
  gotoTopuppage()
  {
    this.router.navigate(['/wallet/top-up'], {replaceUrl: true});
  }

  listServicePhone()
  {
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
        this.servicePhoneList =  this.dto.Response;
      }
    );
  }

  
}

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}
  transform(url) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
