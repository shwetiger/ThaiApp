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

@Component({
  selector: 'app-game-show-free-play',
  templateUrl: './game-show-free-play.component.html',
  styleUrls: ['./game-show-free-play.component.scss']
})
export class GameShowFreePlayComponent implements OnInit {

  title: string;
  closeBtnName: string; 
  @Input() data: any=[];   
  @Input() providerId: any;
  token: any;
  gameUserBalance: any;
  gameLoadingone: any=false;
  gameLoadingtwo: any=false;
  launchDameModel: any=[];
  launchGameResModel: any=[];
  launchGameModel: any;
  launchTagName: any;
  userProfileBalance: any;
  isWebview1: boolean;
  deviceId1:any;
 
  constructor(
    private modalService: BsModalService, 
    private dto: DtoService,
    private spinner: NgxSpinnerService, 
    private toastr: ToastrService,
    private http: HttpClient,
    private funct: FunctService,
    private storage: LocalStorageService,
    public bsModalRef: BsModalRef,
    private translateService: TranslateService, 
    private router: Router,) {
      var isWebviewUser = require('is-ua-webview');    
      this.isWebview1 = isWebviewUser(navigator.userAgent); 
  } 
  ngOnInit() 
  {  
    this.getUserProfile();
    this.closeBtnName= this.translateService.instant('cancel');
    this.launchDameModel ={
      "gcode": "string",
      "gpcode": "string",
      "lang": "string"
    }
    this.launchGameModel = {
      "gameId": "string",
      "lang": "string",
      "providerCode": "string",
      "type": "string"
    }
    if(this.isWebview1){
      this.deviceId1="mobile";
    }
   
    else{
      this.deviceId1='';  
    }
  }
  close(){
    this.bsModalRef.hide();
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
   
    //return throwError(error);
    }
    async getGameUserBalance()
    {     
      this.token = this.storage.retrieve('token');    
      let headers = new HttpHeaders();
      headers = headers.set('Authorization', this.token); 
      
      let config = {
        headers: {'Authorization': this.token},
        params: {'providerId': this.data.providerId},
      }
      const axios = require('axios').default;
      await axios.get(this.funct.ipaddress + 'loginGS/getBalanceV129', config )
      .then((res) => {      
        this.gameUserBalance = res.data.data.balance;
        this.storage.store('localGameBalanceBefore',this.gameUserBalance)        
        return res.data.balance;
      
    })
      .catch((error) => {          
        if (error.response) {        
        }
      });
    
    }

