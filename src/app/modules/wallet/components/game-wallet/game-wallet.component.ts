import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {Injectable} from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { LocationStrategy } from '@angular/common';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { GameWalletInOutComponent } from 'src/app/shared/dialog/game-wallet-in-out/game-wallet-in-out.component';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
@Component({
  selector: 'app-game-wallet',
  templateUrl: './game-wallet.component.html',
  styleUrls: ['./game-wallet.component.scss']
})

export class GameWalletComponent implements OnInit { 
 
  token: any;
  loadingGameBalance: any;  
  loadingSubmiting: boolean;  
  providerType: any;
  //refreshLoading: any;
  userProfileModel: any;
  showAmount: boolean=false;
  showBalance: any;  
  userimageUrl: any="";
  gameBalance: any;
  gameBalanceList: any=[];
  bsModalRef: BsModalRef;  
  total_balance: any;
  gameType: any;
  depositModel : any;
  activeProviderId: any;
  gameName: any;
  gameWalletTransfer: any;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private Location: LocationStrategy,
    private modalService: BsModalService,
    private router: Router,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private dto: DtoService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private storage: LocalStorageService,
    private funct: FunctService,
    ) {

    this.providerType= history.state.providerType;
    this.gameType= history.state.gameType;
    this.gameName= history.state.gameName;
    this.gameWalletTransfer=history.state.gameWalletTransfer;
   
  }

  async ngOnInit() {   
   
    this.common.refreshLoading=true;
    this.spinner.show("refreshLoading"); 

    this.getUserProfile();
    this.showAmount=this.storage.retrieve('localShowBalance');
    if(!this.showAmount){
      this.showBalance= "*****";       
    } 
    this.getGameBalance();          
  } 

 

  //add code 
  getUserProfile(){    
    this.token = this.storage.retrieve('token');  
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);    
    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,""))
    )
    .subscribe(
      result => {
        this.dto.Response = {};
        this.dto.Response = result;
        this.userProfileModel= this.dto.Response;
        this.userimageUrl= this.userProfileModel.imageUrl;
        if(this.userimageUrl == null || this.userimageUrl == ''){
          this.userimageUrl="assets/img/icons/login-image.png";
        }
        
        if(this.showAmount){
        this.showBalance= this.userProfileModel.balance;  
        }
 
      }); 
     
  }

  showMainPassword(show: boolean){
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
     var name=this.userProfileModel?.name;
     if(name !=null && name.length >30){
      name= name.substring(0, 20)+" ...";
      return name;        
     }
     else{
       return name;  
     }
   }

   getGameBalance()
   { 
    // this.createGSGameMember();     
     this.token = this.storage.retrieve('token');    
     let headers = new HttpHeaders();
     headers = headers.set('Authorization', this.token);       
     this.http.get(this.funct.ipaddress + 'user/getAllgameBalance', { headers: headers })
     .pipe
       (
        catchError(this.handleErrorMessage.handleError.bind(this,""))
       )
     .subscribe(
       result => {       
         this.dto.Response = result;  
         this.gameBalanceList=this.dto.Response.list;
         this.total_balance=this.dto.Response.total_balance; 
         this.gameBalance = this.dto.Response;     
        //  if(this.gameType != null || this.gameType != undefined){
        //   var data= this.gameBalanceList.find(x=>(x.providerId == parseInt(this.providerType) || x.providerCode == this.gameName));
          
        //   this.common.refreshLoading=false;
        //   this.spinner.hide("refreshLoading");
        //   if(data !=null || data != undefined){
        //     this.activeProviderId=data.providerId;
        //     var list={'list':data,tranfer: this.gameType,gameWalletTransfer: this.gameWalletTransfer};          
        //     this.showGameInOutDialog(list);           
        //   }
        //   else{            
        //     return;
        //   }           
        //  }          
       }
     );
   } 

   showGameInOutDialog(data) { 
    const initialState= {          
      title: '',
      closeBtnName: '',     
      data: data,      
      backdrop: true,
      ignoreBackdropClick: true
    };    
    this.bsModalRef = this.modalService.show(GameWalletInOutComponent, { class: 'modal-sm game-in-out-alert', initialState });
   
  }
  
  gameTransfer(data,tranfer){
  
    this.activeProviderId=data.providerId;
    var list={'list':data,tranfer: tranfer,gameWalletTransfer: this.gameWalletTransfer};
    this.showGameInOutDialog(list);

  }

  refreshPage(){   
    this.ngOnInit();
    /*clean current type or selected*/
    if(this.depositModel.transferAmount != null || this.depositModel.transferAmount != undefined || this.depositModel.transferAmount != "")
    {
      this.depositModel.transferAmount = "";
    }
    if(this.depositModel.password != null || this.depositModel.password != undefined || this.depositModel.password != "")
    {
      this.depositModel.password = "";
    }
    $("#amountErr").html("");
    $("#passwordErr").html('');
    setTimeout(() =>
    {
      this.common.refreshLoading=false;
      this.spinner.hide("refreshLoading");
    }, 1000);
  }
  createGSGameMember(){         
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);  
    this.http.post(this.funct.ipaddress + 'loginGS/gscreatePlayer', null, {headers: headers })
    .pipe
      (
         catchError(this.handleErrorMessage.handleError.bind(this,""))
      )
    .subscribe(
      result => {        
        this.dto.Response = result;         
      }
    );
  }
}
