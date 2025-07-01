import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, delay, retry } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocationStrategy } from '@angular/common';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';


@Component({
  selector: 'app-promotion-list',
  templateUrl: './promotion-list.component.html',
  styleUrls: ['./promotion-list.component.scss']
})
export class PromotionListComponent implements OnInit {

  name: any;
  selectedIndex: any;
  promotionList: any;
  token: any;
  promotionCount : any;

  constructor(    
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private Location: LocationStrategy,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private funct: FunctService,
    private http: HttpClient,
    private toastr: ToastrService,
    private storage: LocalStorageService,
    private sanitizer: DomSanitizer) {
    this.name=history.state.name; 
    this.selectedIndex = 0;    
    
   }
  

  ngOnInit(): void {
    this.common.refreshLoading=true;
    this.spinner.show("refreshLoading");
    this.getAllPromotions();
  }
 
  getAllPromotions()
  {   
    this.promotionList = this.storage.retrieve('localpromotionList');    
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',  this.token);
    this.http.get(this.funct.ipaddress + 'promotion/GetPromotionList', { headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
      )
    .subscribe(
      result => {
        this.common.refreshLoading=false;
        this.spinner.hide("refreshLoading");
        this.dto.Response = result;
        this.storage.store('localpromotionList',  this.dto.Response);
        this.promotionList = this.storage.retrieve('localpromotionList');
        var count = 0;
        for(var i = 0 ; i < this.promotionList.length ;i++)
        {
          if(this.promotionList[i].readStatus != 1)
          {
             count++;
          }
        }
        this.storage.store('localpromotionCount',count);
        this.promotionCount = this.storage.retrieve('localpromotionCount');
       
      }
    );
  }

  refreshPage()
  {  
    
    this.ngOnInit();
    setTimeout(() =>
    {
      this.common.refreshLoading=false;
      this.spinner.hide("refreshLoading");

    }, 1000);
    //window.location.reload();
  }
}