    playFree()
    {    
      this.gameLoadingone=true;
      this.spinner.show("gameLoadingone");     
      this.launchDameModel.gcode = this.data.list.code;
      this.launchDameModel.gpcode = this.data.list.providercode;
      this.launchDameModel.lang = "my_MM";
      let headers = new HttpHeaders();
      let params = new HttpParams();
      params = params.set('providerId',this.data.providerId);      
      this.http.post(this.funct.ipaddress + 'loginGS/launchDGames', this.launchDameModel, {headers: headers })
      .pipe
        (
           catchError(this.handleError.bind(this))
        )
      .subscribe(
        result => {        
          this.dto.Response = result;
          this.launchGameResModel = this.dto.Response;
          this.bsModalRef.hide();
          window.open(this.launchGameResModel.gameUrl, '_blank'); /*launch demo game*/
        }
      );
    }

 
  play()
  {
    this.gameLoadingtwo=true;
    this.spinner.show("gameLoadingtwo");   
    let params = new HttpParams();
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);  
    params = params.set('providerId',this.data.providerId);   
    this.http.get(this.funct.ipaddress + 'loginGS/getBalance', {params: params, headers: headers })
    .pipe
      (
         catchError(this.handleError.bind(this))
      )
    .subscribe(
      result => {        
        this.dto.Response = result; 
        if(this.dto.Response.data==null)
        {
        this.bsModalRef.hide(); 
        this.toastr.error("", this.translateService.instant("transaction_wait_5sec"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });

          return;
        }
        const parsedData = JSON.parse(this.dto.Response.data); 
        this.gameUserBalance = parsedData.balance;
       if(this.gameUserBalance < 1000)
        {
          this.launchGameModel.gameId = this.data.list.providercode+"_"+this.data.list.code;
          this.launchGameModel.providerCode = this.data.providerName;          
          this.launchGameModel.lang = this.gameLanguage();
          this.launchGameModel.type = this.data.list.type;
          this.gameLoadingtwo=false;
          this.spinner.show("gameLoadingtwo");        
          this.bsModalRef.hide();  
          var data={            
            "id": this.data.providerId,
            "mainBalance": this.userProfileBalance,
            "gameBalance": this.gameUserBalance,
            "categoryId": "",
            "name": this.data.providerName,
            "LiveGameLaunch": this.data.list
          }        
          this.showTransferDialog(data);
          return;     
          
        }
        else
        { 
          this.launchGameModel.gameId = this.data.list.providercode+"_"+this.data.list.code;
          this.launchGameModel.providerCode = this.data.providerName;          
          this.launchGameModel.lang = this.gameLanguage();
          this.launchGameModel.type = this.data.list.type;
          let headers = new HttpHeaders();
          this.token = this.storage.retrieve('token');  
          headers = headers.set('Authorization', this.token); 
          //var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          if(this.data.list.option == true){
               this.gameLoadingtwo=false;
               this.spinner.show("gameLoadingtwo");        
               this.bsModalRef.hide();   
               if(this.deviceId1=='mobile')
                { 
                  this.showOpenChromeDialog(this.launchGameModel,this.data.providerId);
                }    
              else{
                this.storage.store('localCloseGameBalance',this.dto.Response.balance);  
                this.http.post(this.funct.ipaddress + 'loginGS/launchGames', this.launchGameModel, {headers: headers })
                .pipe
                  (
                     catchError(this.handleError.bind(this))
                  )
                .subscribe(
                  async result => {
                    this.spinner.hide("smallSpinner");               
                    this.dto.Response = result;
                    this.launchGameResModel = this.dto.Response;           
                    //this.gameUserBalance =await this.getGameUserBalance();  
                    this.gameUserBalance= this.storage.retrieve('localGameBalanceBefore');
                    this.storage.store('localGamePlayProviderId',this.data.providerId);             
                    this.storage.store('localPreviousRoute','gameList')  
                    sessionStorage.setItem('providerId',this.data.providerId);
                   if(this.launchGameResModel.parameters == "openinnewtap" || this.launchGameResModel.parameters != "openinnewtap"){     
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
                     
                     this.storage.store('localOpenNewTap',this.storage.retrieve('localGameBalanceBefore'));   
                     this.storage.store('localLaunchTagName', this.launchTagName);       
                     this.router.navigate(['/game/play'],{state: {launchUrl: this.launchGameResModel.gameUrl,launchTag: "openinnewtap",launchTagName: this.launchTagName,
                      providerId: this.data.providerId},replaceUrl: false});             
                   }    
                
                   }
                );
              }
            return;
          }
          else{
            if(this.deviceId1=='mobile')
            { 
              this.showOpenChromeDialog(this.launchGameModel,this.data.providerId);
            } 
            else{
            this.storage.store('localCloseGameBalance',this.dto.Response.balance);  
            this.http.post(this.funct.ipaddress + 'loginGS/launchGames', this.launchGameModel, {headers: headers })
            .pipe
              (
                 catchError(this.handleError.bind(this))
              )
            .subscribe(
              async result => {
                this.spinner.hide("smallSpinner");            
                this.dto.Response = result;
                this.launchGameResModel = this.dto.Response;           
                //this.gameUserBalance = await this.getGameUserBalance();  
                this.gameUserBalance= this.storage.retrieve('localGameBalanceBefore');
                this.storage.store('localGamePlayProviderId',this.data.providerId);             
                this.storage.store('localPreviousRoute','gameList')  
                sessionStorage.setItem('providerId',this.data.providerId);
               if(this.launchGameResModel.parameters == "openinnewtap" || this.launchGameResModel.parameters != "openinnewtap"){     
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
                 
                 this.storage.store('localOpenNewTap',this.storage.retrieve('localGameBalanceBefore'));   
                 this.storage.store('localLaunchTagName', this.launchTagName);       
                 this.router.navigate(['/game/play'],{state: {launchUrl: this.launchGameResModel.gameUrl,launchTag: "openinnewtap",launchTagName: this.launchTagName,
                  providerId: this.data.providerId},replaceUrl: false});             
               }    
            
              }
            );
            }
          }        
          
        }
      }
   );
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


  showOpenChromeDialog(data, provierId) {    
    const initialState= {          
      title: '',
      closeBtnName: '',     
      data: data,
      providerId: provierId,
      backdrop: true,
      ignoreBackdropClick: true
    };
    
    this.bsModalRef = this.modalService.show(GameOpenChromeComponent, 
      {class: 'modal-sm game-open-chrome-alert', initialState
  });
 }
 showTransferDialog(data) {
 
  const initialState= {          
    title: '',
    closeBtnName: '',     
    data: data,
    backdrop: true,
    ignoreBackdropClick: true
  };
  
  this.bsModalRef = this.modalService.show(GameListTransferComponent, 
    {class: 'modal-sm game-list-transfer-alert', initialState
});
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



}