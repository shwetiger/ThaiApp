import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { FunctService } from '../../service/funct.service';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../service/common.service';
import { DtoService } from '../../service/dto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
declare var $: any;

@Component({
  selector: 'app-splash-screen-ads',
  templateUrl: './app-splash-screen-ads.component.html',
  styleUrls: ['./app-splash-screen-ads.component.scss']
})
export class AppSplashScreenAdsComponent implements OnInit {
  isShow: any;
  counter: any = 5;
  adsList: any = [];
  customOptions: OwlOptions = {    
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    items:1,
    autoplay: true,
    autoplayTimeout: 2000,
    animateOut: 'fadeOut',
    navSpeed: 100,
    autoHeight: true,
    navText: ['', ''],
    responsive: {
      400: {
        items: 1 
      }
    }
  }

  constructor(
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private router: Router,
    private dto: DtoService,
    private toastr: ToastrService,
    private funct: FunctService,
    private http: HttpClient,
    private storage: LocalStorageService,
    public common: CommonService,
  ) { 
    this.isShow = (sessionStorage.getItem("localShowAds") != null && sessionStorage.getItem("localShowAds") == "false") ? sessionStorage.getItem("localShowAds") : "true";
  }

  async ngOnInit() {
    await this.getAds();
  }

  async getAds() {
    let headers = new HttpHeaders(); 
    this.http.get( this.funct.ipaddress + 'promotion/GetPromotionAds', { headers: headers } )
    .pipe(
      catchError(this.handleError.bind(this))
    ).subscribe(
      result => {
        this.dto.Response = result;  
        this.adsList = this.dto.Response;
        this.openAds();
    });

  }

  openAds() {
    
    if (this.adsList.length > 0 && this.isShow == "true") {

      $("body").addClass("no-scroll");

      this.counter = 5;

      let displayCounter = setInterval(() => {
        this.counter--;
        if (this.counter == 0) {
          this.closeAds();
          clearInterval(displayCounter);
        }
      }, 1500);

    }
  }

  closeAds() {
    this.isShow = "false";
    sessionStorage.setItem("localShowAds", this.isShow);
    $("body").removeClass("no-scroll");
  }

  handleError(error: HttpErrorResponse) {
    if (error.status == 0) {
      this.common.errorMsg("", "checkInternet");
      return;

    } else if (error.status == 400) {
      this.common.errorMsg("", "bad_request");
      return;

    }
    // return throwError(error);
  }

}
