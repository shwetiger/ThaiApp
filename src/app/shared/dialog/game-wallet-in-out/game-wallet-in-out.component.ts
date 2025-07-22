import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError } from 'rxjs/operators';
import { DtoService } from '../../service/dto.service';
import { FunctService } from '../../service/funct.service';
import { ZawgyiDetector } from '@myanmartools/ng-zawgyi-detector';



@Component({
  selector: 'app-game-wallet-in-out',
  templateUrl: './game-wallet-in-out.component.html',
  styleUrls: ['./game-wallet-in-out.component.scss']
})
export class GameWalletInOutComponent implements OnInit, OnDestroy{
  title: string="";
  closeBtnName: string; 
  term_conditions: any;
  @Input() data: any=[];  
  description: any; 
  gameType: any;
  depositModel: any;
  showPass: boolean;
  passwordType='password';
  token: any;
  loadingSubmiting: boolean=false;
  amount_error_message: any="";
  password_error_message: any;
  constructor(    
    private dto: DtoService,
    private toastr: ToastrService,
    private funct: FunctService,
    private http: HttpClient,
    public spinner: NgxSpinnerService,
    private storage: LocalStorageService,
    public bsModalRef: BsModalRef,
    private translateService: TranslateService, 
    private router: Router,
    private readonly _zawgyiDetector: ZawgyiDetector) {
  
  }
 
  ngOnInit() 
  {  
    this.depositModel = {
      "transferAmount": '',
      "password": '',
      "providerId": ""
    }
  this.gameType=this.data.tranfer;
  
  
  if(this.gameType == "in"){
    this.title=this.translateService.instant("main_wallet_tranfer");
    this.title=this.title.replace("@name",this.data.list.display_name);
  }else{
    this.title=this.translateService.instant("game_wallet_tranfer");
    this.title=this.title.replace("@name",this.data.list.display_name);
  }  
    this.closeBtnName= this.translateService.instant('ok');
    this.term_conditions=this.translateService.instant('term_conditions'); 
  }
 
  ngOnDestroy(): void {    
   
    this.bsModalRef.hide();
  }
  goWallet()
  {
    this.bsModalRef.hide();
    this.router.navigate(['/wallet/top-up'],{replaceUrl:true});
  }
  showPassword(show: boolean){

    this.showPass = show;
    if(show)
    {
      this.passwordType= "text"; 
    }
    else
    {
      this.passwordType= "password"; 
    }
  }

  checkPassword()
  {   
   const myanmarRegex = /[\u1000-\u109F]/;

    if (myanmarRegex.test(this.depositModel.password)) {
      this.depositModel.password = this.depositModel.password.slice(0, -1);
    }
        this.password_error_message="";
        if(this.depositModel.password.length > 20)        {
         // $("#passwordErr").html("Password must be maximum 20 digit or characters");
          this.password_error_message=this.translateService.instant("charlength");
          return false;
        }
        if(!this.depositModel.password||this.depositModel.password.length < 4)
        {
          
          this.password_error_message=this.translateService.instant("reqPassLength")
          return false;
        }
        if(this.depositModel.password &&this.depositModel.password.length == 4)
        {
           this.password_error_message="";
           return true;
        }
        if(this.depositModel.password == '' ||this.depositModel.password == null || this.depositModel.password == undefined) 
        {
          var passwordRequired = this.translateService.instant("requiredFiled");
          passwordRequired  =  passwordRequired.toString().replace("@value", this.translateService.instant("passwordHint"));
          this.password_error_message=passwordRequired;
          return false;
        }
    return true;
  }
  checkAmount(){   
    this.amount_error_message="";       
    if(this.depositModel.transferAmount == '' || this.depositModel.transferAmount  == null || this.depositModel.transferAmount == undefined) 
    {
      var amountRequired = this.translateService.instant("requiredFiled");
      amountRequired  =  amountRequired.toString().replace("@value", this.translateService.instant("amount"));
     
      this.amount_error_message=amountRequired;
      return false;
    }  
    if(this.gameType == 'out'){
      if(this.depositModel.transferAmount >= 100) 
      {
        this.amount_error_message="";              
        return true;
    
      }
      if(this.depositModel.transferAmount < 100) {
        this.amount_error_message=this.translateService.instant('amount_error_one');
        // $("#amountErr").html(this.translateService.instant('amount_error_one'));
        return false;
      }
    } 
    if(this.gameType == 'in')
    {
      if(this.depositModel.transferAmount >= 1000) 
      {
        this.amount_error_message="";       
        return true;    
      }
      if(this.depositModel.transferAmount < 1000) {
        //$("#amountErr").html(this.translateService.instant('amount_error'));
        this.amount_error_message=this.translateService.instant('amount_error');
        return false;
      }
    }  
    
  
  }

