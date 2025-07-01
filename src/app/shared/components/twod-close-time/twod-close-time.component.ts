import { Component, EventEmitter, Input, OnChanges, OnInit,  Output,  Pipe,  PipeTransform,  SimpleChanges,  TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { Observable, Subscription, throwError, timer } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe, formatDate } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { FunctService } from '../../service/funct.service';
import { DtoService } from '../../service/dto.service';
import { CommonService } from '../../service/common.service';
import { HandleErrorMessageService } from '../../service/handle-error-message.service';

@Component({
  selector: 'twod-close-time',
  templateUrl: './twod-close-time.component.html',
  styleUrls: ['./twod-close-time.component.scss']
})

export class TwodCloseTimeComponent implements OnInit {
 

  @Output() weekendClosed = new EventEmitter<boolean>();
  @Output() HolidayClosed = new EventEmitter<boolean>();

  @Output() closed = new EventEmitter<boolean>();
  @Output() myEvent = new EventEmitter();
  @Input() sectionId: any;

  countDown;
  counter: any;
  tick = 1000;  
  twoDCloseTime: boolean= false;
  twoDCloseTimeObj: any;
  currentDate: any = null;
  toCloseTime;
  Timeformat:any;

  balance: any; 
  isUserLoggedIn: boolean = false; 
  weekend_close: boolean= false;
  closeHoliday: boolean= false;  
  constructor(
    public handleErrorMessage: HandleErrorMessageService,
    public spinner: NgxSpinnerService,
    private translateService: TranslateService,
    private http: HttpClient,
    private funct: FunctService,
    private toastr: ToastrService,
    private dto: DtoService,
    private storage: LocalStorageService,
    public common: CommonService) {

      this.isUserLoggedIn = this.storage.retrieve('isUserLoggedIn');
    
  }

  async ngOnInit() {  
   this.common.closeLoadingSubmit=true;   
   this.spinner.show("closeLoadingSubmit");
   //balance
   this.common.balanceLoading =true; 
   this.spinner.show('balanceLoading');

   //closetime
   this.common.twodCloseTimeLoading=true;   
   this.spinner.show("twodCloseTimeLoading");
   
   await this.checkCloseWeekend();     
   this.getUserProfile();
  }


  
  ngOnChanges(changes: SimpleChanges) {    
    this.sectionId = (changes && changes.sectionId) ? changes.sectionId.currentValue : this.sectionId;
    this.getSectionList();
  }

