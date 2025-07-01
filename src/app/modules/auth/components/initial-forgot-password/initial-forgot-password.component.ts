import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse, HttpParams} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import {Location} from '@angular/common';
import { BsModalRef, BsModalService,ModalOptions } from 'ngx-bootstrap/modal';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import firebase from 'firebase';

@Component({
  selector: 'app-initial-forgot-password',
  templateUrl: './initial-forgot-password.component.html',
  styleUrls: ['./initial-forgot-password.component.scss']
})
export class InitialForgotPasswordComponent implements OnInit {

  OtpSms: any;
  localOtpSms: any;
  prefix= "+95";
  phoneValue: any="";
  regularExpressionPhone = "^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$";
  localRegisterCountryCode: any;
  forgetPasswordModalRef: BsModalRef;
  recaptcha:boolean=false;
  SMSprovider:any;
  SMSoperatorList:any;
  Usefirebase:boolean=false;
  Operatorcodelist:any;
  MPTarraylist:any=['4','2','8','5'];
  OoredooList:any=['9'];
  MYTELList:any=['6']
  TelenorList:any=['7']
  formPage:any;
  istxtdisable:boolean=false;
  constructor(
    private modalService: BsModalService,
    private translateService: TranslateService,
    private toastr: ToastrService, 
    private spinner: NgxSpinnerService, 
    private dto: DtoService, 
    private http: HttpClient, 
    private util: UtilService, 
    private router: Router, 
    private storage: LocalStorageService, 
    private funct: FunctService,
    private location: Location,
    private afAuth: AngularFireAuth,
    public common:CommonService,
    private route: ActivatedRoute) {
      this.route.queryParams.subscribe(params => {
      this.formPage= params['formPage'];
    });
  }

