import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse,HttpParams} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router ,ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {Location} from '@angular/common';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { NavigationService } from 'src/app/shared/service/navigation.service';


@Component({
  selector: 'app-download-page',
  templateUrl: './download-page.component.html',
  styleUrls: ['./download-page.component.scss']
})
export class DownloadPageComponent implements OnInit {
  downloadLink: any;
  constructor(    
    public navigation: NavigationService,
    private translateService: TranslateService,
    private toastr: ToastrService, 
    private spinner: NgxSpinnerService, 
    private dto: DtoService, 
    private http: HttpClient, 
    private util: UtilService, 
    private router: Router, 
    private storage: LocalStorageService, 
    private funct: FunctService,
    private location: Location,
    private route: ActivatedRoute,) {
    
     }

  ngOnInit(): void {
    this.downloadLink={
      douwnloadLink: ""
    }
    this.getDownloadLink();
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
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    return throwError(error);
  }

getDownloadLink(){
  let headers = new HttpHeaders();
  this.http.get( this.funct.ipaddress+'value/getAppLatestVersion?platform=apk', { headers: headers })
  .pipe(
    catchError(this.handleError.bind(this))
 )
  .subscribe(
    result => {
      this.dto.Response = result;       
      this.downloadLink = this.dto.Response;
    }
  );
}

downloadPage(){
  this.router.navigate(['/download/ios-download'], {replaceUrl: false});
}
}