  getUserProfile() {     
    if(!this.isUserLoggedIn){
       setTimeout(()=>{
        this.balance = 0;
        this.common.balanceLoading =false; 
        this.spinner.hide('balanceLoading'); 
       },1000);
       return;
    } 
    //getUserBalance  
    let token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', token);   
    this.http.get(this.funct.ipaddress + 'user/UserProfile', { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      result => {
        this.dto.Response = {};
        this.dto.Response = result;  
        this.balance =  this.dto.Response.balance;

        this.common.balanceLoading = false; 
        this.spinner.hide('balanceLoading');   

    });
    
  }

  async checkCloseWeekend() {
    const dateTime = await this.common.getDateTime();
    const currentTime = await this.common.convertMyanmarTime(dateTime);
    
    var formatter = 'EEEE';
    var day = formatDate(currentTime, formatter, 'en-US');
    var fourHour36Mins = new Date(currentTime);
    fourHour36Mins.setHours(16);
    fourHour36Mins.setMinutes(36);

    var elevenHour59Mins = new Date(currentTime);
    elevenHour59Mins.setHours(23);
    elevenHour59Mins.setMinutes(59);   
    if ((day == "Friday" && currentTime.getTime() >= fourHour36Mins.getTime()) ||
    (day == "Saturday") || (day == "Sunday" && currentTime.getTime() <= fourHour36Mins.getTime()) ){        
        
          this.weekend_close = true;
          this.weekendClosed.emit(true);
          this.common.refreshLoading=false;
          this.storage.store("localCloseWeekend",true);
          this.common.closeLoadingSubmit =false; 
          this.spinner.hide('closeLoadingSubmit'); 
          this.common.twodCloseTimeLoading = false;
          this.spinner.hide("twodCloseTimeLoading");           
          return;     
    } else {       
      await this.checkCloseHoliday();
      if(this.closeHoliday){
        
        this.weekend_close = true; 
        this.closeHoliday = true;        
        this.HolidayClosed.emit(true);
        this.common.refreshLoading=false;
        this.storage.store("localCloseHoliday",true);
        //betLoading
        this.common.closeLoadingSubmit =false; 
        this.spinner.hide('closeLoadingSubmit'); 
        this.common.twodCloseTimeLoading = false;
        this.spinner.hide("twodCloseTimeLoading");  
      }
      else{  
        this.weekendClosed.emit(false);
        this.weekend_close = false; 
        this.getSectionList();        
      }      
    }  
    
  }


  async getCloseHolidayList(){ 
    const axios = require('axios').default;
    const response = await axios.get(this.funct.ipaddress + 'holiday/GetHolidayList');
    return response.data;    
  }   

  async checkCloseHoliday() {
    const holidayList = await this.getCloseHolidayList();
    const dateTime = await this.common.getDateTime();
    const currentTime = await this.common.convertMyanmarTime(dateTime);

    var fourHour36Mins = new Date(currentTime);
    fourHour36Mins.setHours(16);
    fourHour36Mins.setMinutes(36);

    var elevenHour59Mins = new Date(currentTime);
    elevenHour59Mins.setHours(23);
    elevenHour59Mins.setMinutes(59);

    if (currentTime.getTime() >= fourHour36Mins.getTime() && currentTime.getTime() <= elevenHour59Mins.getTime()) {
      
      const tomorrowDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1);
      
      for( var i=0; holidayList.length > i; i++ ) {
        let holidayDate = new Date(holidayList[i].date);        
        if (
          holidayDate.getFullYear() == tomorrowDate.getFullYear() &&
          holidayDate.getMonth() == tomorrowDate.getMonth() &&
          holidayDate.getDate() == tomorrowDate.getDate() ) {
          this.closeHoliday = true;  
          this.weekend_close=true;      
          this.HolidayClosed.emit(true);
          this.common.refreshLoading=false;
          this.storage.store('localHolidayDescription',holidayList[i].description);
          this.storage.store("localCloseHoliday",true);    
          break;
        } else {
          this.storage.clear("localCloseHoliday");   
          this.HolidayClosed.emit(false);
          this.closeHoliday = false;
          continue;
        }
      }
  
    } else {      
      holidayList.forEach(elem => {
        let holidayDate = new Date(elem.date);
        if(
          holidayDate.getFullYear() == currentTime.getFullYear() &&
          holidayDate.getMonth() == currentTime.getMonth() &&
          holidayDate.getDate() == currentTime.getDate() ) { 
          this.HolidayClosed.emit(true); 
          this.common.refreshLoading=false; 
          this.storage.store('localHolidayDescription',elem.description);        
          this.closeHoliday = true;  
          this.weekend_close=true;            
          return;
        }
      });
    }

  }

  // getSectionList() {   
  //   this.storage.clear("localCloseWeekend");
  //   this.storage.clear("localCloseHoliday");        
  //   this.common.closeLoadingSubmit =false; 
  //   this.spinner.hide('closeLoadingSubmit'); 

  //   let headers = new HttpHeaders();
  //   this.http.get(this.funct.ipaddress + 'twodsection/getTwodSectionList', { headers: headers })
  //   .pipe(
  //     catchError(this.handleErrorMessage.handleError.bind(this,''))
  //   )
  //   .subscribe(
  //     async result => { 
  //       this.dto.Response = result;
  //       let fourSectionList = this.dto.Response;
        
  //       this.storage.store('localTwodSectionList', fourSectionList);        
  //       const dateTime = await this.common.getDateTime();
  //       const currentTime = await this.common.convertMyanmarTime(dateTime);
  //       var fromTime;
  //       var toTime;
  //       var resultTime;
       
  //       if (fourSectionList != undefined) {
        
  //         for (let i = 0; i < fourSectionList.length; i++) {   
                
  //           if (fourSectionList[i].fromTime != null && fourSectionList[i].toTime != null) {  
                             
  //             fromTime = fourSectionList[i].fromTime.split(":");
  //             var from = new Date(currentTime);
  //             from.setHours(fromTime[0]);
  //             from.setMinutes(fromTime[1]);
             
  //             toTime = fourSectionList[i].toTime.split(":");
  //             var to = new Date(currentTime);
          
