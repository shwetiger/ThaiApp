import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalDialogService } from 'ngx-modal-dialog';
import { OwlOptions } from 'ngx-owl-carousel-o';
import isUAWebview from "is-ua-webview";
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { QrViewDialogComponent } from 'src/app/shared/dialog/qr-view-dialog/qr-view-dialog.component';

@Component({
  selector: 'app-top-up-submit',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './top-up-submit.component.html',
  styleUrls: ['./top-up-submit.component.scss']
})

export class TopUpSubmitComponent implements OnInit {
  @ViewChild('imageElement') imageElement: ElementRef;
  supportLanguages = ['en', 'my', 'th', 'zh', 'my_zawgyi'];
  servicePhoneList: any;
  service_transaction: any;
  topupModel: any;
  payment_id: any;
  amount: any;
  transaction_no: any;
  account_no: any;
  isCBPay: any;
  token: any;
  test: any;
  mywithdrawalBankAccList: any = [];
  saveimageParam: any;
  downloadLink: any;

  tutorialOne: BsModalRef;
  tutorialTwo: BsModalRef;


  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    items: 1,
    animateOut: 'fadeOut',
    navSpeed: 100,
    autoHeight: true,
    navText: ['', ''],
    responsive: {
      400: {
        items: 1
      },
    }
  }
  amountScreenShot: any = [];
  transationNoScreenShot: any = [];
  topuplistPayment: any;
  loadingSubmiting: any;
  parentLink: any;
  transactionFieldType: any;
  deviceId: any;
  isWebview: boolean;
  openUrl: string;
  newTopuplistPayment: any;
  paymentDetailMethodList: any;
  topup1_desc1: any;
  transfer_amount: any;
  isDown: any;
  isShowDown: any;
  isUp: any;
  isShowUp: any;
  //loadingPage: any;
  topup_submit_des: any;
  transfer_payment_id: any;
  currentImageUrl: any;
  bsModalRef: BsModalRef;
  transferAlert: BsModalRef;
  qrviewmodal: BsModalRef;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private modalService1: ModalDialogService,
    private viewRef: ViewContainerRef,
    private modalService: BsModalService,
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
    private sanitizer: DomSanitizer,
  ) {

    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage'));
    this.parentLink = history.state.parentLink;

    this.transfer_amount = history.state.transfer_amount;
    this.transfer_payment_id = history.state.transfer_payment_id;

  }

  ngOnInit() {
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");

    this.deviceId = this.storage.retrieve('localDeviceId');
    this.isWebview = isUAWebview(navigator.userAgent)
    if (navigator.userAgent.indexOf("Mi") != -1 && this.isWebview) {
      this.openUrl = "";
    }
    if (this.deviceId != null || this.isWebview) {
      this.openUrl = "?openinnewtap=1";
    }
    else {
      this.openUrl = "";
    }

    this.isUp = true;
    this.isShowUp = true;
    this.isDown = false;
    this.isShowDown = false;
    this.newTopuplistPayment = [];
    this.storage.clear('localTopupBankName');

    this.topuplistPayment = this.storage.retrieve('localTopuplistPayment');

    this.topupModel = {
      payment_id: this.transfer_payment_id,
      amount: '',
      transaction_no: '',
      account_no: '',
    }
    this.saveimageParam = {
      imageUrl: '',
      filename: ''

    }

    // this.transfer_amount=this.storage.retrieve('transfer_amount')
    // this.transfer_payment_id=this.storage.retrieve('transfer_payment_id')
    this.getTopupDetail();

    this.getTutorial();
    this.listServicePhone();

  }


  getTopupDetail() {
    var id = this.transfer_payment_id;
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'payment/getPaymentBankAccount?paymentMethodId=' + id, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = result;
          for (let i = 0; i < this.dto.Response.list.length; i++) {
            this.dto.Response[i] = {
              id: this.dto.Response.list[i].id,
              paymentId: this.dto.Response.list[i].payment_id,
              accountNo: this.dto.Response.list[i].account_no
            }
          }

          this.paymentDetailMethodList = this.dto.Response.list;
          if (this.paymentDetailMethodList.length == 0) {
            this.newTopuplistPayment = [];
            this.transationNoScreenShot = 0;
            this.newTopuplistPayment.name = this.topuplistPayment.find(x => x.id == id.toString()).name;
          } else {
            this.newTopuplistPayment = this.topuplistPayment.find(x => x.id == this.paymentDetailMethodList[0].payment_id);
            this.transationNoScreenShot = this.newTopuplistPayment.transationNoScreenShot;
          }
          this.storage.store('localTopupAlertData', this.newTopuplistPayment);
          this.storage.store('localTransationNoScreenShot', this.newTopuplistPayment.transationNoScreenShot);
          this.topup1_desc1 = this.translateService.instant("topup1_desc1");
          this.topup1_desc1 = this.topup1_desc1.toString().replace("@account", this.newTopuplistPayment.name);
          this.topup_submit_des = this.translateService.instant("topup-submit-des").toString().replace("@account", this.newTopuplistPayment.name);

          if (this.newTopuplistPayment.name == "CB Pay") {
            this.isCBPay = true;
            this.transactionFieldType = "text";
          } else {
            this.isCBPay = false;
            this.transactionFieldType = "number";
          }

          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");

        });
  }

  copyMessage(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.toastr.success('', val + ' ' + this.translateService.instant('copy_success'),
      {
        timeOut: 1000,
        positionClass: 'toast-bottom-center',
      }
    );
  }

  getTutorial() {
    if (this.storage.retrieve('localTransationNoScreenShot') != null) {
      this.transationNoScreenShot = this.storage.retrieve('localTransationNoScreenShot');
    }
  }

  tutorialTwoModal(twodBetEdit: TemplateRef<any>) {
    this.tutorialTwo = this.modalService.show(twodBetEdit, {
      animated: true,
      class: "tutorialTwoModal-class modal-sm"
    });
  }
  tutorialTwoHide() {
    this.tutorialTwo.hide();
  }

  getPhoneNumber(phoneNumber: any) {
    if (phoneNumber != null) {
      phoneNumber = "*******" +
        phoneNumber.substring(
          phoneNumber.length - 4, phoneNumber.length).toString();
      return phoneNumber;
    }
  }


  handleError(error: HttpErrorResponse) {
    this.loadingSubmiting = false;
    this.spinner.hide('loadingTopupSubmiting');
    if (error.status == 400) {
      // this.toastr.error("", this.translateService.instant('bad_request'), {
      //   timeOut: 1000,
      //   positionClass: 'toast-top-center',
      // });

      var topupTransactionRequired = this.translateService.instant("topup_transaction_required");
      $("#TopupTransErr").html(topupTransactionRequired);
      // $('#toput_submit_incorrect').addClass('incorrect-border-color');
      // $("#topupTransactionErr").html("<img src='assets/img/error/incorrect.png' width='30' height='30' ><h5 class='error-color'>"+topupTransactionRequired+"</h5>");
      return;
    }

    if (error.status == 201) {
      this.toastr.error("", this.translateService.instant('record_alerady_exit'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      return;
    }

    if (error.status == 409) {
      this.toastr.error("", this.translateService.instant('dublicate'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 0) {
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 423) {
      this.toastr.error("", this.translateService.instant('youNeedLogin'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      this.storage.store('isLoggedIn', false);
       this.router.navigate(['/login'], { replaceUrl: true });
      return;
      

    }
    else {

      this.toastr.error("", error.status.toString(), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }

  }

  addTopupTransaction() {

    if (this.loadingSubmiting != null && this.loadingSubmiting == true) {
      return;
    }

    let transaction = this.checkTranscation();
    if (!transaction) {
      return;
    }

    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);

    this.loadingSubmiting = true;
    this.spinner.show('loadingTopupSubmiting');

    this.topupModel.amount = this.transfer_amount;
    this.topupModel.payment_id = this.transfer_payment_id;
    this.topupModel.account_no = "string";
    let link = "";
    link = "transaction/topupPointRequest";
    if (this.topupModel.transaction_no.indexOf(".") > -1) {
      this.loadingSubmiting = false;
      this.spinner.hide('loadingTopupSubmiting');
      this.toastr.error("", "Invalid transaction number", {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    this.http.post(this.funct.ipaddress + link, this.topupModel, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.loadingSubmiting = false;
          this.spinner.hide('loadingTopupSubmiting');
          if (this.dto.Response.message == "error") {
            this.toastr.error("", this.translateService.instant("submitting-request-time"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return;
          }
          if (this.dto.Response.status == "Fail") {
            this.toastr.error("", this.dto.Response.message, {
              timeOut: 1000,
              positionClass: 'toast-top-center',
            });
            return;
          }
          if (this.dto.Response.status == "Error") {
            this.toastr.error("", this.translateService.instant('record_alerady_exit'), {
              timeOut: 1000,
              positionClass: 'toast-top-center',
            });
            return;
          }

          if (this.dto.Response.status == "Success") {
            this.router.navigate(['/wallet/transcation-waiting-page'],
              { state: { type: "topup" }, replaceUrl: true })
          }

        });
  }

  checkTranscation() {

    $('#toput_submit_incorrect').removeClass('incorrect-noborder-color');
    var topupTransactionRequired = this.translateService.instant("topup_transaction_required");
    var transactionNumber = this.topupModel.transaction_no.toString();
    // var topupTransactionRequired = this.translateService.instant("requiredFiled");
    topupTransactionRequired = topupTransactionRequired.toString().replace("@value", this.translateService.instant("transcation_required"));
    if (transactionNumber == '' || transactionNumber == null || transactionNumber == undefined) {
      // $('#toput_submit_incorrect').addClass('incorrect-border-color');
      // $("#topupTransactionErr").html("<img src='assets/img/error/incorrect.png' width='30' height='30' ><h5 class='error-color'>"+topupTransactionRequired+"</h5>");
      $("#TopupTransErr").html(topupTransactionRequired);
      return false;
    }
    if (transactionNumber.includes('-')) {
    $("#TopupTransErr").html(topupTransactionRequired); 
    return false;
    }

    if (transactionNumber.length >= 6 && transactionNumber.length < 10) {
      // $('#toput_submit_incorrect').addClass('incorrect-noborder-color');
      // $("#topupTransactionErr").html("")
      $("#TopupTransErr").html('');
      return true;
    }

    if (transactionNumber.length >= 10) {
      // $('#toput_submit_incorrect').addClass('incorrect-border-color');
      // $("#topupTransactionErr").html("");
      $("#TopupTransErr").html(topupTransactionRequired);
      return false;
    }
    if (transactionNumber.length < 6) {
      // $('#toput_submit_incorrect').addClass('incorrect-border-color');
      // $("#topupTransactionErr").html("<img src='assets/img/error/incorrect.png' width='30' height='30' ><h5 class='error-color'>"+topupTransactionRequired+"</h5>");
      $("#TopupTransErr").html(topupTransactionRequired);
      return false;
    }
 
  
  }

  // onPasswordInput(event: Event): void {
  //   const inputElement = event.target as HTMLInputElement;
  //   inputElement.value = inputElement.value.slice(0, 6);
  //   this.topupModel.transaction_no=inputElement.value.slice(0, 6);
  // }

  onPasswordInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let currentValue = inputElement.value.slice(0, 6);
    currentValue = currentValue.replace('.', '');
    inputElement.value = currentValue;
    this.topupModel.transaction_no = currentValue;
  }

  enter(event) {
    event.target.blur();
  }

  paymentDetailMethodListDown() {
    this.isUp = false;
    this.isDown = true;
    this.isShowUp = true;
    this.isShowDown = true;
  }

  paymentDetailMethodListUp() {
    this.isUp = true;
    this.isDown = false;
    this.isShowUp = true;
    this.isShowDown = false;
  }

  listServicePhone() {
    this.service_transaction = 0;
    this.spinner.show();
    let headers = new HttpHeaders();
    this.servicePhoneList = [];
    this.servicePhoneList = this.storage.retrieve('localservicePhoneList');
    if (this.servicePhoneList != null) {
      this.servicePhoneList = this.storage.retrieve('localservicePhoneList');
      for (let i = 0; i < this.servicePhoneList.length; i++) {
        if (this.servicePhoneList[i].title == 'service_transaction') {
          ++this.service_transaction;
        }
      }
    }
    this.http.get(this.funct.ipaddress + 'service/listService', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");

          this.dto.Response = {};
          this.dto.Response = result;
          this.servicePhoneList = this.dto.Response;
          this.service_transaction = 0;


          for (let i = 0; i < this.servicePhoneList.length; i++) {
            if (this.servicePhoneList[i].title == 'service_transaction') {
              ++this.service_transaction;
            }

          }
          this.spinner.hide();
        }
      );
  }

  downloadImage(imageUrl: any) {
    this.spinner.hide();
    this.downloadLink = `https://api.thai2d3dgame.com/api/payment/download?imageUrl=${encodeURIComponent(imageUrl)}`;
    this.downloadLink = this.downloadLink + '?openinnewtap=1'

    if (navigator.userAgent.includes("Chrome")) {
      window.open(this.downloadLink)
      return;
    }
    if (navigator.userAgent.includes("Safari")) {
      window.open(imageUrl)
      return;
    }
  }



  qrVeiwDialog(imageUrl) {
    var data = {
      imageUrl: imageUrl,
      //list: this.storage.retrieve('localLaunchGameList')
    }
    const initialState = {
      title: '',
      closeBtnName: '',
      data: data,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(QrViewDialogComponent,
      {
        class: 'modal-sm qr-view-dalog', initialState
      });
  }

  // saveImage(imageUrl) {
  //   this.imageDownloadService.downloadImage(imageUrl).subscribe((data) => {
  //     const blob = new Blob([data]);
  //     const url = window.URL.createObjectURL(blob);

  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'image.jpg'; // Specify the filename
  //     document.body.appendChild(a);
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   });
  // }

}
