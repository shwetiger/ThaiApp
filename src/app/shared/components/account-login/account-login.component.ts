import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { DtoService } from '../../service/dto.service';
import { UtilService } from '../../service/util.service';
import { FunctService } from '../../service/funct.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Location } from '@angular/common';
import { CommonService } from '../../service/common.service';
import { HandleErrorMessageService } from '../../service/handle-error-message.service';

@Component({
  selector: 'app-account-login',
  templateUrl: './account-login.component.html',
  styleUrls: ['./account-login.component.scss']
})
export class AccountLoginComponent implements OnInit {
  token: any;
  userProfileModel: any;  
  showAmount= true;
  showBalance: any;
  deviceId: any;
  //loadingBalance: any;
  notiCount: any;
  isUserLogin: boolean=false;
  constructor(
    public handleErrorMessage: HandleErrorMessageService,
    public common: CommonService, 
    private translateService: TranslateService,
    private toastr: ToastrService, 
    private spinner: NgxSpinnerService, 
    private dto: DtoService, 
    private http: HttpClient, 
    public util: UtilService, 
    private route: ActivatedRoute,
    private router: Router, 
    private storage: LocalStorageService, 
    private funct: FunctService,
    private _location: Location,) { 
      this.isUserLogin= this.storage.retrieve('isUserLoggedIn');
    }
    ngOnInit(): void {  
      this.getAllNoti();    
      var localnoti= this.storage.retrieve('localNewNotiCount');     
      if(localnoti !=null && this.isUserLogin){
        this.notiCount =this.storage.retrieve('localNewNotiCount');
      }else{
        this.notiCount =0;
      } 
      this.deviceId=this.storage.retrieve('localDeviceId');  
      this.showAmount=  this.storage.retrieve('showAmount');     
      this.showAmount= this.showAmount==null?false:this.showAmount;
    //  this. userProfileModel='';   
      this.token = this.storage.retrieve('token');    
      if(this.token == null) {
        this.storage.store('token', "");       
        this.userProfileModel=null;
        this.storage.store('isUserLoggedIn',false);
      }      
      if(this.storage.retrieve('localShowBalance') ==null){
        this.storage.store('localShowBalance', true); 
      }
      if(this.isUserLogin){
        this.getUserProfile();
        this.showAmount=this.storage.retrieve('localShowBalance');      
        if(!this.showAmount){
          this.showBalance= "*****";
          return;
        } 
      }     

    }
  loginAccount(){
      if(this.deviceId != null){
        this.router.navigate(['/login',this.deviceId],{replaceUrl: false});
        return;
      }
      else{
        this.router.navigate(['/login'],{replaceUrl: false});
        return;
      }      
   }   
    getUserProfile(){ 
      this.common.mainBananceLoadingSubmit=true;
      this.spinner.show("mainBananceLoadingSubmit"); 

      this.token = this.storage.retrieve('token');  
      if(this.token != null){
      let headers = new HttpHeaders();
      headers = headers.set('Authorization', this.token);    
      this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,''))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.userProfileModel= this.dto.Response;  
          if(this.showAmount){
            this.showBalance= this.userProfileModel.balance;  
          } 
          this.common.mainBananceLoadingSubmit=false;
          this.spinner.hide("mainBananceLoadingSubmit");
        }); 
      }
     
    }   

    showPassword(show: boolean){
      this.storage.store('showAmount',show);
      this.showAmount = show; 
      this.storage.store('localShowBalance', this.showAmount); 
      if(this.showAmount){
        this.showBalance= this.userProfileModel.balance;
        
      }
     
     
          
    }
    openWalletPage() {
      this.router.navigate(['/wallet','1'], { replaceUrl: false });  
    }
    getPhoneNumber(phone_no: any){
    
      if(phone_no !=null){  
      //  return phone_no = phone_no.substring(0, 3).toString()+"-"+
      //  phone_no.substring(3,6).toString() + "*****" + phone_no.substring(phone_no.length - 2,phone_no.length).toString();
      return phone_no = phone_no.substring(1, 3).toString()+
      phone_no.substring(3,6).toString() + "*****" + phone_no.substring(phone_no.length - 2,phone_no.length).toString();
      
      } 
     
    }

    goToNotiList() {
      this.router.navigate(['/noti'],{ replaceUrl: false });
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

     goToProfileDetail(){
      this.router.navigate(['/me-page/profile-edit'],{ replaceUrl: false });
     }

     getAllNoti()
      {       
        let userlogin=this.storage.retrieve('isUserLoggedIn'); 
        if(userlogin){
          this.token = this.storage.retrieve('token');
          let headers = new HttpHeaders();
          headers = headers.set('Authorization',  this.token);
          this.http.get(this.funct.ipaddress + 'notification/GetNotificationList', { headers: headers })
          .pipe(
            catchError(this.handleErrorMessage.handleError.bind(this,''))
          )
          .subscribe(
            async result => {
              this.common.refreshLoading=false;
              this.spinner.hide("refreshLoading");
              this.dto.Response = result; 
              if(this.dto.Response.length > 0){
                this.storage.store('localNotiList', this.dto.Response);                        
                var newcount=0;       
                this.dto.Response.forEach(e => {
                  if(e.status == 0){
                    newcount++;          
                  }          
                });
                this.storage.store('localNewNotiCount', newcount);  
                this.notiCount =this.storage.retrieve('localNewNotiCount');     
              }        
            }      
          ); 
        }
      } 

}
