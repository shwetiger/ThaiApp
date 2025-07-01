import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError } from 'rxjs/operators';
import { DtoService } from '../../service/dto.service';
import { FunctService } from '../../service/funct.service';


@Component({
  selector: 'app-game-open-chrome',
  templateUrl: './game-open-chrome.component.html',
  styleUrls: ['./game-open-chrome.component.scss']
})
export class GameOpenChromeComponent implements OnInit {
  title: string;
  closeBtnName: string; 
  @Input() data: any=[];   
  @Input() providerId: any;
  token: any;
  gameUserBalance: any;
  gameLoadingone: any=false;
  gameLoadingtwo: any=false;
  constructor(
    private dto: DtoService,
    private spinner: NgxSpinnerService, 
    private toastr: ToastrService,
    private http: HttpClient,
    private funct: FunctService,
    private storage: LocalStorageService,
    public bsModalRef: BsModalRef,
    private translateService: TranslateService, 
    private router: Router,) {
   
  } 
  ngOnInit() 
  {  
    this.closeBtnName= this.translateService.instant('cancel');
    this.getGameUserBalance();
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
       this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
        return;
    }

    if(error.status == 404)
    {
      //  this.toastr.error("No game list.", 'Invalid!', {
      //   timeOut: 3000,
      //   positionClass: 'toast-top-center',
      //   });
        return;
    }

