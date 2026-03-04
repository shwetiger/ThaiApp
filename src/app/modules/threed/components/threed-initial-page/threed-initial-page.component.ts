import { Component, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError, retry } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ThreedCloseTimeComponent } from 'src/app/shared/components/threed-close-time/threed-close-time.component';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-threed-initial-page',
  templateUrl: './threed-initial-page.component.html',
  styleUrls: ['./threed-initial-page.component.scss']
})
export class ThreedInitialPageComponent implements OnInit {
  @ViewChild(ThreedCloseTimeComponent) child: ThreedCloseTimeComponent;
  twoDCloseTime: boolean;
  token: any;
  pageNumber: any;
  rowsOfPage: any;
  betHistoryList: any;
  winnerList: any;
  isUserLoggedIn: any;
  threedCloseTime: any;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private translateService: TranslateService,
    private http: HttpClient,
    private funct: FunctService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private router: Router, private storage: LocalStorageService,
    private location: Location) {

  }

  ngOnInit(): void {
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.storage.clear('localNewBetThreedNumber');
    this.storage.clear('localSelectTwoDList');
    this.storage.clear('localSelectTwoDList');
    this.getCheckUser();
  }

  public threedClose(data: any) {
    this.threedCloseTime = data;
  }

  getCheckUser() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = {};
          this.dto.Response = result;
          this.isUserLoggedIn = true;
        });
  }

  threedBet() {
    this.router.navigate(['/threed/bet'], { replaceUrl: false });
  }

  threeDWinner() {
    this.router.navigate(['/threed/winner-page', '3D'], { replaceUrl: false });
  }

  goToResult() {
    this.router.navigate(['/threed/bet-history', '3D'], { state: { type: '3D', result: "3D", isActive: true, showlivelink: true }, replaceUrl: false });
  }

  betHistory() {
    let login = this.storage.retrieve('isUserLoggedIn');
    if (!login) {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
       this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    this.storage.store('localThreedIsActive', true);
    this.router.navigate(['/threed/bet-history', '3D'], { state: { type: '3D', isActive: true }, replaceUrl: false });
  }

  refreshPage() {
    this.ngOnInit();
    this.child.getCloseTime();
    this.child.getUserProfile();
    this.threedCloseTime = this.child.threeDCloseTime;
    setTimeout(() => {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 1000);
  }

  goBack() {
    var threedsuccessback = history.state.threedsuccessback;
    if (threedsuccessback == true) {
      this.router.navigate(['/home'], { replaceUrl: false });
    }
    else {
      this.router.navigate(['/home'], { replaceUrl: false });
    }
  }

  refreshPageHeader() {
    this.ngOnInit();
  }
}
