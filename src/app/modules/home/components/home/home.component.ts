import { Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocationStrategy } from '@angular/common';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { AccountLoginComponent } from 'src/app/shared/components/account-login/account-login.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild(AccountLoginComponent) child:AccountLoginComponent;
  gameProviderList : any;
  localgameProviderList: any;
  notiCount: any;
  deviceId: any;
  loading : any;  
  fcmToken: any;
  token: any;
  browserVersion: any;
  fcmtokenCheck: any;
  isUserLogin: boolean=false;
  smsprovider:any;
  maintenance:any;
  isWebview:any;
  deviceId1:any;

  constructor(   
    public handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,  
    private Location: LocationStrategy,private route: ActivatedRoute,
    private translateService: TranslateService,
    private router: Router,
    private dto: DtoService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private storage: LocalStorageService,
    private funct: FunctService,
    private cdr: ChangeDetectorRef    ) { 
    this.deviceId= this.route.snapshot.paramMap.get("deviceId");     
    this.fcmToken= this.route.snapshot.paramMap.get("fcmToken");
    var isWebviewUser = require('is-ua-webview');    
    this.isWebview = isWebviewUser(navigator.userAgent);
    if(this.fcmToken != null){
      this.storage.store('localFcmtoken',this.fcmToken);     
    }
    this.isUserLogin= this.storage.retrieve('isUserLoggedIn');
  }
  
  async ngOnInit(): Promise<void> { 
    this.storage.clear('fishingmaintenance');
    this.storage.clear('localCloseGameBalance');
    this.common.refreshLoading=true;
    this.spinner.show("refreshLoading");   
 
    var lan=this.storage.retrieve('localLanguage');
   // window.history.go(-(window.history.length - 1));
    if(this.isWebview){
      this.deviceId1="mobile";
    }
   
    else{
      this.deviceId1='chrome';  
    }
   this.clearLocationHistory();
    if(lan == null || lan == undefined){
      this.storage.store('localLanguage', "my");
    }      
    this.storage.store("localDeviceId",this.deviceId);     
    this.gameProviderList= [];
    this.getGameProviderList();
    this.gameProviderList = this.storage.retrieve("localgameProviderList");
    this.notiCount= this.storage.retrieve("localNotiCount");
    if(this.isUserLogin){
      this.updateUsedTime();
      this.updateFCMtoken();
    }  
    //gameAds clear
    this.storage.clear('localadsList');
    this.storage.clear('localmarqueeText');
    this.closeMaintenance();
    this.storage.clear("localNotiList")
    //this.getAllNoti();
  }

  getAllNoti()
  {       
    let userlogin=this.storage.retrieve('isUserLoggedIn'); 
    if(userlogin){
      this.token = this.storage.retrieve('token');
      let headers = new HttpHeaders();
      headers = headers.set('Authorization',  this.token);
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
            var newcount=0;       
            this.dto.Response.forEach(e => {
              if(e.status == 0){
                newcount++;          
              }          
            });
            this.storage.store('localNewNotiCount', newcount);  
            this.notiCount =this.storage.retrieve('localNewNotiCount');    
          }        
        }      
      ); 
    }
  } 

  closeMaintenance()
  {
   this.http.get(this.funct.ipaddress + 'gameProvider/closeMaintenance')
   .pipe(
     catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
   .subscribe(
     result => {
       this.dto.Response = {};
       this.dto.Response = result;
     });
  }

  createSKMGameMember(){         
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);  
    this.http.post(this.funct.ipaddress + 'shkm/SKMRegister', null, {headers: headers })
    .pipe
      (
         catchError(this.handleError.bind(this))
      )
    .subscribe(
      result => {        
        this.dto.Response = result;       
      }
    );
  }
  
  handleError(error: HttpErrorResponse)
  {
    this.spinner.hide('loadingSubmiting');
    this.spinner.hide("refreshLoading");
    if(error.status == 0){
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        return;
    }
    if(error.status == 423)
    {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        this.storage.clear('token');
        this.storage.clear('isUserLoggedIn');
        return;
    }
    if(error.status == 400)
    {
       this.toastr.error("Invalid parameters.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        return;
    }    
   
    if(error.status == 404)
    {      
      this.toastr.error("", this.translateService.instant("incorrectPassword"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        return;
    }
    if(error.status == 406)
    {
      this.router.navigate(['/game/deposit-error', '406'], {replaceUrl: true});
      return;
    }
    if(error.status == 700)
    {
      this.router.navigate(['/game/deposit-error', '700'], {replaceUrl: true});
      return;
    }
    this.toastr.error("", error.status.toString(), {
      timeOut: 3000,
      positionClass: 'toast-top-center',
      });
      return;
  }

  // closeMaintenance()
  // {
  //  this.http.get(this.funct.ipaddress + 'gameProvider/closeMaintenance')
  //  .pipe(
  //    catchError(this.handleErrorMessage.handleError.bind(this,''))
  //   )
  //  .subscribe(
  //    result => {
  //      this.dto.Response = {};
  //      this.dto.Response = result;
  //    });
  // }

goToNotiList() {
    this.router.navigate(['/noti-list'],{replaceUrl: false});
  } 

getGameProviderList()
    {   
      let headers = new HttpHeaders();    
      this.http.get(this.funct.ipaddress + 'gameProvider/getGameProviderList', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,''))
        )
      .subscribe(
        result => { 
          this.common.refreshLoading=false;
          this.spinner.hide("refreshLoading");       
          this.dto.Response = result;
          this.gameProviderList =  this.dto.Response;
          this.storage.store('localgameProviderList', this.gameProviderList);
        }
      );
  }

  changeLanguageTitle(data:any)
  {
    let language= this.storage.retrieve('localLanguage');
    if (language == "my") {
      return data.name_my != null ? data.name_my : data.name_en;
    } else if (language == "th") {
      return data.name_th != null ? data.name_th : data.name_en;
    } else if (language == "zh") {
      return data.name_zh != null ? data.name_zh : data.name_en;
    } else {
      return data.name_en;
    }
  }

  twodPage() {    
    if(!this.isUserLogin){
      this.getLogin();
      return;
    }
    this.storage.clear('localSectionId');
    this.storage.clear('localSectionName');
    this.storage.clear('localSection');
    this.storage.clear("localCloseWeekend");
    this.storage.clear("localCloseHoliday");
    this.router.navigate(['/twod'], { replaceUrl: false });
  }

  threedPage() {   
    if(!this.isUserLogin){
      this.getLogin();
      return;
    }
    this.router.navigate(['/threed'], { replaceUrl: false });
  } 

  downloadPage(){
    this.router.navigate(['/download'], { replaceUrl: false });
  }

  refreshPage() 
  {   
    this.ngOnInit();
    window.location.reload();
    this.child.getUserProfile();
      setTimeout(() => {
        this.common.refreshLoading=false;
        this.spinner.hide("refreshLoading");    
      }, 1000);
  }

  goToGame(id, categoryname,maintenance)
  {
    this.isUserLogin= this.storage.retrieve('isUserLoggedIn');
    if(!this.isUserLogin){
      this.getLogin();
      return;
    }
    this.storage.clear('localGameProviderId'); 
    this.storage.clear('localGameCatName');
    this.storage.clear("localGameCatId");
    this.storage.clear('localProviderType');
    this.storage.clear('localProviderId');  
    if(categoryname == "Fishing"){  
      this.storage.clear("localGamePlayProviderId");  
      if(maintenance==true)  
      {
        this.storage.store('localGameProviderId',[8,2]);
        this.storage.store('fishingmaintenance',maintenance)
      }
      else{
        this.storage.store('localGameProviderId',[8,2]);
      }
      this.router.navigate(['/game/gamecategory',id], {state: { catId: id ,catName: categoryname, gameProviderId: id}, replaceUrl: false});
    }else{     
      this.storage.clear("localGameCatId");
      this.storage.store('localGameProviderId',[id]);
      this.router.navigate(['/game/gameList',id], {state: {catName: categoryname }, replaceUrl: false});
    } 
  }

  //old
  updateFCMtoken(){
    var token=this.storage.retrieve('localFcmtoken');
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    var newToken={
      fcmtoken: token
    } 
    this.http.post(this.funct.ipaddress + 'user/updateFcmtoken', newToken, {headers: headers })
    .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this,''))
      )
    .subscribe(
      result => {  
        this.common.refreshLoading=false;
        this.spinner.hide("refreshLoading");          
        this.dto.Response = result;
        this.fcmtokenCheck=this.dto.Response;    
      }
    );
  }

  updateUsedTime(){
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);    
    this.http.get(this.funct.ipaddress + 'Authenticate/updateUsedTime', {headers: headers })
    .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this,''))
      )
    .subscribe(
      result => {   
        this.common.refreshLoading=false;
        this.spinner.hide("refreshLoading");         
        this.dto.Response = result;
      }
    );
  }
  
getLogin(){   
    if(!this.isUserLogin){
       this.router.navigate(['login'],{replaceUrl: false});
    }
  }

  clearLocationHistory() {
    // Check if the browser supports the History API
    if (window.history && window.history.pushState) {
      // Replace the current state with a new one
      window.history.replaceState({}, document.title, window.location.href);
  
    }
  }
  
}
