import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { CommonService } from './common.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { Router } from '@angular/router';
import { LoginDeviceDialogComponent } from '../dialog/login-device-dialog/login-device-dialog.component';
import { throwError } from 'rxjs';
import {Location} from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class HandleErrorMessageService {
  bsModalRef: BsModalRef;
  constructor(
    private router: Router,
    //public navigation: NavigationService,
    public common: CommonService,
    public spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private translateService: TranslateService,
    public toastr: ToastrService,
    private storage: LocalStorageService,
    private _location: Location,
  ) { }

  handleError(err: string, error: HttpErrorResponse) {
    console.log("ERROR>>>>>"+JSON.stringify(error))
    this.common.threedCloseTimeLoading = false;
    this.spinner.hide("threedCloseTimeLoading");
    //gameLoading
    this.common.gameLoading = false;
    this.spinner.hide("gameLoading");
    //balance
    this.common.balanceLoading = false;
    this.spinner.hide("balanceLoading");
    // mainbalance
    this.common.mainBananceLoadingSubmit=false;
    this.spinner.hide("mainBananceLoadingSubmit");
    //submit
    this.common.submitLoading= false;
    this.spinner.hide("submitLoading");
    //refresh
    this.common.refreshLoading=false;
    this.spinner.hide("refreshLoading");

    //betloading
    this.common.betLoading= false;
    this.spinner.hide("betLoading");
     if(error.status==200){
      this.toastr.error("",this.translateService.instant("skm-lock-time"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
        return;
     }
     if(error.status == 0){
      //  this.toastr.error("", this.translateService.instant("checkInternetConnection"), {
      //    timeOut: 3000,
      //    positionClass: 'toast-top-center',
      //  });
         return;
     }

     if(error.status == 423 || error.status == 417)
     {
      //  this.toastr.error("",this.translateService.instant("youNeedLogin"), {
      //    timeOut: 3000,
      //    positionClass: 'toast-top-center',
      //    });
         this.storage.clear('token');
         this.storage.clear('isUserLoggedIn');
         this.router.navigate(['/login'], { replaceUrl: true });
         return;
     }

     if (error.status == 404 ) {
      if(error.error.message=='Please add user email first!')
      {
        if(err=='withdrawaladd'){
        this.toastr.warning("", this.translateService.instant("emailRequired"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        //return;
        this.router.navigate(['/me-page/email-address']);
      }
      if(error.error.message=='viber verification code currently does not support international numbers!')
      {
        this.toastr.warning("", this.translateService.instant("viber_error"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
       // this.router.navigate(['/me-page/email-address']);
      }
      else{
        this.toastr.warning("", this.translateService.instant("emailRequired"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      }



       //phoneOrPwdIncorrect
        if(error.message == "No game alert found"){
          return;
        }
        if(error.error.status == "Error"
        && error.error.message == "PhoneNo or password is not correct" && error.error.data == null){
         this.toastr.error("",this.translateService.instant("accountNotExist"), {
           timeOut: 3000,
           positionClass: 'toast-top-center',
         });
         return;
        }
        if(error.error.data){
          if (error.error.data.dbFailCount < (error.error.data.settingFailCount -2 )) {
            this.toastr.warning("", this.translateService.instant("phoneOrPwdIncorrect"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return;
          }
          if(error.error.data.dbFailCount == (error.error.data.settingFailCount -2 )) {
            this.toastr.error("",this.translateService.instant("login-block-message"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }
          if (error.error.data.dbFailCount == (error.error.data.settingFailCount -1 )) {
            this.toastr.error("", this.translateService.instant("login-block-message-one"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return;
          }
          if (error.error.data.dbFailCount >= error.error.data.settingFailCount) {
            var activeMinute= this.translateService.instant("login-active-minutes");
            activeMinute =  activeMinute.toString().replace("@time",  error.error.data.activeMinute);
            this.toastr.error("",activeMinute, {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return;
          }
        }

     }
     if(error.status == 304)
     {
       this.openNewDialog();
       return;
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
      if(error.error.message=='This email address is already used by another user.')
        {
          this.toastr.error("", this.translateService.instant("email_already_used"), {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            });
            return;
        }
       // temporary_blocked
        if(error.error.message=='temporary_blocked')
        {
          this.toastr.error("", this.translateService.instant("tem_block"), {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            });
            return;
        }
      else{
        this.toastr.error("", error.error.message, {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
     }

     if (error.status == 406 && this.common.actionType == "insertAccount")
     {
       if(error.error.message == "Invalid Bank Account"){
         this.toastr.error("", error.error.message, {
           timeOut: 3000,
           positionClass: 'toast-top-center',
           });
           this._location.back();
           return;
       }
       else{
         this.toastr.error("", this.translateService.instant('withdraw_already_exist'), {
           timeOut: 3000,
           positionClass: 'toast-top-center',
           });
           this._location.back();
           this.router.navigate(['/wallet/withdraw', 'add'],{replaceUrl:true});
          return;
       }
     }
     if (error.status == 400 && this.common.actionType == "insertAccount")
     {
      if(err == "otp")
       {
        // this.toastr.error("", this.translateService.instant('otp-token-expired'),
        // {
        //   timeOut: 3000,
        //   positionClass: 'toast-bottom-center',
        // });
         return;
       }
       else{
        this.toastr.error("","Invalid Parameters", {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          });
         this.router.navigate(['/wallet/withdraw', 'add'],{replaceUrl:true});
         return false;
       }
     }

     if (error.status == 406)
     {
      if (error.error.message === 'User\'s email already exists!') {
        this.toastr.error("", this.translateService.instant("email_already_used"), {
          timeOut: 3000,
          positionClass: 'toast-bottom-center',
        });
        return;
      }
        // if(err == "withdraw delete fail"){
        //   this.toastr.error("", this.translateService.instant("withdraw_delete_fail"), {
        //     timeOut: 3000,
        //     positionClass: 'toast-top-center',
        //   });
        //   return;
        // }
        if(error.message == "Holiday"){
          this.toastr.error("", error.message, {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            });
            return;
        }
        if(error.error.failCount <= error.error.maxFailCount){
          var vv= this.translateService.instant('otp-fail');
          vv=vv.toString().replace("@time", error.error.maxFailCount);
          this.toastr.error("", this.translateService.instant('invalidotp')+" "+vv, {
            timeOut: 5000,
            positionClass: 'toast-bottom-center',
            });

            return false;
        }
        if(error.error.message == "User not acceptable"){

          this.toastr.error("", this.translateService.instant("user_not_acceptable"), {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          });
          return;
        }
        if(error.error.message  == "low_balance"){

          this.toastr.error("", this.translateService.instant('low_balance'), {
            timeOut: 1000,
            positionClass: 'toast-bottom-center',
            });
            return;
        }
        if(error.error.message=='Bank Account Delete fail , withdrawal pending state')
          {
             this.toastr.error("", this.translateService.instant("withdrawal_delete_pending"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
              });
              return;

          }
       else{
         this.toastr.error("", "Try Again Resend OTP", {
           timeOut: 5000,
           positionClass: 'toast-bottom-center',
           });
           return false;
       }

     }

    //  if(error.status == 406)
    // {
    //   this.router.navigate(['/game-deposit-error', '406'], {replaceUrl: true});
    //   return;
    // }
    // if(error.status == 700)
    // {
    //   this.router.navigate(['/game-deposit-error', '700'], {replaceUrl: true});
    //   return;
    // }
     if (error.status == 401)
     {
      if(error.message == "Invalid OTP Token"){
        this.toastr.error("", this.translateService.instant('invalid-otp'), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          });
          return;
      }
      if(error.error.message =="Expire Otp" && error.error.failCount == 1){
        this.toastr.error("",this.translateService.instant('invalid-otp'), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          });
        return;
      }
      else{
        this.toastr.error("", this.translateService.instant('invalid-otp'), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          });
          return;
      }

     }
     if(error.status == 400){
      if(err == "otp"){
        if(error.error.message=='Invalid Otp')
        {
          this.toastr.error("", this.translateService.instant('invalid-otp-code'),
          {
            timeOut: 3000,
            positionClass: 'toast-bottom-center',
          });
          return;
        }
        this.toastr.error("", this.translateService.instant('otp-token-expired'),
        {
          timeOut: 3000,
          positionClass: 'toast-bottom-center',
        });
        return;
      }
      if(err == "referralInvaild"){
        this.toastr.error("", this.translateService.instant('referralInvaild'),
        {
          timeOut: 3000,
          positionClass: 'toast-bottom-center',
        });
        return;
      }

     }
     if(error.status == 429){
      return;
     }


     else{
         return;
     }

   }


   //304
   openNewDialog() {
    const initialState= {
      title: '',
      closeBtnName: '',
      data: "",
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(LoginDeviceDialogComponent,
      {class: 'modal-sm login-device', initialState
   });
  }

  getIsUserLoginMessage(){
    this.toastr.error("", this.translateService.instant("youNeedLogin"), {
      timeOut: 3000,
      positionClass: 'toast-top-center',
      });
      this.router.navigate(['/login'], { replaceUrl: true });
  }
}
