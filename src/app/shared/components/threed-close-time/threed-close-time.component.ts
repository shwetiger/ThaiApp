import { Component, EventEmitter, OnInit,  Output,  Pipe,  PipeTransform,  TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, map, retry } from 'rxjs/operators';
import { Observable, Subscription, throwError, timer } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe, formatDate } from '@angular/common';
import { FunctService } from '../../service/funct.service';
import { CommonService } from '../../service/common.service';
import { DtoService } from '../../service/dto.service';
import { NgxSpinnerService } from 'ngx-spinner';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { HandleErrorMessageService } from '../../service/handle-error-message.service';

@Component({
  selector: 'threed-close-time',
  templateUrl: './threed-close-time.component.html',
  styleUrls: ['./threed-close-time.component.scss']
})
export class ThreedCloseTimeComponent implements OnInit {
  @Output() myEvent = new EventEmitter();
  countDown;
  counter: any;
  tick = 1000;
  token: any;
  threeDCloseTime: any;
  userProfileModel: any=[];
  balance: any;
  showBalane=true;  
  closedate:any;
  closetime:any;
  TimeFormat:any;
  @Output() closed = new EventEmitter<boolean>();

  constructor( 
    public handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    public spinner: NgxSpinnerService,
    private translateService: TranslateService,
    private http: HttpClient,
    private funct: FunctService,
    private toastr: ToastrService,
    private dto: DtoService,
    private storage: LocalStorageService,) 
    {
     
    }

   ngOnInit(): void  {   
    //balanceLoading
    this.common.balanceLoading =true; 
    this.spinner.show('balanceLoading');  
    //dateLoading
    this.common.threedCloseTimeLoading = true;
    this.spinner.show("threedCloseTimeLoading");
    
    this.userProfileModel=[];
    this.getCloseTime();    
  }


  async getCloseTime(){
    this.getUserProfile();
    var time=await this.getThreeDCloseDiff();
    if(time == null ){
      this.threeDCloseTime = true;
      this.closed.emit(this.threeDCloseTime); 
      this.common.threedCloseTimeLoading = false;
      this.spinner.hide("threedCloseTimeLoading");    
      return;
    }
    this.threeDCloseTime = false;
    this.closed.emit(this.threeDCloseTime);
    this.counter =( time.day *86400) + (time.hour * 3600) + (time.minute * 60) + time.second;   
    this.countDown = Observable.timer(0, this.tick).take(this.counter).map(() => --this.counter);
    this.common.threedCloseTimeLoading = false;
    this.spinner.hide("threedCloseTimeLoading");
  }
     
  
  getUserProfile(){    
    this.token = this.storage.retrieve('token');  
    if(this.token != null){
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);    
    this.http.get(this.funct.ipaddress + 'user/UserProfile', { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      result => {
        this.dto.Response = {};
        this.dto.Response = result;        
        this.userProfileModel= this.dto.Response;  
        this.showBalane=false;
        this.balance= this.userProfileModel.balance;  
        this.common.balanceLoading =false; 
        this.spinner.hide('balanceLoading'); 
        
      }); 
   
    }
   
  }  
       

  
  async getDateTime(){
    const axios = require('axios').default;
    const response = await axios.get(this.funct.ipaddress + 'threedconfig/3d_close_time');  
    return response.data;     
  }
  
  async getCurrentTime(){
    const axios = require('axios').default;
    const response = await axios.get(this.funct.ipaddress + 'value/getDateTime');   
    return response.data.utc_datetime;    
  }
 
  async getThreeDCloseDiff() {    
    var duration;
    const localCurrentTime=await this.getCurrentTime();//this.storage.retrieve('localCurrentTime');
    const currentDate = new Date(localCurrentTime); 
    var localclosedate=await this.getDateTime();
    const localFromDate= localclosedate.from_date;//this.storage.retrieve('localThreeDCloseTime').from_date; 
    const fromDate = new Date(localFromDate);      
    var day1= this.getDateDiff(currentDate, fromDate);    
    var day1Second=(day1.day * 86400) +(day1.hour*3600)+(day1.minute *60)+day1.second;
    
    
    if(day1Second > 0){
      duration=null;     
      return duration;
    }
    const localToDate= localclosedate.to_date; //this.storage.retrieve('localThreeDCloseTime').to_date; 
    var closeDate=localToDate.split("T");
    this.closedate=closeDate[0];
    const endDate = new Date(localToDate);
    if(endDate.getHours()>12)
    {
     this.TimeFormat='PM';
    this.closetime=(endDate.getHours()-12)*3600+ endDate.getMinutes()*60;
    }
    else{
      this.TimeFormat='AM';
      this.closetime=(endDate.getHours())*3600+ endDate.getMinutes()*60;
    }
    if(currentDate>=fromDate && currentDate<=endDate){
      //open
      duration=this.getDateDiff(currentDate, endDate);  
    
      if((endDate.getFullYear() == currentDate.getFullYear()) && (endDate.getMonth() == currentDate.getMonth()) && (endDate.getDate() == currentDate.getDate())){
        if(((currentDate.getHours() > endDate.getHours()) ||
            (currentDate.getHours() == endDate.getHours() && currentDate.getMinutes() > endDate.getMinutes()) ||
            (currentDate.getHours() == endDate.getHours() && currentDate.getMinutes() == endDate.getMinutes() && currentDate.getSeconds() <= endDate.getSeconds()))
        ){
          
          if((currentDate.getHours() < 18 || (currentDate.getHours() == 18 && currentDate.getMinutes() <= 20 ))){   // can change
            duration=null;
            return duration;
          }else{       
            duration=null;
            return duration;
          }
        }else{        
          duration=this.getDateDiff(currentDate, endDate);
          return duration;
        }  
      } 
      else{     
        duration=this.getDateDiff(currentDate, endDate);
        if(duration.second <0 ){
          duration=null;
        }
        return duration;
      }      
    }else{
      //close
      duration=null;
      return duration;    
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
   
    refreshPage(): void{
      this.ngOnInit();
      this.myEvent.emit(); 
      //window.location.reload();
    }
}


// @Pipe({
//   name: "threedformatTime"
// })
// export class ThreedFormatTimePipe implements PipeTransform {

  
//   constructor(private translateService: TranslateService,private datePipe: DatePipe,private toastr: ToastrService,private dto: DtoService, private http: HttpClient, 
//      private storage: LocalStorageService, private funct: FunctService,) {    
  
//   }  
//   transform(value: number): string {   
//     // const hours: number = Math.floor(value / 3600);
//     // const minutes: number = Math.floor((value % 3600) / 60);
//     const days: number = Math.floor(value/ 86400);
//     const hours: number = Math.floor((value % 86400) / 3600);
//     const minutes: number = Math.floor((value % 3600) / 60);
//     const seconds: number= Math.floor(value % 60);
//    var showDays;

//    if(days == 0){
//     showDays='';
//    }
//    else{
//     showDays=("00" + days).slice(-2)+
//     this.translateService.instant("days");
//    }
  
//     return (
//       showDays +
//       ("00" + hours).slice(-2) +
//       ":" +
//       ("00" + minutes).slice(-2) +
//       ":" +
//       ("00" + seconds).slice(-2)
//       //("00" + Math.floor(value - minutes * 60)).slice(-2)
//     );
//   }
// }
