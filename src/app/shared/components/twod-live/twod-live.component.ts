import { formatDate } from '@angular/common';
import { Component, OnInit,OnDestroy } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from 'ngx-webstorage';
import * as Parse from 'parse';
import { CommonService } from '../../service/common.service';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { FunctService } from '../../service/funct.service';
import { DtoService } from '../../service/dto.service';
import { HandleErrorMessageService } from '../../service/handle-error-message.service';
import { catchError } from 'rxjs/internal/operators/catchError';


@Component({
  selector: 'app-twod-live',
  templateUrl: './twod-live.component.html',
  styleUrls: ['./twod-live.component.scss'],

})
export class TwodLiveComponent implements OnInit, OnDestroy{
    token:any;
    isServerapicall: boolean = false;
    liveserverdata:any;
    lastUpdateDate:any;
    result:any;
    intervalId:any;
  constructor(
    public handleErrorMessage: HandleErrorMessageService,
    private storage: LocalStorageService,
    public common: CommonService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private funct: FunctService,
    private dto: DtoService,) {
  }
  async ngOnInit() {
    this.getapicalldecision();
    const date = await this.common.getDateTime();
    const currentTime = await this.common.convertMyanmarTime(date);
    this.storage.store('localLiveDate',currentTime);

  }
 ngOnDestroy() {
    clearInterval(this.intervalId);
  }

getapicalldecision()
{
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.post(this.funct.ipaddress + 'LastValue/LastValueFromTS',{}, { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      result => {
        this.dto.Response = result;
        this.isServerapicall=this.dto.Response;
        if (this.isServerapicall) {
            this.getlastValue();
            this.getModernInternet();
            this.intervalId = setInterval(() => {
              this.getlastValue();
              this.getModernInternet();
            }, 3000);


          } else {
            this.getLiveData();
          }
      });
}


getlastValue()
{
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.post(this.funct.ipaddress + 'LastValue/lastValue',{}, { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
    )
    .subscribe(
      async result => {
        this.dto.Response = result;
        this.dto.Response.results.forEach(result => {
        this.liveserverdata = JSON.parse(result.data);
        });

        this.dto.Response.results.forEach(result => {
            this.lastUpdateDate = result.lastUpdateDate;
            });
            this.dto.Response.results.forEach(result => {
                this.result = result.result;
                });
        var datas=this.dto.Response.results
        if (datas != '' && datas != null && datas != undefined) {
        var dateStr1 = new Date(this.lastUpdateDate.iso).toLocaleString("en-US", {timeZone: "Asia/Yangon"});
        const format = 'dd-MM-yyyy h:mm:ss a';
        const myDate = dateStr1;
        const locale = 'en-US';
        const formattedDate = formatDate(myDate, format, locale);
        var updatedTime = "Updated: " + formattedDate;
        var lastIndex=null;
        var showAnimation = false;
        var showManualOutAnimation=false;
        var sectionDatas = JSON.stringify(this.liveserverdata);
        var resuldData=this.result;
        if (sectionDatas != null && sectionDatas != "") {
            document.getElementById('section-container').innerHTML = '<div id="section-container" class="container"> </div>';
            var sectionList = JSON.parse(sectionDatas);

            for (let i = 0; i < sectionList.length; i++) {
                var item = sectionList[i];
                var from = new Date(item.fromDateTime);
                var to = new Date(item.toDateTime);
                var toDisplayDateTime=new Date(item.toDisplayDateTime);
                var now = await this.common.convertMyanmarTime(new Date());//new Date();

                var showManualOut;
                var dateManualOut= new Date(to.setSeconds(to.getSeconds() - 15));

                if ((from.getTime() < now.getTime() && to.getTime() > now.getTime() && !item.isDone))
                {
                    lastIndex = i;
                    showAnimation = true;
                    if(item.switchManual &&  dateManualOut.getTime() <= now.getTime()){
                        showManualOut=true;
                    }
                    break;
                }
                else if((toDisplayDateTime.getTime() <= now.getTime()) && (item.switchManual == true && item.isManual == false))
                {
                    lastIndex = i;
                    showAnimation = true;
                    if(dateManualOut.getTime() <= now.getTime()){
                        showManualOut=true;
                    }
                    break;

                }
                else if(now.getTime() > 17){
                    showAnimation = false;
                }
                else {
                    showAnimation = false;
                }

            }
            document.getElementById('result').innerHTML = resuldData;
            if (showAnimation == false) {
                document.getElementById('result').className = 'resultStyle';
            }
            else {
                document.getElementById('result').className = 'resultStyle';
                document.getElementById('result').className = 'resultStyleAnimate';
            }

            document.getElementById('lastUpdateDate').innerHTML =
                        (showAnimation == false ? "<img src='assets/img/icon/done.png'  width='20'>" : "<img src='assets/img/icon/update.png'  width='20'>")
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
                if((item.isDone == true && item.isManual==true && item.switchManual==true) || !isShake ){
                    result = item.result;
                }

                else{
                    result = "--";
                }
                 var isShake;//=true;
                if(index == lastIndex){
                   isShake= true;
                }
                else{
                    isShake= false;
                }

                    document.getElementById('section-container').innerHTML = `${document.getElementById('section-container').innerHTML}
                    <div class='row section-inner' style = 'width: 100%; text-decoration: none; color: white;'>

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
            });

        }
    }

 });
}

async getLiveData() {
    this.initializeParseClient();

    const client = this.createLiveQueryClient();
    client.open();

    const query = new Parse.Query('TwoDLiveResult');
    const data = await query.get("xNiYjJixOZ");

    if (!data) return;

    const dateObject = this.parseYangonDate(data.get('lastUpdateDate'));
    const formattedDate = this.formatDate(dateObject);
    const updatedTime = "Updated: " + formattedDate;

    const sectionData = data.get('data');

    const resultData = data.get('result');

    if (sectionData) {
      const sectionList = JSON.parse(sectionData);
      const state = this.evaluateSections(sectionList, dateObject);
      this.renderSections(sectionList, state.lastIndex, state.showAnimation);
      this.renderResult(resultData, state.showAnimation);
      this.updateLastUpdateDateUI(state.showAnimation, updatedTime);
    }

    this.subscribeToUpdates(client, query);

    this.getModernInternet();
  }

  initializeParseClient() {
    (Parse as any).serverURL = 'https://thai2d3d.b4a.io';
    (Parse as any).keyLiveQueryUrl = 'wss://thai2d3d.b4a.io';
    (Parse as any).initialize('dxEhlPEJK3rGaa1viywMIxS31lqCFZMwb0oHQWXJ', 'G4ePnxxZcdObpoF8bZMx2QzvgNlFrpGb8WHrF0Bx');
  }

  createLiveQueryClient() {
    return new (Parse as any).LiveQueryClient({
      applicationId: 'dxEhlPEJK3rGaa1viywMIxS31lqCFZMwb0oHQWXJ',
      serverURL: 'wss://thai2d3d.b4a.io',
      javascriptKey: 'G4ePnxxZcdObpoF8bZMx2QzvgNlFrpGb8WHrF0Bx'
    });
  }

  parseYangonDate(dateString) {
    return new Date(new Date(dateString).toLocaleString("en-US", { timeZone: "Asia/Yangon" }));
  }

  // formatDate(date) {
  //   // You can plug in a library like date-fns here
  //   return date.toLocaleString('en-US', {
  //     hour12: true,
  //     day: '2-digit',
  //     month: '2-digit',
  //     year: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     second: '2-digit',
  //   });
  // }

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); // yy

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ,${hours}:${minutes}:${seconds}`;
}

  evaluateSections(sectionList, dateObject) {
    let lastIndex = null;
    let showAnimation = false;

    for (let i = 0; i < sectionList.length; i++) {
      const item = sectionList[i];
      const from = new Date(item.fromDateTime);
      const to = new Date(item.toDateTime);
      const display = new Date(item.toDisplayDateTime);
      const manualOutTime = new Date(to.getTime() - 15000);
      if ((from < dateObject && to > dateObject && !item.isDone) ||
          (display <= dateObject && item.switchManual && !item.isManual)) {
        lastIndex = i;
        showAnimation = true;
        break;
      }

      if (dateObject > 17 && item.isDone) {
        showAnimation = false;
      }
    }

    return { lastIndex, showAnimation };
  }

  updateLastUpdateDateUI(showAnimation, updatedTime) {
    const iconPath = showAnimation
      ? "assets/img/icon/update.png"
      : "assets/img/icon/done.png";

    const html = `
      <img src='${iconPath}' width='20'>
      <span style="font-style: italic;">${updatedTime}</span>
    `;

    const dateElem = document.getElementById('lastUpdateDate');
    if (dateElem) {
      dateElem.innerHTML = html;
    }
  }

  renderSections(sectionList, lastIndex, showAnimation) {
    const container = document.getElementById('section-container');
    container.innerHTML = '<div class="container"></div>';

    sectionList.forEach((item, index) => {
      const isShake = index === lastIndex && showAnimation;
      const set = this.formatSet(item.set);
      const value = this.formatValue(item.value);
      const result = isShake ? "--" : (item.result || "--");

      const html = `
        <div class='row section-inner' style='width: 100%; text-decoration: none; color: white;'>
          <div class='container'>
            <div class='row ${index !== 0 ? "driver mx-1 pt-1" : "mx-1 pt-1"}'></div>
            <div class='row d-flex justify-content-center ${index !== 0 ? "pt-1" : ""}'>${item.section}</div>
            <div class='row' style='padding-top: 8px; text-align: center; justify-content: space-between;'>
              <div class='col-4'><p style='color: silver;'>Set</p></div>
              <div class='col-4'><p style='color: silver;'>Value</p></div>
              <div class='col-4'><p style='color: silver;'>2D</p></div>
            </div>
            <div class='row mb-1 ${isShake ? 'annimate' : 'no-annimate'}'>
              <div class='col-4'>${set}</div>
              <div class='col-4'>${value}</div>
              <div class='col-4'><span style='color: #ffff00;'>${result}</span></div>
            </div>
          </div>
        </div>`;
      container.innerHTML += html;

    });
  }

  renderResult(resultData, showAnimation) {
    const resultElem = document.getElementById('result');
    resultElem.innerHTML = resultData;
    resultElem.className = showAnimation ? 'resultStyleAnimate' : 'resultStyle';
  }

  formatSet(set = '--') {
    if (!set || set === '--') return '<span>--</span>';
    return `<span>${set.slice(0, -1)}</span><span style='color: #ffff00;'>${set.slice(-1)}</span>`;
  }

  formatValue(value = '--') {
    if (!value || value === '--') return '<span>--</span>';
    return `<span>${value.slice(0, -4)}</span><span style='color: #ffff00;'>${value.slice(-4, -3)}</span><span>${value.slice(-3)}</span>`;
  }

  subscribeToUpdates(client, query) {
    const subscription = client.subscribe(query);
    subscription.on('open', () => { /* maybe log */ });
    subscription.on('update', (result) => {
      const page = document.getElementById('livePage');
      if (page) {
        this.handleLiveUpdate(result);
      }
    });
  }

 async handleLiveUpdate(result) {
  const page = document.getElementById('livePage');
  if (!page) return;

  const datas = result;
  if (!datas) return;

  const rawDate = datas.get('lastUpdateDate');
  const dateObject = this.parseYangonDate(rawDate);
  const formattedDate = this.formatDate(dateObject);
  const updatedTime = "Updated: " + formattedDate;

  const sectionData = datas.get('data');
  const resultData = datas.get('result');

  if (sectionData) {
    const sectionList = JSON.parse(sectionData);
    const state = this.evaluateSections(sectionList, dateObject);
    this.renderSections(sectionList, state.lastIndex, state.showAnimation);
    this.renderResult(resultData, state.showAnimation);
    this.updateLastUpdateDateUI(state.showAnimation, updatedTime);
  }
}


  async getModernInternet() {
    (Parse as any).serverURL = 'https://thai2d3d.b4a.io';
    (Parse as any).keyLiveQueryUrl = 'wss://thai2d3d.b4a.io';
    Parse.initialize('dxEhlPEJK3rGaa1viywMIxS31lqCFZMwb0oHQWXJ', 'G4ePnxxZcdObpoF8bZMx2QzvgNlFrpGb8WHrF0Bx');
    var client = new  (Parse as any).LiveQueryClient({
        applicationId: 'dxEhlPEJK3rGaa1viywMIxS31lqCFZMwb0oHQWXJ',
        serverURL: 'wss://thai2d3d.b4a.io',
        javascriptKey: 'G4ePnxxZcdObpoF8bZMx2QzvgNlFrpGb8WHrF0Bx'
    });

    var modernInternetLink=new (Parse as any).Query('ModernInternet');
    var modernInternetLinkDatas = await modernInternetLink.get("F0QapwSYJl"); // F0QapwSYJl // yuQAHDBzeE
    var Live2dboss = new (Parse as any).Query('Live2dboss');
    var Live2dbossDatas = await Live2dboss.get("I2CZXHqtbT"); //I2CZXHqtbT //AJotixiCSi
    const axios = require('axios').default;
    const response = await axios.get(Live2dbossDatas.get('link'));
    var datas= response.data.data;
    var currentTime= this.storage.retrieve('localLiveDate');
    var dateTime = await this.common.convertMyanmarTime(new Date(currentTime));
    let twodSectionDatas;
    if(datas == undefined || datas == null){
        if((dateTime.getHours() == 9  && dateTime.getMinutes() >= 30) || dateTime.getHours() > 9 ){
            twodSectionDatas={'modern_930': modernInternetLinkDatas.get('modern'),'internet_930': modernInternetLinkDatas.get('internet'),
            'modern_200': "",'internet_200':""}
        }
        if( dateTime.getHours() >= 14 ){
            twodSectionDatas={'modern_930': modernInternetLinkDatas.get('modern'),'internet_930': modernInternetLinkDatas.get('internet'),
            'modern_200': modernInternetLinkDatas.get('modern230'),'internet_200': modernInternetLinkDatas.get('internet230')}
        }
        else{
            twodSectionDatas={'modern_930': modernInternetLinkDatas.get('modern'),'internet_930': modernInternetLinkDatas.get('internet'),
            'modern_200': modernInternetLinkDatas.get('modern230'),'internet_200': modernInternetLinkDatas.get('internet230')}
        }
    }
    else{
        if(((dateTime.getHours() == 9  && dateTime.getMinutes() >= 30) || dateTime.getHours() > 9) && dateTime.getHours() < 14 ){
            if(datas.internet_930 == null || datas.modern_930 == null){
                datas.internet_930 = modernInternetLinkDatas.get('internet');
                datas.modern_930 = modernInternetLinkDatas.get('modern');
                twodSectionDatas= datas;
            }
            else{
                twodSectionDatas= datas;
            }
        }
        if(dateTime.getHours() >= 14 ){
            if(datas.internet_930 == null || datas.modern_930 == null){
                datas.internet_930 = modernInternetLinkDatas.get('internet');
                datas.modern_930 = modernInternetLinkDatas.get('modern');
                twodSectionDatas= datas;
            }
            if(datas.internet_200 == null || datas.modern_200 == null){
                datas.internet_200 =  modernInternetLinkDatas.get('internet230');
                datas.modern_200 = modernInternetLinkDatas.get('modern230');
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

    if (twodSectionDatas != '' && twodSectionDatas != null && twodSectionDatas != undefined) {
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

}

function OnDestroy() {
    throw new Error('Function not implemented.');
}

