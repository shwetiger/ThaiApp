import { Component, OnInit, Pipe, PipeTransform, TemplateRef, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { Subscription, throwError, timer } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe, formatDate } from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { BetSectionDialogComponent } from 'src/app/shared/dialog/bet-section-dialog/bet-section-dialog.component';
import { TwodCloseTimeComponent } from 'src/app/shared/components/twod-close-time/twod-close-time.component';
import { Location } from '@angular/common';
import { BetSectionColsedComponent } from '../../../../shared/dialog/bet-section-colsed/bet-section-colsed.component';



@Component({
  selector: 'app-twod-initial-page',
  templateUrl: './twod-initial-page.component.html',
  styleUrls: ['./twod-initial-page.component.scss']
})
export class TwodInitialPageComponent implements OnInit {
  @ViewChild(TwodCloseTimeComponent) child:TwodCloseTimeComponent;

  token: any;  
  modalRef: BsModalRef;
  allClosed:boolean;
  isUserL
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false,
    class: "betSection-class modal-sm",
  }; 
  twodSectionList: any;
  isUserLoggedIn=false;
 
  modalConfig: ModalOptions;
  closeWeekend: boolean=false;
  closeHoliday: boolean=false;
  constructor(   
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private translateService: TranslateService,
    private modalService: BsModalService, 
    private http: HttpClient,
    private funct: FunctService,
    public spinner: NgxSpinnerService, 
    private toastr: ToastrService, 
    private dto: DtoService,
    private router: Router,private storage: LocalStorageService,
    private location:Location) 
    {  
        
    
    }

  ngOnInit(){  
    this.storage.clear('Localbetselectcount');
    this.common.refreshLoading=true;
    this.spinner.show("refreshLoading"); 

    this.storage.clear('localNewBetTwodNumber');
    this.isUserLoggedIn= this.storage.retrieve('isUserLoggedIn');
    this.getCheckUser();   
    this.getSectionList();
  }

 

  public getWeekendClosed(data: any) {   
    this.closeWeekend = data;   
    if( this.closeWeekend){
      this.storage.store("localCloseWeekend",this.closeWeekend);
    }  
    
  }

  public getHolidayClosed(data: any) {   
    this.closeHoliday = data;
    if(this.closeHoliday){
      this.storage.store("localCloseHoliday",this.closeWeekend);
    }  
    else{
      this.storage.clear("localCloseHoliday");         
    }
  }
  betSectionSelect(id: number,name: string){   
    for(let i=0; i< this.twodSectionList.length; i++){
      if(this.twodSectionList[i].id == id){
        this.twodSectionList[i].isSelected = true;
        if(id !=null || id != undefined){
          this.storage.store('localSection',this.twodSectionList[i]);
          this.storage.store('localSectionId',id);
          this.storage.store('localSectionName',name);
        }       
      }   
      else{
        this.twodSectionList[i].isSelected = false;
      }
    }    
  }

  

  twoDbet()
  {      
    let count=0;
    for(let i=0; i< this.twodSectionList.length; i++)
    {
      if(this.twodSectionList[i].isSelected)
      {
        this.modalRef.hide();//{state:{parentLink : "/twod-page",granParent:this.parentLink},
        this.router.navigate(['/twod-bet'], {state: {replaceUrl: false}});
      }
      else
      {
       ++count;        
      }
    }     
    if(count == 4){
      this.toastr.warning('',this.translateService.instant('bet-not-select'), {
              timeOut: 1000,
              positionClass: 'toast-top-center',
              });
    }    
  }  

  // getDateTime(){
  //   let headers = new HttpHeaders(); 
  //     this.http.get( this.funct.ipaddress + 'value/getDateTime', { headers: headers } )
  //     .pipe(
  //       catchError(this.handleErrorMessage.handleError.bind(this,''))
  //    )
  //     .subscribe(
  //       result => {
  //         this.dto.Response = result;  
  //         this.storage.store('localDateTime',this.dto.Response.utc_datetime);          
  //       }
  //     );   
  // }
 
  async getSectionList(){
    let time;
    let x;
    let headers = new HttpHeaders();
      this.http.get(this.funct.ipaddress + 'twodsection/getTwodSectionList', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,''))
      )
      .subscribe(
        async result => {
          let count=0;
          this.dto.Response = result;
          this.twodSectionList=this.dto.Response;  
          const dateTime = await this.common.getDateTime();
          const closeTime= await this.common.convertMyanmarTime(dateTime);        
          for(let i=0; i< this.twodSectionList.length; i++){    
              if(this.twodSectionList[i].toTime != null){
                time = this.twodSectionList[i].toTime.split(":");               
                x = new Date(closeTime);             
                x.setHours(time[0]);
                x.setMinutes(time[1]);
                x.getTime();            
                if((closeTime.getHours() > x.getHours()) || 
                (closeTime.getHours() >= x.getHours() && closeTime.getMinutes() >=x.getMinutes()) ){      
                  this.twodSectionList[i].isClosed= true;
                  this.twodSectionList[i].isSelected = false;                                        
                }  
                        
                // if((closeTime.getHours() >=14 && closeTime.getMinutes() >=36 )){ 
                  if((closeTime.getHours() >16 || (closeTime.getHours()==16 && closeTime.getMinutes() >= 36) )){  
                  this.twodSectionList[i].isClosed= false;
                  this.twodSectionList[i].isSelected = false;                                        
                }                   
              }  
              else{      
                ++count;
              }     
           
           }
          if(count > 0){            
            this.toastr.warning('',this.translateService.instant('Section Null'), {
                    timeOut: 1000,
                    positionClass: 'toast-top-center',
                    });

          }
        //  this.twodSectionList= this.storage.store('localTwodSectionList', this.dto.Response);  
         
        }
      );
  }  

  getDate(date) {
    var formatter = 'dd/MM/yyyy hh:mm:ss a';
    return formatDate(date, formatter, 'en-US');
    } 


  getCheckUser(){
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
        this.dto.Response = {};
        this.dto.Response = result;
        this.isUserLoggedIn= true;         
      }); 
  }
  betHistory(){
    let login= this.storage.retrieve('isUserLoggedIn'); 
    if(!login){
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
         this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    this.router.navigate(['/twod/bet-history','2D'], {state: {type: '2D',pagefrom:'2dinitial'},replaceUrl: false} );

  }
  TwoDWinner(){
    this.router.navigate(['/twod/winner-page','2D'], {state: {type: '2D'},replaceUrl: false} );
  }
  goToHoliday() {
    this.router.navigate(['/twod/holiday'], {replaceUrl: false});  
  }

  refreshPage(): void{    
    this.ngOnInit();    
    this.child.ngOnInit(); 
    setTimeout(() => {
      this.common.refreshLoading=false;
      this.spinner.hide("refreshLoading"); 
    }, 1000);    
  }
 
  betSectionModal(refLink: any){
    if(this.closeWeekend || this.closeHoliday){
      this.router.navigate(['/twod/bet'],{replaceUrl:false});
    }
    else{
        this.allClosed = this.twodSectionList.every(section => section.isClosed === true);
       if (this.allClosed) {
         //let initialState = { refLink: refLink };
        this.modalConfig = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false,
        class: "bet-section-closed-modal modal-sm",
      };
      this.modalRef = this.modalService.show(BetSectionColsedComponent, {...this.modalConfig});
    
       } else {
       
      let initialState = { refLink: refLink };
      this.modalConfig = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false,
        class: "bet-section-modal modal-sm",
      };
      this.modalRef = this.modalService.show(BetSectionDialogComponent, {...this.modalConfig, initialState});
    }
    }
    
  }

   async checkTwodCloseTime() {
    
    const dateTime = await this.common.getDateTime();
    const currentTime = await this.common.convertMyanmarTime(dateTime);
    for(let i=0; i < this.twodSectionList.length; i++){    
      if (this.twodSectionList[i].fromTime != null && this.twodSectionList[i].toTime != null) {
        var toTime = this.twodSectionList[i].toTime.split(":");
        var to = new Date(currentTime);
        to.setHours(toTime[0]);
        to.setMinutes(toTime[1]);

        var fourHour36Mins = new Date(currentTime);
        fourHour36Mins.setHours(16);
        fourHour36Mins.setMinutes(36);
      
        if (currentTime.getTime() >= to.getTime()){      
          this.twodSectionList[i].isClosed = true;
          this.twodSectionList[i].isSelected = false;                                        
        }  
        
        if (currentTime.getTime() >= fourHour36Mins.getTime()) {  
          this.twodSectionList[i].isClosed = false;
          this.twodSectionList[i].isSelected = false;                                        
        }
      
      }        
      
    }

  }



  refreshPageHeader() {
    //this.ngOnInit(); 
    this.common.refreshLoading=true;
    this.spinner.show("refreshLoading");
    setTimeout(() => {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 2000);   
  }

  goBack(){
    this.location.back()
  }

}

