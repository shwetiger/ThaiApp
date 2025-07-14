import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse, HttpParams} from '@angular/common/http';
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
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';


@Component({
  
  selector: 'app-twod-bet-confirm-page',
  templateUrl: './twod-bet-confirm-page.component.html',
  styleUrls: ['./twod-bet-confirm-page.component.scss']
})
export class TwodBetConfirmPageComponent implements OnInit {
  bsModalRef: BsModalRef;
  betTwoDList: any;
  supportLanguages = ['en','my','th','zh'];
  totalAmount: any;
  totalAccountAmount: any;
  modalRef: BsModalRef;  
  twodBetEdit: BsModalRef; 
  twodBetAdd: BsModalRef; 

  twodBetUnBetList: BsModalRef; 
  token: any;
  userProfileModel: any=[];
  finalBetTwoDList: any;


  betAddNumber: any;
  betAddAmount: any;
  cannotSmallThan: any;

  newUnbetLimitList= [];


  doBetModel: any;
  total_amount: any;
  sectionId: any;  
  twodbetDetailList: any;
  newBetTwoDList= [];
  localUnBetLimitList: any;
  dreamBook: boolean=false;
  twodsection:any;
  currentDate:any;
  maxlength:any;

 constructor(   
  private handleErrorMessage: HandleErrorMessageService,
  public common: CommonService,
  private modalService: BsModalService, 
  private translateService: TranslateService,
  private toastr: ToastrService, 
  private spinner: NgxSpinnerService, 
  private dto: DtoService, private http: HttpClient, private util: UtilService, 
  private router: Router, 
  private storage: LocalStorageService, 
  private funct: FunctService,
  private _location: Location,) {  
     
    this.betTwoDList=history.state.betTwoDList;
   // 
 
  }
  async ngOnInit(): Promise<void> {
    this.common.refreshLoading=true;
    this.spinner.show("refreshLoading"); 
    this.maxlength=7;    
    if (this.storage.retrieve('localNewTwodDreamBookNumber')) {
      this.dreamBook = true;
      this.betTwoDList = this.storage.retrieve('localNewTwodDreamBookNumber')
    }else{
      this.dreamBook = false;
      this.betTwoDList=this.storage.retrieve('localNewBetTwodNumber');
    }
    this.betTwoDList.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage')); 
    this.totalAccountAmount= 0;   
    this.totalBetAmount();
    this.doBetModel={
      total_amount: 0,
      sectionId: '',
      twodbetDetailList: ''
    }
    this.getBalance();
    this.localUnBetLimitList= '';
    this.twodsection=this.storage.retrieve('localSection');
    
    this.getCurrentDate();
    await this.getUnBetList();
    
  }

  // checkMaxLength(event: any) {
  //   const inputValue = event.target.value;
    
  //   if (inputValue.length > this.maxlength) {
  //     this.betAmount = parseInt(inputValue.slice(0, this.maxlength), 10);
  //   }
  // }

  keyPressNumbers(event: KeyboardEvent) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const key = event.key;
  
    // Cast event.target to HTMLInputElement to access 'value'
    const inputElement = event.target as HTMLInputElement;
  
