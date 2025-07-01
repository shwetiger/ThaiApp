import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse,HttpParams} from '@angular/common/http';
import { catchError} from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { TwodCloseTimeComponent } from 'src/app/shared/components/twod-close-time/twod-close-time.component';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { CommonService } from 'src/app/shared/service/common.service';


@Component({
  selector: 'app-twod-dream-book',
  templateUrl: './twod-dream-book.component.html',
  styleUrls: ['./twod-dream-book.component.scss']
})
  
export class TwodDreamBookComponent implements OnInit {

  @ViewChild(TwodCloseTimeComponent) child:TwodCloseTimeComponent;

  bsModalRef: BsModalRef;
  modalRef: BsModalRef;  

  token: any;

  dreamBookList: Array<any> = [];
  addList: any;

  pageNumber: any;
  rowsOfPage: any;
  loadingMore: any;
  searchKey: any = "";  
  count: number = 0;

  cannotSmallThan: any;
  amount: any;
  selectdreambookList: Array<{id: number, number:string,isUse: boolean}>=[];
  newBetTwodNumber = [];
  twodCloseTime: any;
  sectionId: any;
  isUserLoggedIn: boolean = false;
  betSelectedCount: number=0;
  ReverseId: number=0;

  isNewDreamBook: any=[];
  
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
      this.storage.clear('localNewBetTwodNumber');
      this.sectionId = this.storage.retrieve("localSectionId");
      this.isUserLoggedIn = this.storage.retrieve('isUserLoggedIn');
    }

  ngOnInit(): void {  
    this.pageNumber = 0;
    this.rowsOfPage = 200;
    this.getDreamBookList(0);
    this.addList = [] ? [] : this.storage.retrieve('localTwodDreamBookList');
  }

  public twoDClose(data: any) {
    this.twodCloseTime = data;
  }

  changeLanguage(data: any) {
    let language = this.storage.retrieve('localLanguage');
    if (language == "my" || language == 'my_zawgyi') {
      return data.description_my != null ? data.description_my : data.name;
    } else if (language == "th") {
      return data.description_zh != null ? data.description_zh : data.name;
    } else if (language == "zh") {
      return data.description_zh != null ? data.description_zh : data.name;
    } else {
      return data.description_en;
    }
  }

  getDreamBookList(pageNumber) {    
    this.loadingMore = false;
    this.spinner.show("apiLoading");

    this.addList = this.storage.retrieve('localTwodDreamBookList');
   
    if(this.addList == null){
      this.addList = [];
    } 

    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);

    let params = new HttpParams();
    this.pageNumber = pageNumber + 1;
    params = params.set('searchKey', this.searchKey).set('pageNumber',this.pageNumber).set('rowsOfPage', this.rowsOfPage);
    
    this.http.get(this.funct.ipaddress + 'dreamBook/get2dDreamBookList', { params: params, headers: headers })
    .pipe(
      catchError(this.handleError.bind(this))
    )
    .subscribe(
        result => {
          this.dto.Response = result;
          this.dreamBookList = result.results;        
          this.dreamBookList.map((elem) => {
            elem.isSelected1 = false;
            elem.isSelected2 = false;
            elem.isR1 = false;
            elem.isR2 = false;
         
          });
          this.addList = [...this.addList, ...this.dreamBookList];
          if (this.addList.length < result.totalRows) {
            this.loadingMore = true;
          }
        this.pageNumber = this.dto.Response.pageNumber;
        this.betNumberReselected();
        
        this.storage.store("localTwodDreamBookList", this.addList);
        this.spinner.hide("apiLoading");

    });
    
  }

  search() {

    this.addList = [];

    if(this.searchKey == null ||this.searchKey.length == 0){
      this.addList = this.storage.retrieve('localTwodDreamBookList');
      return;
    }

    var newaddList = this.storage.retrieve('localTwodDreamBookList');  
    newaddList.forEach(elem => {
      if (elem.description_en && elem.description_en.includes(this.searchKey)) {
        this.addList.push(elem);
      }
      else if (elem.description_my && elem.description_my.includes(this.searchKey)) {
        this.addList.push(elem);
      }
      else if (elem.description_th && elem.description_th.includes(this.searchKey)) {
        this.addList.push(elem);
      }
      else if (elem.description_zh && elem.description_zh.includes(this.searchKey)) {
        this.addList.push(elem);
      }
      else if (elem.number1 && elem.number1.includes(this.searchKey)) {
        this.addList.push(elem);
      }
      else if (elem.number2 && elem.number2.includes(this.searchKey)) {
        this.addList.push(elem);
      }
    });
    
  }

  betNumberSelected(id: number, num: number, isSelected: boolean) {
      if(this.addList.find(x=> x.id != id && x.number1 == num && x.isSelected1) || this.addList.find(x=> x.id != id && x.number2 == num && x.isSelected2)) {
        this.common.errorMsg('already_added', 'top');
        return;
      }  
      if(this.addList.find(x=> x.id == id && x.number1 == num)) {
        this.addList.find(x => x.id == id && x.number1 == num).isSelected1 = isSelected;              
        if (isSelected) ++this.count;
        else  --this.count;
        this.betSelectedCount= this.count;
        return;    
      }  
      if(this.addList.find(x=> x.id == id && x.number2 == num)) {
        this.addList.find(x => x.id == id && x.number2 == num).isSelected2 = isSelected;      
        if (isSelected) ++this.count;
        else  --this.count;
        this.betSelectedCount= this.count;         
        return;
      }
  }
  checkReverseNumber(isSelected,num){
    
    if(isSelected && this.count == 1){
      let count=0;       
      var num2= num.toString().split('').reverse().join('');      
      for(let i=0;i<this.addList.length; i++){
        if (this.addList[i].number1 == num2) {
          this.addList[i].isSelected1 = true;
          this.betSelectedCount= count+2;     
          this.ReverseId=this.addList[i].id;
          return;
        }  
        if(this.addList[i].number2 == num2) {            
          this.addList[i].isSelected2 = true;            
          this.betSelectedCount= count+2;     
          this.ReverseId=this.addList[i].id;
          return;
        }
      }
    }    
    if(this.ReverseId !=0){          
      if(this.addList.find(x=> x.id == this.ReverseId)) {
        this.addList.find(x => x.id == this.ReverseId).isSelected1 = false;              
        this.ReverseId=0;     
        return;   
      }  
      if(this.addList.find(x=> x.id == this.ReverseId)) {
        this.addList.find(x => x.id == this.ReverseId).isSelected2 = false; 
        this.ReverseId=0;     
        return;          
      } 
    }
    if(!isSelected && this.count == 1){   
      for(let i=0;i< this.addList.length; i++){
        if(this.addList[i].isSelected1) {          
          var num2= this.addList[i].number1.toString().split('').reverse().join('');      
          for(let j=0;j<this.addList.length; j++){
            if (this.addList[j].number1 == num2) {
              this.addList[j].isSelected1 = true;
              this.betSelectedCount= this.count +1;     
              this.ReverseId=this.addList[j].id;
              return;
            }  
            if (this.addList[j].number2 == num2) {
              this.addList[j].isSelected2 = true;
              this.betSelectedCount= this.count +1;     
              this.ReverseId=this.addList[j].id;
              return;
            }
          }
        } 
        if (this.addList[i].isSelected2) {          
          var num2= this.addList[i].number2.toString().split('').reverse().join('');      
          for(let j=0;j<this.addList.length; j++){
            if(this.addList[j].number1 == num2) {
              this.addList[j].isSelected1 = true;
              this.betSelectedCount= this.count +1;     
              this.ReverseId=this.addList[j].id;
              return;
            }  
            if(this.addList[j].number2 == num2) {
              this.addList[j].isSelected2 = true;
              this.betSelectedCount= this.count +1;     
              this.ReverseId=this.addList[j].id;
              return;
            }
          }
        }          
      }
    }   
  }

 
  betNumberReselected() {
    if (this.storage.retrieve('localNewTwodDreamBookNumber') != null) {

      let localbet = this.storage.retrieve('localNewTwodDreamBookNumber');
      let count = 0;
      let newTwodDreamBookNumber = [];

      for(let k=0; k<localbet.length; k++){
        if (this.addList.find(x=> localbet[k].id != null && x.id == localbet[k].id && x.number1 == localbet[k].number)) {
          this.addList.find(x=> x.id == localbet[k].id != null && localbet[k].id && x.number1 == localbet[k].number).isSelected1 = true;
          newTwodDreamBookNumber[count]={"id": this.addList[k].id,"number": this.addList[k].number1,
          "selected":true,"unbetstatus":false,"amount":this.amount,"checked": false};
          count++;
        }
        if (this.addList.find(x=> localbet[k].id != null && x.id == localbet[k].id && x.number2 == localbet[k].number)) {
          this.addList.find(x=> x.id == localbet[k].id && x.number2 == localbet[k].number).isSelected2 = true;
          newTwodDreamBookNumber[count]={"id": this.addList[k].id, "number": this.addList[k].number2,
          "selected":true,"unbetstatus":false,"amount":this.amount,"checked": false};
          count++;
        }
      }
      this.count = count;
      this.betSelectedCount=this.count;
      this.storage.store('localNewTwodDreamBookNumber', newTwodDreamBookNumber);
      //console.warn("localNewTwodDreamBookNumber", this.storage.retrieve("localNewTwodDreamBookNumber"));
    }
  }

  twodBetDreamClean(){
    this.isNewDreamBook=[];
    this.betSelectedCount=0;
    this.count = 0;
    this.addList.map((elem) => {
      elem.isSelected1 = false;
      elem.isSelected2 = false;  
      elem.isR1 = false;
      elem.isR2 = false;  
    });
    this.storage.clear('localNewTwodDreamBookNumber');
  }

  twodBetDream() {

    if (!this.isUserLoggedIn) {
      this.common.errorMsg('youNeedLogin', 'top');
      return;
    }

    let checkAmount = this.checkBetAmount();
    let checkNumber = this.checkBetNumber();

    if (!checkAmount || !checkNumber) {
      return;
    }

    this.addList = this.storage.retrieve('localTwodDreamBookList');

    let c=0;
    let twinNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
    for (let k=0; k < this.addList.length; k++) {
      if (this.addList[k].isSelected1) {
        if(!twinNumbers.includes(this.addList[k].number1)){
          this.newBetTwodNumber[c]={ "id": this.addList[k].id,"number": this.addList[k].number1,
        "selected":true,"unbetstatus":false,"amount":this.amount,"checked": false, "isR": true};
        ++c;
        }else{
          this.newBetTwodNumber[c]={ "id": this.addList[k].id,"number": this.addList[k].number1,
          "selected":true,"unbetstatus":false,"amount":this.amount,"checked": false, "isR": false};
          ++c;
        }       
      }
      if (this.addList[k].isSelected2) {
        if(!twinNumbers.includes(this.addList[k].number2)){
          this.newBetTwodNumber[c]={ "id": this.addList[k].id, "number": this.addList[k].number2,
          "selected":true,"unbetstatus":false,"amount":this.amount,"checked": false,"isR": true};
          ++c;
        }
        else{
          this.newBetTwodNumber[c]={ "id": this.addList[k].id, "number": this.addList[k].number2,
          "selected":true,"unbetstatus":false,"amount":this.amount,"checked": false,"isR": false};
          ++c;
        }        
      }
    }

    if (this.newBetTwodNumber.length > 0) {
      this.storage.store('localNewTwodDreamBookNumber', this.newBetTwodNumber);  
      this.router.navigate(['/twod/bet-confirm'], { replaceUrl: false });
    }
  }

  checkBetAmount() {    
    if (this.amount == '' || this.amount == null || this.amount == undefined) {
      var amountRequired = this.translateService.instant("requiredFiled");
      amountRequired=amountRequired.toString().replace("@value",  this.translateService.instant('amount'));
      $("#betAmountErr").html(amountRequired);
      return false;
    }   
    if (this.amount >= 100) {
      $("#betAmountErr").html("")
      return true;
    }
    if (this.amount < 100) {
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
  dreamBookRound(){      
    let twinNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
    for(let k=0;k< this.isNewDreamBook.length; k++){
      if(this.isNewDreamBook[k].isOne){
        // this.addList.find(x => x.number1 == this.isNewDreamBook[k].num && x.id == this.isNewDreamBook[k].id).isR1 = true;       
        let num1=this.isNewDreamBook[k].num.split('').reverse().join('');
        if(!twinNumbers.includes(num1)) {  
          let isSelected=this.addList.find(x => x.number1 == this.isNewDreamBook[k].num && x.id == this.isNewDreamBook[k].id).isR1;
          if(!isSelected){
            let isSelected1=this.addList.find(x => x.number1 == num1);
            if(isSelected1 !=null && isSelected1 !=undefined){
              this.addList.find(x => x.number1 == this.isNewDreamBook[k].num && x.id == this.isNewDreamBook[k].id).isR1 = true;
              this.addList.find(x => x.number1 == num1).isSelected1 = true;   
              ++this.count;
            }
            
          }
        } 
      }
      else{
        // this.addList.find(x => x.number2 == this.isNewDreamBook[k].num && x.id == this.isNewDreamBook[k].id).isR2 = true;
        let num2=this.isNewDreamBook[k].num.split('').reverse().join('');
        if(!twinNumbers.includes(num2)) {
          let isSelected=this.addList.find(x => x.number2 == this.isNewDreamBook[k].num && x.id == this.isNewDreamBook[k].id).isR2;
          if(!isSelected){
            let isSelected1=this.addList.find(x => x.number2 == num2);
            if(isSelected1 !=null && isSelected1 !=undefined){
              this.addList.find(x => x.number2 == this.isNewDreamBook[k].num && x.id == this.isNewDreamBook[k].id).isR2 = true;
              this.addList.find(x => x.number2 == num2).isSelected2 = true;   
              ++this.count; 
            }
            
          }                    
        } 
      }
    }
    this.betSelectedCount=this.count;      
   
   
  }
 
  // dreamBookRound(){
  //   if (!this.isUserLoggedIn) {
  //     this.common.errorMsg('youNeedLogin', 'top');
  //     return;
  //   }
  //   let checkAmount = this.checkBetAmount();    
  //   if (!checkAmount ) {
  //     return;
  //   }

  //   this.selectdreambookList = [];
  //   let twinNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
  //   for(let j=0; j<this.addList.length; j++){
  //     if(this.addList[j].isSelected1){
  //       let num1=this.addList[j].number1;
  //       let num2 = num1.split('').reverse().join('');
  //       if ( !twinNumbers.includes(num1) ) {
  //         this.selectdreambookList.push({ id: this.addList[j].id, number: num1, isUse: true });
  //         this.selectdreambookList.push({ id: null, number: num2, isUse: true }); 
  //       } else {
  //         this.selectdreambookList.push({ id: this.addList[j].id, number: num1, isUse: true });
  //       }
        
  //     }
  //     if(this.addList[j].isSelected2){
  //       let num1=this.addList[j].number2;
  //       let num2 = num1.split('').reverse().join('');
  //       if ( !twinNumbers.includes(num1) ) {
  //         this.selectdreambookList.push({ id: this.addList[j].id, number: num1, isUse: true });
  //         this.selectdreambookList.push({ id: null, number: num2, isUse: true });
  //       } else {
  //         this.selectdreambookList.push({ id: this.addList[j].id, number: num1, isUse: true });
  //       }
       
  //     }     
     
  //   }
  //   this.newBetTwodNumber = [];
  //   let c=0;
  //   for(let l=0; l<this.selectdreambookList.length; l++){
  //     if (this.selectdreambookList[l].isUse) {
  //       this.newBetTwodNumber[c]={"id": this.selectdreambookList[l].id,"number": this.selectdreambookList[l].number,
  //       "selected":true,"unbetstatus":false,"amount":this.amount};
  //       ++c;
  //     }
  //   }
  //   if (this.newBetTwodNumber.length > 0) {      
  //     this.storage.store('localNewTwodDreamBookNumber', this.newBetTwodNumber);   
  //     this.router.navigate(['/bet-confirm'], { state: {parentLink: '/twod-dream-book'}, replaceUrl: false } );
  //   }
  // }
  dreamCountModal(dreamCount: TemplateRef<any>) {
 
    this.selectdreambookList = [];

   if (this.count == 1) this.roundNumber();
   else this.getDreamListSelected();
  
    const countModal = { list : this.selectdreambookList, amount: this.amount };     
    this.modalRef = this.modalService.show(dreamCount, {
      initialState : countModal,
      class: "dreamCount-class modal-sm"
    });
  }

  dreamCountBetNumberSelected(dreamNumber: number, isUse: boolean) {    
   
    for(let n=0; n < this.selectdreambookList.length; n++){
      if (this.selectdreambookList[n].number.toString() == dreamNumber.toString()) {
        this.selectdreambookList[n].isUse = isUse;
      }    
    }
    
  }

  getDreamListSelected() { 
    this.addList.forEach(elem => {
      if (elem.isSelected1) {
        if (!this.selectdreambookList.find(x=>x.number == elem.number1)) {
          this.selectdreambookList.push({ id: elem.id, number: elem.number1, isUse: true });
        }
      }
      if (elem.isSelected2) {
        if (!this.selectdreambookList.find(x=>x.number == elem.number2)) {
          this.selectdreambookList.push({ id: elem.id, number: elem.number2, isUse: true });
        }
      }
    });
  }

  roundNumber() {
    var num1;
    var dreamId;

    let checkAmount = this.checkBetAmount();    
    if (!checkAmount) {
      return;
    }
    
    this.addList.forEach(elem => {
      if (elem.isSelected1 || elem.isSelected2) {
        num1 = (elem.isSelected1) == true ? elem.number1 : (elem.isSelected2) == true ? elem.number2 : null;
        dreamId = elem.id;
      }
    });    
    let twinNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
    if (num1 != null) {     
      if ( !twinNumbers.includes(num1) ) {
        let rNumber = num1.split('').reverse().join('');
        this.selectdreambookList.push({ id: dreamId, number: num1, isUse: true });
        this.selectdreambookList.push({ id: null, number: rNumber, isUse: true }); 
      } else {
        this.selectdreambookList.push({ id: dreamId, number: num1, isUse: true });
      }
    }
  
  }

  dreamCountBet() { 

    if (!this.isUserLoggedIn) {
      this.common.errorMsg('youNeedLogin', 'top');
      return;
    }

    let checkAmount = this.checkCountAmount(); 
    let checkNumber = this.checkCountNumber();
    
    if (!checkAmount || !checkNumber) {
      return;
    }

    this.newBetTwodNumber = [];

    let c=0;   
    for(let l=0; l<this.selectdreambookList.length; l++){
      if(this.selectdreambookList[l].isUse) {
        this.newBetTwodNumber[c]={"id": this.selectdreambookList[l].id,"number": this.selectdreambookList[l].number,
        "selected":true,"unbetstatus":false,"amount":this.modalService.config.initialState.amount};
        ++c;
      }
    }

    if (this.newBetTwodNumber.length > 0) {
      this.modalRef.hide();
      this.storage.store('localNewTwodDreamBookNumber', this.newBetTwodNumber);
      this.router.navigate(['/twod/bet-confirm'], { replaceUrl: false } );
    }

  }

  dreamCountCancel() {
    this.modalRef.hide();
    for (let m=0; m< this.selectdreambookList.length; m++) {
      if (!this.selectdreambookList[m].isUse) {
        if (this.addList.find(x=>x.number1 == this.selectdreambookList[m].number)) {
          for (let i=0; i<this.addList.length;i++) {
            if(this.addList[i].number1 == this.selectdreambookList[m].number){
              this.addList[i].isSelected1=false;
            }           
          }
          --this.count;
        }
        if (this.addList.find(x=>x.number2 == this.selectdreambookList[m].number)) {
          for (let i=0; i<this.addList.length;i++) {
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

  checkCountAmount() {    
    if (this.modalService.config.initialState.amount == '' || this.modalService.config.initialState.amount == null || this.modalService.config.initialState.amount == undefined) {
      var countamountRequired = this.translateService.instant("requiredFiled");
      countamountRequired = countamountRequired.toString().replace("@value",  this.translateService.instant('amount'));
      $("#countAmountErr").html(countamountRequired);
      return false;
    }   
    if (this.modalService.config.initialState.amount >= 100) {
      $("#countAmountErr").html("")
      return true;
    }
    if (this.modalService.config.initialState.amount < 100) {
     this.cannotSmallThan = this.translateService.instant("cannotSmallThan");
     this.cannotSmallThan = this.translateService.instant('amount')+":"+this.cannotSmallThan.toString().replace("@value", '100');
      $("#countAmountErr").html(this.cannotSmallThan);
      return false;
    }
  }

  checkCountNumber() {
    let count = this.selectdreambookList.filter(x=> x.isUse == true).length;
    if (count == 0) {
      this.common.errorMsg('select_numbers', 'bottom');
      return false;
    }
    return true;
  }

  handleError(error: HttpErrorResponse){
    if (error.status == 0) {
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
    if (error.status == 423) {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      this.storage.clear('token');
      this.storage.clear('isUserLoggedIn');
    }
    if (error.status == 400) {
      this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
    return throwError(error);
  }

  refreshPage(){
    this.isNewDreamBook=[];
    this.count=0;
    this.betSelectedCount=0;
    if (this.searchKey !=null || this.searchKey != undefined || this.searchKey != "") {
      this.searchKey = "";
    }
    this.spinner.show("refreshLoading");
    this.ngOnInit();

    if (this.isUserLoggedIn) this.child.getUserProfile();
    this.child.getSectionList();

    setTimeout(() => {
      this.spinner.hide("refreshLoading");
    }, 1000);
  }

  enter(event) {
    event.target.blur();
  }

}
