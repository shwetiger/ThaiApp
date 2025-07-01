import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';


@Component({
  selector: 'app-holiday-list-page',
  templateUrl: './holiday-list-page.component.html',
  styleUrls: ['./holiday-list-page.component.scss']
})
export class HolidayListPageComponent implements OnInit {
 
  holidayList: Array<any> = [];
  newResultList: Array<any> = [];
  constructor(
    private translateService: TranslateService,
    private storage: LocalStorageService,
    private http: HttpClient,
    private funct: FunctService, 
    private toastr: ToastrService,
    private dto: DtoService,) 
    { }

  ngOnInit(): void {
    this.getHolidays();
  }

    handleError(error: HttpErrorResponse){
    if(error.status == 0){
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    
    if(error.status == 423)
    {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        this.storage.clear('token');
        this.storage.clear('isUserLoggedIn');
    }
    
    if(error.status == 400)
    {
       this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
    }
   
    return throwError(error);
    }
  
    getHolidays(){
    let headers = new HttpHeaders(); 
    this.http.get( this.funct.ipaddress + 'holiday/GetHolidayList', { headers: headers } )
    .pipe(
      catchError(this.handleError.bind(this))
   )
    .subscribe(
      result => {
        this.dto.Response = result;   
        const sortedHolidays = this.dto.Response.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        sortedHolidays.forEach(e => {
          this.holidayList.push(e);
        });
      this.newResultList = this.groupByType(this.holidayList);
      }
      );   

    }
  
  getMonth(date) {
    var formatter = 'MMMM';
    return formatDate(date, formatter, 'en-US');
  }
  
  getDate(date) {
    var formatter = 'dd-MM-yyyy';
    return formatDate(date, formatter, 'en-US');
  } 
  
  sort(unsortedList: any): any {
  const keys: string[] = Object.keys(unsortedList);  
  var sortedKeys = keys.sort((a,b)=>new Date(b).getTime() - new Date(a).getTime() );
  const sortedList: any = {};

  sortedKeys.forEach(x => {
    sortedList[x] = unsortedList[x];
  });

  return sortedList;
}
  
asIsOrder(a, b) {
  return 1;
}
//   groupByType(array){
//     return array.reduce((r, a) => {
//       var value=  this.getMonth(a.date);
//           r[value] = r[value] || [];
//           r[value].push(a);
//           return r;
//       }, Object.create(null));
//   }

// }

 groupByType(array) {
  return array.reduce((r, a) => {
      // Get the date object
      const date = new Date(a.date); // Ensure a.date is a Date object

      // Format the month as the full month name (e.g., 'January', 'February', etc.)
      const monthName = date.toLocaleString('default', { month: 'long' }); // "January", "February", etc.
      
      // Format the year and combine it with the month name
      const yearMonth = `${date.getFullYear()}-${monthName}`; // "YYYY-MonthName"
      
      // Initialize the array for the year-month key if it doesn't exist
      r[yearMonth] = r[yearMonth] || [];
      
      // Push the item into the respective group
      r[yearMonth].push(a);
      
      return r;
  }, Object.create(null));
}
}
