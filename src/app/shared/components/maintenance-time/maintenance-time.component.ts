//import { Component, OnInit } from '@angular/core';
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
import { FormatTimePipe } from '../../pipes/common.pipe';
import { stringify } from 'querystring';
import { clearInterval } from 'timers';

@Component({
  selector: 'app-maintenance-time',
  templateUrl: './maintenance-time.component.html',
  styleUrls: ['./maintenance-time.component.scss']
})
export class MaintenanceTimeComponent implements OnInit {

 // @Output() weekendClosed = new EventEmitter<boolean>();
 // @Output() HolidayClosed = new EventEmitter<boolean>();

 // @Output() closed = new EventEmitter<boolean>();
  //@Output() myEvent = new EventEmitter();
  @Input() gameProviderId: any;

  
  datetoday;
  counter: any;
  tick = 1000;  
  maintenanceCloseTime: boolean= false;
  twoDCloseTimeObj: any;
  currentDate: any = null;

  pipe = new DatePipe('en-US');
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


    
  }

  async ngOnInit() {  

   await this.checkMaintenanceTime();  

   
  }
  demoDays:any;
  demoHr:any;
  demoMin:any;
  demoSec:any;
  fromTime:any;
  toTime;
 
  x=setInterval(()=>{
    
    var now =new Date().getTime();
    var distance=this.toTime-now;
    if(distance>0 && now>this.fromTime) 
    {
    var days=Math.floor(distance/(1000*60*60*24));
    var hours=Math.floor((distance % (1000*60*60*24))/(1000*60*60));
    var minutes=Math.floor((distance%(1000*60*60))/(1000*60));
    var seconds=Math.floor((distance%(1000*60))/1000);
    
    if(days<10)
      this.demoDays= "0"+days;
    else
    this.demoDays=days;
    if(hours<10)
    this.demoHr= "0"+hours;
    else
    this.demoHr=hours;
    if(minutes<10)
    this.demoMin= "0"+minutes;
    else
    this.demoMin= minutes;
    if(seconds<10)
    this.demoSec= "0"+seconds ;
    else
    this.demoSec= seconds ;
    }
    if(distance <= 0)
    {
     //clearInterval(this.x)
     this.demoHr="0"+0;
     this.demoMin= "0"+0;
     this.demoSec= "0"+0;
     
    }
  });

  
  ngOnChanges(changes: SimpleChanges) {    
    this.getgameProviderList();
  }

 
  
  async checkMaintenanceTime() {
    const dateTime = await this.common.getDateTime();
    const currentTime = await this.common.convertMyanmarTime(dateTime);

    this.datetoday= new Date();
    this.datetoday=this.pipe.transform(this.datetoday, 'LLLL d, y')
    
    
    var formatter = 'EEEE';
    var day = formatDate(currentTime, formatter, 'en-US');
    var fourHour36Mins = new Date(currentTime);
    fourHour36Mins.setHours(16);
    fourHour36Mins.setMinutes(36);

    var elevenHour59Mins = new Date(currentTime);
    elevenHour59Mins.setHours(23);
    elevenHour59Mins.setMinutes(59);   
    this.getgameProviderList(); 
 
  }

  getgameProviderList() { 
    
    this.gameProviderId =this.storage.retrieve('localGameProviderId'); 
    if(this.gameProviderId[0]==8 && this.gameProviderId[1]==2)
    {
        this.gameProviderId=10;
    }
    let headers = new HttpHeaders();
    let params = new HttpParams(); 
    params = params.set('Id',this.gameProviderId);
    this.http.get(this.funct.ipaddress + 'gameProvider/GetDetailListById', {params:params ,headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
  
    .subscribe(
      async result => { 
        this.dto.Response = result;
        let gameproviderlist = this.dto.Response;
        const dateTime = await this.common.getDateTime();
        const currentTime = await this.common.convertMyanmarTime(dateTime);
        var fromDateTime; 
        var fromDate;
        var fromDate1;
        var fromTime;
        var fromTime1;
        var toTime;
        var toDate;
        var toDateTime;
        var toTime1;
        var toDate1;
        if (gameproviderlist != undefined) {
                
            if (gameproviderlist.fromTime != null && gameproviderlist.toTime != null) {              
              fromDateTime = gameproviderlist.fromTime.split(" ");
              fromDate=fromDateTime[0];
              fromDate1=fromDate.split("-");
              fromTime=fromDateTime[1];
              fromTime1=fromTime.split(":");

             var from = new Date();
              from.setDate(fromDate1[2])
              from.setHours(fromTime1[0]);
              from.setMinutes(fromTime1[1]);
              toDateTime=gameproviderlist.toTime.split(" ");
             
              toDate = toDateTime[0];
              toTime = toDateTime[1];
              toDate1=toDate.split("-");
              toTime1=toTime.split(":");
              var to = new Date(currentTime);
              to.setDate(toDate1[2]);
              to.setHours(toTime1[0]);
              to.setMinutes(toTime1[1]);
            
            this.getTwoDCloseDiffNew(from, to, null);     
            }          
        }
      
    });
    
  }
 


  async getTwoDCloseDiffNew(startTime, endTime, resultTime) {
  
    this.maintenanceCloseTime= false;
    var duration;
    const currentDate = await this.common.getDateTime();
    
  
    var sTime = new Date(startTime);
    var eTime = new Date(endTime);
  // startDate = new Date(TodayDate.getFullYear(), TodayDate.getMonth(), TodayDate.getDate(), startTime.getHours(), startTime.getMinutes(), 0);
  // endDate = new Date(TodayDate.getFullYear(), TodayDate.getMonth(), TodayDate.getDate() + 1, endTime.getHours(), endTime.getMinutes(), 0);
  // this.fromTime=startDate;
  // this.toTime=endDate.getTime();
  this.fromTime=sTime.getTime();
  this.toTime=eTime.getTime();
  var diff =this.toTime-this.fromTime;

  
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