  handleError(error: HttpErrorResponse)
  {   
    this.loadingSubmiting=false;
    this.spinner.hide('loadingSubmiting');
  
    this.depositModel.password='';
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
    if(error.status  == 307)
    {
      
      // this.toastr.error("", 'Going to perform an online maintenance Withdraw API is DISABLED temporarily', {
      //   timeOut: 1000,
      //   positionClass: 'toast-top-center',
      //   });

        this.toastr.error("", this.translateService.instant("gametransferwait") , {
          timeOut: 1000,
          positionClass: 'toast-top-center',
          });
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
      this.toastr.error("", this.translateService.instant('low_balance'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });      
      return;
    }
    if(error.status == 700)
    {
      this.bsModalRef.hide();
      this.data.gameWalletTransfer=this.storage.retrieve("localGameWalletTransfer");
      if((this.data.gameWalletTransfer !=null || this.data.gameWalletTransfer != undefined) &&  this.data.gameWalletTransfer == "Wallet"){
        this.router.navigate(['/game/deposit-error', '700'], {replaceUrl: false});
      }
      else{
        this.router.navigate(['/game/deposit-error', '700'], {replaceUrl: true});
      }
     
      return;
    }
    if(error.status==509)
      {
        this.toastr.error("", this.translateService.instant('transfer_20min_lock'), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });      
        return;
      }
    // this.toastr.error("", error.status.toString(), {
    //   timeOut: 3000,
    //   positionClass: 'toast-top-center',
    //   });
    //   return;
    //return throwError(error);
    }

  transfer()
  {     

    let amountCheck = this.checkAmount();    
    let pwdCheck = this.checkPassword();    
    if (!pwdCheck || !amountCheck ) {
      return;
    } 
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    this.depositModel.providerId = this.data.list.providerId.toString();
   
    this.loadingSubmiting=true;
    this.spinner.show('loadingSubmiting');
    
    if(this.gameType == 'in')
    {
      var gameIn = this.translateService.instant("game_from");
      gameIn = gameIn.toString().replace("@wallet", this.translateService.instant("main_wallet"));
      var gameOut = this.translateService.instant('game_to');
      gameOut = gameOut.replace("@wallet", this.translateService.instant("game_wallet_tran_text"));      
      this.storage.store('gameFrom', gameIn);
      this.storage.store('gameTo', gameOut);  
     
      if(this.data.list.providerId==14)
      {
        this.http.post( this.funct.ipaddress+'shkm/TransferIn', this.depositModel,  { headers: headers })
        .pipe(
          catchError(this.handleError.bind(this))
          )
        .subscribe(
          result => {
            this.dto.Response = result; 
            this.loadingSubmiting=false;
            this.spinner.hide('loadingSubmiting');
            if(this.dto.Response.message == "error"){
              this.toastr.error("", this.translateService.instant("submitting-request-time"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
                });
                return;
            }
            
            if(this.dto.Response.errCode == '70')
            {
              this.toastr.error("", 'INSUFFICIENT_KIOSK_BALANCE', {
              timeOut: 1000,
              positionClass: 'toast-top-center',
              });
              return;
            }
          
            if(this.dto.Response.errMsg == '')
            {
              this.bsModalRef.hide();
              this.storage.store("transferAmount", this.depositModel.transferAmount); 
              this.data.gameWalletTransfer=this.storage.retrieve("localGameWalletTransfer");
                if( (this.data.gameWalletTransfer !=null || this.data.gameWalletTransfer != undefined) &&  this.data.gameWalletTransfer == "Wallet"){
                this.router.navigate(["/game/deposit-success",'200'], {replaceUrl: false});
                }
                else{
                  this.router.navigate(["/game/deposit-success",'200'], {replaceUrl: true});
                }           
            
              return;
            }
            else
            {
              this.toastr.error("", this.dto.Response.errMsg, {
                    timeOut: 5000,
                    positionClass: 'toast-top-center',
                    });
                    return;
            }
            
          }
        ); 
      }
      else{
        this.http.post( this.funct.ipaddress+'loginGS/gsDeposit', this.depositModel,  { headers: headers })
        .pipe(
          catchError(this.handleError.bind(this))
          )
        .subscribe(
          result => {
            this.dto.Response = result; 
            this.loadingSubmiting=false;
            this.spinner.hide('loadingSubmiting');
            if(this.dto.Response.status == "Error" ||this.dto.Response.message == "error" ){
              this.toastr.error("", this.translateService.instant("submitting-request-time"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
                });
                return;
            }
            if(this.dto.Response.errCode == '70')
            {
              this.toastr.error("", 'INSUFFICIENT_KIOSK_BALANCE', {
              timeOut: 1000,
              positionClass: 'toast-top-center',
              });
              return;
            }
           
            if(this.dto.Response.errMsg == 'SUCCESS')
            {
              this.bsModalRef.hide();
              this.storage.store("transferAmount", this.depositModel.transferAmount); 
              this.data.gameWalletTransfer=this.storage.retrieve("localGameWalletTransfer");
                if( (this.data.gameWalletTransfer !=null || this.data.gameWalletTransfer != undefined) &&  this.data.gameWalletTransfer == "Wallet"){
                  this.router.navigate(["/game/deposit-success",'200'], {replaceUrl: false});
                }
                else{
                  this.router.navigate(["/game/deposit-success",'200'], {replaceUrl: true});
                }           
            
              return;
            }
            else
            {
              this.toastr.error("", this.dto.Response.errMsg, {
                    timeOut: 5000,
                    positionClass: 'toast-top-center',
                    });
                    return;
            }
            
          }
        ); 
      }
    }

    if(this.gameType == 'out')
    {     
      var gameIn = this.translateService.instant("game_from");
      gameIn = gameIn.toString().replace("@wallet", this.translateService.instant("game_wallet_tran_text"));
      var gameOut = this.translateService.instant('game_to');
      gameOut = gameOut.replace("@wallet", this.translateService.instant("main_wallet"));    
      this.storage.store('gameFrom', gameIn);
      this.storage.store('gameTo',gameOut);     
      if(this.data.list.providerId==14)
      {
        this.http.post(this.funct.ipaddress+'shkm/TransferOut', this.depositModel,  { headers: headers })
        .pipe(
          catchError(this.handleError.bind(this))
          )
        .subscribe(
          result => {
            this.dto.Response = result; 
            this.loadingSubmiting=false;
            this.spinner.show('loadingSubmiting');
            this.storage.store("transferAmount", this.depositModel.transferAmount);
            if(this.dto.Response.message == "error"){
              this.toastr.error("", this.translateService.instant("submitting-request-time"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
                });
                return;
            }
            
            if(this.dto.Response.errMsg == ''){
              this.bsModalRef.hide();
              this.data.gameWalletTransfer=this.storage.retrieve("localGameWalletTransfer");
              if((this.data.gameWalletTransfer !=null || this.data.gameWalletTransfer != undefined) &&  this.data.gameWalletTransfer == "Wallet"){
                this.router.navigate(["/game/deposit-success",'200'], {replaceUrl: false});
              }
              else{
                  this.router.navigate(["/game/deposit-success",'200'], {replaceUrl: true});
              }   
              
            }
            if(this.dto.Response.errCode == '72'){
              this.toastr.error("", this.translateService.instant('low_balance'), {
                timeOut: 1000,
                positionClass: 'toast-top-center',
                });
                return;
            }
          
            if(this.dto.Response.errMsg == ''){
              return;
            }

            if(this.dto.Response.errMsg=='Recovery failed    code:1100011')
            {
              this.toastr.error("", this.translateService.instant('low_balance'), {
                timeOut: 1000,
                positionClass: 'toast-top-center',
                });
                return;
            }
            else{
              this.toastr.error("", this.dto.Response.errMsg, {
                timeOut: 1000,
                positionClass: 'toast-top-center',
                });
                return;
            }            
            
           }
        ); 
      }
      else{
        this.http.post(this.funct.ipaddress+'loginGS/gsWithdrawal', this.depositModel,  { headers: headers })
        .pipe(
          catchError(this.handleError.bind(this))
          )
        .subscribe(
          result => {
            this.dto.Response = result; 
            this.loadingSubmiting=false;
            this.spinner.show('loadingSubmiting');
            this.storage.store("transferAmount", this.depositModel.transferAmount);
            if(this.dto.Response.status == "Error" || this.dto.Response.message == "error" ){
              this.toastr.error("", this.translateService.instant("submitting-request-time"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
                });
                return;
            }
            if(this.dto.Response.errCode == '0'){
              this.bsModalRef.hide();

              this.data.gameWalletTransfer=this.storage.retrieve("localGameWalletTransfer");
              if((this.data.gameWalletTransfer !=null || this.data.gameWalletTransfer != undefined) &&  this.data.gameWalletTransfer == "Wallet"){
                this.router.navigate(["/game/deposit-success",'200'], {replaceUrl: false});
              }
              else{
                  this.router.navigate(["/game/deposit-success",'200'], {replaceUrl: true});
              }   
              
            }
            if(this.dto.Response.errCode == '72'){
              this.toastr.error("", this.translateService.instant('low_balance'), {
                timeOut: 1000,
                positionClass: 'toast-top-center',
                });
                return;
            }
            if(this.dto.Response.errCode == '999'){
              this.toastr.error("", this.translateService.instant('underMaintenance'), {
                timeOut: 1000,
                positionClass: 'toast-top-center',
                });
                return;
            }
            if(this.dto.Response.errMsg == "SUCCESS"){
              return;
            }
            else{
              this.toastr.error("", this.dto.Response.errMsg, {
                timeOut: 1000,
                positionClass: 'toast-top-center',
                });
                return;
            }            
            
           }
        ); 
      }
      
    }
    else{
      return;
    }
  }
  
  enter(event)
  {
    event.target.blur();
  }
  close(){
    this.bsModalRef.hide();
  }

}