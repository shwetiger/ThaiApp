import { Component, OnInit,ViewEncapsulation, Renderer2, AfterViewInit, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, delay, retry } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl,SafeHtml } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { param } from 'jquery';
import { TranslateService } from '@ngx-translate/core';
import { formatDate, formatNumber } from '@angular/common';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';



@Component({
  selector: 'app-noti-detail',
  templateUrl: './noti-detail.component.html',
  styleUrls: ['./noti-detail.component.scss'],
  template:'template: `<div class="quill-content" [innerHTML]="sanitizedContent"></div>`,',
  encapsulation: ViewEncapsulation.None 
})
export class NotiDetailComponent implements OnInit {
 
  notiId : any;
  token : any;
  notiDetailObj: any;
  notiList: any;
  userProfileModel: any;
  supportLanguages = ['en', 'my', 'th', 'zh'];
  isUserLoggedIn: boolean=false;
  twodResult: any="";
  imgLink: any;
  notilink:any;
  linktext:any;
  openUrl:any;

  constructor( 
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private spinner: NgxSpinnerService, 
    private translateService: TranslateService,
    private dto: DtoService,
    private funct: FunctService,
    private http: HttpClient,
    private toastr: ToastrService,
    private storage: LocalStorageService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private renderer: Renderer2, private el: ElementRef) { 
    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage')); 
  }

  ngOnInit(): void {
    this.common.refreshLoading=true;
    this.spinner.show("refreshLoading");
    this.isUserLoggedIn= this.storage.retrieve('isUserLoggedIn'); 
    this.getUserProfile();
    this.notiDetailObj = {type:"All"};
    this.notiId = this.route.snapshot.paramMap.get("id");  
    this.notiList = this.storage.retrieve('localNotiList');   
    this.getNotiById();   
    this.openUrl="?openinnewtap=1";
  }

