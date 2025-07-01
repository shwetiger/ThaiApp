import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { FunctService } from '../../../service/funct.service';
import { CommonService } from '../../../service/common.service';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DtoService } from '../../../service/dto.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
import { formatDate } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-threed-result',
  templateUrl: './threed-result.component.html',
  styleUrls: ['./threed-result.component.css']
})
export class ThreedResultComponent implements OnInit {
  token:any;
  resultList:Array<any>=[];
  pageNumber:any;
  rowsOfPage:any;
  isLast: boolean = false;
  query: any;

   /*XXX*/
   spinnerName :string;
  constructor(private spinner: NgxSpinnerService,private http: HttpClient,private funct: FunctService,private toastr: ToastrService, private dto: DtoService,
    private router: Router,private storage: LocalStorageService) 
  {
   
      // this.pageNumber=0;
      // this.rowsOfPage=40;
      /*XXX*/
      this.spinnerName = "threedresultLoading";
     
    }

  ngOnInit(): void {
   this.resultList=[];
  //  this.getThreedResult(0);  

  this.getThreedResult();  
  }


    async getThreeResult() {
    var response = await this.query.find();
    var data = await this.query.find();
    if (data != null && data != "") {
      response.forEach(e => {
        var item = {
          date:e.get('date'),
          number: e.get('number'),
        };
        this.resultList.push(item);
      });
      this.resultList.sort((a,b)=> new Date(b.date).getTime() > new Date(a.date).getTime() ? 1 : -1)
    }
    }
    getDate(date) {
    var formatter = 'dd-MM-yyyy';
    return formatDate(date, formatter, 'en_US');
    }
    handleError(error: HttpErrorResponse)
    {
    
      if(error.status == 400)
        {
          this.toastr.error("Bad request.", 'Invalid!', {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            });
        }
        return throwError(error);
    }
  

  //add
  getThreedResult()
  {
    
    this.spinner.show(this.spinnerName);     
    let headers = new HttpHeaders();      
    this.http.get(this.funct.ipaddresslive + 'twod/getThreedResults', {headers: headers })
    .pipe
      (
          catchError(this.handleError.bind(this))
      )
    .subscribe(
      result => {
        this.dto.Response = result;
        this.resultList = this.dto.Response;        
        this.spinner.hide(this.spinnerName);
       
      }
    );
  }
}
