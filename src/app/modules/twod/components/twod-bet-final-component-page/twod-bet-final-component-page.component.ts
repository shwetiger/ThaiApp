import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { JsonPipe, Location } from '@angular/common';

@Component({
  selector: 'app-twod-bet-final-component-page',
  templateUrl: './twod-bet-final-component-page.component.html',
  styleUrls: ['./twod-bet-final-component-page.component.scss']
})
export class TwodBetFinalComponentPageComponent implements OnInit {
  betTwoDList: any;
  supportLanguages = ['en', 'my', 'th', 'zh'];
  totalAmount: any;
  totalAccountAmount: any;
  token: any;
  userProfileModel: any = [];
  odd: any;
  discountPercent: any;
  limitedAmt: any;
  doBetModel: any;
  total_amount: any;
  discountAmount = 0;
  sectionId: any;
  twodbetDetailList: any;
  newBetTwoDList = [];
  twodBetUnBetList: BsModalRef;
  twodsection: any;
  currentDate: any;


  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private http: HttpClient,
    private util: UtilService,
    private router: Router,
    private storage: LocalStorageService,
    private funct: FunctService,
    private _location: Location,
    private modalService: BsModalService,) {

    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage'));
    this.totalAccountAmount = 0;
    this.betTwoDList = history.state.betTwoDList;
    if (history.state.betTwoDList == undefined) {
      this.betTwoDList = this.storage.retrieve('localBetFinalNumber');
    }
    if (history.state.oddModel != null) {
      this.odd = history.state.oddModel.odd;
      this.discountPercent = history.state.oddModel.discountPercent;
      this.limitedAmt = history.state.oddModel.limitedAmt;
    }
    if (history.state.oddModel == undefined) {
      this.odd = this.storage.retrieve('localOddNumber').odd;
      this.discountPercent = this.storage.retrieve('localOddNumber').discountPercent;
      this.limitedAmt = this.storage.retrieve('localOddNumber').limitedAmt;
    }

  }


  async ngOnInit(): Promise<void> {
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.userProfileModel = {
      balance: ""
    }
    this.doBetModel = {
      total_amount: 0,
      sectionId: 0,
      twodbetDetailList: ''
    }
    this.twodsection = this.storage.retrieve('localSection');
    this.getCurrentDate();
    this.totalBetAmount();
    await this.getBalance();
    this.getDiscountAmount();
  }
  getDiscountAmount() {
    this.discountAmount = 0;
    if (this.limitedAmt != null) {
      if (this.limitedAmt > 0 &&
        (this.totalAmount >= this.limitedAmt)) {
        var value = ((this.totalAmount * this.discountPercent) / 100)
          .toString();
        if (value != null && value.indexOf(".")) {
          value = value.split(".")[0];
          this.discountAmount = this.totalAmount - parseInt(value);
        } else {
          this.discountAmount = this.totalAmount - parseInt(value);
        }
      }
      else {
        this.discountAmount = null;
      }
    }


  }

  totalBetAmount() {
    this.totalAmount = 0;
    for (let i = 0; i < this.betTwoDList.length; i++) {
      this.totalAmount = this.totalAmount + parseInt(this.betTwoDList[i].amount);
    }

  }

  async getBalance() {
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
          this.userProfileModel = this.dto.Response;
        });
    this.spinner.hide();
  }


  async doBet(twodBetUnBetList: TemplateRef<any>) {
    /*XXX*/
    await this.getBalance();

    this.common.submitLoading = false;

    if (this.common.submitLoading != null && this.common.submitLoading) {
      return;
    }
    for (let i = 0; i < this.betTwoDList.length; i++) {
      this.newBetTwoDList[i] = {
        amount: this.betTwoDList[i].amount,
        number: this.betTwoDList[i].number
      }
    }

    this.doBetModel.total_amount = this.totalAmount;
    this.doBetModel.twodbetDetailList = this.newBetTwoDList;
    if (this.userProfileModel.balance < this.doBetModel.total_amount) {
      this.toastr.error("", this.translateService.instant('low_balance'), {
        timeOut: 1000,
        positionClass: 'toast-bottom-center',
      });
    }
    else {
      this.token = this.storage.retrieve('token');
      let headers = new HttpHeaders();
      headers = headers.set('Authorization', this.token);
      this.common.submitLoading = true;
      this.spinner.show("submitLoading");
      this.doBetModel.sectionId = this.storage.retrieve('localSectionId');
      this.http.post(this.funct.ipaddress + 'twodbet/betTwodFourSection', this.doBetModel, { headers: headers })
        .pipe(
          catchError(this.handleErrorMessage.handleError.bind(this, ''))
        )
        .subscribe(
          result => {
            this.dto.Response = result;
            this.storage.clear('Localbetselectcount');
            this.common.submitLoading = false;
            this.spinner.hide("submitLoading");
            if (this.dto.Response.message == "error") {
              this.toastr.error("", this.translateService.instant("submitting-request-time"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
              });
              return;
            }
            if (this.dto.Response.unBetList != null && this.dto.Response.status == 'bet_fail') {
              this.toastr.error("", this.translateService.instant("over_limit_number"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
              });
              return;
            }
            // if(this.dto.Response.status == "Fail")
            // {
            //   this.toastr.error("", "Limited exceeded, Please try again", {
            //     timeOut: 3000,
            //     positionClass: 'toast-top-center',
            //     });
            //     return;
            // }
            // if(this.dto.Response.status == "Success"){
            //   this.storage.clear('localNewBetTwodNumber');
            //   this.router.navigate(['/twod/bet-success-unsuccess-page'],{state: {status: "success"},replaceUrl: true})
            // }


            if (this.dto.Response.unBetList == "") {
              this.common.submitLoading = false;
              this.spinner.hide("submitLoading");
              this.storage.clear('localNewBetTwodNumber');
              this.router.navigate(['/twod/bet-success-unsuccess-page'], { state: { status: "success" }, replaceUrl: true })
            }

            else {
              // this.toastr.error("", "Limited exceeded, Please try again", {
              //   timeOut: 3000,
              //   positionClass: 'toast-top-center',
              //   });

              // for(let j=0; j< this.betTwoDList.length; j++){
              //   this.dto.Response.unBetList.forEach(e => {
              //     if( e.number == this.betTwoDList[j].number){
              //      this.betTwoDList[j].unbetstatus= true;
              //     }
              //    });
              // }
              const unBetLimitListModal = {
                unBetLimitList: this.dto.Response.unBetList,
              };
              this.twodBetUnBetList = this.modalService.show(twodBetUnBetList, {
                initialState: unBetLimitListModal,
                class: "twodBetUnBetList-class modal-sm"
              });
              return;
            }
          });
    }
  }
  unBetLimitListModalDelete() {
    this.twodBetUnBetList.hide();

  }
  refreshPage() {
    this.spinner.show("refreshLoading");
    this.ngOnInit();
    setTimeout(() => {
      this.spinner.hide("refreshLoading");
    }, 1000);

  }
  goToWallet() {
    this.router.navigate(['/wallet/top-up'], { replaceUrl: false });
  }

  getCurrentDate() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
    if (now.getHours() > 16 || (now.getHours() === 16 && now.getMinutes() > 30)) {
      now.setDate(now.getDate() + 1);
    }
    this.currentDate = now.toLocaleDateString('en-US', options);
  }


}
