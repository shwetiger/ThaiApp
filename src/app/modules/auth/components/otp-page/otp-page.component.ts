import { Component, OnInit, ViewChild } from '@angular/core';
import { CodeInputComponent } from 'angular-code-input';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { Location } from '@angular/common';
import isUAWebview from "is-ua-webview";
import { FunctService } from 'src/app/shared/service/funct.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { NavigationService } from 'src/app/shared/service/navigation.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';
declare var require: any;

@Component({
  selector: 'app-otp-page',
  templateUrl: './otp-page.component.html',
  styleUrls: ['./otp-page.component.scss']
})
export class OtpPageComponent implements OnInit {
  @ViewChild('codeInput') codeInput !: CodeInputComponent;
  OtpSms: any;
  otpcode: any;
  phoneNumber: any;
  time: number = 180;  
  otpPhoneNumber: any;
  updateDeviceId: any;
  updateDeviceIdforfirebase:any;
  deviceId: any;
  phone_no: any;
  ipAddress: any;
  guid: any;
  request_id: any;
  code: any;
  password: any;
  token: any;  
  bankAccountList = [];/*XXX*/
  localInsertAccountOtpSms : any;
  viberorsmsotptype:any;
  otpheader:any;
  otpdesciption:any;
  smstype:any;
  commonFormtype:any;
  smssender:any;
  userProfile:any;
  /*XXX*/
  isclickResendButton = false;
  openUrl: any;
  checkOtpModel: { code: string; request_id: string; phone_no: string; register_key: string; };
  isWebview: boolean;
  coundDown: number;
  verify:any;
  recaptcha:boolean=false; 
  SMSprovider:any;
  otptype:any;
  changeoptprocess:boolean=false;
  registerottype:any;
  emailaddress:any;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    public navigation: NavigationService,
    private translateService: TranslateService,
    private toastr: ToastrService, 
    private spinner: NgxSpinnerService, 
    private dto: DtoService,
    private http: HttpClient, 
    private util: UtilService, 
    private router: Router, 
    private storage: LocalStorageService, 
    private funct: FunctService,
    private _location: Location,
    private afAuth: AngularFireAuth,) { 
      this.common.actionType = history.state.actionType;
      this.otptype=history.state.otptype;
      /*call local inert bank acc otp sms*/
     this.localInsertAccountOtpSms = history.state.localInsertAccountOtpSms;
     this.bankAccountList = history.state.bankAccountList;

     this.deviceId=this.storage.retrieve('localDeviceId');  
      this.isWebview=isUAWebview(navigator.userAgent)    
      if(navigator.userAgent.indexOf("Mi") != -1 && this.isWebview ){
        this.openUrl="";
      }
      if(this.deviceId !=null || this.isWebview){
          this.openUrl="?openinnewtap=1";
      }
      else{
        this.openUrl="";
      }
    }

  ngOnInit(): void { 
    this.common.submitLoading= false;         
    this.spinner.hide("submitLoading");
    this.time=this.storage.retrieve('Timer');
    this.changeoptprocess=this.storage.retrieve('changeotpprocess');
    this.registerottype=this.storage.retrieve('registeropttype');
    this.emailaddress=this.storage.retrieve('localEmail')
    this.commonFormtype=this.storage.retrieve('formPageType')
    if(this.time==null)
    {
      this.time=180;
    }
    this.startCountdown(this.time); 
    this.updateDeviceId={      
      deviceId: '',
      phone_no: '',
      ipAddress: '',
      guid: '',
      request_id: 0,
      code:'',
    }  
    this.updateDeviceIdforfirebase={      
      deviceId: '',
      phone_no: '',
      ipAddress: ''
    }  
    
    this.common.actionType = this.storage.retrieve('actionType');
    this.otptype=this.storage.retrieve('otptype');
    this.verify=this.storage.retrieve('verificationCode');
    this.localInsertAccountOtpSms=this.storage.retrieve('localInsertAccountOtpSms');
    this.bankAccountList=this.storage.retrieve('localInsertBankAccountList');
    if(this.storage.retrieve('localNewDeviceOtpSms') !=null){
      if(this.storage.retrieve('localNewDeviceOtpSms').number !=null){
        this.phoneNumber ="+" + this.storage.retrieve('localNewDeviceOtpSms').number;
      }
    }
  
    if(this.storage.retrieve('localInsertAccountOtpSms') !=null){
      if(this.storage.retrieve('localInsertAccountOtpSms').number !=null){
        this.phoneNumber ="+" + this.storage.retrieve('localInsertAccountOtpSms').number;
      }
    }
    
    if(this.storage.retrieve('localPhoneValue') !=null){
     var phone= this.storage.retrieve('localPhoneValue');
     var prefix=this.storage.retrieve('localPhonePrefix')
      if(phone.startsWith('0'))
    {
      this.phoneNumber= prefix + phone.substring(1,phone.length);
    }
    else{
      this.phoneNumber= prefix + phone;
    }    
    } 

    this.checkOtpModel ={
      code: '',
      request_id: '',
      phone_no: '',
      register_key: ''
    }
    this.GetSMSProvider();
    this.getotptype();
  
  
  }

 startCountdown(seconds) {
    let counter = seconds;  
    const interval = setInterval(() => { 
      this.coundDown=counter; 
      counter--; 
      if (counter < -1 ) {       
        clearInterval(interval);
        this.coundDown=counter;       
      }
      this.storage.store("Timer",this.coundDown)
    }, 1000);
    
  
  }

  onCodeCompleted(i: number) {  
    this.otpcode = i;
    this.validateOtp();
    
  }

  validateOtp()
  {   
      this.common.submitLoading= false;         
      this.spinner.hide("submitLoading");
        if(!this.otpcode ||this.otpcode.length <6)
        {
          $("#passErr").html(this.translateService.instant("otp_required"));
          return false;
        }
       else
        {
          $("#passErr").html("");
          return true;
        }
  }
  
  checkOtp() {
    this.common.submitLoading= true;   
    this.spinner.show("submitLoading"); 
    this.storage.clear("changeoptprocess");
    let checkOPTINput = this.validateOtp();
    if (!checkOPTINput) {
      return;
    }   
    if(this.common.actionType == "insertAccount")
    {
      if(this.localInsertAccountOtpSms.request_id != null)
      {
        this.token = this.storage.retrieve('token');    
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', this.token);
        this.OtpSms = []; 
        this.http.get(this.funct.ipaddress + 'transaction/withdrawcheckOTP?code='+this.otpcode+'&request_id='+this.localInsertAccountOtpSms.request_id, { headers: headers })
        .pipe(
          catchError(this.handleErrorMessage.handleError.bind(this,'otp'))
          )
        .subscribe(
          result =>{     
            this.common.submitLoading= false;         
            this.spinner.hide("submitLoading"); 
            this.dto.Response = result;
            this.OtpSms = this.dto.Response;  
            if(this.dto.Response.status == 401){
              if(this.dto.Response.code == 0){
                this.toastr.error("", this.translateService.instant('invalid-otp-code'),
                {
                timeOut: 3000,
                positionClass: 'toast-bottom-center',
                });
               return;
              } if(this.dto.Response.code == 11){
              
                this.toastr.error("", this.translateService.instant('otp-token-expired'),
                {
                  timeOut: 3000,
                  positionClass: 'toast-bottom-center',
                });
               return;
              }
            }
            if (this.OtpSms  != null) 
            { 
              if (this.OtpSms.status == true) 
              { 
                this.http.post( this.funct.ipaddress+'userbankaccount/insertuserBankAccount', this.bankAccountList,  { headers: headers })
                .pipe(
                  catchError(this.handleErrorMessage.handleError.bind(this,''))
                  )
                .subscribe(
                  result => 
                  {
                    this.dto.Response = result;
                    this.toastr.success("", this.translateService.instant('bankacc_addsuccess'), 
                    {
                      timeOut: 3000,
                      positionClass: 'toast-top-center',
                    });                   
                   this.storage.store('otpSms',"insert");     
                   var insertAccount= this.storage.retrieve("localInsertAccount"); 
                   this.storage.clear("localInsertAccount"); 
                   this.storage.clear('localInsertAccountOtpSms');
                   this.storage.clear('bankAccountList');
                   if(insertAccount == 'insertAccount'){
                    this._location.back();                    
                   }  
                   else{
                    history.go(-2);                   
                   }                  
                  }
                );                 
                this.storage.clear('localInsertAccountOtpSms');
                return true;
              } 
              else if(this.OtpSms.status == 401)
              {
                this.toastr.error("", 'The OTP Token has expired', 
                {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
                return false;
              }
              else
               {
                this.toastr.error("", 'OTP is not correct', 
                {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
                return false;
              }
            }
          }
        );
      }
      return;
    }
    if(this.otpcode !=null && this.otpcode.length ==6){ 
        if(this.storage.retrieve('localOtpSms').request_id !=null){
          let headers = new HttpHeaders(); 
          this.OtpSms = [];
         const localOtpSms = this.storage.retrieve('localOtpSms');
          var phone_no=this.storage.retrieve('localOtpSms').to;
          var request_id=this.storage.retrieve('localOtpSms').request_id;
          var code=this.otpcode;
          var link;
          if (this.commonFormtype== "forgetPassword") {
            this.token = this.storage.retrieve('token');  
            headers = headers.set('Authorization', this.token);
              link='user/checkOTPXXx?phone_no='+phone_no+'&code='+code+'&request_id='+request_id;
          }
          else{
           
             link='user/checkOTP?&phone_no='+phone_no+'&code='+code+'&request_id='+request_id+'&smstype='+this.registerottype;
          }
          this.http.get(this.funct.ipaddress + link, { headers: headers })
          .pipe(
            catchError(this.handleErrorMessage.handleError.bind(this,'otp'))
            )
          .subscribe(
            result => {
              this.dto.Response = result;
              this.OtpSms = this.dto.Response; 
              this.storage.clear("registeremail")
              if(this.dto.Response.status == 401){
                if(this.dto.Response.code == 0){
                  this.toastr.error("", this.translateService.instant('invalid-otp-code'),
                  {
                  timeOut: 3000,
                  positionClass: 'toast-bottom-center',
                  });
                 return;
                } if(this.dto.Response.code == 11){
                  this.toastr.error("", this.translateService.instant('otp-token-expired'),
                  {
                    timeOut: 3000,
                    positionClass: 'toast-bottom-center',
                  });
                 return;
                }
              
              }   
              if (this.OtpSms  != null) {
                if (this.OtpSms.status == true) {  
                  this.commonFormtype=this.storage.retrieve('formPageType')          
                  if (this.commonFormtype== "forgetPassword") {
                    this.storage.clear('localOtpSms');
                    var registerKey=this.funct.encrypt();
                    this.router.navigate(['/login/resetPassword'],{state:{registerKey : registerKey},replaceUrl: true});
                  } else {
                    var registerKey=this.funct.encrypt();
                    
                    this.storage.clear('registeropttype');
                    this.router.navigate(['/login/registration'],{state:{registerKey : registerKey},replaceUrl: true});
                  }
                  return true;
                }              
                 else {
                  this.toastr.error("Tip", 'OTP is not correct', {
                    timeOut: 3000,
                    positionClass: 'toast-top-center',
                  });//ShowError(context,Tran.of(context).text("sys_unauthrized"));
                  return false;
                }
              }
            }
          );

        }
        else{
           this.toastr.error("", this.translateService.instant('invalid-otp-code'), {
                    timeOut: 3000,
                    positionClass: 'toast-bottom-center',
                  });
                  return false;
        }
      
    }
  }
  getOtp(){ 
   
    this.time=180;
    this.startCountdown(this.time);        
    if (this.commonFormtype== "forgetPassword") {       
      this.ResendOtp("user/getForgotPassowrdOTP?phoneNo=");
      return
    }
    if(this.common.actionType == "insertAccount"){
      this.ResendWithdrawOtp();
      return;
    }
    else{
      this.ResendOtp("user/getRegisterOTP?phoneNo=");  
      return    
    }  
  }

  ResendWithdrawOtp(){
  this.token = this.storage.retrieve('token');    
  let headers = new HttpHeaders();
  headers = headers.set('Authorization', this.token); 
  this.storage.store('localInsertBankAccountList', this.bankAccountList); //store for next otp page
  this.http.get(this.funct.ipaddress + 'transaction/getWithdrawOTP', { headers: headers })
          .pipe(
            catchError(this.handleErrorMessage.handleError.bind(this,''))
            )
          .subscribe(
            result =>{
              this.dto.Response = result;   
              this.localInsertAccountOtpSms=this.dto.Response;
            }
          );
    
  }
  getNewOtp(){    
    this.codeInput.reset();
    this.common.submitLoading= false;         
    this.spinner.hide("submitLoading");
  
    let headers = new HttpHeaders();   
    this.http.get(this.funct.ipaddress + 'user/getRegisterDeviceOTP?phoneNo='+this.phoneNumber, { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
      )
    .subscribe(
      result => {           
        this.dto.Response = result;   
        this.startCountdown(this.time);          
        this.storage.store('localNewDeviceOtpSms',  this.dto.Response);              
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
        }
      }
    );           
    return;
  }

  getNewDeviceOtp(){
    this.common.submitLoading= true;   
    this.spinner.show("submitLoading"); 
    let headers = new HttpHeaders();   
    this.updateDeviceId.phone_no= this.storage.retrieve('localLoginModel').phone_no;
    this.updateDeviceId.ipAddress=this.storage.retrieve('localLoginModel').ipAddress;
    this.updateDeviceId.guid= this.storage.retrieve('localNewDeviceOtpSms').guid;
    this.updateDeviceId.request_id= this.storage.retrieve('localNewDeviceOtpSms').request_id;
    this.updateDeviceId.code= this.otpcode; 
    this.updateDeviceId.deviceId=this.storage.retrieve('localLoginModel').deviceId;  
    this.http.post(this.funct.ipaddress+'user/updateDeviceId', this.updateDeviceId,  { headers: headers })
      .pipe(            
        catchError(this.handleErrorMessage.handleError.bind(this, 'otp'))
     )  
     .subscribe(
      result => {
             
        this.dto.Response = result;      
        if(this.dto.Response.status == 401){
          if(this.dto.Response.code == 0){
            this.common.submitLoading= false;         
            this.spinner.hide("submitLoading"); 
            this.toastr.error("", this.translateService.instant('invalid-otp-code'),
            {
            timeOut: 2000,
            positionClass: 'toast-bottom-center',
            });
          
           return;
          } if(this.dto.Response.code == 10){
            this.common.submitLoading= false;         
            this.spinner.hide("submitLoading"); 
            this.toastr.error("", this.translateService.instant('otp-token-expired'),
            {
              timeOut: 2000,
              positionClass: 'toast-bottom-center',
            });
           
           return;
          }
        }  
      
        var loginDevice=this.storage.retrieve('localForgetLoginDevice');             
        if(this.dto.Response.status == "Success") {          
          if(loginDevice == 'loginDevice'){ 
            this.goToAutoLogin();
            this.storage.clear('localForgetLoginDevice');
          }
          else{                            
            this.storage.clear('localNewDeviceOtpSms');
            this.autoLogin();                                                 
            return;
          }            
        } 
        else {
          this.toastr.error("Tip", this.dto.Response.message.toString(), {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            });           
          return false;
        }
      }
    );   
  }


  autoLogin(){   
    var autoLoginModal=this.storage.retrieve('localLoginModel');
    let headers = new HttpHeaders(); 
    this.http.post(this.funct.ipaddress+'Authenticate/login', autoLoginModal,  { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      async result => {     
        this.dto.Response = result;     
         if (this.dto.Response.status != 'Error') {
         var token = result["token"];
          if(token != null)
          {
            this.util.isLogged = true;
            this.dto.token = "Bearer "+token+"";
            this.storage.store('token', this.dto.token);                  
            this.storage.store('isUserLoggedIn', this.util.isLogged);    
            this.storage.clear('localLoginModel');  
            // this._location.back();
            // this._location.back();   
            history.go(-2)     

          }
        }
        else {
          this.spinner.hide();
          this.toastr.error('', this.dto.Response.message, {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          });
        }
      }
    ); 

  }
  async getSMS()
  {    
    let config = {     
      params: {'toPhnumber': this.storage.retrieve('localLoginModel').phone_no},
    }
    const axios = require('axios').default;
    await axios.get(this.funct.ipaddress + 'user/sendLoginMsg', config )
      .then((res) => {      
        return res;
    })
    .catch((error) => {    
    });
 
  }

  updateFCMtoken(){
    var token=this.storage.retrieve('localFcmtoken');    
    let headers = new HttpHeaders();  
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
    this.http.post(this.funct.ipaddress + 'user/updateFcmtokenInitial', newToken, { headers: headers })
    .pipe
      (
        catchError(this.handleErrorMessage.handleError.bind(this,''))
      )
    .subscribe(
      result => {        
        this.dto.Response = result;    
      }
    );
  }


  async goToAutoLogin()
  {    
    let headers = new HttpHeaders();
    var loginModel= this.storage.retrieve('localLoginModel');   
    this.http.post(this.funct.ipaddress+'Authenticate/login', loginModel,  { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,''))
       )
      .subscribe(
        result => {          
          this.storage.clear('localLoginModel');
          this.dto.Response = result;          
           if (this.dto.Response.status != 'Error') {
           var token = result["token"];           
            if(token != null)
            {
              this.util.isLogged = true;
              this.dto.token = "Bearer "+token+"";
              this.storage.store('token', this.dto.token);                        
              this.storage.store('isUserLoggedIn', this.util.isLogged);
              this.storage.clear('localLoginModel');                  
              // this._location.back();   
              // this._location.back(); 
              // this._location.back(); 
              // this._location.back();
               history.go(-4);
            // this.router.navigate(['/me-page'],{replaceUrl: false})
            }
          }
          else{            
            this.toastr.error(this.dto.Response.message, 'Invalid!', {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }
        }
      );   
  }

  ResendOtp(url){   
    let headers = new HttpHeaders();    
    this.http.get(this.funct.ipaddress + url + this.phoneNumber, { headers: headers })
      .pipe(       
        catchError(this.handleErrorMessage.handleError.bind(this,''))
        )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;              
          this.storage.store('localOtpSms',  this.dto.Response);       
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
          }
        }
      );
  } 

  UpdateNewDeviceId(){
    let headers = new HttpHeaders();  
    this.updateDeviceIdforfirebase.phone_no=  this.storage.retrieve('localLoginModel').phone_no;
    this.updateDeviceIdforfirebase.ipAddress=this.storage.retrieve('localLoginModel').ipAddress;
    this.updateDeviceIdforfirebase.deviceId=this.storage.retrieve('localLoginModel').deviceId;  
    this.http.post(this.funct.ipaddress+'user/updateDeviceIdforFirebaseMessing', this.updateDeviceIdforfirebase,  { headers: headers })
      .pipe(            
        catchError(this.handleErrorMessage.handleError.bind(this, 'otp'))
     )  
     .subscribe(
      result => {
        this.common.submitLoading= false;         
        this.spinner.hide("submitLoading");        
        this.dto.Response = result;      
        if(this.dto.Response.status == 401){
          if(this.dto.Response.code == 0){
            this.toastr.error("", this.translateService.instant('invalid-otp-code'),
            {
            timeOut: 2000,
            positionClass: 'toast-bottom-center',
            });
           return;
          } 
        }  
        var loginDevice=this.storage.retrieve('localForgetLoginDevice');             
        if(this.dto.Response.status == "Success") {          
          if(loginDevice == 'loginDevice'){ 
            this.goToAutoLogin();
            this.storage.clear('localForgetLoginDevice');
          }
          else{                            
            this.storage.clear('localNewDeviceOtpSms');
            this.autoLogin();                                                 
            return;
          }            
        } 
        else {
          this.toastr.error("Tip", this.dto.Response.message.toString(), {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            });           
          return false;
        } 
      }
    );   
  }
  
handleClick()
{
  if(this.coundDown >= 0)
  {
    this.common.submitLoading= true;   
    this.spinner.show("submitLoading"); 
    var credentials=firebase.auth.PhoneAuthProvider.credential(this.verify,this.otpcode);
    firebase .auth().signInWithCredential(credentials)
   .then((response)=> {
    if (this.commonFormtype== "forgetPassword") {
      var registerKey=this.funct.encrypt();
      this.router.navigate(['/login/resetPassword'],{state:{registerKey : registerKey},replaceUrl: true});
      return;
    } 
    if(this.common.actionType == "insertAccount")
    {
      this.InsertWithdrawalAccount();
      return;
    }
    else {
      var registerKey='CfD3JNRXpafVf36oZZKJjqIch8QyDq81sv0IyuVR4m9y7hswwjuzkTr8AwRt6uVD';
      this.router.navigate(['/login/registration'],{state:{registerKey : registerKey},replaceUrl: true});
      return;
    }
  }).catch((error)=>
  {
    this.common.submitLoading= false;   
    this.spinner.hide("submitLoading"); 
    if(error.code=='auth/invalid-verification-code')
    {
      this.toastr.error("", this.translateService.instant('invalid-otp-code'),
       {
        timeOut: 2000,
        positionClass: 'toast-bottom-center',
      });
    }
    else
    {
      this.toastr.error("",error.message,
      {
       timeOut: 2000,
       positionClass: 'toast-bottom-center',
     });
    }
   }
  ); 
  }
else{
  this.toastr.error("", this.translateService.instant('otp-token-expired'),
  {
  timeOut: 2000,
  positionClass: 'toast-bottom-center',
  })
}
}

UpdateDeviceIdwithfirebase()
{
  if(this.coundDown >= 0)
  {
    this.common.submitLoading= true;   
    this.spinner.show("submitLoading"); 
    var credentials=firebase.auth.PhoneAuthProvider.credential(this.verify,this.otpcode);
    firebase.auth().signInWithCredential(credentials)
   .then((response)=> {
    this.UpdateNewDeviceId();

  }).catch((error)=>{
    this.common.submitLoading= false;   
    this.spinner.hide("submitLoading"); 
    if(error.code=='auth/invalid-verification-code')
    {
      this.toastr.error("", this.translateService.instant('invalid-otp-code'),
       {
        timeOut: 2000,
        positionClass: 'toast-bottom-center',
      });
    }
    else
    {
      this.toastr.error("",error.message,
      {
       timeOut: 2000,
       positionClass: 'toast-bottom-center',
     });
    }
}
  );
  }
else{
  this.toastr.error("", this.translateService.instant('otp-token-expired'),
  {
  timeOut: 2000,
  positionClass: 'toast-bottom-center',
  })
}
}


signInWithPhoneNumber() {
  this.recaptcha=true;
  const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container'); // Make sure you have an element with id 'recaptcha-container'
  this.afAuth.signInWithPhoneNumber(this.phoneNumber,appVerifier)
    .then(confirmationResult => {
      this.storage.clear('verificationCode');
      this.verify=confirmationResult.verificationId
      appVerifier.clear()
      this.recaptcha=false;
      this.startCountdown(this.time); 
    })
    .catch(error => {
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
   catchError(this.handleErrorMessage.handleError.bind(this,''))
  )
 .subscribe(
   result => {
    this.dto.Response = {};
     this.dto.Response = result;
     this.SMSprovider=this.dto.Response.message; 
   });
}

InsertWithdrawalAccount(){

  let headers = new HttpHeaders();
  this.token = this.storage.retrieve('token');    
  headers = headers.set('Authorization', this.token);  
  this.http.post( this.funct.ipaddress+'userbankaccount/insertuserBankAccount', this.bankAccountList,  { headers: headers })
                .pipe(
                  catchError(this.handleErrorMessage.handleError.bind(this,''))
                  )
                .subscribe(
                  result => 
                  {
                    this.dto.Response = result;
                    this.toastr.success("", this.translateService.instant('bankacc_addsuccess'), 
                    {
                      timeOut: 3000,
                      positionClass: 'toast-top-center',
                    });                   
                   this.storage.store('otpSms',"insert");     
                   var insertAccount= this.storage.retrieve("localInsertAccount"); 
                   this.storage.clear("localInsertAccount"); 
                   if(insertAccount == 'insertAccount'){
                    this._location.back();                    
                   }  
                   else{
                    this._location.back();
                    this._location.back();                      
                   }                  
                  }
                );                 
                this.storage.clear('localInsertAccountOtpSms');
                return true;
}

getotptype() {   
  if(this.commonFormtype =='register')
  {
    if (this.registerottype == "vmg_viber") {
      this.storage.clear("localotptype");
      this.storage.store("localotptype", "Viber");
      this.smssender = this.phoneNumber;
    }
      else if(this.registerottype=='email')
        {
          this.storage.clear("localotptype")
          this.storage.store("localotptype",'Email')
          this.smssender=this.emailaddress;
        }
      else{
        this.storage.clear("localotptype")
        this.storage.store("localotptype",'SMS')
        this.smssender = this.phoneNumber;
      }
    this.viberorsmsotptype=this.storage.retrieve('localotptype');
    this.otpheader = this.translateService.instant("otpheader");
    this.otpheader= this.otpheader.toString().replace("@type",this.viberorsmsotptype);
    this.otpdesciption = this.translateService.instant("otpdescription");
    this.otpdesciption= this.otpdesciption.toString().replace("@type",this.viberorsmsotptype);
  } 
  else{
  this.token = this.storage.retrieve('token');    
  let headers = new HttpHeaders();
  this.http.get(this.funct.ipaddress+'user/userSmsType?phone_no='+this.phoneNumber, {headers: headers })
  .pipe(
    catchError(this.handleErrorMessage.handleError.bind(this,''))
 )
  .subscribe(
    result => {
      this.dto.Response = result;     
      this.smstype=this.dto.Response.smstype;
      if(this.smstype=="vmg_viber")
      {
        this.storage.clear("localotptype")
        this.smssender = this.phoneNumber;
      }
      else if(this.smstype=='email')
        {
          this.smssender=this.dto.Response.email;
          this.storage.clear("localotptype")
          this.storage.store("localotptype",'Email')
 
        }
      else{
        this.storage.clear("localotptype")
        this.storage.store("localotptype",'SMS')
        this.smssender=this.phoneNumber;
      }
      this.viberorsmsotptype=this.storage.retrieve('localotptype');
      this.otpheader = this.translateService.instant("otpheader");
      this.otpheader= this.otpheader.toString().replace("@type",this.viberorsmsotptype);
      this.otpdesciption = this.translateService.instant("otpdescription");
      this.otpdesciption= this.otpdesciption.toString().replace("@type",this.viberorsmsotptype);
      return;
   });  
  }
 }


}