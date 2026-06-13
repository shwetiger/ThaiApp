import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { FunctService } from 'src/app/shared/service/funct.service';
import { catchError } from 'rxjs/operators';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/shared/service/common.service';


@Component({
  selector: 'app-user-guide',
  templateUrl: './user-guide.component.html',
  styleUrls: ['./user-guide.component.scss'],
})
export class UserGuideComponent implements OnInit {
  FaqId: any;
  token: any;
  Questiondetaillist: any;
  Question: any;
  Questiondetaillisshow: any;
  currentIndex = 0;
  progressValue = 1;
  totallist: any;
  currentpercent: any;
  isPreviousDisabled: boolean = true;
  isNextDisabled: boolean = false;
  disabledButtonColor: string = 'grey';
  lang: string = 'my'
  constructor(
    private route: ActivatedRoute,
    private storage: LocalStorageService,
    private http: HttpClient,
    private funct: FunctService,
    private handleErrorMessage: HandleErrorMessageService,
    private dto: DtoService,
    private router: Router,
    private translateService: TranslateService,
    public common: CommonService,
  ) {
      console.log('CURRENT LANG =', this.translateService.currentLang);
      this.lang=this.translateService.currentLang;

  this.translateService.get('previous').subscribe(res => {
    console.log('TRANSLATE TEST =', res);
  });

      // <h4 *ngIf="lang == 'en'" class="">{{ video.description_en}}</h4>
      //           <h4 *ngIf="lang == 'my'" class="">{{ video.description_my}}</h4>
      //           <h4 *ngIf="lang == 'th'" class="">{{ video.description_th}}</h4>
      //           <h4 *ngIf="lang == 'zh'" class="">{{ video.description_zh}}</h4>
   }

  ngOnInit(): void {
    this.FaqId = this.route.snapshot.params.FaqId;
    this.Question = this.route.snapshot.params.Question;
    this.getqusetionbyId(this.FaqId);

  }

  getqusetionbyId(FaqId: any) {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set('FaqId', FaqId);
    this.http.get(this.funct.ipaddress + 'feedback/faqStepsForApp', { params: params, headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.Questiondetaillist = this.dto.Response;
          this.Questiondetaillisshow = this.Questiondetaillist[this.currentIndex];
          this.totallist = this.Questiondetaillist.length;
          this.currentpercent = Math.ceil(100 / this.Questiondetaillist.length);
        });
  }

  gotonext() {
    this.currentIndex = this.currentIndex + 1;
    this.currentpercent = Math.ceil(this.currentpercent + (Math.ceil(100 / this.Questiondetaillist.length)));
    this.progressValue = this.progressValue + 1;
    if (this.progressValue > 1) {
      this.isPreviousDisabled = false;
    }
    if (this.progressValue == this.totallist) {
      this.isNextDisabled = true;
    }
    this.Questiondetaillisshow = this.Questiondetaillist[this.currentIndex];
  }

  gotofeedback() {
    this.router.navigate(['/me-page/feedback'], { state: { type: 'faq' }, replaceUrl: true });
  }

  gotoprevious() {
    this.currentIndex = this.currentIndex - 1;
    this.currentpercent = Math.ceil(this.currentpercent - (Math.ceil(100 / this.Questiondetaillist.length)));
    this.progressValue = this.progressValue - 1;
    if (this.progressValue < this.totallist) {
      this.isNextDisabled = false;
    }
    if (this.progressValue < this.totallist) {
      this.isPreviousDisabled = false;
    }
    if (this.progressValue == 1) {
      this.isPreviousDisabled = true;
    }
    this.Questiondetaillisshow = this.Questiondetaillist[this.currentIndex];
  }

}
