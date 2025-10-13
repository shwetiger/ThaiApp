import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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
  selector: 'app-game-win-lose',
  templateUrl: './game-win-lose.component.html',
  styleUrls: ['./game-win-lose.component.scss']
})
export class GameWinLoseComponent implements OnInit{
  title: string;
  closeBtnName: string; 
  @Input() data: any=[];   
 
  token: any;
  gameUserBalance: any;
  gameLoadingone: any=false;
  gameLoadingtwo: any=false;
  closeGameBalance: any;
  loadingGameBalance: boolean=true;
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
    this.loadingGameBalance=true;
    this.spinner.show('gameWinLoseLoading');

    
    this.closeGameBalance={
      balanceBefore:0,
      postBalance:0
    }    

    this.closeBtnName= this.translateService.instant('cancel'); 
    this.getDoBalanceCloseGame();    
  }
  close(){
    window.location.reload();
    this.bsModalRef.hide();
  }
  handleError(error: HttpErrorResponse){   
    this.loadingGameBalance=false;
    this.spinner.hide('gameWinLoseLoading');
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
       this.toastr.error("Bad request.", 'Invalid!', {
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
    getDoBalanceCloseGame()
    {
      this.token = this.storage.retrieve('token'); 
       
      let headers = new HttpHeaders();
      headers = headers.set('Authorization', this.token);  
      var GamePlayResult={
        balanceBefore: this.data.gameBalance,
        postBalance: this.data.gameBalance,
        providerId: this.data.providerId
      }      
        
      this.http.post(this.funct.ipaddress + 'loginGS/DoBalanceCloseGame',GamePlayResult, { headers: headers })
      .pipe
        (
          catchError(this.handleError.bind(this))
        )
      .subscribe(
        result => {
          this.dto.Response = result; 
          if(this.dto.Response.status == "Success"){           
           this.closeGameBalance.balanceBefore= parseInt(this.data.gameBalance);          
           this.closeGameBalance.postBalance= parseInt(this.dto.Response.postBalance);
           this.loadingGameBalance=false;
           this.spinner.hide('gameWinLoseLoading');                                                    
          }
        }
      );
    
    }
 
  

  changeNumber(n1,n2){    
   return  Math.abs(n1 - n2); 
  }
  changeLanguage() {
    var data= this.data.list;  
     let language= this.storage.retrieve('localLanguage');
     if (language == "my") {
       return data.name_my != null ? data.name_my : data.name;
     } else if (language == "th") {
       return data.name_zh != null ? data.name_zh : data.name;
     } else if (language == "zh") {
       return data.name_zh != null ? data.name_zh : data.name;
     } else {
       return data.name;
     }
   }
}