    if(error.status == 429)
    {
      //  this.toastr.error("Please contact us.", 'Invalid!', {
      //   timeOut: 3000,
      //   positionClass: 'toast-top-center',
      //   });
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
        this.gameUserBalance = res.data.balance;          
        return res.data.balance;
    })
      .catch((error) => {          
        if (error.response) {        
        }
      });
      if(this.providerId==14)
      {
        await axios.get(this.funct.ipaddress + 'shkm/getBalance', config )
        .then((res) => {      
          this.gameUserBalance = res.data.data;          
          return res.data.balance;
      })
        .catch((error) => {          
          if (error.response) {        
          }
        });
      }
    
    }
  goToWebView()
  {
    this.gameLoadingone=true;
    this.spinner.show("gameLoadingone"); 
    let headers = new HttpHeaders();
    this.token = this.storage.retrieve('token');  
    headers = headers.set('Authorization', this.token);   
    if(this.providerId==14)
    { 
    this.http.post(this.funct.ipaddress + 'shkm/SKMLogin', this.data, {headers: headers })
        .pipe
          (
             catchError(this.handleError.bind(this))
          )
        .subscribe(
          async result => {
            this.dto.Response = {};
            this.dto.Response = result;
            var launchGameResModel = this.dto.Response; 
            this.storage.store('localGamePlayProviderId',this.providerId);
            this.storage.store('localPreviousRoute','gameList')  
            sessionStorage.setItem('providerId',this.providerId);
            var launchTagName;               
            var gamelist=this.storage.retrieve('localLaunchGameList');
             let language= this.storage.retrieve('localLanguage'); 
               if (language == "my") {
                 launchTagName=this.translateService.instant("game-win-lose-chrome");
                 launchTagName=launchTagName.toString().replace("@name",gamelist.name_my);                 
               } else if (language == "th") {
                 launchTagName=this.translateService.instant("game-win-lose-chrome");
                 launchTagName=launchTagName.toString().replace("@name", gamelist.name_th);                 
               } else if (language == "zh") {
                 launchTagName=this.translateService.instant("game-win-lose-chrome");
                 launchTagName=launchTagName.toString().replace("@name", gamelist.name_zh);                   
               } else {
                 launchTagName=this.translateService.instant("game-win-lose-chrome");
                 launchTagName=launchTagName.toString().replace("@name",gamelist.name);                  
               }      
                this.storage.store('localOpenNewTap',this.storage.retrieve('localGameBalanceBefore'));   
                this.gameLoadingone=false;
                this.spinner.hide("gameLoadingone");
                this.bsModalRef.hide();
                this.storage.store('localCloseGameBalance',this.gameUserBalance);  
                this.storage.store('localLaunchTagName', launchTagName);
                this.router.navigate(['/game/play'],{state: {launchUrl: launchGameResModel.gameUrl,launchTag: "openinnewtap",launchTagName: launchTagName,
                providerId: this.providerId},replaceUrl: false});   
           
          }
  );   
        }
        else{
          this.http.post(this.funct.ipaddress + 'loginGS/launchGames', this.data, {headers: headers })
        .pipe
          (
             catchError(this.handleError.bind(this))
          )
        .subscribe(
          async result => {
            this.dto.Response = {};
            this.dto.Response = result;
            var launchGameResModel = this.dto.Response; 
            this.storage.store('localGamePlayProviderId',this.providerId);
            this.storage.store('localPreviousRoute','gameList')  
            sessionStorage.setItem('providerId',this.providerId);
            var launchTagName;               
            var gamelist=this.storage.retrieve('localLaunchGameList');
             let language= this.storage.retrieve('localLanguage'); 
               if (language == "my") {
                 launchTagName=this.translateService.instant("game-win-lose-chrome");
                 launchTagName=launchTagName.toString().replace("@name",gamelist.name_my);                 
               } else if (language == "th") {
                 launchTagName=this.translateService.instant("game-win-lose-chrome");
                 launchTagName=launchTagName.toString().replace("@name", gamelist.name_th);                 
               } else if (language == "zh") {
                 launchTagName=this.translateService.instant("game-win-lose-chrome");
                 launchTagName=launchTagName.toString().replace("@name", gamelist.name_zh);                   
               } else {
                 launchTagName=this.translateService.instant("game-win-lose-chrome");
                 launchTagName=launchTagName.toString().replace("@name",gamelist.name);                  
               }      
                this.storage.store('localOpenNewTap',this.storage.retrieve('localGameBalanceBefore'));   
                this.gameLoadingone=false;
                this.spinner.hide("gameLoadingone");
                this.bsModalRef.hide();
                this.storage.store('localCloseGameBalance',this.gameUserBalance);  
                this.storage.store('localLaunchTagName', launchTagName);
                this.router.navigate(['/game/play'],{state: {launchUrl: launchGameResModel.gameUrl,launchTag: "openinnewtap",launchTagName: launchTagName,
                providerId: this.providerId},replaceUrl: false});   
           
          }
  ); 
        } 
  }
  goToChrome()
  {
    this.gameLoadingtwo=true;
    this.spinner.show("gameLoadingtwo"); 
    let headers = new HttpHeaders();
    this.token = this.storage.retrieve('token');  
    headers = headers.set('Authorization', this.token);     
    if(this.providerId==14)
    {
      this.http.post(this.funct.ipaddress + 'shkm/SKMLoginchrome',this.data, {headers: headers })
      .pipe
        (
           catchError(this.handleError.bind(this))
        )
      .subscribe(
        async result => {
          this.dto.Response = {};
          this.dto.Response = result;
          var launchGameResModel = this.dto.Response; 
        
          this.storage.store('localGamePlayProviderId',this.providerId);
          this.storage.store('localPreviousRoute','gameList')  
          sessionStorage.setItem('providerId',this.providerId);
          var launchTagName;
             
            var gamelist=this.storage.retrieve('localLaunchGameList');
             let language= this.storage.retrieve('localLanguage');    
             if (language == "my") {
               launchTagName=this.translateService.instant("game-win-lose-chrome");
               launchTagName=launchTagName.toString().replace("@name",gamelist.name_my);                 
             } else if (language == "th") {
               launchTagName=this.translateService.instant("game-win-lose-chrome");
               launchTagName=launchTagName.toString().replace("@name", gamelist.name_th);                 
             } else if (language == "zh") {
               launchTagName=this.translateService.instant("game-win-lose-chrome");
               launchTagName=launchTagName.toString().replace("@name", gamelist.name_zh);                   
             } else {
               launchTagName=this.translateService.instant("game-win-lose-chrome");
               launchTagName=launchTagName.toString().replace("@name",gamelist.name);                  
             }      
             this.storage.store('localOpenNewTap',this.storage.retrieve('localGameBalanceBefore'));   
             this.gameLoadingtwo=false;
             this.spinner.show("gameLoadingtwo");        
             this.bsModalRef.hide();       
             this.storage.store('localCloseGameBalance',this.gameUserBalance); 
             this.storage.store('localLaunchTagName', launchTagName);  
             this.router.navigate(['/game/play'],{state: {launchUrl: launchGameResModel.gameUrl,launchTag: "openinnewtap",launchTagName: launchTagName,
              providerId: this.providerId},replaceUrl: false}); 
        }
      );  
    }
    else{
      this.http.post(this.funct.ipaddress + 'loginGS/launchGamesInChrome', this.data, {headers: headers })
      .pipe
        (
           catchError(this.handleError.bind(this))
        )
      .subscribe(
        async result => {
          this.dto.Response = {};
          this.dto.Response = result;
          var launchGameResModel = this.dto.Response; 
          this.storage.store('localGamePlayProviderId',this.providerId);
          this.storage.store('localPreviousRoute','gameList')  
          sessionStorage.setItem('providerId',this.providerId);
          var launchTagName;
             
            var gamelist=this.storage.retrieve('localLaunchGameList');
             let language= this.storage.retrieve('localLanguage');    
             if (language == "my") {
               launchTagName=this.translateService.instant("game-win-lose-chrome");
               launchTagName=launchTagName.toString().replace("@name",gamelist.name_my);                 
             } else if (language == "th") {
               launchTagName=this.translateService.instant("game-win-lose-chrome");
               launchTagName=launchTagName.toString().replace("@name", gamelist.name_th);                 
             } else if (language == "zh") {
               launchTagName=this.translateService.instant("game-win-lose-chrome");
               launchTagName=launchTagName.toString().replace("@name", gamelist.name_zh);                   
             } else {
               launchTagName=this.translateService.instant("game-win-lose-chrome");
               launchTagName=launchTagName.toString().replace("@name",gamelist.name);                  
             }      
             this.storage.store('localOpenNewTap',this.storage.retrieve('localGameBalanceBefore'));   
             this.gameLoadingtwo=false;
             this.spinner.show("gameLoadingtwo");        
             this.bsModalRef.hide();       
             this.storage.store('localCloseGameBalance',this.gameUserBalance); 
             this.storage.store('localLaunchTagName', launchTagName);  
             this.router.navigate(['/game/play'],{state: {launchUrl: launchGameResModel.gameUrl,launchTag: "openinnewtap",launchTagName: launchTagName,
              providerId: this.providerId},replaceUrl: false}); 
        }
      );  
    }
  
  }

}