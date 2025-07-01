import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import {Location} from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import axios from 'axios';
import { FunctService } from 'src/app/shared/service/funct.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';


@Component({
  selector: 'app-threed-bet-confirm-page',
  templateUrl: './threed-bet-confirm-page.component.html',
  styleUrls: ['./threed-bet-confirm-page.component.scss']
})
export class ThreedBetConfirmPageComponent implements OnInit {
  bsModalRef: BsModalRef;
  betTwoDList: any;
  supportLanguages = ['en','my','th','zh'];
  totalAmount: any;
  totalAccountAmount: any;
  modalRef: BsModalRef;  
  threedBetEdit: BsModalRef; 
  twodBetAdd: BsModalRef; 

  threedBetUnBetList: BsModalRef; 
  token: any;
  userProfileModel: any;
  finalBetTwoDList: any;


  betAddNumber: any;
  betAddAmount: any;
  cannotSmallThan: any;

  newUnbetLimitList= [];


  doBetModel: any;
  total_amount: any; 
  twodbetDetailList: any;
  newBetTwoDList= [];

  localThreeDUnbetLimitList: any;
  dreambook: any;
  quickSelectedList: any; 
  threedNumberFieldType : any;
  
 constructor(
  private handleErrorMessage: HandleErrorMessageService,
  public common: CommonService,
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
  private _location: Location) {    

      this.betTwoDList=history.state.betThreeDList;
      this.dreambook = history.state.dreambook;
      this.quickSelectedList=history.state.quickSelectedList;     
      
  }

  async ngOnInit(): Promise<void> {
    this.common.refreshLoading=false;
    this.spinner.hide("refreshLoading"); 

    this.threedNumberFieldType = "number";
    this.userProfileModel={
      balance: ""
    };
    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage')); 
    this.totalAccountAmount= 0;
    
    if(this.dreambook == undefined){
      this.betTwoDList=this.storage.retrieve('localNewDreamBookNumber');
    }
    if(this.betTwoDList == undefined){
      this.betTwoDList=this.storage.retrieve('localNewBetThreedNumber');
    }
    if(this.quickSelectedList || this.storage.retrieve('localquickSelectLink')){
      this.betTwoDList=this.storage.retrieve('localQuickSelectedNumberList');
    }

    this.sortBetList();
    this.totalBetAmount();
    this.doBetModel={
      total_amount: 0,
      threedbetDetailList: ''
    }
    this.getBalance();
    this.localThreeDUnbetLimitList= '';
    await this.getUnBetList();
  }

  sortBetList() {
    this.betTwoDList.sort((a, b) => {
      return parseInt(a.number, 10) - parseInt(b.number, 10);
    });
  }

  threedBetEditModal(threedBetEdit: TemplateRef<any>,number: number, amount: number,) {
    const betModal = {
      number : number,
      amount: amount
    }; 
    this.threedBetEdit = this.modalService.show(threedBetEdit, {
      initialState : betModal,
      class: "threedBetEdit-class modal-sm",
      backdrop: true,
      ignoreBackdropClick: true
    });
 }

 twodBetAddModal(twodBetAdd: TemplateRef<any>,) {
    this.betAddAmount='';
    this.betAddNumber='';
    this.twodBetAdd = this.modalService.show(twodBetAdd, {   
      class: "threedBetAddClass",
      backdrop: true,
      ignoreBackdropClick: true
    });
   }

  betAddModelRemove(){
    this.twodBetAdd.hide();
  }

  keyPressNumbers(event){
    var charCode = (event.which) ? event.which : event.keyCode;
    // Only Numbers 0-9
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    else {      
      return true;
    }
  }

  keyPressNumberfornumberintput(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const charCode = (event.which) ? event.which : event.keyCode;
    const allowedChars = /^[0-9]*$/; // Regular expression to allow only numbers
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    // Prevent input if length is already 3 digits
    if (inputElement.value.length >= 3 && allowedChars.test(event.key)) {
      event.preventDefault();
      return false;
    }
  }
  checkBetAddNumber(){  
    $("#betAddNumberErr").html("");
    if(this.betAddNumber == '' || this.betAddNumber == null || this.betAddNumber == undefined) 
    {
      var betAmount3 = this.translateService.instant("requiredFiled");
      betAmount3 =betAmount3.toString().replace("@value", this.translateService.instant('bet_list_number'));
      $("#betAddNumberErr").html(betAmount3);
      return false;
    } 
    var num=this.betAddNumber.toString();    
   
    if( num.includes(".")){
      $("#betAddNumberErr").html(this.translateService.instant('3digit_only'));
      return false;
    }
    var regular= '^[0-9]{3}$';
    let pattern = RegExp(regular);// /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/;

    if (!pattern.test(this.betAddNumber)) {
       $("#betAddNumberErr").html(this.translateService.instant('3digit_only'));
       return false;
    }      
    if(this.betTwoDList.find(x=>x.number== this.betAddNumber)) {
       return true;
      } 
      else{
        return true;
      }   
  }