  //             to.setHours(toTime[0]);
  //             to.setMinutes(toTime[1]);
              
  //             resultTime = this.convert24HoursFormat(fourSectionList[i].sectionName).split(":");
  //             var resultT = new Date(currentTime);
  //             resultT.setHours(resultTime[0]);
  //             resultT.setMinutes(resultTime[1]);
              
  //             var fourHour36Mins = new Date(currentTime);
  //             fourHour36Mins.setHours(16);
  //             fourHour36Mins.setMinutes(36);

  //             var elevenHour39Mins = new Date(currentTime);
  //             elevenHour39Mins.setHours(23);
  //             elevenHour39Mins.setMinutes(59);
  
  //             if (this.sectionId != null && this.sectionId != undefined) {
  //               if (this.sectionId == fourSectionList[i].id) {
  //               
  //                 this.getTwoDCloseDiffNew(currentTime, to, null);
  //               }
  //             } else {
  //               if (currentTime.getTime() >= fourHour36Mins.getTime() && currentTime.getTime() <= elevenHour39Mins.getTime()) {
  //                 if (i == 0) {  
                   
  //                   this.getTwoDCloseDiffNew(currentTime, to, null);
  //                   return;
  //                 } 
  //               }                
  //               if (currentTime.getTime() <= to.getTime()) {
  //                 if (i == 0) {  
  //                   this.getTwoDCloseDiffNew(currentTime, to, null);
  //                   return;
  //                 } 
  //               }               
  //               if (currentTime.getTime() >= from.getTime() && currentTime.getTime() <= to.getTime()) { 
            
  //                 this.getTwoDCloseDiffNew(currentTime, to, null);
  //                 return;
  //               }                
  //               if (currentTime.getTime() >= to.getTime() && currentTime.getTime() <= resultT.getTime()) { 
                  
  //                toTime = fourSectionList[i+1].toTime.split(":");
  //                var to = new Date(currentTime);
  //                to.setHours(toTime[0]);
  //                to.setMinutes(toTime[1]);
  //                if(to.getHours()>12){
  //                  this.Timeformat='PM';
  //                  this.toCloseTime=(to.getHours()-12)*3600+to.getMinutes()*60;
  //                  }
  //                  else{
  //                    this.Timeformat='AM';
  //                    this.toCloseTime=(to.getHours())*3600+to.getMinutes()*60;
  //                  }   
  //                 return;
  //               }             
  //               if (currentTime.getTime() >= to.getTime() && currentTime.getTime() <= fourHour36Mins.getTime()) {
  //                 if (i == 3) {
  //                   this.getTwoDCloseDiffNew(currentTime, to, resultT);                
  //                   return;
  //                 }
                
  //               }
  //               // if(currentTime.getTime()>to.getTime() && currentTime.getTime()<result.getTime() && from.getTime()<currentTime.getTime())
  //               // {
  //               //   this.getTwoDCloseDiffNew(currentTime, to, resultT); 
  //               //   return
  //               //  // this.toCloseTime=(to.getHours()-12)*3600+to.getMinutes()*60;
  //               // }
              
  //               else{ 
                 
  //                 this.weekend_close= false;
  //                 this.twoDCloseTime = false;
  //                   // toTime = fourSectionList[i+1].toTime.split(":");
  //                   // var to = new Date(currentTime);
  //                   // to.setHours(toTime[0]);
  //                   // to.setMinutes(toTime[1]);
  //                   if(to.getHours()>12){
  //                     this.Timeformat='PM';
  //                     this.toCloseTime=(to.getHours()-12)*3600+to.getMinutes()*60;
  //                     }
  //                     else{
  //                       this.Timeformat='AM';
  //                       this.toCloseTime=(to.getHours())*3600+to.getMinutes()*60;
  //                     }   
  //                 this.common.twodCloseTimeLoading = false;
  //                 this.spinner.hide('twodCloseTimeLoading');
  //                 return;
  //               }
  //             }
              
  //           }
            
  //         }
  //       }
      
  //   });
    
  // }