  ngAfterViewInit() {
    const container: HTMLElement = this.el.nativeElement.querySelector('#contentContainer');
    const links = container.getElementsByTagName('a');
      this.renderer.listen(links, 'click', (event: MouseEvent) => {
        event.preventDefault();
        window.location.href = (event.target as HTMLAnchorElement).href;
      });
    
  }
  getSanitizedContent(content: string): SafeHtml {
    const correctedContent = content.replace(/\\"/g, '"');
    return this.sanitizer.bypassSecurityTrustHtml(correctedContent);
  }

  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'a') {
      event.preventDefault();
      const href = (target as HTMLAnchorElement).href;
      this.navigateTo(href);
    }
  }

  navigateTo(url: string) {
 
    window.location.href = url;

 
  }

  getNotiById()
  {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',  this.token);
    let params = new HttpParams();
    params = params.set("notiId",this.notiId);
    this.http.get(this.funct.ipaddress + 'notification/GetNotiById?', { params: params, headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      result => {
        this.dto.Response = result; 
        if(this.dto.Response.type=='2D Results'){
          this.twodResult=this.translateService.instant('twod_result_section');         
          this.twodResult=this.twodResult.toString().replace("@section", this.dto.Response.fortime);       
        }
        this.storage.store('localNotiObj',  this.dto.Response);
        this.notiDetailObj = this.dto.Response;
        if(this.notiDetailObj.body!=null){
        if(this.notiDetailObj.body.includes('<a>'))
        {
          this.linktext=this.notiDetailObj.body.substring(
          this.notiDetailObj.body.indexOf(""), 
          this.notiDetailObj.body.lastIndexOf("<a>")
        );
        this.notilink = this.notiDetailObj.body.substring(
          this.notiDetailObj.body.indexOf("<a>")+3, 
          this.notiDetailObj.body.lastIndexOf("</a>")
        );
        this.notilink=this.notilink+this.openUrl;
        }
        
        else
        {
        this.notilink=''
        }
      }
        this.getImageLink(this.notiDetailObj);
      
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

  getDateTime(date)
  {
    var formatter = 'yyyy/MM/dd hh:mm a';
    return formatDate(date, formatter, 'en-US');
  }

  getDate(date)
  {
    var formatter = 'yyyy/MM/dd';
    return formatDate(date, formatter, 'en-US');
  }
  
  getNotiPoint(state) {
    if (state == "RECEIVED") {
      let translated = this.translateService.instant('point_noti_desc');
      translated = translated
        .replaceAll('@kyat', this.notiDetailObj.bill)
        .replaceAll('@point', this.notiDetailObj.pointWallet)
        .replaceAll('@percent', this.notiDetailObj.percentage);
      return translated;
    }
    if (state == "APPROVED") {
      let translated = this.translateService.instant('pt_trans_success_desc');
      translated = translated
        .replaceAll('@kyat', this.notiDetailObj.bill)
      return translated;
    }

    if (state == "DENIED") {
      let translated = this.translateService.instant('pt_trans_denied_desc');
      translated = translated
        .replaceAll('@kyat', this.notiDetailObj.bill)
      return translated;
    }

    
  }

 getFirstTopUpStr() 
  {
   var str = this.translateService.instant('point-detail-des');
    str = str.replaceAll('@percentage', this.notiDetailObj.percentage);
    var billValue = parseFloat(this.notiDetailObj.bill.replace(/,/g, ''));
    if (!isNaN(billValue)) {
        var formattedBill = billValue.toLocaleString(); 
        str = str.replaceAll('@kyat', formattedBill); 
    } else {
        str = str.replaceAll('@kyat', this.notiDetailObj.bill); 
    }
    str = str.replaceAll('@pointkyat', this.notiDetailObj.pointWallet);    
    str = str.replaceAll('@pointNo', this.notiDetailObj.account_no);
    return str;
  }

  getTopupNotiStr(state) {
    var no=this.notiDetailObj.transaction_no!=null && this.notiDetailObj.transaction_no !="" && this.notiDetailObj.transaction_no !=undefined? this.notiDetailObj.transaction_no:this.notiDetailObj.account_no
    var str = "";
    if (state == "APPROVED")
    {
      str = this.translateService.instant('top_up_success');
    }
    else {
       str = this.translateService.instant('top_up_denied');
    }

    var billValue = parseFloat(this.notiDetailObj.bill.replace(/,/g, '')); 
    if (!isNaN(billValue)) {
      
        var formattedBill = billValue.toLocaleString(); 
        str = str.replace('@kyat', formattedBill); 
    } else {
        
        str = str.replace('@kyat', this.notiDetailObj.bill); 
    }
   
    str = str.replace('@tracNo', no);
    return str;
  }

  getWithdrawNotiStr(state) {
      var no = this.notiDetailObj.account_no
      if (no != null && no != "" && no != undefined)
      {
        if (no.length > 5)
        {
          no = no.replaceAll("+959", "09").substr(0,3)+"*** ***";
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

    var billValue = parseFloat(this.notiDetailObj.bill.replace(/,/g, '')); 
    if (!isNaN(billValue)) {
      
        var formattedBill = billValue.toLocaleString(); 
        str = str.replace('@kyat', formattedBill); 
    } else {
        
        str = str.replace('@kyat', this.notiDetailObj.bill); 
    }
   // str = str.replace('@kyat', this.notiDetailObj.bill);
    str = str.replace('@tracNo', no);
    return str;
  }

getBalance(){
    if (this.notiDetailObj.balance!=null && this.notiDetailObj.balance!="" && this.notiDetailObj.balance!=undefined) {
      return formatNumber(this.notiDetailObj.balance, '1.2-2') + "KS";
    }
    else return "";
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

  getWinnerDate() {
    var dateStr = "";
    if (this.notiDetailObj.request_date != null && this.notiDetailObj.request_date != "" && this.notiDetailObj.request_date != undefined)
    {
      dateStr = this.getDateTime(this.notiDetailObj.request_date);
      return dateStr;
    }
    else if (this.notiDetailObj.currentdate != null && this.notiDetailObj.currentdate != "" && this.notiDetailObj.currentdate != undefined)
    {
      dateStr = this.getDateTime(this.notiDetailObj.currentdate);
      return dateStr;
    }
    else {
      return "";
    }
  }

}
