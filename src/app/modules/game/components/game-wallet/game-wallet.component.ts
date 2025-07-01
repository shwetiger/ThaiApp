import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-game-wallet',
  templateUrl: './game-wallet.component.html',
  styleUrls: ['./game-wallet.component.scss']
})
@Injectable()
export class GameWalletComponent implements OnInit { 
 
  token: any;
  loadingGameBalance: any;  
  loadingSubmiting: boolean;  
  providerType: any;
  refreshLoading: any;
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
  isMaintenance:any;
  gameproviderlist:any;
  providerCodes:any;
  providerBalances:any;
  loading:Boolean=false;

  constructor(
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
    this.refreshLoading=true;
    this.spinner.show("refreshLoading"); 
    this.loading=true; 
    this.getUserProfile();
    this.showAmount=this.storage.retrieve('localShowBalance');
    if(!this.showAmount){
      this.showBalance= "*****";       
    }     ;
    this.getGameBalance(); 

  }

  handleError(error: HttpErrorResponse)
  {
    this.refreshLoading=false;  
    this.loadingSubmiting=false;
    this.spinner.hide('loadingSubmiting');
    this.spinner.hide("refreshLoading");
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
      this.router.navigate(['/game/deposit-error', '406'], {replaceUrl: true});
      return;
    }
    if(error.status == 700)
    {
      this.router.navigate(['/game/deposit-error', '700'], {replaceUrl: true});
      return;
    }
    this.toastr.error("", error.status.toString(), {
      timeOut: 3000,
      positionClass: 'toast-top-center',
      });
      return;
  }

  //add code 
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
     var name=this.userProfileModel.name;
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
     this.createGSGameMember(); 
     this.createSKMGameMember();   
     this.token = this.storage.retrieve('token');    
     let headers = new HttpHeaders();
     headers = headers.set('Authorization', this.token);       
     this.http.get(this.funct.ipaddress + 'user/getAllgame', { headers: headers })
     .pipe
       (
          catchError(this.handleError.bind(this))
       )
     .subscribe(
       result => {       
         this.dto.Response = result;  
         this.gameBalanceList=this.dto.Response.data.list;
         this.gameBalance = this.dto.Response; 
         this.providerCodes = this.gameBalanceList.map(x => x.providerCode);
        //  if(this.gameType != null || this.gameType != undefined){
        //   var data= this.gameBalanceList.find(x=>(x.providerId == parseInt(this.providerType) || x.providerCode == this.gameName));
        //   this.refreshLoading = false;
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
         this.refreshLoading = false;
         this.spinner.hide("refreshLoading");    
         this.getAllGameProviderBalances();
       }
     );
   } 

  getAllGameProviderBalances() {
  this.loading = true;
  this.token = this.storage.retrieve('token');
  let headers = new HttpHeaders().set('Authorization', this.token);

  const providerCodes = this.gameBalanceList.map(x => x.providerCode);
  this.providerBalances = {};

  let errorAlertShown = false; // ✅ Prevents multiple alerts

  providerCodes.forEach(code => {
    this.http.get(this.funct.ipaddress + 'user/getGameBalance?gp_name=' + code, { headers: headers })
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe((result: any) => {
        if (result.isSuccess) {
          this.providerBalances[code] = result.data;
          this.total_balance = (Object.values(this.providerBalances) as number[])
            .reduce((sum, value) => sum + value, 0);
          this.loading = false;
        } else {
          if (
            result.message === "The request is too fast, please wait 5 seconds before operating again" &&
            !errorAlertShown // ✅ Only show the first time
          ) {
            errorAlertShown = true;
            this.toastr.error("", this.translateService.instant("5secwait"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return;
          }
        }
      });
  });
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
    this.refreshLoading = false;
    this.spinner.hide("refreshLoading");  
  }
  
  gameTransfer(data,tranfer){
    this.gameproviderlist=this.storage.retrieve("localgameProviderList");
    var checkmaintenance = this.gameproviderlist.find(x=>(x.id == parseInt(data.providerId)));
    if(checkmaintenance.isMaintenance == true)
    {
        this.toastr.error("", this.translateService.instant("transfer_maintenance_alert"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
    }
    else{
    var list={'list':data,tranfer: tranfer,gameWalletTransfer: this.gameWalletTransfer};
    this.showGameInOutDialog(list);
    }
  }

  getGameList(provierId)
  {   
   
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('providerId',provierId);
    this.http.get(this.funct.ipaddress + 'loginGS/GetGsGameList', { params:params, headers: headers })
    .pipe(
      catchError(this.handleError.bind(this,''))
    )
    .subscribe(
      async result => {
        this.common.refreshLoading=false;
        this.spinner.hide("refreshLoading"); 
        this.dto.Response = result;
        this.isMaintenance = this.dto.Response.isMaintenance;
        this.storage.store("isMaintenance",this.isMaintenance)
        return;
      }
    ); 
  }

  refreshPage(){
    this.spinner.show("refreshLoading");
    this.ngOnInit();
    this.gameBalance();
    this.getAllGameProviderBalances();
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
    // setTimeout(() =>
    // {
    //   this.refreshLoading=false;
    //   this.spinner.hide("refreshLoading");
    // }, 1000);

  }

  createGSGameMember(){         
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);  
    this.http.post(this.funct.ipaddress + 'loginGS/gscreatePlayer', null, {headers: headers })
    .pipe
      (
         catchError(this.handleError.bind(this))
      )
    .subscribe(
      result => {        
        this.dto.Response = result;         
      }
    );
  }

  createSKMGameMember(){         
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);  
    this.http.post(this.funct.ipaddress + 'shkm/SKMRegister', null, {headers: headers })
    .pipe
      (
         catchError(this.handleError.bind(this))
      )
    .subscribe(
      result => {        
        this.dto.Response = result;         
      }
    );
  }

  goToProfile(){
    this.router.navigate(['/me-page/profile-edit'], {replaceUrl: false});   
  }
}