  getSectionList() {   
    this.storage.clear("localCloseWeekend");
    this.storage.clear("localCloseHoliday");        
    this.common.closeLoadingSubmit =false; 
    this.spinner.hide('closeLoadingSubmit'); 

    let headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'twodsection/getTwodSectionList', { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      async result => { 
        this.dto.Response = result;
        let fourSectionList = this.dto.Response;
        this.storage.store('localTwodSectionList', fourSectionList);        
        const dateTime = await this.common.getDateTime();
        const currentTime = await this.common.convertMyanmarTime(dateTime);
        var fromTime;
        var toTime;
        var resultTime;
        if (fourSectionList != undefined) {
          
          for (let i = 0; i < fourSectionList.length; i++) {    

            if (fourSectionList[i].fromTime != null && fourSectionList[i].toTime != null) {              
              fromTime = fourSectionList[i].fromTime.split(":");
              var from = new Date(currentTime);
              from.setHours(fromTime[0]);
              from.setMinutes(fromTime[1]);
             
              toTime = fourSectionList[i].toTime.split(":");
              var to = new Date(currentTime);
              to.setHours(toTime[0]);
              to.setMinutes(toTime[1]);

              resultTime = this.convert24HoursFormat(fourSectionList[i].sectionName).split(":");
              var resultT = new Date(currentTime);
              resultT.setHours(resultTime[0]);
              resultT.setMinutes(resultTime[1]);

              var fourHour36Mins = new Date(currentTime);
              fourHour36Mins.setHours(16);
              fourHour36Mins.setMinutes(36);

              var threeHour30Mins = new Date(currentTime);
              threeHour30Mins.setHours(15);
              threeHour30Mins.setMinutes(57);

              var elevenHour39Mins = new Date(currentTime);
              elevenHour39Mins.setHours(23);
              elevenHour39Mins.setMinutes(59);
              if (this.sectionId != null && this.sectionId != undefined) {
                if (this.sectionId == fourSectionList[i].id) {
                  this.getTwoDCloseDiffNew(currentTime, to, null);
                }
              } else {
                if (currentTime.getTime() >= fourHour36Mins.getTime() && currentTime.getTime() <= elevenHour39Mins.getTime()) {
                  if (i == 0) {     
                    this.getTwoDCloseDiffNew(currentTime, to, null);
                    return;
                  } 
                }                
                if (currentTime.getTime() <= to.getTime()) {
            
                  if (i == 0) {       
                    this.getTwoDCloseDiffNew(currentTime, to, null);
                    return;
                  } 
                }               
                if (currentTime.getTime() >= from.getTime() && currentTime.getTime() <= to.getTime()) { 
                  this.getTwoDCloseDiffNew(currentTime, to, null);
                  return;
                }                
                if (currentTime.getTime() >= to.getTime() && currentTime.getTime() <= resultT.getTime()) { 
                  toTime = fourSectionList[i+1].toTime.split(":");
                  var to = new Date(currentTime);
                   to.setHours(toTime[0]);
                   to.setMinutes(toTime[1]);
                   if(to.getHours()>12){
                     this.Timeformat='PM';
                     this.toCloseTime=(to.getHours()-12)*3600+to.getMinutes()*60;
                     }
                     else{
                       this.Timeformat='AM';
                       this.toCloseTime=(to.getHours())*3600+to.getMinutes()*60;  
                     }   
                     this.common.twodCloseTimeLoading = false;
                     this.spinner.hide('twodCloseTimeLoading');
                     return;  
                }             
                if (currentTime.getTime() >= to.getTime() && currentTime.getTime() <= fourHour36Mins.getTime()) {
                  if (i == 3) {
                    this.getTwoDCloseDiffNew(currentTime, to, resultT);                
                    return;
                  }
                  else{
                    if(currentTime.getTime() > threeHour30Mins.getTime())
                    {
                    this.twoDCloseTime= true;
                    this.common.twodCloseTimeLoading = false;
                    this.spinner.hide('twodCloseTimeLoading');
                    return;
                    }
                  }
 
                }
                else{   
                  this.weekend_close= false;
                  toTime = fourSectionList[i].toTime.split(":");
                
                   var to = new Date(currentTime);
                   to.setHours(toTime[0]);
                   to.setMinutes(toTime[1]);
                   if(to.getHours()>12){
                     this.Timeformat='PM';
                     this.toCloseTime=(to.getHours()-12)*3600+to.getMinutes()*60;
                     }
                     else{
                       this.Timeformat='AM';
                       this.toCloseTime=(to.getHours())*3600+to.getMinutes()*60;
                     }           
                  this.common.twodCloseTimeLoading = false;
                  this.spinner.hide('twodCloseTimeLoading');
                  return;
                }
              }
              
            }
         
            
          }
        }
      
    });
    
  }

