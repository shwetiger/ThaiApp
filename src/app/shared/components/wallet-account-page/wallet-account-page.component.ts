import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Location } from '@angular/common';
import { DtoService } from '../../service/dto.service';
import { UtilService } from '../../service/util.service';
import { FunctService } from '../../service/funct.service';


@Component({
  selector: 'app-wallet-account-page',
  templateUrl: './wallet-account-page.component.html',
  styleUrls: ['./wallet-account-page.component.scss']
})
export class WalletAccountPageComponent implements OnInit {
  topUpButton= 'TopUp';
  token: any;
  userProfileModel: any;
  isUserLoggedIn;
  showAmount: boolean=false;
  showBalance: any;
  wallet_description2: any;
  //allAccount='KBZ Pay, Wave Pay and CB Pay';
  constructor(
    private translateService: TranslateService,
    private toastr: ToastrService, 
    private spinner: NgxSpinnerService, 
    private dto: DtoService, 
    private http: HttpClient, 
    private util: UtilService, 
    private router: Router, 
    private storage: LocalStorageService, 
    private funct: FunctService,
    private _location: Location,)
    { 
    }

  ngOnInit(): void {
    this.storage.clear("localGameWalletTransfer");
    this.isUserLoggedIn= this.storage.retrieve('isUserLoggedIn');
    this.userProfileModel='';
    this.wallet_description2 = this.translateService.instant("wallet_description2_one");
    this.wallet_description2 = this.wallet_description2.toString().replace("@topUpButton", this.translateService.instant("topupPage"));
    this.getUserProfile(); 
    this.showAmount=this.storage.retrieve('localShowBalance');
    // this.showAmount= false;      
    // this.showBalance= "*****";
    if(!this.showAmount){
      this.showBalance= "*****";
      return;
    } 
   
    
  }
  handleError(error: HttpErrorResponse){
    if(error.status == 0){
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    
    if(error.status == 423)
    {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        this.storage.clear('token');
        this.storage.clear('isUserLoggedIn');
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
          this.dto.Response = {};
          this.dto.Response = result;
          this.userProfileModel= this.dto.Response;
          if(this.showAmount){
          this.showBalance= this.userProfileModel.balance;  
          }
        }); 
      this.spinner.hide();
    }

    showPassword(show: boolean){
      this.showAmount = show;
      this.storage.store('localShowBalance', this.showAmount); 
      if(this.showAmount){
        this.showBalance= this.userProfileModel.balance;        
      }
      else{
        this.showBalance= "*****";
      }        
          
    }

    changeName(){      
       var name=this.userProfileModel.name;
       if(name !=null && name.length >30){
        name= name.substring(0, 20)+" ...";
        return name;        
       }
       else{
         return name;  
       }
     }
     gotoWithdraw(){
      this.router.navigate(["/wallet/withdraw"],{replaceUrl: false});   
     }

     goToGameWallet(){
      this.storage.store("from-game-account-login",null)  
      this.storage.store("localGameWalletTransfer","Wallet");
      this.router.navigate(['/game/wallet'], {state: {"gameWalletTransfer": 'Wallet'},replaceUrl: false})
     }
     goToHistory(){
      this.router.navigate(['/wallet/history'], {replaceUrl: false});
     }
     goToProfile(){
      this.router.navigate(['/me-page/profile-edit'], {replaceUrl: false});      
     }
     goToTopup(){
      this.router.navigate(['/wallet/top-up'], {replaceUrl: false});  
     }
     goToTutorial(name){
      this.router.navigate(['/wallet/tutorial-video'], {state: {"name": name}, replaceUrl: false});       
     }
}
