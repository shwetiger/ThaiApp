import { Component,  ComponentFactoryResolver,  EventEmitter,  Input,  OnInit, Output, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router ,ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError } from 'rxjs/operators';
import { Location, LocationStrategy } from '@angular/common';
import { BsModalRef, BsModalService,} from 'ngx-bootstrap/modal';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { TopupAlertMaintenanceComponent } from 'src/app/shared/dialog/topup-alert-maintenance/topup-alert-maintenance.component';

@Component({
  selector: 'app-top-up',
  templateUrl: './top-up.component.html',
  styleUrls: ['./top-up.component.scss']
})

export class TopUpComponent implements OnInit {

  token: any;
  bsModalRef: BsModalRef;  
  userBalance : any;
  chooseTopupAmount: Array<any>=[];  
  topupSelectedAmount: any;
  topuplistPayment: any;
  showAmountFrom: boolean=false;
  payment_id: any;
  topupAmount: any;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    private Location: LocationStrategy,
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
    private route: ActivatedRoute,
    public common: CommonService) { 
     
 
    }

  async ngOnInit() {     
    this.common.refreshLoading=true;
    this.spinner.show("refreshLoading"); 
    this.topupAmount=''
    this.chooseTopupAmount = [
      { amount: '1000', selected: false },
      { amount: '5000', selected: false },
      { amount: '10000', selected: false },
      { amount: '100000', selected: false },
      { amount: '200000', selected: false },
      { amount: '500000', selected: false }
    ];
    this.getPaymentMethoded();
    this.getUserProfile();

  }

  getPaymentMethoded()
  {      
    this.token = this.storage.retrieve('token');   
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);  
    this.http.get(this.funct.ipaddress + 'payment/topuplistPayment', { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,""))
    )
    .subscribe(
      result => {   
        this.common.refreshLoading=false;
        this.spinner.hide("refreshLoading");    
        this.dto.Response = result;       
        this.storage.store('localTopuplistPayment',  this.dto.Response);
        this.topuplistPayment= this.storage.retrieve('localTopuplistPayment');       
      }); 
   }
  disabledImage(image_url: any) {
    var img;
    img=image_url.replace('.png', 'disable.png')
    return img=image_url.replace('.png', 'disable.png');
   }

  changeAction(id) {
    this.payment_id = id; 
    this.getTopupDetail(id)   
    this.showAmountFrom=true;
  }
 
 
  refreshPage(): void{    
    this.ngOnInit(); 
    this.payment_id=""; 
    this.getUserProfile();
    setTimeout(() => {
      this.common.refreshLoading=false;
      this.spinner.hide("refreshLoading");
    }, 1000);
  }

  getUserProfile() {

    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);

    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', {headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,""))
      )
    .subscribe(
     result => {
       this.dto.Response = {};
       this.dto.Response = result;
       this.userBalance = this.dto.Response.balance;
    });
  }

  checkAmountTopup() {  
    for (let k=0; k<this.chooseTopupAmount.length; k++){
      if (this.topupAmount== this.chooseTopupAmount[k].amount) 
        {
         this.chooseTopupAmount[k].selected=true;
        }
        else{
          this.chooseTopupAmount[k].selected=false;
        }
    }
    $('#topup_amount_incorrect').removeClass('incorrect-noborder-color');
    $("#topupAmountErr").html("");
    if (this.topupAmount != undefined && this.topupAmount != null && this.topupAmount != '') {      
      if (this.topupAmount < 1000) {
        // $('#topup_amount_incorrect').addClass('incorrect-border-color');
        $("#topupAmountErr").html("<h5 class='error-color'>"+this.translateService.instant("amount_error")+"</h5>");
        return false;
      } else {
        $('#topup_amount_incorrect').addClass('incorrect-noborder-color');
        this.topupSelectedAmount=this.topupAmount;
        $("#topupAmountErr").html("");
        return true;
      }
    } else {
      // $('#topup_amount_incorrect').addClass('incorrect-border-color');
      var amount = this.translateService.instant("requiredFiled");
      amount = amount.toString().replace("@value", this.translateService.instant("cash_amount"));
      $("#topupAmountErr").html("<h5 class='error-color'>"+amount+"</h5>");
      // <img src='assets/img/error/incorrect.png' width='30' height='30' >
      return false;
    }
  }

  changeChooseTopup(amount) {
    for (let k=0; k<this.chooseTopupAmount.length; k++) {
      if (this.chooseTopupAmount[k].amount == amount) {
        var selected=this.chooseTopupAmount[k].selected;        
        this.chooseTopupAmount[k].selected=!selected;
        this.topupAmount=parseInt(amount);
        this.checkAmountTopup();            
      } else {
        this.chooseTopupAmount[k].selected=false;
      }
    }
  }

  requestTopup(){
    if(this.payment_id=="")
    {
      this.toastr.error("", this.translateService.instant('selectbanktype'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      return;

    }
    this.common.submitLoading= true;         
    this.spinner.show("submitLoading");    
    let chk =this.checkAmountTopup();
    if(!chk){
      this.common.submitLoading= false;         
      this.spinner.hide("submitLoading");  
      return;
    }
    this.common.submitLoading= false;         
    this.spinner.hide("submitLoading");
    this.storage.store('transfer_amount',this.topupSelectedAmount)
    this.storage.store('transfer_payment_id',this.payment_id)
    this.router.navigate(['/wallet/top-up-submit'], { state: {transfer_amount: this.topupSelectedAmount,transfer_payment_id: this.payment_id},replaceUrl: false});
  }

  enter(event) {
    event.target.blur();
  }

  getTopupDetail(id) {     
    this.token = this.storage.retrieve('token');   
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'payment/getPaymentBankAccount?paymentMethodId='+id, { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,""))
    )
    .subscribe(
      result => {       
        this.dto.Response = result.objMaintain;
        
        if(this.dto.Response !=null){
          this.showTopupMaintenanceDialog(this.dto.Response);
        } 
        else{
          return;
        }

    });
  }

  showTopupMaintenanceDialog(data) {   
    this.storage.clear("localWithdrawMaintenance");  
    const initialState= {          
      title: '',
      closeBtnName: '',     
      data: data,
      backdrop: true,
      ignoreBackdropClick: true
    };    
    this.bsModalRef = this.modalService.show(TopupAlertMaintenanceComponent, { class: 'modal-sm topup-maintenance-alert', initialState });
  }

  keyPressNumberfornumberintput(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const charCode = (event.which) ? event.which : event.keyCode;
    const allowedChars = /^[0-9]*$/;
    if (inputElement.value.length >= 10 && allowedChars.test(event.key)) {
      event.preventDefault();
      return false;
    }
    if (!allowedChars.test(event.key) || charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
  
    return true;
  }
}
