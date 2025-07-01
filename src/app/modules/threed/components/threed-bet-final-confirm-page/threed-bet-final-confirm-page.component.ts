import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse, HttpParams} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import {Location} from '@angular/common';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';


@Component({
  selector: 'app-threed-bet-final-confirm-page',
  templateUrl: './threed-bet-final-confirm-page.component.html',
  styleUrls: ['./threed-bet-final-confirm-page.component.scss']
})
export class ThreedBetFinalConfirmPageComponent implements OnInit {
  betTwoDList: any;
  supportLanguages = ['en','my','th','zh'];
  totalAmount: any;
  totalAccountAmount: any; 
  token: any;
  userProfileModel: any;
  odd: any;
  discountPercent: any;
  limitedAmt: any;
  doBetModel: any;
  total_amount: any;
  discountAmount= 0;
  threedbetDetailList: any;
  newBetTwoDList= [];

 constructor(
  private handleErrorMessage: HandleErrorMessageService,
  public common: CommonService,
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

    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage')); 
    this.totalAccountAmount= 0;
    this.betTwoDList=history.state.betTwoDList;
    if(history.state.betTwoDList == undefined){
      this.betTwoDList=this.storage.retrieve('localThreedBetFinalNumber');
    }       
    if(history.state.oddModel == undefined){     
      this.odd=this.storage.retrieve('localThreedOddNumber').odd;
      this.discountPercent= this.storage.retrieve('localThreedOddNumber').discountPercent;
      this.limitedAmt= this.storage.retrieve('localThreedOddNumber').limitedAmt;
    }
    if(history.state.oddModel !=null){
      this.odd=history.state.oddModel.odd;
      this.discountPercent= history.state.oddModel.discountPercent;
      this.limitedAmt= history.state.oddModel.limitedAmt;
    }     
  }
  

  ngOnInit(): void {
    this.common.refreshLoading=false;
    this.spinner.hide("refreshLoading"); 

   this.getBalance(); 
   this.totalBetAmount();      
   this.userProfileModel={
     balance: ""
   };
    this.doBetModel={
      total_amount: 0,
      threedbetDetailList: ''
    }
    this.getDiscountAmount();
  }
  getDiscountAmount(){
    this.discountAmount = 0;   
    if(this.limitedAmt != null){
      if (this.limitedAmt > 0 &&
        (this.totalAmount >= this.limitedAmt)) {
          var value = ((this.totalAmount * this.discountPercent) / 100)
          .toString();
          if (value != null && value.indexOf(".")) {
            value = value.split(".")[0];
            this.discountAmount = this.totalAmount - parseInt(value);
          } else {
            this.discountAmount =this.totalAmount - parseInt(value);
          }
      }
      else{
        this.discountAmount=null;
      }
    }
    
    
  }

  totalBetAmount(){
    this.totalAmount=0;
    for (let i= 0; i < this.betTwoDList.length; i++)  
    {
      this.totalAmount = this.totalAmount + parseInt(this.betTwoDList[i].amount);
    }
  }
  

  getBalance(){    
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);    
    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      result => {
        this.common.refreshLoading=false;
        this.spinner.hide("refreshLoading"); 
        this.dto.Response = {};
        this.dto.Response = result;
        this.userProfileModel= this.dto.Response;   
        
      }); 
    this.spinner.hide();
  }
  
  goBack() {
    this._location.back();
  }
  doBet(){
  
    if(this.common.submitLoading !=null && this.common.submitLoading){
      return;
    }
    for (let i= 0; i < this.betTwoDList.length; i++)  
    { 
      this.newBetTwoDList[i] = {
        amount: this.betTwoDList[i].amount,
        number: this.betTwoDList[i].number
      }
    }   

    this.doBetModel.total_amount=this.totalAmount;    
    this.doBetModel.threedbetDetailList= this.newBetTwoDList;
    if(this.userProfileModel.balance < this.doBetModel.total_amount){
      this.toastr.error("", this.translateService.instant('low_balance'), {
        timeOut: 1000,
        positionClass: 'toast-bottom-center',
        });
    }
    else{

      this.token = this.storage.retrieve('token');        
      let headers = new HttpHeaders();
      headers = headers.set('Authorization', this.token);  
     this.common.submitLoading= true;   
      this.spinner.show("submitLoading");
      this.http.post(this.funct.ipaddress + 'threedbet/betThreed', this.doBetModel, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,''))
      )
      .subscribe(
        result => {
          this.common.submitLoading= false;   
          this.spinner.hide("submitLoading");
          this.dto.Response = result;    
          if(this.dto.Response.unBetList!=null && this.dto.Response.status=='bet_fail')  
            {
              this.toastr.error("", this.translateService.instant("over_limit_number"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
                });
                return;
            }    
          if(this.dto.Response.message == "error"){
            this.toastr.error("", this.translateService.instant("submitting-request-time"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
              });
              return;
          }
          if(this.dto.Response.status == "Success"){         
            this.storage.clear('localNewBetThreedNumber');
            sessionStorage.setItem('rootUrl',"/threed-bet");
            this.router.navigate(['/threed/bet-success-unsuccess-page'],{state: {status: "success",type:'threed'},replaceUrl: true})
          }       
        }); 
    }

    
  }
  twodBetLowBalance(){      
    this.router.navigate(['/wallet/top-up'],{ replaceUrl: false});
   
  }
  refreshPage() {
    this.ngOnInit();
    setTimeout(() =>
    {
      this.common.refreshLoading=false;
      this.spinner.hide("refreshLoading"); 
    }, 1000);
    
    
  }
}
