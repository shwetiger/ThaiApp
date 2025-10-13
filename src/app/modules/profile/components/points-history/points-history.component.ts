import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
@Component({
  selector: 'app-points-history',
  templateUrl: './points-history.component.html',
  styleUrls: ['./points-history.component.scss']
})
export class PointsHistoryComponent implements OnInit {
  showBalance: any;
  receivedTab: any;
  transferTab: any;
  pointtransfer: any;
  token: any;
  totalpoint: any;
  referalusers: any;
  myrecivepointList: any;
  transferlist: any;
  amount: any;
  cannotSmallThan: any;
  point_wallet: any;

  constructor(private modalService: BsModalService,
    public common: CommonService,
    private handleErrorMessage: HandleErrorMessageService,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private http: HttpClient,
    private storage: LocalStorageService,
    private funct: FunctService,
    private route: ActivatedRoute,
    private _location: Location
  ) { }

  ngOnInit(): void {
    this.receivedTab = true;
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.getUserProfile();
    this.GetRecievedList();
    this.GetTransferList();
  }

  gotoReceived() {
    this.receivedTab = true;
    this.transferTab = false;
  }

  gotoTransfer() {
    this.transferTab = true;
    this.receivedTab = false;
  }

  showtransferdialog(pointtransfer: TemplateRef<any>) {
    this.pointtransfer = this.modalService.show(pointtransfer,
      {
        class: "point-modal modal-sm",
        ignoreBackdropClick: true,
        keyboard: false
      });
  }

  HideTransferModel() {
    this.amount = ''
    this.pointtransfer.hide();
  }

  refreshPage() {
    this.ngOnInit();
  }

  getUserProfile() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.point_wallet = this.dto.Response.point_wallet;
          this.GetMyReferalInfo();
        });
  }


  GetMyReferalInfo() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${this.token}`);
    this.http.post(
      this.funct.ipaddress + 'point-promotion-setting/GetMyReferalInfo',
      {},
      { headers: headers }
    )
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.totalpoint = this.dto.Response.current_points + this.point_wallet;
          this.referalusers = this.dto.Response.referral_users;
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
        }
      );
  }

  GetRecievedList() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${this.token}`);
    this.http.post(
      this.funct.ipaddress + 'point-promotion-setting/GetMyReferalPoints',
      {},
      { headers: headers }
    )
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.myrecivepointList = this.dto.Response;
          this.myrecivepointList = this.dto.Response.map((item: any) => {
            const [datePart, ...timeParts] = item.created_date_str.split(' ');
            const timePart = timeParts.join(' '); // Handles "3:58 PM"
            return {
              ...item,
              date: datePart,
              time: timePart
            };
          });
        }
      );
  }

  GetTransferList() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${this.token}`);
    this.http.get(
      this.funct.ipaddress + 'PointToMainWallet/GetMyList',
      { headers: headers }
    )
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        (result: any) => {
          this.dto.Response = result;
          this.transferlist = this.dto.Response.map((item: any) => {
            const [datePart, ...timeParts] = item.created_date.split(' ');
            const timePart = timeParts.join(' ');
            return {
              ...item,
              date: datePart,
              time: timePart
            };
          });
        }
      );
  }

  checkBetAmount() {
    if (this.amount == '' || this.amount == null || this.amount == undefined) {
      var amountRequired = this.translateService.instant("requiredFiled");
      amountRequired = amountRequired.toString().replace("@value", this.translateService.instant("points"));
      $("#betAmountErr").html(amountRequired);
      return false;
    }
    if (this.amount >= 1000) {
      $("#betAmountErr").html("")
      return true;
    }
    if (this.amount < 1000) {
      this.cannotSmallThan = this.translateService.instant("min_pt_required");
      $("#betAmountErr").html(this.cannotSmallThan);
      return false;
    }
  }

  Transfer(amount: number) {
    let checkAmount = this.checkBetAmount();
    if (checkAmount == false) {
      return;
    }
    this.token = this.storage.retrieve('token');
    this.amount = amount;
    const transfer = {
      amount: amount
    };
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${this.token}`);
    this.http.post(
      this.funct.ipaddress + 'PointToMainWallet/Transfer',
      transfer,
      { headers: headers }
    )
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          if (this.dto.Response.status === 'Success') {
            this.toastr.success("", this.translateService.instant("bank_accname_success"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            this.pointtransfer.hide();
            this.amount = '';
            this.GetMyReferalInfo();
            this.GetRecievedList();
            this.GetTransferList();
          } else {
            this.toastr.error("", this.translateService.instant("pt_not_enought"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            this.pointtransfer.hide();
            this.amount = '';
          }
        },
      );
  }

  keyPressNumberfornumberintput(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const charCode = (event.which) ? event.which : event.keyCode;
    const allowedChars = /^[0-9]*$/;

    // Prevent input if length is already 3 digits
    if (inputElement.value.length >= 10 && allowedChars.test(event.key)) {
      event.preventDefault();
      return false;
    }
    // Allow only digits 0-9
    if (!allowedChars.test(event.key) || charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

}