  async getTwoDCloseDiffNew(startTime, endTime, resultTime) {
    this.weekend_close=false;
    this.twoDCloseTime= false;
    var duration;
    const currentDate = await this.common.getDateTime();
    const TodayDate = new Date(currentDate);
    var startDate;
    var endDate;
    if ((TodayDate.getHours() >= 16 && TodayDate.getMinutes() >= 36) && (TodayDate.getHours() <= 23 && TodayDate.getMinutes() <= 59)) {
      startDate = new Date(TodayDate.getFullYear(), TodayDate.getMonth(), TodayDate.getDate(), startTime.getHours(), startTime.getMinutes(), 0);
      endDate = new Date(TodayDate.getFullYear(), TodayDate.getMonth(), TodayDate.getDate() + 1, endTime.getHours(), endTime.getMinutes(), 0);
      
    } 
    else {     
      startDate = new Date(TodayDate.getFullYear(), TodayDate.getMonth(), TodayDate.getDate(), startTime.getHours(), startTime.getMinutes(), 0);
      endDate = new Date(TodayDate.getFullYear(), TodayDate.getMonth(), TodayDate.getDate(), endTime.getHours(), endTime.getMinutes(), 0);
      
    }

    duration = this.getDateDiff(startDate, endDate);
    if(endTime.getHours()>12){
      this.Timeformat='PM';
      this.toCloseTime=(endTime.getHours()-12)*3600+endTime.getMinutes()*60;
      }
      else{
        this.Timeformat='AM';
        this.toCloseTime=(endTime.getHours())*3600+endTime.getMinutes()*60;
      }   
                  
    this.counter = (duration.hour * 3600) + (duration.minute * 60) + duration.second;
    this.countDown = Observable.timer(0, this.tick).take(this.counter).map(() => --this.counter);
    if (startTime != null && endTime != null) {
      var section = this.storage.retrieve('localSection');          
      if(resultTime != null) {
        
        this.twoDCloseTime = false;
        this.twoDCloseTimeObj = { status: this.twoDCloseTime, section: (section) ? section.sectionName : "" };
        this.closed.emit(this.twoDCloseTimeObj); 
        this.common.twodCloseTimeLoading = false;
        this.spinner.hide('twodCloseTimeLoading');   
        return;
      } 
      else {
        if (startTime.getTime() >= endTime.getTime()) { // bet close time interval
          this.twoDCloseTime = false;
          var fourHour36Mins = new Date(currentDate);
          fourHour36Mins.setHours(16);
          fourHour36Mins.setMinutes(36);
          if (startTime.getTime() >= fourHour36Mins.getTime()) this.twoDCloseTime = false;
        } else {
          this.twoDCloseTime = false;
        }    
         
        this.common.twodCloseTimeLoading = false;
        this.spinner.hide('twodCloseTimeLoading');
        this.twoDCloseTimeObj = { status: this.twoDCloseTime, section: (section) ? section.sectionName : "" };
        this.closed.emit(this.twoDCloseTimeObj);
      }

    }

  }
  
  getDateDiff(startDate, endDate){
    
    var diff = endDate.getTime() - startDate.getTime();
    var days = Math.floor(diff / (60 * 60 * 24 * 1000));
    var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
    var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
    var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60)); 
    return { day: days, hour: hours, minute: minutes, second: seconds };
  }

  getDate(date) {
    var formatter = 'dd/MM/yyyy hh:mm:ss a';
    return formatDate(date, formatter, 'en-US');
  }

  convert24HoursFormat(time) {
     var hours   = Number(time.match(/^(\d+)/)[1]);
      var minutes = Number(time.match(/:(\d+)/)[1]);
      var AMPM    = time.match(/\s(.*)$/)[1];
      if (AMPM === "PM" && hours < 12) hours = hours + 12;
      if (AMPM === "AM" && hours === 12) hours = hours - 12;
      var sHours   = hours.toString();
      var sMinutes = minutes.toString();
      if (hours < 10) sHours = "0" + sHours;
      if (minutes < 10) sMinutes = "0" + sMinutes;
      return (sHours + ":" + sMinutes);

  }
  
}