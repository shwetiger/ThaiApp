import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse,HttpParams} from '@angular/common/http';
import { catchError, count, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { CommonService } from 'src/app/shared/service/common.service';

@Component({
  selector: 'app-dream-book-page',
  templateUrl: './dream-book-page.component.html',
  styleUrls: ['./dream-book-page.component.scss']
})
export class DreamBookPageComponent implements OnInit {
  bsModalRef: BsModalRef;
  modalRef: BsModalRef;  
  dreamBookList:any;
  addList:any;
  isLast:boolean=false;
  token:any;
  searchKey:" ";
  pageNumber:any;
  rowsOfPage:any;
  count:number = 0;
  loadingMore: any;
  loading: any;
  cannotSmallThan: any;
  amount: any;
  selectdreambookList: Array<{number:string,isUse: boolean}>=[];
  newBetThreedNumber=[];
  threedCloseTime: any;
  dreambookSearchKey: any='';
  constructor(
    private translateService: TranslateService, 
    private modalService: BsModalService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private funct: FunctService,
    private toastr: ToastrService, 
    private dto: DtoService,
    private router: Router,
    private storage: LocalStorageService,
    public common: CommonService) { 
    
    }

  ngOnInit(): void {  
    this.pageNumber=0;
    this.rowsOfPage=200;
    this.getDreamBookList(0);
    this.addList =[]?[]: JSON.parse(localStorage.getItem('dreamBooks'));
  }

  translate(key: string): string {
    return this.translateService.instant(key)// retrieves the translation for the given key
  }
  public twodClose(data: any) {
    this.threedCloseTime=data;
   
  }
  dreamCountModal(dreamCount: TemplateRef<any>) {
 
    if(this.count== 1){
      
      this.roundNumber();
    }else{
      this.selectdreambookList=[];
      this.getDreamListSelected();
    }
    const countModal = {
      list : this.selectdreambookList,
      amount: ''
    };     
    this.modalRef = this.modalService.show(dreamCount, {
      initialState : countModal,
      class: "dreamCount-class modal-sm"
    });
  }
  dreamListSelected(dreamNumber: number,isUse: boolean) {    
   
    for(let n=0; n< this.selectdreambookList.length; n++){
      if(this.selectdreambookList[n].number.toString() == dreamNumber.toString())      
      {
        this.selectdreambookList[n].isUse= isUse;
      }    
    }
    
  }

  getDreamListSelected(){
    for(let i=0; i<this.addList.length;i++){
      if(this.addList[i].isSelected1){
        if(this.selectdreambookList.find(x=>x.number == this.addList[i].number1)){
         
        }
        else{         
          this.selectdreambookList.push({number: this.addList[i].number1,isUse: true})
        }
        
      }
      if(this.addList[i].isSelected2){
        if(this.selectdreambookList.find(x=>x.number == this.addList[i].number2)){
        
        }
        else{
          this.selectdreambookList.push({number: this.addList[i].number2,isUse: true})
        }
        //this.selectdreambookList.push({number: this.addList[i].number2,isUse: true})
      }
    }
  }
  roundNumber(){
    var num1;
    for(let i=0; i<this.addList.length;i++){
      if(this.addList[i].isSelected1){
        num1=this.addList[i].number1;
      }
      if(this.addList[i].isSelected2){
        num1=this.addList[i].number2;
       
      }
    }
    if(this.selectdreambookList.find(x=>x.number == num1)){
      num1=null;
    }
    try{
      if(num1 !=null)
      { 
       
        var splitted = (""+num1).split("");   
        if(splitted.length == 3)
        {
  
         var indexValue= this.selectdreambookList.indexOf(num1);
         if(indexValue < 0 )
         {
          // let a = ["1", "1", "2", "3", "3", "1"];
          let unique = splitted.filter((item, i, ar) => ar.indexOf(item) === i);
          if(unique.length == 1)
          { 
            this.selectdreambookList.push({number:num1,isUse: true}); 
          } 
          else 
          {
            let shuff1 = splitted[0]+splitted[1]+splitted[2]; 
            if(this.selectdreambookList.filter(f=>f.number === shuff1).length == 0)
            { 
              this.selectdreambookList.push({number:shuff1,isUse:true}); 
            }
            let shuff2 = splitted[0]+splitted[2]+splitted[1]; 
            if(this.selectdreambookList.filter(f=>f.number === shuff2).length  == 0)
            {
              this.selectdreambookList.push({number:shuff2,isUse:true}); 
            }
            let shuff3 = splitted[1]+splitted[0]+splitted[2]; 
            if(this.selectdreambookList.filter(f=>f.number === shuff3).length  == 0)
            {
              this.selectdreambookList.push({number:shuff3,isUse:true}); 
            }
            let shuff4 = splitted[1]+splitted[2]+splitted[0]; 
            if(this.selectdreambookList.filter(f=>f.number === shuff4).length  == 0)
            {
              this.selectdreambookList.push({number:shuff4,isUse: true}); 
            }
            let shuff5 =splitted[2]+splitted[0]+splitted[1]; 
            if(this.selectdreambookList.filter(f=>f.number === shuff5).length  == 0)
            {
              this.selectdreambookList.push({number:shuff5,isUse:true}); 
            }
            let shuff6 = splitted[2]+splitted[1]+splitted[0]; 
            if(this.selectdreambookList.filter(f=>f.number === shuff6).length == 0)
            {
              this.selectdreambookList.push({number:shuff6,isUse:true});  
            } 
          } 
         
         }  
        }  
      }
    }
    catch(Error)
    {
      
    } 
  }  
  checkBetAmount(){    
    if(this.amount == '' || this.amount == null || this.amount == undefined) 
    {
      var amountRequired = this.translateService.instant("requiredFiled");
      amountRequired=amountRequired.toString().replace("@value",  this.translateService.instant('amount'));
      $("#betAmountErr").html(amountRequired);
      return false;
    }   
    if(this.amount >= 100) 
    {
      $("#betAmountErr").html("")
      return true;
  
    }
    if(this.amount < 100) {
     this.cannotSmallThan = this.translateService.instant("cannotSmallThan");
     this.cannotSmallThan = this.translateService.instant('amount')+":"+this.cannotSmallThan.toString().replace("@value", '100');
      $("#betAmountErr").html(this.cannotSmallThan);
      return false;
    }
  
  }

  checkBetNumber() {
    if (this.count == 0) {
      this.common.errorMsg('select_numbers', 'top');
      return false;
    }
    return true;
  } 
  checkCountAmount(){    
    if(this.modalService.config.initialState.amount == '' || this.modalService.config.initialState.amount == null || this.modalService.config.initialState.amount == undefined) 
    {
      var countamountRequired = this.translateService.instant("requiredFiled");
      countamountRequired=countamountRequired.toString().replace("@value",  this.translateService.instant('amount'));
      $("#countAmountErr").html(countamountRequired);
      return false;
    }   
    if(this.modalService.config.initialState.amount >= 100) 
    {
      $("#countAmountErr").html("")
      return true;
  
    }
    if(this.modalService.config.initialState.amount < 100) {
     this.cannotSmallThan = this.translateService.instant("cannotSmallThan");
     this.cannotSmallThan = this.translateService.instant('amount')+":"+this.cannotSmallThan.toString().replace("@value", '100');
      $("#countAmountErr").html(this.cannotSmallThan);
      return false;
    }
  
  }
  dreamCountBet(){ 
    let amountCheck = this.checkCountAmount();   
    
    if (amountCheck==false) {
      return;
    }
    this.newBetThreedNumber=[]; 
    let c=0;
    for(let l=0; l<this.selectdreambookList.length; l++){
      if(this.selectdreambookList[l].isUse == true){
        this.newBetThreedNumber[c]={"number": this.selectdreambookList[l].number,
        "selected":true,"unbetstatus":false,"amount":this.modalService.config.initialState.amount};
        ++c;
      } 
     
    }

    this.modalRef.hide();
    this.storage.store('localNewDreamBookNumber',this.newBetThreedNumber);
    this.storage.store('threedRoot',"/dream-book");
    this.storage.store('localThreedDPage', 'dreamBook');
    this.router.navigate(['/threed/bet-confirm'], {state: {betThreeDList:  this.newBetThreedNumber},replaceUrl:false} );

  }
  dreamCountCancel(){
    this.modalRef.hide();
    for(let m=0; m< this.selectdreambookList.length; m++){
      if(!this.selectdreambookList[m].isUse)      
      {
        if(this.addList.find(x=>x.number1 == this.selectdreambookList[m].number))
        {
          for(let i=0; i<this.addList.length;i++){
            if(this.addList[i].number1 == this.selectdreambookList[m].number){
              this.addList[i].isSelected1=false;
            }           
          }
          --this.count;
        }
        if(this.addList.find(x=>x.number2 == this.selectdreambookList[m].number))
        {
          for(let i=0; i<this.addList.length;i++){
            if(this.addList[i].number2 == this.selectdreambookList[m].number){
              this.addList[i].isSelected2=false;
            }
           
          }
          --this.count;
        }
        else{
          this.selectdreambookList=[];
        }
      }    
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
    if(error.status == 400)
    {
       this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    return throwError(error);
  }

  dreambookSelected(num: number,isSelected: boolean) {
    for(let k=0; k<this.addList.length; k++){
      if(this.addList[k].number1 == num){
        this.addList[k].isSelected1= isSelected;
        if(isSelected == true){
          ++this.count;
        }
        else{
          --this.count;
        }
      }
      if(this.addList[k].number2 == num){
        this.addList[k].isSelected2 = isSelected;
        if(isSelected == true){
          ++this.count;
        }
        else{
          --this.count;
        }
      }
    }
  }

  getDreamBookList(pageNumber){
    this.loadingMore= false;
    this.loading= true;
    this.spinner.show();
    this.addList= this.storage.retrieve('localdreambookList');
    if(this.addList == null){
      this.addList= [];
    } 

    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    let params = new HttpParams();
    this.pageNumber=pageNumber + 1;
    params = params.set('searchKey', this.searchKey).set('pageNumber',this.pageNumber).set('rowsOfPage', this.rowsOfPage);
      this.http.get( this.funct.ipaddress+'dreamBook/getDreamBookList', { params: params,headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
     )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.dreamBookList = result.results;

          for(let j=0; j<this.dreamBookList.length; j++){
            this.dreamBookList[j].isSelected1=false;
            this.dreamBookList[j].isSelected2=false;
          }
          for(let i=0; i<this.dreamBookList.length; i++){
            this.dreamBookList[i].isSelected1= false; 
            this.dreamBookList[i].isSelected2= false; 
          }
          this.addList = [...this.addList, ...this.dreamBookList];
          if(this.addList.length>=result.totalRows){
            this.isLast=true;
          };
          pageNumber = result.results.pageNumber; 
          this.loading= false;
          this.loadingMore= true;
          localStorage.setItem('dreamBooks', JSON.stringify(this.addList));
         if(this.storage.retrieve('localNewDreamBookNumber') !=null){
           var localbet=this.storage.retrieve('localNewDreamBookNumber');
           for(let k=0; k<localbet.length; k++){
             if(this.addList.find(x=>x.number1 == localbet[k].number)){
              this.addList.find(x=>x.number1 == localbet[k].number).isSelected1=true;
             }
             if(this.addList.find(x=>x.number2 == localbet[k].number)){
              this.addList.find(x=>x.number2 == localbet[k].number).isSelected2=true;
             } 
           }          
           this.count=this.storage.retrieve('localNewDreamBookNumber').length;
         }

          this.storage.store('localdreambookList',this.addList);
        }
      );
    
  }
  threedBetDreamClean(){
    this.count=0;
    for(let i=0; i<this.addList.length;i++){
      this.addList[i].isSelected1=false;
      this.addList[i].isSelected2=false;
    }
  }
  threedBetDream(){
    this.addList = this.storage.retrieve('localdreambookList');

    let checkAmount = this.checkBetAmount();
    let checkNumber = this.checkBetNumber();

    if (!checkAmount || !checkNumber) {
      return;
    }
    let c=0;
    for(let k=0; k<this.addList.length; k++){
      if(this.addList[k].isSelected1){
        this.newBetThreedNumber[c]={"number": this.addList[k].number1,
        "selected":true,"unbetstatus":false,"amount":this.amount};
        ++c;
      }
      if(this.addList[k].isSelected2){
        this.newBetThreedNumber[c]={"number": this.addList[k].number2,
        "selected":true,"unbetstatus":false,"amount":this.amount};
        ++c;
      }
      
    }
    if(this.threedCloseTime){
      this.toastr.error('', this.translateService.instant('threeDbet_time_close'), {
        positionClass: 'toast-top-center',
        timeOut: 1000,
      });
      return;
    }
    if (this.newBetThreedNumber.length > 0) {
      this.storage.store('localNewDreamBookNumber',this.newBetThreedNumber);   
      this.storage.store('threedRoot',"/dream-book");
      this.storage.store('localThreedDPage', 'dreamBook');
      this.router.navigate(['/threed/bet-confirm'], {state: {betThreeDList:  this.newBetThreedNumber},replaceUrl:false} );
    } else {
      return;
    }
  }
  refreshPage(){

    this.spinner.show("refreshLoading");
    this.count=0;
    this.addList=[];
    this.ngOnInit();

    setTimeout(() =>
    {
      this.spinner.hide("refreshLoading");
    }, 1000);

  }
  enter(event)
  {
    event.target.blur();
  }

  search() {
    this.addList=[];
    if(this.dreambookSearchKey == null ||this.dreambookSearchKey.length == 0){
      this.addList= this.storage.retrieve('localdreambookList');
      return;
    }
   var newaddList =this.storage.retrieve('localdreambookList');   
   newaddList.forEach(element => {
     
      if(element.description_en.includes(this.dreambookSearchKey)
      || (element.number1.includes(this.dreambookSearchKey))
      || (element.number2.includes(this.dreambookSearchKey))
      || (element.description_en.toLowerCase().includes(this.dreambookSearchKey.toLowerCase()))){
        this.addList.push(element);
      }
      else if(element.description_my.includes(this.dreambookSearchKey)
      || (element.number1.includes(this.dreambookSearchKey))
      || (element.number2.includes(this.dreambookSearchKey))){
        this.addList.push(element);
      }
      else if (element.description_th.includes(this.dreambookSearchKey)
      || (element.number1.includes(this.dreambookSearchKey))
      || (element.number2.includes(this.dreambookSearchKey))){
        this.addList.push(element);
      }
      else if(element.description_zh.includes( this.dreambookSearchKey)
      || (element.number1.includes(this.dreambookSearchKey))
      || (element.number2.includes(this.dreambookSearchKey))){
        this.addList.push(element);
      }
    });
  }

  changeLanguage(data: any) {
    let language = this.storage.retrieve('localLanguage');
    if (language == "my") {
      return data.description_my != null ? data.description_my : data.name;
    } else if (language == "th") {
      return data.description_th != null ? data.description_th : data.name;
    } else if (language == "zh") {
      return data.description_zh != null ? data.description_zh : data.name;
    } else {
      return data.description_en;
    }
  }
}
