import { Component, OnInit, TemplateRef, ViewEncapsulation,ViewChild,ElementRef} from '@angular/core';
import { HttpClient, HttpHeaders ,HttpParams,HttpErrorResponse} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {Location} from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';

@Component({
  selector: 'app-withdraw-change-account',
  templateUrl: './withdraw-change-account.component.html',
  styleUrls: ['./withdraw-change-account.component.scss']
})
export class WithdrawChangeAccountComponent implements OnInit {
  token: any;
  mywithdrawalBankAccList : any;
  withdrawalBankAccDelete: any;
  withdrawaledit: BsModalRef;
  currentpaymentid:any;
  currentbankaccid:any;
  withdrawaldeleteList:any;
  bankaccounteditmodel:any;
  editName:any;
//@ViewChild('withdrawaldelete', { static: true }) myTemplateRef!: TemplateRef<any>;
  
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
    private _location: Location,) { 
     
    }

  ngOnInit(): void {
   this.editName='';
   this.getMyWithdrawAccounts();
   this.withdrawalBankAccDelete= {
    "payment_id": 0,
    "bank_acc_id": 0
   }
  }

  showeditmodal(withdrawaledit: TemplateRef<any>,bankAccObj: any): void {
    this.withdrawalModel(bankAccObj,withdrawaledit)
  }

  saveEdit(): void {
    if(!this.editName || this.editName == null || this.editName=='null')
    {
         this.toastr.error("", this.translateService.instant("bank_accname_required"), {
              timeOut: 2000,
              positionClass: 'toast-top-center',
            });
          return;
    }
    else{
     this.withdrawaledit.hide(); 
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders().set('Authorization', this.token);
    const formData = new FormData();
    formData.append('accid', this.bankaccounteditmodel.bank_account_id.toString());
    formData.append('accName', this.editName);
    this.http.post(this.funct.ipaddress + 'userbankaccount/edituserBankAccountNameForMobile', formData, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;  
          this.withdrawaledit.hide();     
          if(this.dto.Response.status=='Success')
          {
            this.toastr.success("", this.translateService.instant("bank_accname_success"), {
                           timeOut: 2000,
                           positionClass: 'toast-top-center',
                           });
             
           this.getMyWithdrawAccounts();
            this.editName='';
          }
          else{
            this.editName='';
            this.toastr.error("", this.translateService.instant("withdraw_edit_fail"), {
                           timeOut: 3000,
                           positionClass: 'toast-top-center',
                           });
          }
        }
      );
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
         this.router.navigate(['/login'], { replaceUrl: true });
    }
    if(error.error.message=='Bank Account Delete fail , withdrawal pending state')
    {
       this.toastr.error("", this.translateService.instant("withdrawal_delete_pending"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        return;     
    }

    if(error.error.message!='Bank Account Delete fail , withdrawal pending state')
      {
        this.toastr.error("", this.translateService.instant("withdraw_delete_fail"), {
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
 
  
  getMyWithdrawAccounts()
  {
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);      
    this.http.get( this.funct.ipaddress+'userbankaccount/getuserbankaccount-byUserId', { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
     )
      .subscribe(
        result => {
          this.dto.Response = result;       
          this.mywithdrawalBankAccList = this.dto.Response;
        }
      );
  }

  // checkwithdrawDelete(payment_id: any,bank_acc_id: any,withdrawaldelete: TemplateRef<any>){
  //   this.currentpaymentid=payment_id;
  //   this.currentbankaccid=bank_acc_id;
  //   this.token = this.storage.retrieve('token');    
  //   let headers = new HttpHeaders();
  //   let params = new HttpParams();
  //   headers = headers.set('Authorization', this.token); 
  //  // this.withdrawaldelete.hide();   
  //   params = params.set("paymentId",payment_id).set("bank_acc_id", bank_acc_id); 
  //   this.http.get( this.funct.ipaddress+'userbankaccount/checkuserbankaccount-byPaymentId',{ params:params,headers: headers }) 
  //     .pipe(
        
  //       catchError(this.handleError.bind(this))
  //    )
  //     .subscribe(
  //       result => {
  //         this.dto.Response = result;   
  //         this.withdrawaldeleteList=this.dto.Response;
  //         if (this.withdrawaldeleteList=='') {
        
  //             this.toastr.error("", this.translateService.instant("withdraw_delete_fail"), {
  //              timeOut: 3000,
  //              positionClass: 'toast-top-center',
  //              });
           
  //           return;
  //         } 
  //         else{
  //          // var template = document.getElementById('withdrawaldelete') as HTMLTemplateElement;
  //           this.withdrawalModel(this.currentpaymentid,this.currentbankaccid,withdrawaldelete)
  //         }
          
  //       }
  //     );

  // }

  withdrawDelete()
  {
    this.withdrawalBankAccDelete.payment_id= this.currentpaymentid
    this.withdrawalBankAccDelete.bank_acc_id= this.currentbankaccid;
   
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    let params = new HttpParams();
    headers = headers.set('Authorization', this.token); 
    this.withdrawaledit.hide();    
    this.http.post( this.funct.ipaddress+'userbankaccount/deleteuserBankAccount',this.withdrawalBankAccDelete, { headers: headers })
      .pipe(
        
        catchError(this.handleError.bind(this))
     )
      .subscribe(
        result => {
          this.dto.Response = result;   
          this.withdrawaldeleteList=this.dto.Response;
          if (this.dto.Response.status == "Success") {         
            this.getMyWithdrawAccounts();
            return;
          } 
          
        }
      );

  }
  withdrawAdd()
  {  
    this.router.navigate(['/wallet/withdraw', 'add'],{replaceUrl: false});
  }
  changeBankAccount(id: any)
   { 
    this.router.navigate(['/wallet/withdraw'], {state: {bank_account_id: id},replaceUrl:true});
    this._location.back();
  }
  goBack(){
    this._location.back();
  }
 
  withdrawalModel(bankAccObj,withdrawaldelete: TemplateRef<any>){
   
    this.bankaccounteditmodel=bankAccObj;
    this.editName=bankAccObj.account_name;
    this.withdrawaledit=this.modalService.show(withdrawaldelete,
      {
        class: "logout-modal modal-sm",
        ignoreBackdropClick: true, 
        keyboard: false
      });       
  }
  HidelogoutModel(){
    this.editName='';
    this.withdrawaledit.hide();
   // this.withdrawaldelete.hide();
  }
  
}

