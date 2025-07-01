import { Component, OnInit } from '@angular/core';
import { formatDate } from "@angular/common";
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';

@Component({
  selector: 'app-twod-history',
  templateUrl: './twod-history.component.html',
  styleUrls: ['./twod-history.component.scss']
})
export class TwodHistoryComponent implements OnInit {
  query: any;
  liveResult: any;
  updateDate: any;  
  historyList: Array<any>=[];
  date:String;
  result: String;
  section: String;
  set: String;
  value: String;
  isReference: boolean;  
  showdateHistory: string;
  
  constructor(
    private toastr: ToastrService, private dto: DtoService,
    private funct: FunctService,
    private http: HttpClient,   
    private route: ActivatedRoute,) { 
    
  }
  async ngOnInit(): Promise<void> {
    this.section = this.route.snapshot.paramMap.get("section");
    this.showdateHistory = this.route.snapshot.paramMap.get("showdateHistory");
    this.getTwoDHistory();    
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
 getTwoDHistory(){
 
  this.http.get(this.funct.ipaddresslive + 'twod/getHistoryBySections?sectionName='+this.section+'&&lastUpdatedDate='+this.showdateHistory).subscribe(
    result => {
      this.dto.Response = result;       
      this.dto.Response.sort((a, b) => b.id - a.id);        
      this.historyList=this.dto.Response;
      for(let i=0;i<this.historyList.length;i++){
        if(this.historyList[i].isReference){
          this.liveResult = this.historyList[i].result;
          this.updateDate = this.getUpdateDate(this.historyList[i].date);
        }
      }      
    }    
  );
 }

 

  getDate(date) {
    var newDate=  date.split(".")[0]+ "Z";
    var dateStr1 = new Date(newDate).toLocaleString("en-US", {timeZone: "Asia/Yangon"});
    var formatter = 'hh:mm:ss';
    return formatDate(dateStr1, formatter, 'en_US');
    }

  getUpdateDate(date) {
    var newDate=  date.split(".")[0]+ "Z";
    var dateStr1 = new Date(newDate).toLocaleString("en-US", {timeZone: "Asia/Yangon"});
    return dateStr1.replace(",","");
  }
}
