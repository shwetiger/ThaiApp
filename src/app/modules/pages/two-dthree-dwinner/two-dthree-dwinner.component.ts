import { Component, OnInit } from '@angular/core'
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { catchError, delay, retry } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from 'ngx-webstorage';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';

@Component({
  selector: 'app-two-dthree-dwinner',
  templateUrl: './two-dthree-dwinner.component.html',
  styleUrls: ['./two-dthree-dwinner.component.scss']
})

export class TwoDThreeDWinnerComponent implements OnInit {

  spinnerName : string;
  type: any;
  token: any;
  parentLink: any;

  winnerList: any;
  lastResultModel : any;

  getWinnerListModel: any;
  likeUnlikeModel: any;
  twodimgeLink: string;
  resultObj: any;
  loadingRefresh: boolean;
  
 constructor(
    private translateService: TranslateService,
    private dto: DtoService,
    private funct: FunctService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private storage: LocalStorageService,
    private sanitizer: DomSanitizer) {   
  
      this.spinnerName ="refreshLoading";
      this.token = this.storage.retrieve('token');
      this.type = history.state.type;
      this.type = this.route.snapshot.paramMap.get("type");    
  }

  ngOnInit(): void {
    this.loadingRefresh=true;
    this.spinner.show('loadingRefresh');
    //this.type = "3D";
    if(this.type=='2D'){
      this.changeTwoDImageLink();
      this.parentLink="/twod-page";
    }
    else{
      this.parentLink="/threed-page";
    }
    this.winnerList =[];
    this.resultObj = {
      datetime2d: '',
      datetime3d: '',
      for_time: '',
      id2d: '',
      id3d: '',
      live2dDataApiUrl: '',
      number2d: '',
      number3d: '',
      weekly2dDataApiUrl: '',
    }
    this.getWinnerList();/*XXXX*/
  }

  handleError(error: HttpErrorResponse){
    this.loadingRefresh=false;
    this.spinner.hide('loadingRefresh');
    if(error.status == 417)
    {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        return;
    }
    //return throwError(error);
  }

  async getLastResult()
 {
    const axios = require('axios').default;
    await axios.get(this.funct.ipaddress + 'result/GetLastResult')
    .then((res) => 
    {
      this.resultObj =res.data;
      return res.data;
    });
 }
 async getWinnerList()
  {
    this.spinner.show("loadingRefresh");
    await this.getLastResult()
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    let params = new HttpParams();
    params = params.set("resultId", "");
    var newType= (this.type == "2D") ? "winner/Get2dWinnerList" : "winner/Get3dWinnerList";
      this.http.get(this.funct.ipaddress + newType , {params:params})
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;        
          this.winnerList= this.dto.Response.results; 
          this.loadingRefresh=false;
          this.spinner.hide('loadingRefresh');
        });
     
  }


  changeTwoDImageLink(){
    var lang=this.storage.retrieve('localLanguage');
    switch(lang) {     
      case 'my':
        this.twodimgeLink="assets/img/winner/winner_2d_my.png";
        break;
      case 'th':
        this.twodimgeLink="assets/img/winner/winner_2d.png";
        break;
      case 'zh':
        this.twodimgeLink="assets/img/winner/winner_2d.png";
        break;  
      default:
        this.twodimgeLink="assets/img/winner/winner_2d.png";
    }
    
  }

}