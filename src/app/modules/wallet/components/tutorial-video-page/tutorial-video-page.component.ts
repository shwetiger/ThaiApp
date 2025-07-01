import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { catchError, delay, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from 'ngx-webstorage';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';

@Component({
  selector: 'app-tutorial-video-page',
  templateUrl: './tutorial-video-page.component.html',
  styleUrls: ['./tutorial-video-page.component.scss']
})
export class TutorialVideoPageComponent implements OnInit {
  name: any;
  topupvideotutorialList: any;
  withdrawalvideotutorialList: any;
  topup: boolean;
  withdrawal: boolean;
  showTopupVideo: SafeResourceUrl;
  showWithdrawVideo: SafeResourceUrl;
  selectedIndex: any;
  // safeSrc: SafeResourceUrl;
  loading: any;
  token:any;
  lang:any;
  constructor(
    private translateService: TranslateService,
    private dto: DtoService,
    private funct: FunctService,
    private http: HttpClient,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private storage: LocalStorageService,
    private sanitizer: DomSanitizer) {
    this.name=history.state.name; 
    this.selectedIndex = 0;   
   }

  ngOnInit(): void {
    this.lang=this.storage.retrieve('localLanguage'); 
    if(this.name != null && this.name != "" && this.name != undefined){
      this.getOfflineVideotutorial(); 
      this.getVideotutorial(); 
    } 
    else{
      this.name="Topup";
      this.getOfflineVideotutorial(); 
       this.getVideotutorial(); 
    }  
      
  }
  handleError(error: HttpErrorResponse){
    if(error.status == 0)
    {
     return;
    }
    if(error.status == 423)
    {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    if(error.status == 400)
    {
       this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    return throwError(error);
    }

    
  getVideotutorial(){    
    this.loading=true;
    this.spinner.show();     
    let headers = new HttpHeaders();
    this.token = this.storage.retrieve('token');    
    headers = headers.set('Authorization', this.token);
    const params = new HttpParams().set('transType', this.name);
    if(this.name == 'Topup'){  
   // this.http.get(this.funct.ipaddress + 'videotutorial/'+this.name+'videotutorialList', { headers: headers })   
    this.http.get(this.funct.ipaddress + 'TransactionTutorial/app_list', { headers: headers,params:params })
    .pipe(
         catchError(this.handleError.bind(this))
      )
    .subscribe(
      result => {
        this.dto.Response = {};
        this.dto.Response = result;       
         // this.storage.store('local'+this.name+'videotutorialList', this.dto.Response);        
          this.topup = true;
         // this.topupvideotutorialList = this.storage.retrieve('local'+this.name+'videotutorialList');
          this.topupvideotutorialList=this.dto.Response;
          this.showTopupVideo = this.sanitizer.bypassSecurityTrustResourceUrl(this.topupvideotutorialList[this.selectedIndex].liveLink);  
          this.loading=false;
          this.spinner.hide();        
        }
        );
        }
        if(this.name == 'Withdrawal'){  
          this.http.get(this.funct.ipaddress + 'TransactionTutorial/app_list', { headers: headers,params:params })
         .pipe(
         catchError(this.handleError.bind(this))
      )
    .subscribe(
      result => {
        this.dto.Response = {};
        this.dto.Response = result;         
          this.storage.store('local'+this.name+'videotutorialList', this.dto.Response);
          this.withdrawal = true;
          this.withdrawalvideotutorialList = this.storage.retrieve('local'+this.name+'videotutorialList');
          this.showTopupVideo= this.sanitizer.bypassSecurityTrustResourceUrl(this.withdrawalvideotutorialList[this.selectedIndex].liveLink);         
          this.loading=false;
          this.spinner.hide();  
         });      
        }
        
     
  }
    
  getOfflineVideotutorial(){
    this.spinner.show();    
    this.topupvideotutorialList = [];
    this.withdrawalvideotutorialList= [];
    this.topupvideotutorialList = this.storage.retrieve('local'+this.name+'videotutorialList');
    this.withdrawalvideotutorialList = this.storage.retrieve('local'+this.name+'videotutorialList');

    if(this.topupvideotutorialList !=null && this.name == 'topup')
    {
      this.topup = true;      
      this.topupvideotutorialList = this.storage.retrieve('local'+this.name+'videotutorialList');
      this.showTopupVideo= this.sanitizer.bypassSecurityTrustResourceUrl(this.topupvideotutorialList[this.selectedIndex].video_url);
     
    if(this.topupvideotutorialList!=null)   {
      this.spinner.hide();
    }
      return  this.topupvideotutorialList;
    }
    if(this.withdrawalvideotutorialList != null && this.name == 'withdrawal')
    {
      this.withdrawal = true;
      this.withdrawalvideotutorialList = this.storage.retrieve('local'+this.name+'videotutorialList');
      this.showTopupVideo= this.sanitizer.bypassSecurityTrustResourceUrl(this.withdrawalvideotutorialList[this.selectedIndex].video_url);
   
      if(this.withdrawalvideotutorialList!=null)   {
        this.spinner.hide();
      }
      return  this.withdrawalvideotutorialList;
    }
    
  }

  openVideo(videoId: number){
  
    if(this.name == 'Topup')
    {     
      this.showTopupVideo= this.sanitizer.bypassSecurityTrustResourceUrl(this.topupvideotutorialList[videoId].liveLink);
     
      return;
    }
    if(this.name == 'Withdrawal')
    {      
      this.showTopupVideo= this.sanitizer.bypassSecurityTrustResourceUrl(this.withdrawalvideotutorialList[videoId].liveLink);
      // this.spinner.hide();
      return;
    }
  }

}
function sleep(arg0: number) {
  throw new Error('Function not implemented.');
}

