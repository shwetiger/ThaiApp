import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError } from 'rxjs/operators';
import { DtoService } from '../../service/dto.service';
import { FunctService } from '../../service/funct.service';
import { GameCategoryTransferComponent } from '../game-category-transfer/game-category-transfer.component';
import { GameListTransferComponent } from '../game-list-transfer/game-list-transfer.component';
import { GameOpenChromeComponent } from '../game-open-chrome/game-open-chrome.component';
import { SportDialogComponent } from 'src/app/shared/dialog/sport-dialog/sport-dialog.component';

@Component({
  selector: 'app-game-web-mobile-view',
  templateUrl: './game-web-mobile-view.component.html',
  styleUrls: ['./game-web-mobile-view.component.scss']
})
export class GameWebMobileViewComponent implements OnInit {
  gameLoadingone: any=false;
  gameLoadingtwo: any=false;
  title: string;
  closeBtnName: string; 
  @Input() data: any=[];   
  @Input() providerId: any;
  token: any;
  gameUserBalance: any;
  launchGameModel: any=[];
  launchGameResModel: any=[];
  launchTagName: any;
  userProfileBalance: any;
  isUserLoggedIn:any;

  constructor(  private modalService: BsModalService, 
    private dto: DtoService,
    private spinner: NgxSpinnerService, 
    private toastr: ToastrService,
    private http: HttpClient,
    private funct: FunctService,
    private storage: LocalStorageService,
    public bsModalRef: BsModalRef,
    private translateService: TranslateService, 
    private router: Router,) { }

  ngOnInit(): void {
    this.getUserProfile();
    this.closeBtnName= this.translateService.instant('cancel');
    // this.launchGameModel ={
    //   "gcode": "string",
    //   "gpcode": "string",
    //   "lang": "string"
    // }
    this.launchGameModel = {
      "gameId": "string",
      "lang": "string",
      "providerCode": "string",
      "type": "string"
    }
  }

  close(){
    this.bsModalRef.hide();
  }

