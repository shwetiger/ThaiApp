import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError } from 'rxjs/operators';
import { DtoService } from '../../service/dto.service';
import { FunctService } from '../../service/funct.service';


@Component({
  selector: 'app-sport-dialog',
  templateUrl: './sport-dialog.component.html',
  styleUrls: ['./sport-dialog.component.scss']
})
export class SportDialogComponent implements OnInit {
  title: string;
  closeBtnName: string; 
  @Input() data: any=[];  
  play_free: any;
  show_transfer: boolean=false;
  launchTagName: any;
  token: any;
  launchGameResModel: any;
  constructor(
    private toastr: ToastrService,
    private http: HttpClient,
    private dto: DtoService, 
    private route: ActivatedRoute, 
    private funct: FunctService,
    private storage: LocalStorageService,public bsModalRef: BsModalRef,private translateService: TranslateService, private router: Router,) {
   
  } 
  ngOnInit() 
  {  
  
    if(parseInt(this.data.gameBalance) < 1000){
      this.show_transfer=true;
    }    
   
    this.play_free= this.translateService.instant('show-sport');
    this.closeBtnName= this.translateService.instant('cancel');

    
  }
  close(){
    this.bsModalRef.hide();
  }
  handleError(error: HttpErrorResponse){
      
   
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
      this.toastr.error("", error.message, {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        return;
    }
  
    }
  goToPlay()
  { 
    if(this.data.view=='webview')
      {
    this.bsModalRef.hide();
    let headers = new HttpHeaders();
        this.token = this.storage.retrieve('token');  
        headers = headers.set('Authorization', this.token);  
    this.http.post(this.funct.ipaddress + 'loginGS/launchGames', this.data.launchGameModel, {headers: headers })
        .pipe
          (
             catchError(this.handleError.bind(this))
          )
        .subscribe(
          async result => {
            this.dto.Response = {};
            this.dto.Response = result;
            this.launchGameResModel = this.dto.Response;           
            this.storage.store('localGamePlayProviderId',this.data.providerId);          
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

      else{
        this.bsModalRef.hide();
        let headers = new HttpHeaders();
            this.token = this.storage.retrieve('token');  
            headers = headers.set('Authorization', this.token);  
        this.http.post(this.funct.ipaddress + 'loginGS/launchGameswithMobileView', this.data.launchGameModel, {headers: headers })
            .pipe
              (
                 catchError(this.handleError.bind(this))
              )
            .subscribe(
              async result => {
                this.dto.Response = {};
                this.dto.Response = result;
                this.launchGameResModel = this.dto.Response;           
                this.storage.store('localGamePlayProviderId',this.data.providerId);          
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
  goToWallet(){
    
    this.bsModalRef.hide();
    this.storage.store("localListGameLaunch",this.data.launchGameModel);
    this.storage.store("view",this.data.view);
    this.router.navigate(['/game/wallet'], {state: { providerType: this.data.providerId,gameType: "in" }, replaceUrl: false});
  }


}