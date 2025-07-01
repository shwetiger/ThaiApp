import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from 'ngx-webstorage';
import { FunctService } from '../../service/funct.service';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DtoService } from '../../service/dto.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import isUAWebview from "is-ua-webview";
@Component({
  selector: 'app-ads-slider',
  templateUrl: './ads-slider.component.html',
  styleUrls: ['./ads-slider.component.scss']
})
export class AdsSliderComponent {
  adsList : any;
  marqueeText : any;
  customOptions: OwlOptions = {    
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    items:1,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplaySpeed: 2000,
    //animateOut: 'rightLeft',
    navSpeed: 100,
    autoHeight: true,
    navText: ['', ''],
    responsive: {
      400: {
        items: 1 
      },
      // 0: {
      //   items: 1
      // },
      // 400: {
      //   items: 2
      // },
      // 740: {
      //   items: 3
      // },
      // 940: {
      //   items: 4
      // }
    },
    // nav: true
  }
  isWebview: boolean;
  openUrl: string;
  deviceId: any;

  constructor( private storage: LocalStorageService, private spinner: NgxSpinnerService, private toastr: ToastrService, private http: HttpClient, private dto: DtoService, private router: Router,
    private route: ActivatedRoute, private funct: FunctService) 
    { 
      this.deviceId=this.storage.retrieve('localDeviceId'); 
      this.isWebview=isUAWebview(navigator.userAgent)    
          if(navigator.userAgent.indexOf("Mi") != -1 && this.isWebview ){
            this.openUrl="";
          }
          if(this.deviceId !=null || this.isWebview){
              this.openUrl="?openinnewtap=1";
          }
          else{
            this.openUrl="";
          }
    }
 ngOnInit(): void {
  
    this.getAdsList();
    this.getMarqueeText();
  }
    handleError(error: HttpErrorResponse){
      if(error.status == 423)
      {
       
      }
      if(error.status == 400)
      {
         this.toastr.error("Bad request.", 'Invalid!', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          });
      }
      return throwError(error);
      }

  getAdsList()
  {    
    this.spinner.show();
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('gameProviderId',"0");   
    this.http.get(this.funct.ipaddress + 'ads/GetAdsList', { params:params, headers: headers })
    .pipe(
         catchError(this.handleError.bind(this))
      )
    .subscribe(
      result => {
        this.dto.Response = {};
        this.dto.Response = result;
        this.adsList =  this.dto.Response;
        this.storage.store('localhomeadsList', this.adsList);
        this.spinner.hide();
      }
    );
  }

  getMarqueeText()
  {
    this.spinner.show();
    let headers = new HttpHeaders();
    let params = new HttpParams(); 
    params = params.set('providerId',"0");
    this.http.get(this.funct.ipaddress + 'marquee/getMarqueeText', { params:params, headers: headers })
    .pipe(
         catchError(this.handleError.bind(this))
      )
    .subscribe(
      result => {
        this.dto.Response = {};
        this.dto.Response = result;
        this.marqueeText =  this.dto.Response;
        this.storage.store('localmarqueeText', this.marqueeText);
        this.spinner.hide();
      }
    );
  }
}

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipeAds implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}
  transform(url) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
}
}