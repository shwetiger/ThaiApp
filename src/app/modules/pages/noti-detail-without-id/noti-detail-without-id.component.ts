import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, delay, retry } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl,SafeHtml } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { formatDate, formatNumber } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';




@Component({
  selector: 'app-noti-detail-without-id',
  templateUrl: './noti-detail-without-id.component.html',
  styleUrls: ['./noti-detail-without-id.component.scss']
})
export class NotiDetailWithoutIdComponent implements OnInit {

  data: any;
  token: any;

  guid: any;
  isUserLoggedIn: boolean;
  userProfileModel: any;
  bankSlip: any;
  twodResult: any;
  imgLink: any;
  linktext:any;
  notilink:any;
  openUrl:any;
  

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private spinner: NgxSpinnerService, 
    private router: Router,
    private translateService: TranslateService,
    private dto: DtoService,
    private funct: FunctService,
    private http: HttpClient,
    private toastr: ToastrService,
    private storage: LocalStorageService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,) { 
   
  }
  ngOnInit(): void {   
    this.common.refreshLoading=true;
    this.spinner.show("refreshLoading");   
    this.openUrl="?openinnewtap=1"; 
    this.data={
      isFirstTopup: ''
    }
      this.guid=this.route.snapshot.paramMap.get("data"); 
      if(this.guid !=null || this.guid !=undefined){
       this.isUserLoggedIn=this.storage.retrieve('isUserLoggedIn');
        if(!this.isUserLoggedIn){
          this.getBankSlip(this.guid);
        }        
      }      
      this.getAllNoti();
      this.getUserProfile();
  }

  getSanitizedContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
  
  getBankSlip(guid){    
    let headers = new HttpHeaders();   
    this.http.get(this.funct.ipaddress + 'notification/GetNotiByGuid?guid='+guid, { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      result => {
        this.dto.Response = result; 
        if(this.dto.Response.type == 'BankSlip'){
          this.bankSlip=this.dto.Response;
        }
        else{
          this.bankSlip=null;
        }
        
      }
    
    );
  }
  goToHome(){
    this.router.navigate(["/home"],{ replaceUrl: true });   
  }
  goToForget() {     
    sessionStorage.setItem('rootUrl',"forget-noti");  
    this.router.navigate(["/home"],{ replaceUrl: true });     
  }

    
  getUserProfile(){ 
  this.isUserLoggedIn= false;    
  this.token = this.storage.retrieve('token');  
  if(this.token != null){
  let headers = new HttpHeaders();
  headers = headers.set('Authorization', this.token);    
  this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
  .pipe(
    catchError(this.handleErrorMessage.handleError.bind(this,''))
  )
  .subscribe(
    result => {
      this.dto.Response = {};
      this.dto.Response = result;
      this.userProfileModel= this.dto.Response;  
      this.isUserLoggedIn= this.storage.retrieve('isUserLoggedIn'); 
    }); 
  }
 
} 
  getAllNoti()
  {   
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',  this.token);
    this.http.get(this.funct.ipaddress + 'notification/GetNotificationList', { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      result => {
        this.dto.Response = result;          
        this.dto.Response.forEach(e => 
          {
          if(e.guid == this.guid)
          {   
            e.status == "0";       
            this.data=e;
            if(this.data.type=='2D Results'){
              this.twodResult=this.translateService.instant('twod_result_section');         
              this.twodResult=this.twodResult.toString().replace("@section", this.data.fortime);
             }  

             if(this.data.body.includes('<a>'))
             {
               this.linktext=this.data.body.substring(
               this.data.body.indexOf(""), 
               this.data.body.lastIndexOf("<a>")
             );
             this.notilink = this.data.body.substring(
               this.data.body.indexOf("<a>")+3, 
               this.data.body.lastIndexOf("</a>")
             );
             this.notilink=this.notilink+this.openUrl;
     
             }
             else
             {
             this.notilink=''
             }
             this.getImageLink(this.data);
                      
          }
          this.common.refreshLoading=false;
          this.spinner.hide("refreshLoading");
        });  
       
      }
    
    );
    
  }

  getImageLink(obj){     
    let headers = new HttpHeaders();    
    var fortime='';
    var isFirstTopup='';
    if(obj.fortime == null){
      fortime= '';
    }
    if(obj.fortime != null){
      fortime=obj.fortime;
    }
    if(obj.isFirstTopup == null){
      isFirstTopup='';
    }
    if(obj.isFirstTopup != null){
      isFirstTopup= obj.isFirstTopup;
    }
    var imgObj={
      title: obj.title,
      type: obj.type,
      fortime: fortime,
      isFirstTopup: isFirstTopup,
    } 
    this.http.post(this.funct.ipaddress +'notification/GetNotiImages', imgObj, { headers: headers }) 
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      result => {
        this.dto.Response = result;    
        if(this.dto.Response !=null){
          this.imgLink=this.dto.Response.imagePath;
        }
        else{
          this.imgLink="";
        }
        this.common.refreshLoading=false;
        this.spinner.hide("refreshLoading");
      }
    );
  }

  getFirstTopUpStr() 
  {
   var str = this.translateService.instant('point-detail-des');
    str = str.replaceAll('@percentage', this.data.percentage);
    str = str.replaceAll('@kyat', this.data.bill);
    str = str.replaceAll('@pointkyat', this.data.pointWallet);
    str = str.replaceAll('@pointNo', this.data.account_no);
    return str;

  }
  getWithdrawNotiStr(state) {
       var no = this.data.account_no
       if (no != null && no != "" && no != undefined)
       {
         if (no.length > 5)
         {
           no = no.replaceAll("+959", "09").substr(0,5)+"*** ***";
           }
         }
     var str = "";
     if (state == "APPROVED")
     {
       str = this.translateService.instant('withdrawal_success');
     }
     else {
        str = this.translateService.instant('withdrawal_denied');
     }
     str = str.replace('@kyat', this.data.bill);
     str = str.replace('@tracNo', no);
     return str;
   }
 
  getTopupNotiStr(state) {
    var no=this.data.transaction_no!=null && this.data.transaction_no !="" && this.data.transaction_no !=undefined? this.data.transaction_no:this.data.account_no
    
    var str = "";
    if (state == "APPROVED")
    {
      str = this.translateService.instant('top_up_success');
    }
    else {
       str = this.translateService.instant('top_up_denied');
    }
    str = str.replace('@kyat', this.data.bill);
    str = str.replace('@tracNo', no);
    return str;
  }
  getBalance(){
    if (this.data.balance!=null && this.data.balance!="" && this.data.balance!=undefined) {
      return formatNumber(this.data.balance, '1.2-2') + "KS";
    }
    else return "";
  }
  getDateTime(date)
  {
    var formatter = 'yyyy/MM/dd hh:mm a';
    return formatDate(date, formatter, 'en-US');
  }

  getWinnerDate() {
    var dateStr = "";
    if (this.data.request_date != null && this.data.request_date != "" && this.data.request_date != undefined)
    {
      dateStr = this.getDateTime(this.data.request_date);
      return dateStr;
    }
    else if (this.data.currentdate != null && this.data.currentdate != "" && this.data.currentdate != undefined)
    {
      dateStr = this.getDateTime(this.data.currentdate);
      return dateStr;
    }
    else {
      return "";
    }

  }
  getDate(date)
  {
    var formatter = 'yyyy/MM/dd';
    return formatDate(date, formatter, 'en-US');
  }
  getNotiPoint() {
    var str =this.translateService.instant('point_success').replaceAll('@kyat', this.data.bill);
     return str;
   }
 
}