    // Prevent input if it's not a number or if the max length is reached
    if (!allowedKeys.includes(key) || inputElement.value.length >= this.maxlength) {
      event.preventDefault();
    }
  }
  //dreamBook SingleR
  twodSingleR(number, amount){
   
    let newArray= [];
    let newR= {"id": "", "number": number.toString().split('').reverse().join(''),"selected":true,"unbetstatus":false,
    "amount":amount,"checked": false,"isR": false};
    for(let i=0;i<this.betTwoDList.length; i++){
      if(this.betTwoDList[i].number == number){
        let olddata= {"id": this.betTwoDList[i].id, "number": this.betTwoDList[i].number,
        "selected":true,"unbetstatus":false,"amount": this.betTwoDList[i].amount,"checked": false,"isR": false};
        newArray.push(olddata);
        for(let j=0;j<this.betTwoDList.length; j++){
          if(newR.number==this.betTwoDList[j].number)
            {
              this.toastr.error("", this.translateService.instant("already_added"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
                });
              return;
            }
        }
        newArray.push(newR);
      }
      else{
        newArray.push(this.betTwoDList[i]);
      }      
    }
    this.betTwoDList=newArray;
    this.totalBetAmount();  
  }
  
  //dreamBook AllR
  twodAllR(){ 
    let newArr=[];
    let removenumber=[]
    
    //let twinNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
    for(let i=0; i<this.betTwoDList.length; i++){
      let isremove=false;
      if(this.betTwoDList[i].isR){
        let newR= {"id": "","number": this.betTwoDList[i].number.toString().split('').reverse().join(''),
        "selected":true,"unbetstatus":false, "amount":this.betTwoDList[i].amount,"checked": false,"isR": false};
        let olddata= {"id": this.betTwoDList[i].id, "number": this.betTwoDList[i].number,
        "selected":true,"unbetstatus":false,"amount": this.betTwoDList[i].amount,"checked": false,"isR": false};
        newArr.push(olddata);
        for(let j=0; j<this.betTwoDList.length; j++)
        {
          if(newR.number==this.betTwoDList[j].number)
          {

            isremove=true;
            removenumber.push(newR.number)
          }
        
        }
        if(isremove==false)
        {
          newArr.push(newR);
        }
      }
      else{
        
        newArr.push(this.betTwoDList[i]);
      }

    }
   
    this.betTwoDList = newArr;
    this.totalBetAmount();
    if(removenumber.length!=0)
    {
     this.toastr.error("",removenumber.sort()+' '+this.translateService.instant("already_added"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
              }); 
            }  
  }

  twodBetEditModal(twodBetEdit: TemplateRef<any>,number: number, amount: number,) {
    const betModal = {
      number : number,
      amount: amount
    };     
    this.twodBetEdit = this.modalService.show(twodBetEdit, {
      initialState : betModal,
      class: "twodBetEdit-class modal-sm",
      backdrop: true,
      ignoreBackdropClick: true
    });
 }

 twodBetAddModal(twodBetAdd: TemplateRef<any>) {  
  this.betAddNumber="";
  this.betAddAmount="";    
  this.twodBetAdd = this.modalService.show(twodBetAdd, {   
    class: "twodBetAddClass modal-sm",
    backdrop: true,
    ignoreBackdropClick: true
  });
}

  betAddModelRemove(){
    this.twodBetAdd.hide();
  }

  // keyPressNumbers(event){
  //   var charCode = (event.which) ? event.which : event.keyCode;
  //   // Only Numbers 0-9
  //   if ((charCode < 48 || charCode > 57)) {
  //     event.preventDefault();
  //     return false;
  //   }
  //   else {      
  //     return true;
  //   }
  // }
  checkBetAddNumber(){  
    $("#betAddNumberErr").html("");
    var num=this.betAddNumber.toString();    
   if( num ==null || num.length != 2){
    $("#betAddNumberErr").html(this.translateService.instant("twodigitonly"));
    return false;
   }
    if( num.includes(".")){
      $("#betAddNumberErr").html("2 digit only...");
      return false;
    }
    var regular= '^[0-9]{2}$';
    let pattern = RegExp(regular);// /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/;

    if (!pattern.test(this.betAddNumber)) {
       $("#betAddNumberErr").html(this.translateService.instant("twodigitonly"));
       return false;
    }
    if(this.betAddNumber == '' || this.betAddNumber == null || this.betAddNumber == undefined) 
    {
      var betAddNumber = this.translateService.instant("requiredFiled");
      betAddNumber = betAddNumber.toString().replace("@value", this.translateService.instant('bet_list_number'));
      $("#betAddNumberErr").html(betAddNumber);
      return false;
    } 
       
    if(this.betAddNumber.length == 2){
     for(let i=0; i<this.betTwoDList.length;i++){
      return true;
      // if(this.betTwoDList[i].number == this.betAddNumber){
      //   // $("#betAddNumberErr").html("Already added!");
      //   this.toastr.warning("", 'Number Already Added', {
      //     timeOut: 2000,
      //     positionClass: 'toast-top-center',
      //     });
      //   return false;
      //  }else{
      //   $("#betAddNumberErr").html("");
      //   return true;
      //  }
     }    
    } 
    if(this.betTwoDList.length == 0){
      $("#betAddNumberErr").html("");
        return true;
    }

  }

  checkBetAddAmount(){
    if(this.betAddAmount == '' || this.betAddAmount == null || this.betAddAmount == undefined) 
    {
      var betAddAmount = this.translateService.instant("requiredFiled");
      betAddAmount = betAddAmount.toString().replace("@value", this.translateService.instant('amount'));
      $("#betAddAmountErr").html(betAddAmount);
      return false;
    }   
    if(this.betAddAmount >= 100) 
    {
      $("#betAddAmountErr").html("")
      return true;
    }
    if(this.betAddAmount < 100) {
      var betAddAmount1 = this.translateService.instant("cannotSmallThan");
      betAddAmount1 = this.translateService.instant('amount')+":"+betAddAmount1.toString().replace("@value", '100');
      $("#betAddAmountErr").html( betAddAmount1);
      return false;
    }
  }
  async betAddModelNumber(){ 
    var num=  this.checkBetAddNumber();
    var amount=this.checkBetAddAmount();
    if(!num || !amount)
    {
      return;
    } 
   
    let count=0;
    if(this.betTwoDList.length >0){
      for(let i=0; i< this.betTwoDList.length; i++){     
        if(this.betTwoDList[i].number == this.betAddNumber ){
          this.toastr.warning("", this.translateService.instant('already_added'), {
                timeOut: 1000,
                positionClass: 'toast-top-center',
                });
        }
        if(this.betTwoDList[i].number != this.betAddNumber){
             ++count;
        }
      }
      if(this.betTwoDList.length == count)
      {
       
        if(this.betAddNumber !=null && this.betAddAmount !=null)
        {
          if(this.dreamBook){
            let twinNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
            if(twinNumbers.includes(this.betAddNumber.toString())){
             
              let olddata={ "id": "", "number": this.betAddNumber.toString(),
                "selected":true, "unbetstatus":false, "amount": this.betAddAmount, "checked": false, "isR": false };
                this.betTwoDList.push(olddata); 
            }
            if(!this.betTwoDList.find(x=>x.number == this.betAddNumber.toString())){             
              let reverseNum= this.betAddNumber.toString().split('').reverse().join('');   
              if(this.betTwoDList.find(x=>x.number == reverseNum)){
                let olddata={ "id": "", "number": this.betAddNumber.toString(),
                "selected":true, "unbetstatus":false, "amount": this.betAddAmount, "checked": false, "isR": false };
                this.betTwoDList.find(x=>x.number == reverseNum).isR =false;
                this.betTwoDList.push(olddata);                 
              }  
              else{
                let olddata={ "id": "", "number": this.betAddNumber.toString(),
                "selected":true, "unbetstatus":false, "amount": this.betAddAmount, "checked": false, "isR": true };                
                this.betTwoDList.push(olddata);                 
              }      
             
            } 
            if(!twinNumbers.includes(this.betAddNumber.toString()) && !this.betTwoDList.find(x=>x.number == this.betAddNumber.toString()) ){
           
              let olddata={ "id": "", "number": this.betAddNumber.toString(),
              "selected":true, "unbetstatus":false, "amount": this.betAddAmount, "checked": false, "isR": true };              
              this.betTwoDList.push(olddata); 
            }          
                       
          }
          else{
            var newNumber={number: this.betAddNumber, selected: true, betLimitColor: '', unbetstatus: false, amount: this.betAddAmount};
            this.betTwoDList.push(newNumber); 
          }
              
         this.twodBetAdd.hide();
         /*XXXX*/
         this.totalBetAmount();
         await this.getUnBetListNew(); 
        }
      }   
    }  
    else{     
      this.betTwoDList=[];     
      if(this.betAddNumber !=null && this.betAddAmount !=null)
        {
          let twinNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];         
          if(this.dreamBook){
            if(!twinNumbers.includes(this.betAddNumber.toString())){              
              let olddata={ "id": "", "number": this.betAddNumber.toString(),
              "selected":true, "unbetstatus":false, "amount": this.betAddAmount, "checked": false, "isR": true };
              this.betTwoDList.push(olddata);              
            }
            else{             
              let olddata={ "id": "", "number": this.betAddNumber.toString(),
              "selected":true, "unbetstatus":false, "amount": this.betAddAmount, "checked": false, "isR": false };
              this.betTwoDList.push(olddata); 
              
            }           
          }         
          else{          
            var newNumber={number: this.betAddNumber, selected: true, betLimitColor: '', unbetstatus: false, amount: this.betAddAmount};
            this.betTwoDList.push(newNumber);  
          }            
         this.twodBetAdd.hide();
         /*XXXX*/
         this.totalBetAmount();
        //await this.getUnBetListNew(); 
        this.storage.clear('localNewBetTwodNumber'); 
        this.storage.store('localNewBetTwodNumber',this.betTwoDList);     
         
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
  twodBetDelete(number: number){  

    if(!this.dreamBook){
      this.betTwoDList.splice(this.betTwoDList.findIndex(x=>x.number === number),1);     
    }
    else{
      let newArr=[];
      let twinNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
      let isR = this.betTwoDList.find(x=> x.number == number).isR;
      if(isR){
        this.betTwoDList.splice(this.betTwoDList.findIndex(x=>x.number === number),1);     
      }
      if(!isR && twinNumbers.includes(number.toString())){
        this.betTwoDList.splice(this.betTwoDList.findIndex(x=>x.number === number),1);   
      }
      else{    
       
        for(let j=0; j<this.betTwoDList.length; j++){
          if(this.betTwoDList[j].isR){
            newArr.push(this.betTwoDList[j]);
          }
          if(!this.betTwoDList[j].isR && this.betTwoDList[j].number != number){            
            let newNum= number.toString().split('').reverse().join('');    
            if(newNum== this.betTwoDList[j].number){             
              let olddata= { "id": this.betTwoDList[j].id, "number": this.betTwoDList[j].number,
              "selected":true, "unbetstatus":false, "amount": this.betTwoDList[j].amount, "checked": false, "isR": true };
              newArr.push(olddata);
            }
            else{              
              newArr.push(this.betTwoDList[j]);
            }            
          }         
        }
        this.betTwoDList= newArr;
       
      }     
    }
    this.totalBetAmount();
  }
 

  getBalance(){    
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
  checkBetAmount(){
    if(this.modalService.config.initialState.amount == '' || this.modalService.config.initialState.amount == null || this.modalService.config.initialState.amount == undefined) 
    {
     var checkamont= this.translateService.instant("requiredFiled");
     checkamont=checkamont.toString().replace("@value", this.translateService.instant('amount'));
      $("#betAmountErr").html(checkamont);
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
  async twodBetModal(number: number, amount: number){
    let vv=this.checkBetAmount();
    if(!vv){
      return;
    }
   
    this.localUnBetLimitList= await this.getUnBetList();
    if(this.localUnBetLimitList == ""  || !this.localUnBetLimitList.find(x=>x.number == number)){
      this.betTwoDList.find(x=>x.number == number).amount =amount;
      this.totalBetAmount(); 
      this.twodBetEdit.hide();
    }
   
    if(this.localUnBetLimitList != "" || this.localUnBetLimitList !=null){
      for(let i=0; i< this.localUnBetLimitList.length; i++){
        if(number == this.localUnBetLimitList[i].number){
          if(amount <= this.localUnBetLimitList[i].amount ){
           
            this.betTwoDList.find(x=>x.number == number).unbetstatus= false;
            this.betTwoDList.find(x=>x.number == number).amount =amount;
            this.totalBetAmount();
            await this.getUnBetList();   
            this.twodBetEdit.hide();                  
            break;
          }
          if(amount > this.localUnBetLimitList[i].amount ){
           
            this.betTwoDList.find(x=>x.number == number).unbetstatus= true;
            this.betTwoDList.find(x=>x.number == number).amount =amount;  
            this.totalBetAmount(); 
            await this.getUnBetList(); 
            this.twodBetEdit.hide();
           
            break;      
          }
         
        }
       
      }
    }
   
  }
  twodBetModalDelete(){   
    this.twodBetEdit.hide();
  }
 
  betFinalConfirm(){  
    if(this.common.betLoading !=null && this.common.betLoading == true){
      return;
    }
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);    
    
    this.common.betLoading= true;   
    this.spinner.show("betLoading"); 

    var sectionName = this.storage.retrieve('localSection').sectionName;//this.storage.retrieve('localSectionName');   
    let params = new HttpParams();
    params = params.set('sectionName', sectionName);  
    
      this.http.get(this.funct.ipaddress+'odd/getTwoDOdd', { params: params,headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,''))
     )
      .subscribe(
        result => {
          this.common.betLoading= false;   
          this.spinner.hide("betLoading");
          this.dto.Response = result;
          this.storage.store('localOddNumber',this.dto.Response);
          this.storage.store('localBetFinalNumber',this.betTwoDList);
          
          this.router.navigate(['/twod/bet-final-confirm'], {state: {betTwoDList: this.betTwoDList,oddModel: this.dto.Response}, replaceUrl: false} );
        }
      );
  }
 
   async twodBetUnBetListModal(twodBetUnBetList: TemplateRef<any>) { 
   
    let login= this.storage.retrieve('isUserLoggedIn'); 
    if(!login){
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
      return;
    }
    
    /*XXX*/
    this.localUnBetLimitList= await this.getUnBetListNew(); 
    if(this.localUnBetLimitList==undefined)
    {
      this.toastr.error("", this.translateService.instant("select_numbers"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    
    if (this.localUnBetLimitList.status === 'Error' && this.localUnBetLimitList.message === 'too many request') {
      this.toastr.error("", this.translateService.instant("submitting-request-time"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
    }
    if(this.localUnBetLimitList == 'low_balance'){            
      this.toastr.error("", this.translateService.instant("game_low_balance"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }      
    /*XXX*/
    if(this.localUnBetLimitList =="Holiday"){
      this.toastr.error("", this.localUnBetLimitList, {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
       return;
    } 
    if(this.localUnBetLimitList == 400)
    {
      this.toastr.error("", "Invalid Bet Amount", {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
      return;
    }
   /*XXXX*/
    if(this.localUnBetLimitList == "")
    {    
     
      this.betFinalConfirm();
      return;
    }
    
    if(this.localUnBetLimitList!= null || this.localUnBetLimitList != undefined || this.localUnBetLimitList != "")
    {  
       if(this.localUnBetLimitList==undefined && this.betTwoDList.length==0)   
       {
        this.toastr.error("", this.translateService.instant("select_numbers"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
       }
     
      for(let j=0; j< this.betTwoDList.length; j++){      
        this.localUnBetLimitList.forEach(e => {
          if( e.number == this.betTwoDList[j].number){
           this.betTwoDList[j].unbetstatus= true;      
          }
         }); 
      }  
      const unBetLimitListModal = {
        unBetLimitList : this.localUnBetLimitList,    
      };     
      this.twodBetUnBetList = this.modalService.show(twodBetUnBetList, {
        initialState : unBetLimitListModal,
        class: "twodBetUnBetList-class modal-sm"
      });
    }
   
    
   
 }

 unBetLimitListModalDelete(){  
  this.twodBetUnBetList.hide();
  
}
 
/*XXX- MH*/
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
this.doBetModel.twodbetDetailList= this.newBetTwoDList;  
this.doBetModel.sectionId=this.storage.retrieve('localSectionId');


let response = await axios.post(this.funct.ipaddress + 'twodbet/Check2dBetLimitFourSection',this.doBetModel, {headers: {'Authorization': this.token}})
    .then((response) => { 
      
      return response.data;
    })
    .catch((error) => { 
      if(error.response != undefined){
        if(error.response.status == 406){
          return error.response.data.message;   
        } 
        // if(error.response.status==509)   
        // {
        //   return:
        // }
        else{
          return error.response.data.message;
        }
      }
      else{
        return error.response;
      }      
    });
  return response;
} 

async twodBetModalNew(number: number, amount: number)
{
  let vv=this.checkBetAmount();
  if(!vv){
    return;
    }
   if(this.betTwoDList != null || this.betTwoDList != undefined || this.betTwoDList != "")
   {
       this.betTwoDList.find(x=>x.number == number).amount = amount;
       this.totalBetAmount();
       this.twodBetEdit.hide();
       this.localUnBetLimitList = await this.getUnBetListNew();
   }

   if(this.localUnBetLimitList == 400)
    {
        this.toastr.error("", 'Invalid Bet Amount', {
          timeOut: 1000,
          positionClass: 'toast-top-center',
          });
        return;
    }
    /*May be total error*/
    // if(this.localUnBetLimitList == null || this.localUnBetLimitList == undefined || this.localUnBetLimitList =="" )
    // {
    //   this.betTwoDList.find(x=>x.number == number).unbetstatus= false;
    //   this.totalBetAmount();
    //   await this.getUnBetListNew();
    //   this.twodBetEdit.hide();
    //   return;
    // }    
    if(this.localUnBetLimitList !=null || this.localUnBetLimitList != undefined || this.localUnBetLimitList != "" )
    {
      for(let i=0; i< this.localUnBetLimitList.length; i++)
      {
        if(number == this.localUnBetLimitList[i].number)
        {
          if(amount <= this.localUnBetLimitList[i].amount )
          {
            this.betTwoDList.find(x=>x.number == number).unbetstatus= false;
            this.betTwoDList.find(x=>x.number == number).amount =amount;
            this.totalBetAmount();
          //  await this.getUnBetListNew();   
            this.twodBetEdit.hide();  
            break;
          }
          if(amount > this.localUnBetLimitList[i].amount )
          {
            this.betTwoDList.find(x=>x.number == number).unbetstatus= true;
            this.betTwoDList.find(x=>x.number == number).amount =amount;  
            this.totalBetAmount(); 
          //  await this.getUnBetListNew(); 
            this.twodBetEdit.hide();
            break;      
          }
        }
        else
        {
          this.betTwoDList.find(x=>x.number == number).unbetstatus= false;
          this.totalBetAmount();
         // await this.getUnBetListNew();   
          this.twodBetEdit.hide();
        }
      }
    }
}
/*The below is old*/
  async getUnBetList(){  
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
  this.doBetModel.twodbetDetailList= this.newBetTwoDList;  
  this.doBetModel.sectionId=this.storage.retrieve('localSectionId');
  var response = await axios.post(this.funct.ipaddress + 'twodbet/Check2dBetLimitFourSection',this.doBetModel, {headers: {'Authorization': this.token}})
  return response.data;  
  } 
  goBack(){
     this._location.back();
  }

   getCurrentDate() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };

    if (now.getHours() > 16 || (now.getHours() === 16 && now.getMinutes() > 30)) {
      now.setDate(now.getDate() + 1);
    }
    this.currentDate= now.toLocaleDateString('en-US', options); 
  }


  
}
