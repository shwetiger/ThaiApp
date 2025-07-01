import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from 'ngx-webstorage';

import { DatePipe, formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { DtoService } from '../../service/dto.service';
import { CommonService } from '../../service/common.service';
import { FunctService } from '../../service/funct.service';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';

@Component({
  selector: 'app-twod-live',
  templateUrl: './twod-live.component.html',
  styleUrls: ['./twod-live.component.scss'],

})
export class TwodLiveComponent implements OnInit{
   private _connection1: HubConnection;
 

  constructor(   
    private toastr: ToastrService,
    private dto: DtoService,
    private http: HttpClient,
    private datePipe: DatePipe,
    private storage: LocalStorageService,
    public common: CommonService,
    private spinner: NgxSpinnerService,
    private funct: FunctService,) { 
    
  }  
  async ngOnInit(){    
    const date = await this.common.getDateTime();
    const currentTime = await this.common.convertMyanmarTime(date);
    this.storage.store('localLiveDate',currentTime);    
    await this.getLiveData();   
    await this.getModernInternet(); 
  }
 
  async getLiveData() {   
    this._connection1  = new HubConnectionBuilder()
    .withUrl('https://api.thai2dlive.com/liveDataHub', {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
     })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

    this._connection1.on("liveData", async function (datas, message) {   
      if (datas != '' && datas != null && datas != undefined) {
        document.getElementById('result').innerHTML = datas[0].result; 
        var dateStr1 = new Date(datas[0].lastUpdateDate.split(".")[0]+ "Z").toLocaleString("en-US", {timeZone: "Asia/Yangon"}); 
        const format = 'dd-MM-yyyy h:mm:ss a';
        const myDate = dateStr1;
        const locale = 'en-US';
        const formattedDate = formatDate(myDate, format, locale);         
        var updatedTime = "Updated: " + formattedDate; 
        //mmtime
        var currentTime=new Date();
        const localDate = new Date(currentTime);
        const timeZoneOffset = new Date(currentTime).getTimezoneOffset();
        let offsetMinutes: any;
        if (timeZoneOffset != -390) {
        if (timeZoneOffset < -390) { // thai= -420, china = -480 (early than myanmar)
            offsetMinutes = Math.abs(timeZoneOffset) - 390;

            var hours = (offsetMinutes / 60);
            var rhours = Math.floor(hours);
            var minutes = (hours - rhours) * 60;
            var rminutes = Math.round(minutes);
    
            localDate.setHours(localDate.getHours()-rhours);
            localDate.setMinutes(localDate.getMinutes()-rminutes);
        }
        if (timeZoneOffset > -390) { // us = 420 (later than myanmar)
            offsetMinutes = timeZoneOffset - (-390);

            var hours = (offsetMinutes / 60);
            var rhours = Math.floor(hours);
            var minutes = (hours - rhours) * 60;
            var rminutes = Math.round(minutes);
    
            localDate.setHours(localDate.getHours()+rhours);
            localDate.setMinutes(localDate.getMinutes()+rminutes);
        }
        }

        const now= localDate;  
       
        var showAnimation = false;
        //var showManualOutAnimation=false;
        var sectionDatas = datas[0].data;
        if (sectionDatas != null && sectionDatas != "") {
            document.getElementById('section-container').innerHTML = '<div id="section-container" class="container"> </div>';
            var sectionList = JSON.parse(sectionDatas);      
            // var sectionList=[{"section":"10:30 AM","set":"1,580.09","value":"22,125.33","result":"95","isManual":false,"isDone":true,"from":"09:30:00","to":"10:30:00","toDisplay":"10:30:00","fromDateTime":"2022-06-27T09:30:00","toDateTime":"2022-06-27T10:30:00","toDisplayDateTime":"2022-06-27T10:30:00"},
            // {"section":"12:01 PM","set":"1,577.19","value":"33,906.32","result":"96","isManual":true,"isDone":true,"from":"11:00:00","to":"12:01:00","toDisplay":"12:01:00","fromDateTime":"2022-06-27T11:00:00","toDateTime":"2022-06-27T12:01:00","toDisplayDateTime":"2022-06-27T12:01:00"},
            // {"section":"02:30 PM","set":"--","value":"--","result":"--","isManual":false,"isDone":false,"from":"13:30:00","to":"14:30:00","toDisplay":"14:30:00","fromDateTime":"2022-06-27T13:30:00","toDateTime":"2022-06-27T14:30:00","toDisplayDateTime":"2022-06-27T14:30:00"},
            // {"section":"04:30 PM","set":"--","value":"--","result":"--","isManual":false,"isDone":false,"from":"15:00:00","to":"16:30:00","toDisplay":"16:30:00","fromDateTime":"2022-06-27T15:00:00","toDateTime":"2022-06-27T16:30:00","toDisplayDateTime":"2022-06-27T16:30:00"}];

            for (let i = 0; i < sectionList.length; i++) {
                var item = sectionList[i];
                var from = new Date(item.fromDateTime);
                var to = new Date(item.toDateTime);
                var toDisplayDateTime=new Date(item.toDisplayDateTime);  
                
                if ((from.getTime() < now.getTime() && to.getTime() > now.getTime() && !item.isDone)) 
                {                      
                    showAnimation = true;                                    
                    break;
                } 
                else if((toDisplayDateTime.getTime() <= now.getTime()) && (item.switchManual == true && item.isManual == false))
                {

                    showAnimation = true;   
                    break;
                }   
                if(toDisplayDateTime.getTime() > now.getTime()){
                    if(((item.switchManual && item.isManual) || (!item.switchManual && item.isDone))){                       
                        showAnimation = false;
                       
                    }
                    if(((item.switchManual && !item.isManual) || (!item.switchManual && !item.isDone))){
                        if(now.getTime() < from.getTime()){ 
                            if((!sectionList[i-1].switchManual && !sectionList[i-1].isDone)
                            || sectionList[i-1].switchManual && !sectionList[i-1].isManual){
                                showAnimation = true; 
                                break; 
                            } 
                            else{
                                showAnimation = false;                                                        
                                break; 
                            }                           
                        }                             
                    }                                                         
                } 
                else {                      
                    showAnimation = false;                    
                }    
            }           
            if (showAnimation == false) {
                updatedTime=  "Updated: " + formattedDate.substring(0, formattedDate.length-6) 
                +":00"+  formattedDate.substring( formattedDate.length-3, formattedDate.length); 
                
                document.getElementById('result').className = 'resultStyle';
            }
            else {
                document.getElementById('result').className = 'resultStyle'; 
                document.getElementById('result').className = 'resultStyleAnimate';                
            }
           
            
            document.getElementById('lastUpdateDate').innerHTML =
                (showAnimation == false ? "<i class='material-icons' style='font-size: 18px; margin-right: 4px; color: green; position: relative; top: 3px;'>done</i> " : "<i class='material-icons' style='font-size: 18px; margin-right: 4px; position: relative; top: 3px;'>update</i>")
                + '<span style="font-style: italic;">' + updatedTime + '</span>';

            sectionList.forEach((item, index) => {
                var section = item.section;
                var set0 = '--';
                var set1 = '';
                if (item.set != "--" && item.set != null && item.set != '') {                    
                        set0 = item.set.substr(0, item.set.length - 1);
                        set1 = item.set.substr(item.set.length - 1, item.set.length);                    
                }
                var val0 = '--';
                var val1 = '';
                var val2 = '';
                var result = '--';
                if (item.value != "--" && item.value != null && item.value != '') {                   
                        val0 = item.value.substr(0, item.value.length - 4);
                        val1 = item.value.substr(item.value.length - 4, 1);
                        val2 = item.value.substr(item.value.length - 3, item.value.length);                                     
                }
                if(item.isDone == true ){
                    result = item.result;
                }
                else{
                    result = "--";
                } 
                var from = new Date(item.fromDateTime);
                var to = new Date(item.toDateTime);
                var toDisplayDateTime=new Date(item.toDisplayDateTime); 
                var isShake= true;
                if (((from.getTime() < now.getTime() && to.getTime() > now.getTime() && !item.isDone )
                || (toDisplayDateTime.getTime() <= now.getTime() )) && ((item.switchManual && !item.isManual) || (!item.switchManual && !item.isDone)))
                {
                    isShake = true; 
                    
                }
                else isShake = false; 
                //show 
              
                document.getElementById('section-container').innerHTML = `${document.getElementById('section-container').innerHTML}
                <div class='row section-inner' style="color: white;">                      
                    <div class='container'>
                        <div class='row ${index != 0?"driver mx-1 pt-1":"mx-1 pt-1" }'></div>
                        <div class='row d-flex justify-content-center ${index != 0?"pt-1":"" }'> ${section} </div>
                        <div class='row' style='padding-top: 8px; text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between;'> 
                            <div class='col-4'><p style='color: silver;'>Set</p></div>
                            <div class='col-4'><p style='color: silver;'>Value</p></div>
                            <div class='col-4'><p style='color: silver;'>2D</p></div>                            
                        </div >
                        <div class='row ${isShake ? 'annimate' : 'no-annimate'}'>
                        <div class='col-4'> <span>${set0}</span ><span style='color: #ffff00;'>${set1}</span></div> 
                        <div class='col-4'><span>${val0}</span><span style='color: #ffff00;'>${val1}</span><span>${val2}</span></div> 
                        <div class='col-4'><span style='color: #ffff00;'>${isShake == true?"--": result}</span> </div>                             
                        </div>
                        <div class='row ${index == sectionList.length-1 ?"pb-1":"" }'></div>                            
                    </div>                      
                </div>`; 
                $('#modern-container').show();                    
                $('#loading').hide();     
            });

                    
        }       
      }      
    });
    this._connection1.start().then(function () { 
    }).catch(function (err) {        
    });    
  }

  ngOnDestroy(){   
    this._connection1.stop();
  }
  
  handleError(error: HttpErrorResponse)
  {
      if(error.status == 400)
      {
         this.toastr.error("Bad request.", '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          });
          return;
      }
      else{
        this.toastr.error("", error.status.toString(), {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            });
            return;
      }  
  }
  async getModernInternet() {    
    var modernInternetLinkDatas; 
    
    const axiosM = require('axios').default;
    const responseM = await axiosM.get(this.funct.ipaddresslive + 'twod/getModernInternet');
    var modernInternetLinkDatas= responseM.data;
    const axios = require('axios').default;
    const response = await axios.get(this.funct.ipaddressluke);
    var datas= response.data.data;
    var currentTime= this.storage.retrieve('localLiveDate');
    var dateTime = new Date(currentTime);
    let twodSectionDatas;
    if(datas == undefined || datas == null){
        if((dateTime.getHours() == 9  && dateTime.getMinutes() >= 30) || dateTime.getHours() > 9 ){
            twodSectionDatas={'modern_930': modernInternetLinkDatas[0].modern,'internet_930': modernInternetLinkDatas[0].internet,
            'modern_200': "",'internet_200':""}
        }
        if( dateTime.getHours() >= 14 ){
            twodSectionDatas={'modern_930': modernInternetLinkDatas[0].modern,'internet_930': modernInternetLinkDatas[0].internet,
            'modern_200': modernInternetLinkDatas[0].modern230,'internet_200': modernInternetLinkDatas[0].internet230}
        }
        else{
            twodSectionDatas={'modern_930': modernInternetLinkDatas[0].modern,'internet_930': modernInternetLinkDatas[0].internet,
            'modern_200': modernInternetLinkDatas[0].modern230,'internet_200': modernInternetLinkDatas[0].internet230}
        }
    }
    else{
        if((dateTime.getHours() == 9  && dateTime.getMinutes() >= 30) || dateTime.getHours() > 9 ){
            if(datas.internet_930 == null || datas.modern_930 == null){
                datas.internet_930 = modernInternetLinkDatas[0].internet;
                datas.modern_930 = modernInternetLinkDatas[0].modern;                            
                twodSectionDatas= datas;                
            }  
            else{
                twodSectionDatas= datas;
            }         
        }
        if(dateTime.getHours() >= 14 ){
            if(datas.internet_200 == null || datas.modern_200 == null){
                datas.internet_930 = modernInternetLinkDatas[0].internet;
                datas.modern_930 = modernInternetLinkDatas[0].modern;
                datas.internet_200 =  modernInternetLinkDatas[0].internet230;
                datas.modern_200 = modernInternetLinkDatas[0].modern230;
                twodSectionDatas= datas;
            }  
            else{
                twodSectionDatas= datas;
            }
        }
       else{
        twodSectionDatas= datas;
       }
       
        
    }   
    var internet930 = twodSectionDatas.internet_930 == "" || twodSectionDatas.internet_930 == null ? "--" : twodSectionDatas.internet_930;
    var modern930 = twodSectionDatas.modern_930 == "" || twodSectionDatas.modern_930 == null ? "--" : twodSectionDatas.modern_930;
    var internet200 = twodSectionDatas.internet_200 == "" || twodSectionDatas.internet_200 == null ? "--" : twodSectionDatas.internet_200;
    var modern200 = twodSectionDatas.modern_200 == "" || twodSectionDatas.modern_200 == null ? "--" : twodSectionDatas.modern_200;
    document.getElementById('modern-container').innerHTML = `${document.getElementById('modern-container').innerHTML}
    <div class="row header-row" style="margin: 10px 20px !important;">
        <div class="col-3"></div>
        <div class="col-5 text-center text-white">Modern</div>
        <div class="col-4 text-center text-white">Internet</div>
    </div>
    <div class="row modern-1" style="margin: 10px 20px !important;">
        <div class="col-3 text-white">9:30 AM</div>
        <div class="col-5 text-center text-white">${modern930}</div>
        <div class="col-4 text-center" style="color: #ffff00;">${internet930}</div>
    </div>
    <div style="border-bottom: 1px solid silver;margin: 2px 20px !important;" ></div>
    <div class="row modern-2" style="margin: 10px 20px !important;">
        <div class="col-3 text-white">2:00 PM</div>
        <div class="col-5 text-center text-white">${modern200}</div>
        <div class="col-4 text-center" style="color: #ffff00;">${internet200}</div>
    </div>`;
  }

 
}
