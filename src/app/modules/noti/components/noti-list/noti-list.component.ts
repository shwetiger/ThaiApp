import { HttpClient ,HttpErrorResponse,HttpHeaders, HttpParams, } from '@angular/common/http';
import { Component, NgModule, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError } from 'rxjs/operators';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
  
@Component({
  selector: 'app-noti-list',
  templateUrl: './noti-list.component.html',
  styleUrls: ['./noti-list.component.scss'],
  
})
export class NotiListComponent implements OnInit {
  notiList: any;
  token: any;
  notiCount: any; 
  deviceId: any;
  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private spinner: NgxSpinnerService,
    private translateService: TranslateService,
    private toastr: ToastrService, 
    private dto: DtoService,
    private router: Router,
    private funct: FunctService,
    private http: HttpClient, 
    private storage: LocalStorageService,
    private sanitizer: DomSanitizer) {    
    this.deviceId=this.storage.retrieve('localDeviceId');    
   }
  ngOnInit(): void {
    this.common.refreshLoading=true;
    this.spinner.show("refreshLoading");     
    this.notiList=[];
    this.notiCount=0;
    this.getAllNoti();
  }

  getSanitizedContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
  getAllNoti()
  {
    var userlogin=this.storage.retrieve('isUserLoggedIn');
    if(!userlogin){   
    }
    var localnoti=this.storage.retrieve('localNotiList');
    if(localnoti !=null){
      this.notiList=localnoti;
    } 
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',this.token);
    this.http.get(this.funct.ipaddress + 'notification/GetNotificationList', { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      async result => {
        this.common.refreshLoading=false;
        this.spinner.hide("refreshLoading");
        this.dto.Response = result;
        if(this.dto.Response.length > 0){
          this.storage.store('localNotiList', this.dto.Response);
          this.notiList = this.storage.retrieve('localNotiList');         
          var newcount=0;       
          this.dto.Response.forEach(e => {
            if(e.status == 0){
              newcount++;          
            }          
          });
          this.storage.store('localNewNotiCount', newcount);         
        }        
      }      
    );    
  }  
  goToNotiDetail(noti) {
    var login= this.storage.retrieve('isUserLoggedIn'); 
    if(login){     
      this.router.navigate(['/noti/detail',noti.id],{replaceUrl: false}); 
    }
    else{
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      return;
    }   
  }

   getAllNotiCutStr(str) {
    if (str != null && str.length > 100) {
      str = str.replace(50, ' ');
      return str.substr(0, 100);
    } else {
      return str;
    }
  }

  getAllNotiCutStrTitle(str) {    
    if (str != null && str.length > 50) {
      return str.substr(0, 50);
    }
    else {
      return str;
    }    
  }  
  refreshPage(){
    
    this.ngOnInit();
    setTimeout(() => {
      this.common.submitLoading= false;         
      this.spinner.hide("submitLoading");
      
    }, 1000);
  }
}