  ngOnInit(): void
  {
    this.common.submitLoading= false;         
    this.spinner.hide("submitLoading");
    this.prefix = this.storage.retrieve('localPhonePrefix');
    this.phoneValue=this.storage.retrieve('localPhoneValue');
    this.storage.clear("formPageType")
    this.GetSMSProvider();
    this.getSMSOperators();
    this.storage.clear('actionType');
    if(this.formPage=='changepwdpage'){ 
      this.istxtdisable=true;
    }
  }
  handleError(error: HttpErrorResponse) {    
    this.common.submitLoading= false;         
    this.spinner.hide("submitLoading");
    if(error.status == 0){
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }

    if (error.status == 403) {
      if(error.error.message == 'so_close'){
        this.toastr.error("", this.translateService.instant("otp-request-time"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      if(error.error.message == 'over_limited.'){
        this.toastr.error("", this.translateService.instant("otp-request-time-ten"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
      
        return;
      }

      if(error.error.message == 'temporary_blocked'){
        this.toastr.error("", this.translateService.instant("tem_block"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      // else{
      //   this.toastr.error("", error.error.message, {
      //     timeOut: 3000,
      //     positionClass: 'toast-top-center',
      //   });
      //   return;
      // }
     
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
       if(error.status == 404)
       {         
        this.toastr.error("",  this.translateService.instant("accountNotExist"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          });
          return;
       }
      //   else {
      //    this.toastr.error("", this.translateService.instant("otp-request-time"), {
      //     timeOut: 3000,
      //     positionClass: 'toast-top-center',
      //     });
      // }
    }

checkPhoneNumber()
  {
    $("#phoneErr").html("");
    var prefix = this.storage.retrieve('localPhonePrefix'); 
    this.phoneValue=this.storage.retrieve('localPhoneValue');
    if(this.phoneValue.length==0) 
    {
     var phoneRequired = this.translateService.instant("requiredFiled");
     phoneRequired =  phoneRequired.toString().replace("@value", this.translateService.instant("phonenumbererr"));
        $("#phoneErr").html(phoneRequired);
        this.common.submitLoading= false;         
        this.spinner.hide("submitLoading");
      return false;
    }
    if(prefix == "+95"){
      if(!this.phoneValue.startsWith("0")){
       var checkNumber = this.translateService.instant("not-allowed-phone");
       checkNumber= checkNumber.toString().replace("@number","09");
        $("#phoneErr").html(checkNumber);
        this.common.submitLoading= false;         
        this.spinner.hide("submitLoading");
        return false;
      }
    }
    if(prefix == "+66"){
      if(!this.phoneValue.startsWith("0")){
       var checkNumber = this.translateService.instant("not-allowed-phone");
       checkNumber= checkNumber.toString().replace("@number","06, 08, 09");
        $("#phoneErr").html(checkNumber);
        this.common.submitLoading= false;         
        this.spinner.hide("submitLoading");
        return false;
      }
    }
      
    let mobNumber = RegExp(this.regularExpressionPhone);

    if (!mobNumber.test(this.phoneValue)) {
       $("#phoneErr").html(this.translateService.instant("phoneInvaild"));
       this.common.submitLoading= false;         
       this.spinner.hide("submitLoading");
      return false;
    }  
    else{
      $("#phoneErr").html("");
      return true;
    } 
  }
  
  
forgetPasswordModal(forgetPassword: TemplateRef<any>) {
  let checkPhone = this.checkPhoneNumber();
  if (!checkPhone) {
    return; 
  }
  var phoneNumber;
  this.prefix = this.storage.retrieve('localPhonePrefix');
   if(this.phoneValue.startsWith('0'))
    {
      phoneNumber= this.prefix + this.phoneValue.substring(1, this.phoneValue.length);
    }
    else{
      phoneNumber= this.prefix + this.phoneValue;
    }  
    const forgetPasswordModal = {
      number : phoneNumber,    
    };     
    this.forgetPasswordModalRef = this.modalService.show(forgetPassword, {
      initialState : forgetPasswordModal,
      class: "forgetPassword-class modal-sm"
    });
 }
 HideAlert()
 {
  this.forgetPasswordModalRef.hide();
 }
  
submit()
  {
    this.common.submitLoading= true;         
    this.spinner.show("submitLoading");
      this.updateFCMtoken();
      let checkPhone = this.checkPhoneNumber();
      if (!checkPhone){
        return; 
      }
      let phoneNumber = this.prefix+this.phoneValue;
      this.prefix = this.storage.retrieve('localPhonePrefix');
      if (this.phoneValue.startsWith("0")) {
        phoneNumber =this.prefix +this.phoneValue.substring(
            1, this.phoneValue.length);
      }    
      else{
        phoneNumber= this.prefix + this.phoneValue;
      }       
      this.OtpSms = [];      
      this.OtpSms = this.storage.retrieve('localOtpSms'); 
      this.ForgotPasswordBankSlipCheck();
      return;      
  }
  updateFCMtoken(){
    var token=this.storage.retrieve('localFcmtoken');  
    let headers = new HttpHeaders();
   // headers = headers.set('Authorization', this.token); 
    var phone_no='';
    var phoneValue=this.storage.retrieve('localPhoneValue');
    var prefix = this.storage.retrieve('localPhonePrefix');
    
    if((phoneValue == null || phoneValue ==undefined || phoneValue =="")){
      return;
    } 
    if(phoneValue.startsWith('0'))
    {
      phone_no= prefix + phoneValue.substring(1,phoneValue.length);
    }
    else{
      phone_no= prefix + phoneValue;
    }  
    var newToken={
      fcmtoken: token,
      phone_no: phone_no
    } 
    this.http.post(this.funct.ipaddress + 'user/updateFcmtokenInitial', newToken, {headers: headers })
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
  ForgotPasswordBankSlipCheck()
  {
    let checkPhone = this.checkPhoneNumber();
    if (!checkPhone){
      return; 
    }
    let phoneNumber;
    this.phoneValue= this.storage.retrieve('localPhoneValue');
    this.prefix = this.storage.retrieve('localPhonePrefix');
    if(this.phoneValue ==null || this.phoneValue == undefined || this.phoneValue == ""){
      return;
    }
    if (this.phoneValue.startsWith("0")) {
      phoneNumber =this.prefix+this.phoneValue.substring(
          1, this.phoneValue.length);    }    
    else{
      phoneNumber= this.prefix + this.phoneValue;
    }
    this.http.get(this.funct.ipaddress + 'userforgotpassword/ForgotPasswordBankSlipCheck?phoneNo='+phoneNumber)
    .pipe(
        catchError(this.handleError.bind(this))
      )
    .subscribe(
       result => 
      {
        this.dto.Response = {};
        this.dto.Response = result;
        if(this.dto.Response==null)
        {
          this.toastr.error("",this.translateService.instant("forgetpwd_nouser"), {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          });
          this.common.submitLoading= false;         
          this.spinner.hide("submitLoading");
          return;
        }
        switch(this.dto.Response.requestFlag) 
        {
          case true:
             // if(this.SMSprovider == 'firebase' && this.Usefirebase == true)
              if( this.Usefirebase == true)
                  {
                       this.signInWithPhoneNumber();
                  }
                 else
                  {
                      this.getForgotPassowrdOTP();// go to password reset page 
                  }
              break;
          case false:
               switch(this.dto.Response.requestStatus)
               {
                case 0: //pending transaction slip 
                                
                    this.router.navigate(['/login/waiting'],{replaceUrl: false});
                    break;
                case 1 : //approved transaction slip
                  if(this.SMSprovider == 'firebase' && this.Usefirebase == true)
                  {
                       this.signInWithPhoneNumber();
                  }
                 else
                  {
                      this.getForgotPassowrdOTP();// go to password reset page 
                  }
                   
                   break;
                case 2 : //approved transaction slip
                   if(this.SMSprovider == 'firebase' && this.Usefirebase == true)
                    {
                      this.signInWithPhoneNumber();
                    }
                    else
                    {
                     this.getForgotPassowrdOTP();// go to password reset page 
                    }
                   break;
                case -1: //invalid user or inactive or non register
                    // this.toastr.error("", this.translateService.instant("accountNotExistorInactive"), {
                    // timeOut: 3000,
                    // positionClass: 'toast-top-center',
                    // });
                    if(this.dto.Response.status=="INACTIVE" && this.dto.Response.failCount<3)
                    {
                      this.toastr.error("",this.translateService.instant("user_not_acceptable"), {
                        timeOut: 3000,
                        positionClass: 'toast-top-center',
                      });
                      this.common.submitLoading= false;         
                      this.spinner.hide("submitLoading");
                    }
                    else{
                    var activeMinute= this.translateService.instant("login-active-minutes");
                    activeMinute =  activeMinute.toString().replace("@time",  5);
                    this.toastr.error("",activeMinute, {
                      timeOut: 3000,
                      positionClass: 'toast-top-center',
                    });
                  }
                   return;
                case 3 :
                   this.router.navigate(['/login/forgot-password-validation'],{replaceUrl: false});//show question page --closed
                   break;
                case 4 : 
                    this.router.navigate(['/login/forgot-password-validation'],{replaceUrl: false});//show question page --closed
                    break;
                default:
                  if(this.SMSprovider == 'firebase' && this.Usefirebase == true)
                  {
                       this.signInWithPhoneNumber();
                  }
                  else
                  {
                       this.getForgotPassowrdOTP();// go to password reset page 
                  }
                  break;
               }
              break;
        }
      }
    );
  }
  
  getForgotPassowrdOTP()
  {
    let checkPhone = this.checkPhoneNumber();
    if (!checkPhone){
      return; 
    }
    let phoneNumber;
    this.phoneValue= this.storage.retrieve('localPhoneValue');
    this.prefix = this.storage.retrieve('localPhonePrefix');
    if(this.phoneValue ==null || this.phoneValue == undefined || this.phoneValue == ""){
      return;
    }
    if (this.phoneValue.startsWith("0")) {
      phoneNumber =this.prefix+this.phoneValue.substring(
          1, this.phoneValue.length);
    }    
    else{
      phoneNumber= this.prefix + this.phoneValue;
    }  
      let headers = new HttpHeaders();    
      this.OtpSms = [];      
      this.OtpSms = this.storage.retrieve('localOtpSms');
    this.http.get(this.funct.ipaddress + 'user/getForgotPassowrdOTP?phoneNo=' + phoneNumber, { headers: headers })
      .pipe(
          catchError(this.handleError.bind(this))
        )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;        
          this.storage.store('localOtpSms',  this.dto.Response);
          this.OtpSms = this.storage.retrieve('localOtpSms'); 
          this.storage.store("otptype",'smsotp')  
          this.storage.store("formPage",'forgetPassword')  
          this.storage.clear("Timer")  ;  
          this.storage.store("formPageType",'forgetPassword');
          this.router.navigate(['/login/otp'], {state: {formPage:"forgetPassword",otptype:'smsotp'}, replaceUrl: true});
          if (this.dto.Response.statusCode == 200){
            if (this.dto.Response.body.split('').trim() == "Not valid OTP code") {
              this.toastr.error("Bad request.", 'OTP is not correct', {
                timeOut: 3000,
                positionClass: 'toast-top-center',
                });
              return null;
            }
            if (this.dto.Response.body.split('').trim() == "Try Again") {
              this.toastr.error("Bad request.", this.dto.Response.body.toString(), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
                });            
              return null;
            }
            return this.OtpSms;
          }
        }
      );
  }

  signInWithPhoneNumber() {
    this.recaptcha=true;
    let phCheck = this.checkPhoneNumber();    
    if (phCheck==false) {
      return;
    }      
    this.phoneValue=this.storage.retrieve('localPhoneValue');
   
    let phoneNumber;
    if (this.phoneValue.startsWith("0")) {
      phoneNumber =this.prefix+this.phoneValue.substring(
          1, this.phoneValue.length);
    }
    if(!this.phoneValue.startsWith("0")) //XXXX 
    {
      phoneNumber = this.prefix + this.phoneValue;
    }
    
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container'); // Make sure you have an element with id 'recaptcha-container'
   
    this.afAuth.signInWithPhoneNumber(phoneNumber,appVerifier)
      .then(confirmationResult => {
        this.storage.store('verificationCode',confirmationResult.verificationId)
        this.storage.store("otptype",'firebaseotp')  
        this.storage.store("formPage",'forgetPassword')  
        this.storage.clear("Timer")  ;  
        this.router.navigate(['/login/otp'], {state: {formPage:"forgetPassword",otptype:'firebaseotp'}, replaceUrl: true});
     
      })
  
      .catch(error => {
    
        this.recaptcha=false;
        this.toastr.error("", error.message,
        {
        timeOut: 2000,
        positionClass: 'toast-bottom-center',
        });
        console.error('Phone authentication error',error.message);
      });
  }

  GetSMSProvider()
  {
   this.http.get(this.funct.ipaddress + 'user/getSMSProvider')
   .pipe(
     catchError(this.handleError.bind(this))
    )
   .subscribe(
     result => {
      this.dto.Response = {};
       this.dto.Response = result;
       this.SMSprovider=this.dto.Response.message;
       this.storage.store('SMSprovider',this.SMSprovider);
     });

  }

  getSMSOperators()
  {
   var phoneno= this.phoneValue.substring(2, this.phoneValue.length);
   this.http.get(this.funct.ipaddress + 'user/getSMSOperators')
   .pipe(
     catchError(this.handleError.bind(this))
    )
   .subscribe(
     result => {
      this.dto.Response = {};
       this.dto.Response = result;
      
       this.SMSoperatorList=this.dto.Response;
       if(this.SMSoperatorList!=undefined ||this.SMSoperatorList!=null || this.SMSoperatorList!="")
       {
        
       for (let i = 0; i < this.SMSoperatorList.length; i++) 
       {
        if(this.SMSoperatorList[i].operatorType=="MPT")
        {
          for(let i = 0; i < this.MPTarraylist.length; i++)
          if(phoneno.startsWith(this.MPTarraylist[i]))
          {
            this.Usefirebase=true;
          }
         
        }
        else if(this.SMSoperatorList[i].operatorType=="Ooredoo")
        {
          for(let i = 0; i < this.OoredooList.length; i++)
          if(phoneno.startsWith(this.OoredooList[i]))
          {
            this.Usefirebase=true;
          }
          
        }
        else if(this.SMSoperatorList[i].operatorType=="MYTEL")
        {
          for(let i = 0; i < this.MYTELList.length; i++)
          if(phoneno.startsWith(this.MYTELList[i]))
          {
            this.Usefirebase=true;
          }
          
        }

        else if(this.SMSoperatorList[i].operatorType=="Telenor")
        {
          for(let i = 0; i < this.TelenorList.length; i++)
          if(phoneno.startsWith(this.TelenorList[i]))
          {
            this.Usefirebase=true;
          }
          
        }
      }
    }
    else
    {
      return;
    }
    
     });

  }

}
function JSONEncoder() {
  throw new Error('Function not implemented.');
}

function urlencode(phoneNumber: string) {
  throw new Error('Function not implemented.');
}