  async  playwithWebView(){
    this.gameLoadingone=true;
    this.spinner.show("gameLoadingone");  
    await  this.getGameUserBalance();
    if(this.gameUserBalance < 1000)
      { 
        this.launchGameModel.gameId = this.data.gameId;
        this.launchGameModel.providerCode = this.data.providerCode;          
        this.launchGameModel.lang = this.gameLanguage();
        this.launchGameModel.type = this.data.type;
        var data ={
          gameBalance: this.gameUserBalance,
          balance:  this.userProfileBalance,         
          providerId: this.providerId,
          launchGameModel :this.launchGameModel,
          view:'webview'
        }
        this.storage.store("from-game-account-login",null)  
        this.bsModalRef.hide();
        this.showSportDialog(data);   
        return;
      }
      else{
    this.storage.store('localCloseGameBalance',this.gameUserBalance);
    this.launchGameModel.gameId = this.data.gameId;
    this.launchGameModel.providerCode = this.data.providerCode;          
    this.launchGameModel.lang = this.gameLanguage();
    this.launchGameModel.type = this.data.type;
    let headers = new HttpHeaders();
    this.token = this.storage.retrieve('token');  
    headers = headers.set('Authorization', this.token);
    var url = this.funct.ipaddress + 'loginGS/launchGames';
    this.http.post(url, this.launchGameModel, {headers: headers })
    .pipe
      (
        catchError(this.handleError.bind(this,''))
      )
    .subscribe(
      async result => {
        this.dto.Response = {};
        this.dto.Response = result;
        this.launchGameResModel = this.dto.Response;
        this.gameLoadingone=false;
        this.spinner.show("gameLoadingone");        
        this.bsModalRef.hide();        
        this.storage.store('localGamePlayProviderId',this.providerId);
        this.storage.store('localPreviousRoute','gameList')  
        sessionStorage.setItem('providerId',this.providerId);  
          var gamelist=this.storage.retrieve('localLaunchGameList');
           let language= this.storage.retrieve('localLanguage');    
           if (language == "my") {
             this.launchTagName=this.translateService.instant("game-win-lose-chrome");
             this.launchTagName=this.launchTagName.toString().replace("@name",gamelist.name_my);                 
           } else if (language == "th") {
             this.launchTagName=this.translateService.instant("game-win-lose-chrome");
             this.launchTagName=this.launchTagName.toString().replace("@name", gamelist.name_th);                 
           } else if (language == "zh") {
             this.launchTagName=this.translateService.instant("game-win-lose-chrome");
             this.launchTagName=this.launchTagName.toString().replace("@name", gamelist.name_zh);                   
           } else {
             this.launchTagName=this.translateService.instant("game-win-lose-chrome");
             this.launchTagName=this.launchTagName.toString().replace("@name",gamelist.name);                  
           }      
           this.storage.store('localCloseGameBalance',this.gameUserBalance);
           this.storage.store('localOpenNewTap',this.storage.retrieve('localGameBalanceBefore'));          
           this.storage.store('localLaunchTagName', this.launchTagName);
           this.router.navigate(['/game/play'],{state: {launchUrl: this.launchGameResModel.gameUrl,launchTag: "openinnewtap",launchTagName: this.launchTagName,
            providerId: this.providerId},replaceUrl: false}); 
      }
    ); 
  }
}

async getGameUserBalance()
{  
  let params = new HttpParams();
  this.token = this.storage.retrieve('token');    
  let headers = new HttpHeaders();
  headers = headers.set('Authorization', this.token);  
  params = params.set('providerId',this.providerId);
  let config = {
    headers: {'Authorization': this.token},
    params: {'providerId': this.providerId},
  }
  const axios = require('axios').default;

    await axios.get(this.funct.ipaddress + 'loginGS/getBalance', config )
    .then((res) => {
      this.isUserLoggedIn= true;
      this.gameUserBalance = res.data.balance;
      this.storage.store('localGameBalanceBefore',this.gameUserBalance);     
      return res.data.balance;
  })
    .catch((error) => {    
      this.isUserLoggedIn= false; 
      if (error.response) {
      }
    });
  
}

showSportDialog(data) {      
  const initialState= {          
    title: '',
    closeBtnName: '',     
    data: data,
    backdrop: true,
    ignoreBackdropClick: true
  };    
  this.bsModalRef = this.modalService.show(SportDialogComponent, 
    {class: 'modal-sm game-sport-alert', initialState
 });
}


gameLanguage()
{
  let language= this.storage.retrieve('localLanguage');
  if (language == "my") {
    return language+"_"+"MM";
  } else if (language == "th") {
    return language+"_"+"TH"
  } else if (language == "zh") {
    return language+"_"+"CN"
  } 
  else if (language == "en") {
    return language+"_"+"US"
  } 
  else {
    return language+"_"+"US"
  }
}

getUserProfile()
{
  let params = new HttpParams();
  this.token = this.storage.retrieve('token');    
  let headers = new HttpHeaders();
  headers = headers.set('Authorization', this.token);  
  this.http.get(this.funct.ipaddress + 'user/PointUserProfile', {headers: headers })
  .pipe
    (
       catchError(this.handleError.bind(this))
    )
  .subscribe(
    result => {
      this.dto.Response = {};
      this.dto.Response = result;
      this.userProfileBalance = this.dto.Response.balance;
    }
  );
}

handleError(error: HttpErrorResponse){   
  this.spinner.hide();  
  this.spinner.hide("smallSpinner"); 
  if(error.status == 0){
    this.toastr.error("", 'check your internet connection', {
      timeOut: 1000,
      positionClass: 'toast-top-center',
      });
      return;
  }
  
  if(error.status == 423 || error.status== 417)
  {
    
    this.toastr.error("", this.translateService.instant("youNeedLogin"), {
      timeOut: 1000,
      positionClass: 'toast-top-center',
      });
      this.storage.clear('token');
      this.storage.clear('isUserLoggedIn');
       this.router.navigate(['/login'], { replaceUrl: true });
      return;
  }
  if(error.status == 400)
  {
     this.toastr.error("Bad request.", '', {
      timeOut: 1000,
      positionClass: 'toast-top-center',
      });
      return;
  }

  if(error.status == 404)
  {      
      return;
  }

  if(error.status == 429)
  {   
      return;
  }
  else{
    this.toastr.error("", error.status.toString(), {
      timeOut: 3000,
      positionClass: 'toast-top-center',
      });
      return;
  }

  }

