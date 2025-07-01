import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpParams,HttpErrorResponse} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-withdraw-my-accont',
  templateUrl: './withdraw-my-accont.component.html',
  styleUrls: ['./withdraw-my-accont.component.scss']
})
export class WithdrawMyAccontComponent implements OnInit {
  token: any;
  withdrawaledit: BsModalRef;
  mywithdrawalBankAccList : any;
  withdrawalBankAccDelete: any;
  currentpaymentid:any;
  currentbankaccid:any;
  withdrawaldeleteList:any;
  withdrawaldelete:any;
  bankaccounteditmodel:any;
  editName:any;
 
  constructor(  
    public common: CommonService,
    public handleErrorMessage: HandleErrorMessageService,
    private dto: DtoService, 
    private http: HttpClient,    
    private storage: LocalStorageService, 
    public toastr: ToastrService,
    private translateService: TranslateService,
    public spinner: NgxSpinnerService,
    private funct: FunctService,
    private modalService: BsModalService,
    ) { 
      
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
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders().set('Authorization', this.token);
    const formData = new FormData();
    formData.append('accid', this.bankaccounteditmodel.bank_account_id.toString());
    formData.append('accName', this.editName);
    this.http.post(this.funct.ipaddress + 'userbankaccount/edituserBankAccountNameForMobile', formData, { headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,'').bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;  
          this.withdrawaledit.hide();      
          if(this.dto.Response.status=='Success')
          {
            this.toastr.success("", this.translateService.instant("bank_accname_success"), {
                           timeOut: 3000,
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

  getMyWithdrawAccounts()
  {
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);      
    this.http.get( this.funct.ipaddress+'userbankaccount/getuserbankaccount-byUserId', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,''))
     )
      .subscribe(
        result => {
          this.dto.Response = result;       
          this.mywithdrawalBankAccList = this.dto.Response;    
        }
      );
  }

  withdrawDelete(){
    this.withdrawalBankAccDelete.payment_id= this.currentpaymentid;
    this.withdrawalBankAccDelete.bank_acc_id= this.currentbankaccid;
   
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    this.withdrawaldelete.hide();   
    this.http.post( this.funct.ipaddress+'userbankaccount/deleteuserBankAccount',this.withdrawalBankAccDelete, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,'withdraw delete fail'))
     )
      .subscribe(
        result => {
          this.dto.Response = result;   
          if (this.dto.Response.status == "Success") {           
            this.getMyWithdrawAccounts();
            return;
          }           
        }
      );

  }
 
}
