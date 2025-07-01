import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, delay, retry } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';


@Component({
  selector: 'app-promotion-detail',
  templateUrl: './promotion-detail.component.html',
  styleUrls: ['./promotion-detail.component.scss']
})
export class PromotionDetailComponent implements OnInit {
  promotionId : any;
  token : any;
  promotionDetailObj: any;
  promotionCount : any;
  promotionList : any;
  linktext:any;
  promolink:any;
  openUrl:any;
  constructor(
    private spinner: NgxSpinnerService,
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private dto: DtoService,
    private funct: FunctService,
    private http: HttpClient,
    private toastr: ToastrService,
    private storage: LocalStorageService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,) { 
     
    }

  ngOnInit(): void {
    this.common.refreshLoading=true;
    this.spinner.show("refreshLoading");
    this.promotionId = this.route.snapshot.paramMap.get("id");
    this.promotionCount = this.storage.retrieve('localpromotionCount');
    this.promotionList = this.storage.retrieve('localpromotionList');
    this.openUrl="?openinnewtap=1";
    for(var i = 0 ; i < this.promotionList.length ; i++)
    {
      if(this.promotionList[i].id == this.promotionId && this.promotionList[i].readStatus == 0)
      {
        this.promotionCount = this.promotionCount - 1;
      }
    }
    this.storage.store('localpromotionCount',this.promotionCount);
    this.getPromotionById();
  }
  getPromotionById()
  {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',  this.token);
    let params = new HttpParams();
    params = params.set("id",this.promotionId);
    this.http.get(this.funct.ipaddress + 'promotion/GetPromotionDetail', { params: params, headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
      )
    .subscribe(
      result => {
        this.common.refreshLoading=false;
        this.spinner.hide("refreshLoading");
        this.dto.Response = result;
        this.storage.store('localpromotionObj',  this.dto.Response);
        this.promotionDetailObj = this.storage.retrieve('localpromotionObj');
         }
    );
  }
}
