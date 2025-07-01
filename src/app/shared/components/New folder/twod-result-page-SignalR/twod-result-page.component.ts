import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';


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
  constructor(
    private toastr: ToastrService, 
    private dto: DtoService,
    private funct: FunctService,
    private http: HttpClient,
  ) 
    {
     
    }

  ngOnInit(): void {
    this.getTwoDResult();
  }


  handleError(error: HttpErrorResponse){
  
    //.log(JSON.stringify(error))
    if(error.status == 0){
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        return;
    }
    else
    {
       this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        return;
    }
   
 }
  async getTwoDResult() { 
    this.http.get(this.funct.ipaddresslive + 'twod/getTwodWeeklyResults').subscribe(
      async result => {
        this.dto.Response = result;       
        this.resultList=this.dto.Response;
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
            resultList: groups[date].sort((a, b) => a.id - b.id)
          };
        });       
        this.groupArrays.sort((a, b) => new Date(b.date).setHours(0, 0, 0, 0) - new Date(a.date).setHours(0, 0, 0, 0));        
      }
      
    );
    
    //var response = await this.query.find();
    // var data = await this.query.find();
    // if (data != null && data != "") {
    //   data.forEach(e => {
    //     var item = {
    //       date: new Date( e.get('date')).toISOString(),
    //       time: e.get('time_1030'),
    //       set: e.get('set_1030'),
    //       value: e.get('val_1030'),
    //       result: e.get('result_1030'),
    //     };
    //     this.resultList.push(item);
    //   });
    //   // this.newResultList = this.groupByType(this.resultList);
    //   // this.newResultList = this.sort(this.newResultList);     
     
    //   const groups = this.resultList.reduce((groups, game) => {
    //     const date = game.date.split('T')[0];
    //     if (!groups[date]) {
    //       groups[date] = [];
    //     }
    //     groups[date].push(game);
    //     return groups;
    //   }, {});
      
    //   this.groupArrays = Object.keys(groups).map((date) => {
    //     return {
    //       date,
    //       resultList: groups[date]
    //     };
    //   });
    //   this.groupArrays.sort((a, b) => new Date(b.date).setHours(0, 0, 0, 0) - new Date(a.date).setHours(0, 0, 0, 0));
    //  }
}

  getDate(date) {
    var formatter = 'MM-dd-yyyy';
    return formatDate(Date.parse(date), formatter, 'en_US');
  }

  
  changeDateFormat(date)
  {   
    const format = 'EEEE';   
    const locale = 'en-US';
    const formatemdy= 'dd-MM-yyyy';
    const formattedDate = formatDate(date, format, locale);  
    const newdate= formatDate(date, formatemdy, locale);
    return newdate+" "+formattedDate;//+" "+tempDate;  
  }

}
