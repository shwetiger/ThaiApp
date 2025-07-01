import { LocationStrategy } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import isUAWebview from "is-ua-webview";
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-game-win-lose-page',
  templateUrl: './game-win-lose-page.component.html',
  styleUrls: ['./game-win-lose-page.component.scss']
})
export class GameWinLosePageComponent {
  launchUrl: any;  
  urlSafe: SafeResourceUrl;
  providerId: any;
  gameBalanceAfter : any='';
  token: any;
  userProfileModel: any;
  GamePlayResult: any;
  DoBalanceCloseGame: any;
  LaunchGameList: any;
  loading: any;
  game: any;
  checkWindow = false;
  fbAuthWindow: any;
  parentLink: any;
  gameLink: string;
  loadingGameBalance: any;
  catId: any;
  launchTag: any;
  isWebview: boolean;
  launchTagName: any;
  showUI:boolean=false;
  constructor(
    private spinner: NgxSpinnerService,
    public sanitizer: DomSanitizer,
    private Location: LocationStrategy,
    private dto: DtoService, 
    private router: Router,
    private funct: FunctService,
    private http: HttpClient,
    private toastr: ToastrService,
    private translateService: TranslateService, 
    private storage: LocalStorageService,
    private _location: Location) 
    { 
    this.isWebview=isUAWebview(navigator.userAgent); 
    this.gameBalanceAfter='';
    this.launchUrl=history.state.launchUrl;
    this.launchTagName=history.state.launchTagName;
    this.parentLink=history.state.parentLink;
    this.providerId=history.state.providerId;   
    this.game=this.storage.retrieve('localPreviousRoute');
    this.catId= history.state.catId;    
    this.launchTag=history.state.launchTag;
    this.game=this.storage.retrieve('localPreviousRoute');     
      if(this.launchUrl == undefined || this.launchUrl == null)
      {  
        this.launchTagName = this.storage.retrieve('localLaunchTagName');          
      // this.storage.clear('localPreviousRoute');
      // this.game= this.storage.retrieve('localPreviousRoute');      
      // this.providerId= this.storage.retrieve('localGamePlayProviderId');  
      // this.getCalculate(); 
     }  
  }

  ngOnInit() {     
    this.spinner.show();
    this.showUI=false;
    this.game= this.storage.retrieve('localPreviousRoute');
    this.GamePlayResult={
      balanceBefore: 0,      
      postBalance: 0,
      providerId: "",
      differentAmount: 0,
      status: "",     
    } 
    this.providerId=this.storage.retrieve('localGamePlayProviderId');    
    this.getUserProfile();
    this.LaunchGameList=this.storage.retrieve('localLaunchGameList'); 
    if(this.launchUrl != undefined || this.launchUrl != null){     
      this.fbAuthWindow = window.open(this.launchUrl);
      this.checkWindow = true;
      setTimeout(() => this.checkAuthWindow(),0);
    } 
    else{
      this.spinner.hide();
      this.showUI=true;
    }
  }  

  checkAuthWindow(){
    if(this.checkWindow == true){
          if(this.fbAuthWindow.closed){        
           this.storage.clear('localPreviousRoute');
           this.game=this.storage.retrieve('localPreviousRoute');    
           this.spinner.hide(); 
            this.showUI=true;    
           this.goChrome();          
        } 
        else {  
          this.spinner.show();
          this.showUI=false;
          setTimeout(() => this.checkAuthWindow(), 500);
        }     
    }
  }

  changeLanguage(data: any) {
     let language= this.storage.retrieve('localLanguage');
     if (language == "my") {
       return data.name_my != null ? data.name_my : data.name;
     } else if (language == "th") {
       return data.name_th != null ? data.name_th : data.name;
     } else if (language == "zh") {
       return data.name_zh != null ? data.name_zh : data.name;
     } else {
       return data.name_en;
     }
   }

  handleError(error: HttpErrorResponse){
    if(error.status == 0){
      this.toastr.error("", 'check your internet connection', {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
    }
    if(error.status == 423 || error.status== 417)
    {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
        this.storage.clear('token');
        this.storage.clear('isUserLoggedIn');
    }
    if(error.status == 400)
    {
       this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
    }
    if(error.status == 404)
    {
       this.toastr.error("No game list.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    if(error.status == 429)
    {
       this.toastr.error("Please contact us.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    return throwError(error);
    }

  sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
  }
  
  getUserProfile(){    
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);    
    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
    .pipe(
      catchError(this.handleError.bind(this))
    )
    .subscribe(
      result => {
        this.dto.Response = result;       
        this.storage.store('localGameUserProfile',this.dto.Response);
      }); 
  }

  goChrome()
  {
    if(this.launchTag !=null && this.launchTag != undefined){
      return;
    }
    this.loadingGameBalance=true;
    this.spinner.show();
    this.providerId= this.storage.retrieve('localProviderId'); 
    var gameBalanceBefore=this.storage.retrieve('localGameBalanceBefore');   
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);  
    this.GamePlayResult.balanceBefore=gameBalanceBefore;
    this.GamePlayResult.postBalance=gameBalanceBefore;
    this.GamePlayResult.providerId=this.providerId.toString();  
      this.http.post(this.funct.ipaddress + 'loginGS/DoBalanceCloseGame',this.GamePlayResult, { headers: headers })
      .pipe
        (
          catchError(this.handleError.bind(this))
        )
      .subscribe(
        result => {
          this.dto.Response = result;         
          this.DoBalanceCloseGame=result; 
        
       
          if(this.DoBalanceCloseGame.status == "Success"){          
            this.GamePlayResult.balanceBefore=gameBalanceBefore;
            this.GamePlayResult.postBalance=parseInt(this.DoBalanceCloseGame.postBalance);   
            this.loadingGameBalance=false;
            this.spinner.hide(); 
           // this.spinner.hide();
            this.showUI=true;                                        
          }
        }
      ); 
  }

  getCalculate(){
    if(this.launchTag !=null && this.launchTag != undefined){
      return;
    }
    this.GamePlayResult={
      balanceBefore: 0,
      postBalance: 0,
      providerId: "",
      differentAmount: 0,
      status: "",
      signature: ""
    } 
    this.loadingGameBalance=true;
    this.spinner.show();
    this.providerId= this.storage.retrieve('localProviderId'); 
    var gameBalanceBefore=this.storage.retrieve('localGameBalanceBefore');
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);  
    this.GamePlayResult.balanceBefore= gameBalanceBefore;
    this.GamePlayResult.postBalance=gameBalanceBefore;
    this.GamePlayResult.providerId=this.providerId.toString();     
      this.http.post(this.funct.ipaddress + 'loginGS/DoBalanceCloseGame',this.GamePlayResult, { headers: headers })
      .pipe
        (
          catchError(this.handleError.bind(this))
        )
      .subscribe(
        result => {
          this.dto.Response = result;         
          this.DoBalanceCloseGame=result;                   
          if(this.DoBalanceCloseGame.status == "Success"){         
            this.GamePlayResult.balanceBefore=gameBalanceBefore;
            this.GamePlayResult.postBalance=parseInt(this.DoBalanceCloseGame.postBalance);   
            this.loadingGameBalance=false;
            this.spinner.hide();                                         
          }
        }
      );
  }

  changeNumber(n1,n2){     
    return  Math.abs(n1 - n2); 
   }
  
   goToGame(){ 
    this._location.back();
   }
}