  checkBetAddAmount(){

    if(this.betAddAmount == '' || this.betAddAmount == null || this.betAddAmount == undefined) 
    {
      var betAmount1 = this.translateService.instant("requiredFiled");
      betAmount1 =betAmount1.toString().replace("@value", this.translateService.instant('amount'));
      $("#betAddAmountErr").html(betAmount1);
      return false;
    }   
    if(this.betAddAmount >= 100) 
    {
      $("#betAddAmountErr").html("");
      return true;
  
    }
    if(this.betAddAmount < 100) {
      var betAmount2 = this.translateService.instant("cannotSmallThan");
      betAmount2 = this.translateService.instant('amount')+":"+betAmount2.toString().replace("@value", '100');
      $("#betAddAmountErr").html(betAmount2);
      return false;
    }
  }
  async betAddModelNumber(){ 
    let chk1= this.checkBetAddNumber();
    let chk2= this.checkBetAddAmount();  
    if(!chk1 || !chk2){
      return;
    }
    let count=0;
    for(let i=0; i< this.betTwoDList.length; i++){     
      if(this.betTwoDList[i].number == this.betAddNumber )
      {
        this.toastr.warning("", this.translateService.instant('already_added'), {
              timeOut: 1000,
              positionClass: 'toast-top-center',
              });
      }
      if(this.betTwoDList[i].number != this.betAddNumber)
      {
           ++count;
      }
    }
    if(this.betTwoDList.length == count)
    {
        if(this.betAddNumber !=null && this.betAddAmount !=null)
        {
            var newNumber={number: this.betAddNumber.toString(), selected: true, betLimitColor: '', unbetstatus: false, amount: this.betAddAmount};
            this.betTwoDList.push(newNumber);   
            /*XXXX*/
            this.totalBetAmount(); //add

            this.twodBetAdd.hide();
            await this.getUnBetList();
            this.betAddNumber='';
            this.betAddAmount='';
        }
    }
  }

