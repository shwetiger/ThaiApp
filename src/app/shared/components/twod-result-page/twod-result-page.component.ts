import { Component, OnInit } from '@angular/core';
import * as Parse from 'parse';
import { formatDate } from '@angular/common';
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from 'ngx-webstorage';
import '@angular/common/locales/global/th';
import '@angular/common/locales/global/zh';
import '@angular/common/locales/global/my'


@Component({
  selector: 'app-twod-result-page',
  templateUrl: './twod-result-page.component.html',
  styleUrls: ['./twod-result-page.component.scss']
})
export class TwodResultPageComponent  implements OnInit {
  token:any;
  resultList: Array<any> = [];
  newResultList: Array<any> = [];
  query: any;
  resultMap = new Map();
  groups: any;
  groupArrays: any;
  loading: any;
  constructor( private spinner: NgxSpinnerService,private storage: LocalStorageService,)
    {

    }
  ngOnInit(): void {
    this.loading= true;
    this.spinner.show();
    (Parse as any).serverURL = 'https://thai2d3d.b4a.io';
    (Parse as any).keyLiveQueryUrl = 'wss://tslive.b4a.io';
    (Parse as any).initialize('dxEhlPEJK3rGaa1viywMIxS31lqCFZMwb0oHQWXJ', 'G4ePnxxZcdObpoF8bZMx2QzvgNlFrpGb8WHrF0Bx');//PASTE HERE YOUR Back4App APPLICATION ID AND YOUR JavaScript KEY
    this.query = new (Parse as any).Query('TwoDWeeklyLiveResult');
    this.getTwoDResult();
  }

  async getTwoDResult() {
    //var response = await this.query.find();
    var data = await this.query.find();
    if (data != null && data != "") {
      data.forEach(e => {
        var item = {
          date: new Date( e.get('date')).toISOString(),
          time: e.get('time_1030'),
          set: e.get('set_1030'),
          value: e.get('val_1030'),
          result: e.get('result_1030'),
          set0:0,
          set1:0,
          val0:0,
          val1:0,
          val2:0
        };
        this.resultList.push(item);
      });
      this.resultList.forEach((item, index) => {

        if (item.set != "--" && item.set != null && item.set != '') {
                item.set0 = item.set.substr(0, item.set.length - 1);
                item.set1 = item.set.substr(item.set.length - 1, item.set.length);
        }
        if (item.value != "--" && item.value != null && item.value != '') {
         item.val0 = item.value.substr(0, item.value.length - 4);
         item.val1 = item.value.substr(item.value.length - 4, 1);
         item.val2 = item.value.substr(item.value.length - 3, item.value.length);

  }
        // this.resultList.push(set0 :set0)
        // this.resultList.push(set1)
        });
      // set0 = item.set.substr(0, item.set.length - 1);
      // set1 = item.set.substr(item.set.length - 1, item.set.length);
      const groups = this.resultList.reduce((groups, game) => {
        const date = game.date.split('T')[0];
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(game);
        return groups;
      }, {});

      this.groupArrays = Object.keys(groups).map((date) => {
        return {
          date,
          resultList: groups[date]
        };
      });
      this.groupArrays.sort((a, b) => new Date(b.date).setHours(0, 0, 0, 0) - new Date(a.date).setHours(0, 0, 0, 0));
    this.loading= false;
    this.spinner.hide();
  }
}

  getDate(date) {
    var formatter = 'MM-dd-yyyy';
    return formatDate(Date.parse(date), formatter, 'en_US');
  }

  // changeDateFormat(date)
  // {
  //   const format = 'EEEE';
  //   const lang=this.storage.retrieve('localLanguage');
  //   const locale='en-US';
  //   if(lang=='en')
  //   {
  //    locale = 'en-US';
  //   }
  //   if(lang=='th')
  //   {
  //    locale = 'en-US';
  //   }
  //   if(lang=='zh')
  //   {
  //    locale = 'en-US';
  //   }
  //    if(lang=='my')
  //   {
  //    locale = 'en-US';
  //   }

  //   const formatemdy= 'dd-MM-yyyy';
  //   const formattedDate = formatDate(date, format, locale);
  //   const newdate= formatDate(date, formatemdy, locale);
  //   return newdate+" "+formattedDate;//+" "+tempDate;
  // }

  changeDateFormat(date: any) {

  const lang = this.storage.retrieve('localLanguage');

  const localeMap: any = {
    en: 'en-US',
    th: 'th',
    zh: 'zh',
    my: 'my'
  };

  const locale = localeMap[lang] || 'en-US';

  const formattedDay = formatDate(date, 'EEEE', locale);
  const formattedDate = formatDate(date, 'dd-MM-yyyy', locale);
  return `${formattedDate} ${formattedDay}`;
}
}