  async playwithMobileView(){
    this.gameLoadingtwo=true;
    this.spinner.show("gameLoadingtwo"); 
    await  this.getGameUserBalance();
    if(this.gameUserBalance < 1000)
      { 
        this.launchGameModel.gameId = this.data.gameId;
        this.launchGameModel.providerCode = this.data.providerCode;          
        this.launchGameModel.lang = this.gameLanguage();
        this.launchGameModel.type = this.data.type;
        var data ={
          gameBalance: this.gameUserBalance,
          balance:  this.userProfileBalance,         
          providerId: this.providerId,
          launchGameModel :this.launchGameModel,
          view:'mobileview'
        }
        this.storage.store("from-game-account-login",null)  
        this.bsModalRef.hide();
        this.showSportDialog(data);   
        return;
      }
      else{ 
    this.storage.store('localCloseGameBalance',this.gameUserBalance);
    this.launchGameModel.gameId = this.data.gameId;
    this.launchGameModel.providerCode = this.data.providerCode;          
    this.launchGameModel.lang = this.gameLanguage();
    this.launchGameModel.type = this.data.type;
    let headers = new HttpHeaders();
    this.token = this.storage.retrieve('token');  
    headers = headers.set('Authorization', this.token);
    var url = this.funct.ipaddress + 'loginGS/launchGameswithMobileView';
    this.http.post(url, this.launchGameModel, {headers: headers })
    .pipe
      (
        catchError(this.handleError.bind(this,''))
      )
    .subscribe(
      async result => {
        this.dto.Response = {};
        this.dto.Response = result;
        this.launchGameResModel = this.dto.Response;
        this.gameLoadingone=false;
        this.spinner.show("gameLoadingone");        
        this.bsModalRef.hide();        
        this.storage.store('localGamePlayProviderId',this.providerId);
        this.storage.store('localPreviousRoute','gameList')  
        sessionStorage.setItem('providerId',this.providerId);  
          var gamelist=this.storage.retrieve('localLaunchGameList');
           let language= this.storage.retrieve('localLanguage');    
           if (language == "my") {
             this.launchTagName=this.translateService.instant("game-win-lose-chrome");
             this.launchTagName=this.launchTagName.toString().replace("@name",gamelist.name_my);                 
           } else if (language == "th") {
             this.launchTagName=this.translateService.instant("game-win-lose-chrome");
             this.launchTagName=this.launchTagName.toString().replace("@name", gamelist.name_th);                 
           } else if (language == "zh") {
             this.launchTagName=this.translateService.instant("game-win-lose-chrome");
             this.launchTagName=this.launchTagName.toString().replace("@name", gamelist.name_zh);                   
           } else {
             this.launchTagName=this.translateService.instant("game-win-lose-chrome");
             this.launchTagName=this.launchTagName.toString().replace("@name",gamelist.name);                  
           }      
           this.storage.store('localCloseGameBalance',this.gameUserBalance);
           this.storage.store('localOpenNewTap',this.storage.retrieve('localGameBalanceBefore'));          
           this.storage.store('localLaunchTagName', this.launchTagName);
           this.router.navigate(['/game/play'],{state: {launchUrl: this.launchGameResModel.gameUrl,launchTag: "openinnewtap",launchTagName: this.launchTagName,
            providerId: this.providerId},replaceUrl: false}); 
      }
    ); 
  }
}

}