  totalBetAmount(){
    this.totalAmount=0;
    for (let i= 0; i < this.betTwoDList.length; i++)  
    {
      this.totalAmount = this.totalAmount + parseInt(this.betTwoDList[i].amount);
    }
  }
  async twodBetDelete(number: number){
    if(this.betTwoDList != undefined && this.dreambook != "dreambook" && !this.quickSelectedList){
      this.betTwoDList.splice(this.betTwoDList.findIndex(x=>x.number === number),1);
      await this.getUnBetList();
      this.storage.store('localNewBetThreedNumber',this.betTwoDList);
    }
    if(this.dreambook == "dreambook"){
      this.betTwoDList.splice(this.betTwoDList.findIndex(x=>x.number === number),1);
      await this.getUnBetList();
      this.storage.store('localNewDreamBookNumber', this.betTwoDList);
      
    }   
    if(this.quickSelectedList || this.storage.retrieve('localquickSelectLink') !=null){
      
      this.betTwoDList.splice(this.betTwoDList.findIndex(x=>x.number === number),1);
      
      await this.getUnBetList();
      this.storage.store('localQuickSelectedNumberList', this.betTwoDList);
    
    }
    
   
    this.totalBetAmount();
  }
 
 
  getBalance()
  {   
    
    this.token = this.storage.retrieve('token');  
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);    
    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      result => {   
        this.common.refreshLoading=false;
        this.spinner.hide("refreshLoading");     
        this.dto.Response = result;
        this.userProfileModel= this.dto.Response;   
        
      }); 
    this.spinner.hide();
  }
  checkBetAmount()
  {
    if(this.modalService.config.initialState.amount == '' || this.modalService.config.initialState.amount == null || this.modalService.config.initialState.amount == undefined) 
    {
      var betAmount = this.translateService.instant("requiredFiled");
      betAmount =betAmount.toString().replace("@value", this.translateService.instant('amount'));
      $("#betAmountErr").html(betAmount);
      return false;
    }   
    if(this.modalService.config.initialState.amount >= 100) 
    {
      $("#betAmountErr").html("")
      return true;
    }
    if(this.modalService.config.initialState.amount < 100) {
     this.cannotSmallThan = this.translateService.instant("cannotSmallThan");
     this.cannotSmallThan = this.translateService.instant('amount')+":"+this.cannotSmallThan.toString().replace("@value", '100');
      $("#betAmountErr").html(this.cannotSmallThan);
      return false;
    }
  
  }
  async threedBetModal(number: number, amount: number){
    let check=this.checkBetAmount();
    if(!check)
    {
      return;
    }
   
    if(this.localThreeDUnbetLimitList == null || this.localThreeDUnbetLimitList == undefined || this.localThreeDUnbetLimitList == "")
    {
    if(!this.localThreeDUnbetLimitList.find(x=>x.number == number))
          {       
            this.betTwoDList.find(x=>x.number == number).amount = amount;
            this.totalBetAmount();
            this.threedBetEdit.hide();
            await this.getUnBetList(); 
          } 
    }    
    if(this.localThreeDUnbetLimitList != null || this.localThreeDUnbetLimitList != undefined || this.localThreeDUnbetLimitList !="" )
    {
      for(let i=0; i< this.localThreeDUnbetLimitList.length; i++)
      {
        if(number == this.localThreeDUnbetLimitList[i].number)
        {         
          if(amount <= this.localThreeDUnbetLimitList[i].amount )
          {
            this.betTwoDList.find(x=>x.number == number).unbetstatus= false;
            this.betTwoDList.find(x=>x.number == number).amount =amount;
            await this.getUnBetList();   
            this.threedBetEdit.hide();
            this.totalBetAmount();
            break;
          }
          if(amount > this.localThreeDUnbetLimitList[i].amount )
          {
            this.betTwoDList.find(x=>x.number == number).unbetstatus= true;
            this.betTwoDList.find(x=>x.number == number).amount =amount;
            await this.getUnBetList(); 
            this.threedBetEdit.hide();
            this.totalBetAmount(); 
            break;      
          }
             
        }  
           
      }    
    }
   
  
  }
  twodBetModalDelete(){   
    this.threedBetEdit.hide();
  }


  betFinalConfirm(){ 

    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);      
   
    this.common.betLoading= true;   
    this.spinner.show("betLoading"); 
      this.http.get( this.funct.ipaddress+'odd/getThreeDOdd', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,''))
      )
      .subscribe(
        result => {
          this.common.betLoading= false;   
          this.spinner.hide("betLoading");
          this.dto.Response = result;
          this.storage.store('localThreedOddNumber',this.dto.Response);
          this.storage.store('localThreedBetFinalNumber',this.betTwoDList);
          this.router.navigate(['/threed/final-bet-confirm'], {state: {betTwoDList: this.betTwoDList,oddModel: this.dto.Response},replaceUrl:false} );
        }
      );    
  }
  
  async threedBetUnBetListModal(threedBetUnBetList: TemplateRef<any>) { 
    let login= this.storage.retrieve('isUserLoggedIn'); 
    if(!login){
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
      return;
    }
   
    this.localThreeDUnbetLimitList=[];  
    this.localThreeDUnbetLimitList= await this.getUnBetList();
    if(this.localThreeDUnbetLimitList == 400)
    {
       this.toastr.error("", this.translateService.instant('select_numbers'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
      return;
    }  
    if(this.localThreeDUnbetLimitList == 406){            
      this.toastr.error("", this.translateService.instant("game_low_balance"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }        
    if(this.localThreeDUnbetLimitList == "" || this.localThreeDUnbetLimitList == null || this.localThreeDUnbetLimitList ==  undefined ){
        this.betFinalConfirm();
        return;/*XXXX*/
    } 
    if(this.localThreeDUnbetLimitList != "" || this.localThreeDUnbetLimitList != null || this.localThreeDUnbetLimitList != undefined)
    {      
      for(let j=0; j< this.betTwoDList.length; j++)
      {
        this.localThreeDUnbetLimitList.forEach(e => {
         if( e.number == this.betTwoDList[j].number){
          this.betTwoDList[j].unbetstatus= true;      
         }
        });     
      }  
      const unBetLimitListModal = {
        unBetLimitList : this.localThreeDUnbetLimitList,    
      };     
      this.threedBetUnBetList = this.modalService.show(threedBetUnBetList, {
        initialState : unBetLimitListModal,
        class: "threedBetUnBetList-class modal-sm"
      });
    }
 }

 unBetLimitListModalDelete(){  
  this.threedBetUnBetList.hide();
  
}
 
/*XXXX Test*/
async getUnBetListNew()
{  
this.newBetTwoDList=[];
let headers = new HttpHeaders();
headers = headers.set('Authorization', this.token); 

for (let i= 0; i < this.betTwoDList.length; i++)  
{ 
  this.newBetTwoDList[i] = {      
    amount: this.betTwoDList[i].amount,
    number: this.betTwoDList[i].number
  }
}  
 this.doBetModel.total_amount=this.totalAmount;    
 this.doBetModel.threedbetDetailList= this.newBetTwoDList; 
  var response = await axios.post(this.funct.ipaddress + 'threedbet/Check3dBetLimit',this.doBetModel, {headers: {'Authorization': this.token}})
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return error.response.status;
      })
return response;
} 

async threedBetModalNew(number: number, amount: number)
{
   let check=this.checkBetAmount();
    if(!check)
    {
      return;
    }
    if(this.betTwoDList != null || this.betTwoDList != undefined || this.betTwoDList != "")
    {
        this.betTwoDList.find(x=>x.number == number).amount = amount;
        this.totalBetAmount();
        this.threedBetEdit.hide();
        this.localThreeDUnbetLimitList = await this.getUnBetListNew();

    }
    if(this.localThreeDUnbetLimitList == 400)
    {
        this.toastr.error("", 'Invalid Bet Amount', {
          timeOut: 1000,
          positionClass: 'toast-top-center',
          });
        return;
    }
    if(this.localThreeDUnbetLimitList == null || this.localThreeDUnbetLimitList == undefined || this.localThreeDUnbetLimitList =="" )
    {
      this.betTwoDList.find(x=>x.number == number).unbetstatus= false;
      this.totalBetAmount();
      await this.getUnBetListNew();
      this.threedBetEdit.hide();
      return;
    }
    if(this.localThreeDUnbetLimitList != null || this.localThreeDUnbetLimitList != undefined || this.localThreeDUnbetLimitList !="" )
    {
      for(let i=0; i< this.localThreeDUnbetLimitList.length; i++)
      {
        if(number == this.localThreeDUnbetLimitList[i].number)
        {   
          if(amount <= this.localThreeDUnbetLimitList[i].amount )
          {
            this.betTwoDList.find(x=>x.number == number).unbetstatus= false;
            this.betTwoDList.find(x=>x.number == number).amount =amount;
            await this.getUnBetListNew();   
            this.totalBetAmount();
            this.threedBetEdit.hide();
            break;
          }
          if(amount > this.localThreeDUnbetLimitList[i].amount )
          {
            this.betTwoDList.find(x=>x.number == number).unbetstatus= true;
            this.betTwoDList.find(x=>x.number == number).amount =amount;
            await this.getUnBetListNew(); 
            this.totalBetAmount(); 
            this.threedBetEdit.hide();
            break;      
          }
          }  
        /*not include in unbet list*/
        else{
              this.betTwoDList.find(x=>x.number == number).unbetstatus= false;
              await this.getUnBetListNew();
              this.totalBetAmount();  
              this.threedBetEdit.hide();
              break;
            } 
      }    
    }
}

/*The below is old*/
async getUnBetList()
  {  
  this.newBetTwoDList=[];
  let headers = new HttpHeaders();
  headers = headers.set('Authorization', this.token); 
  
  for (let i= 0; i < this.betTwoDList.length; i++)  
  { 
    this.newBetTwoDList[i] = {      
      amount: this.betTwoDList[i].amount,
      number: this.betTwoDList[i].number
    }
  }  
   this.doBetModel.total_amount=this.totalAmount;    
   this.doBetModel.threedbetDetailList= this.newBetTwoDList;  

  var response = await axios.post(this.funct.ipaddress + 'threedbet/Check3dBetLimit',this.doBetModel, {headers: {'Authorization': this.token}})
        .then((response) => {
          return response.data;
        })
        .catch((error) => {  
          if(error.response != undefined){              
           return error.response.status;
          }else{
            return error.response;
          }
        })
  return response;
 
  
} 
goBack(){
  this._location.back();
}
 
}
