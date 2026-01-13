import { Component, Injectable, OnInit, TemplateRef, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { Location, LocationStrategy } from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { TopupAlertMaintenanceComponent } from 'src/app/shared/dialog/topup-alert-maintenance/topup-alert-maintenance.component';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss']
})
@Injectable()
export class WithdrawComponent implements OnInit {
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput: ElementRef;
  // imgURL: string | null = null;
  // lang: string = 'en';
  token: any;
  myAccountList: any;
  bsModalRef: BsModalRef;
  withdrawalBankAccList: any;
  mywithdrawalBankAccList: any;
  supportLanguages = ['en', 'my', 'th', 'zh'];
  clickId = [];
  paymentId: 0;
  bankName: '';
  add_withdraw_account: any;
  add_withdraw_account_hint: any;
  add_withdraw_account_name: any;
  add_withdraw_account_name_hint: any;
  add_withdraw_account_image_hint: any;
  bankAccModel: any;
  add_withdraw_account_confirm: any;
  add_withdraw_account_confirm_hint: any;
  bankSubmitModel: any;
  bankAccountList = [];
  bankAccObj: any;
  isFromAdd: any;
  userBalance: any;
  mybankList: BsModalRef;
  withdrawalRequestModel: any;
  bankAccount: any;
  withdrawalBankAccDelete: any;
  isDeleteBtn: any;
  isSelectBtn: any;
  otpSms: any;
  bank_account_id: any;
  lang: any;
  topupBankName: any;
  newwithdrawalBankAccList: any = [];
  //loadingSubmiting: any;
  parentLink: any;
  showPass: boolean;
  passwordType: any;
  wavePasswordType: any;
  loadingInsertBankAcc: any;
  granParent: any;
  withdrawLength: any = 0;
  withdrawpaymentImg: any;
  recaptcha: boolean = false;
  SMSprovider: any;
  SMSoperatorList: any;
  Usefirebase: boolean = false;
  Operatorcodelist: any;
  MPTarraylist: any = ['4', '2', '8', '5'];
  OoredooList: any = ['9'];
  MYTELList: any = ['6']
  TelenorList: any = ['7']
  phoneValue: any;
  prefix = '+95';
  bankaccoutlistwithpaymentid: any;
  imagePath: any;
  imgURL: any;
  message: string;
  smstype: any;
  functionName: string = 'Withdrawal OTP';
  Timer: any;
  refreshLoading: any;

  constructor(
    public common: CommonService,
    private Location: LocationStrategy,
    private modalService: BsModalService,
    private router: Router,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private dto: DtoService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private storage: LocalStorageService,
    private funct: FunctService,
    private _location: Location,) {

    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage'));
    this.bankAccount = history.state.bankAccount;
    this.otpSms = this.storage.retrieve('otpSms');
    this.bank_account_id = history.state.bank_account_id;
    this.topupBankName = history.state.topupBankName;
    this.parentLink = history.state.parentLink;
    this.granParent = history.state.granParent;
    this.isFromAdd = this.route.snapshot.paramMap.get("isFromAdd");

  }

  ngOnInit(): void {
    this.lang = this.storage.retrieve('localLanguage');
    this.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    this.bankAccModel =
    {
      bankaccountName: '',
      bankAccount: '',
      confirmbankAccount: '',
      bankaccQRbase64: ''
    };
    this.bankSubmitModel = {
      payment_id: 0,
      account_number: ''
    }
    this.withdrawalRequestModel = {
      payment_id: 0,
      amount: '',
      account_no: '',
      login_password: '',
      remark: '',
      signature: '',
    }
    this.bankAccObj = {
      account_number: '',
      payment_id: 0,
      imageUrl: '',
      bank_name: ''
    }
    this.withdrawalBankAccDelete = {
      "payment_id": 0,
      "bank_acc_id": 0
    }
    this.passwordType = "password";
    this.wavePasswordType = "number";

    if (this.isFromAdd == null || this.isFromAdd == undefined) {
      this.getMyWithdrawAccounts();//user's accounts
      this.getUserProfile();
    }
    if (this.isFromAdd == "add") {
      this.mywithdrawalBankAccList = null;
      this.getWithdrawBankAccounts(); //system accounts
    }
    // this.GetSMSProvider();
    // this.getSMSOperators();
    this.getsmstype();
  }


  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  showMyDialog() {
    const initialState = {
      title: '',
      closeBtnName: '',
      ok: '',
    };

    this.bsModalRef = this.modalService.show(ModalContentComponent,
      {
        class: 'modal-sm withdraw-account-alert', initialState
      });
  }

  handleError(error: HttpErrorResponse) {
    this.refreshLoading = false;
    this.spinner.hide("refreshLoading");
    this.loadingInsertBankAcc = false;
    this.spinner.hide("loadingInsertBankAcc");
    this.spinner.hide('loadingWithdrawSubmiting');
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    if (error.status == 0) {
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 404) {
      this.refreshLoading = false;
      this.spinner.hide("refreshLoading");
      if (error.error.message == "No maintain") {
        return;
      }
      else {
        this.toastr.error("", this.translateService.instant("incorrectPassword"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }

    }
    if (error.status == 423) {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      this.storage.clear('token');
      this.storage.clear('isUserLoggedIn');
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    if (error.status == 406 && this.isFromAdd == "add") /*XXXXX add after and*/ {
      if (error.error.message == 'Bank Account Already Exist') {
        this.toastr.error("", this.translateService.instant("bank_acc_limit"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      else {
        this.toastr.error("", this.translateService.instant("withdraw_already_exist"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
    }
    if (error.status == 406 && this.isFromAdd != "add" && error.error.message.includes("Please wait 24 hours")) {
      var indexOf = error.error.message.indexOf("hours");
      var remainTime = error.error.message.substring(indexOf + 5, error.error.message.length);
      this.toastr.error("", "(" + remainTime + ") " + this.translateService.instant("wait_24_hours"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 503 && this.isFromAdd != "add" && error.error.message.includes("Please wait 1 hours")) {

      this.toastr.error("", this.translateService.instant("wait_1_hours"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 406 && this.isFromAdd != "add") {
      this.toastr.error("", this.translateService.instant("withdraw_already_exist"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 400) {
      this.toastr.error("", this.translateService.instant("bad_request"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (error.status == 403) {
      if (error.error.message == 'so_close') {
        this.toastr.error("", this.translateService.instant("otp-request-time"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      if (error.error.message == 'over_limited.') {
        this.toastr.error("", this.translateService.instant("otp-request-time-ten"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      if (error.error.message == 'temporary_blocked') {
        this.toastr.error("", this.translateService.instant("tem_block"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      else {
        this.toastr.error("", error.error.message, {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
    }
    else {
      this.toastr.error("", error.status.toString(), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
  }

  getWithdrawBankAccounts() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'payment/withdrawallistPayment', { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.withdrawalBankAccList = this.dto.Response;
          if (this.topupBankName == undefined || this.topupBankName == null) {
            this.refreshLoading = false;
            this.spinner.hide("refreshLoading");
            return;
          }
          if (this.topupBankName != undefined) {
            for (let j = 0; j < this.withdrawalBankAccList.length; j++) {
              if (this.topupBankName.toLowerCase().replace(" ", '') == this.withdrawalBankAccList[j].name.toLowerCase().replace(" ", '')) {
                this.newwithdrawalBankAccList[0] = this.withdrawalBankAccList[j];
                this.changeAction(this.withdrawalBankAccList[j].id, this.withdrawalBankAccList[j].name, this.withdrawalBankAccList[j].payment_id)
                return;
              }
            }
          }
        }
      );
  }

  getMyWithdrawAccounts() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'userbankaccount/getuserbankaccount-byUserId', { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.mywithdrawalBankAccList = this.dto.Response;
          if (this.mywithdrawalBankAccList.length == 0) {
            this.withdrawLength = 0;
            if (this.otpSms != 'insert' || this.storage.retrieve('localTopupBankName') == undefined || this.storage.retrieve('localTopupBankName') == null) {
              // this.showMyDialog();
            }
            this.getWithdrawBankAccounts();

          }
          if (this.mywithdrawalBankAccList.length > 0) {
            this.withdrawLength = this.mywithdrawalBankAccList.length;
            if (this.bank_account_id != null) {
              if (this.mywithdrawalBankAccList.find(x => x.bank_account_id == this.bank_account_id)) {
                /*for show in ui XXX*/
                this.bankAccObj.account_number = this.mywithdrawalBankAccList.find(x => x.bank_account_id == this.bank_account_id).account_number;
                this.bankAccObj.payment_id = this.mywithdrawalBankAccList.find(x => x.bank_account_id == this.bank_account_id).payment_id;
                this.bankAccObj.imageUrl = this.mywithdrawalBankAccList.find(x => x.bank_account_id == this.bank_account_id).imageUrl;
                this.bankAccObj.bank_name = this.mywithdrawalBankAccList.find(x => x.bank_account_id == this.bank_account_id).bank_name;
                this.bankAccObj.bank_acc_id = this.mywithdrawalBankAccList.find(x => x.bank_account_id == this.bank_account_id).bank_account_id;
                this.withdrawalRequestModel.payment_id = this.bankAccObj.payment_id;
                this.withdrawalRequestModel.account_no = this.bankAccObj.account_number;
                this.getWithdrawMaintenance(this.withdrawalRequestModel.payment_id);
              }
              //need to call 24 hours wait api
            }
            else {
              if (this.isSelectBtn == undefined || this.isSelectBtn == '' || this.isSelectBtn == null)/*If no choose payment account*/ {
                this.paymentId = this.mywithdrawalBankAccList[0].payment_id;
                this.withdrawalRequestModel.payment_id = this.paymentId;
                this.withdrawalRequestModel.account_no = this.mywithdrawalBankAccList[0].account_number;
              }
              /*show initial*/
              this.bankAccObj.account_number = this.mywithdrawalBankAccList[0].account_number;
              this.bankAccObj.payment_id = this.mywithdrawalBankAccList[0].payment_id;
              this.bankAccObj.imageUrl = this.mywithdrawalBankAccList[0].imageUrl;
              this.bankAccObj.bank_name = this.mywithdrawalBankAccList[0].bank_name;
              this.bankAccObj.bank_acc_id = this.mywithdrawalBankAccList[0].bank_account_id;
              this.getWithdrawMaintenance(this.mywithdrawalBankAccList[0].payment_id);
            }
          }
          this.refreshLoading = false;
          this.spinner.hide("refreshLoading");
        }
      );
  }

  gameBankAccListModal(mybankList: TemplateRef<any>) {
    this.mybankList = this.modalService.show(mybankList, {
      class: "gameList-class modal-sm"
    });
  }
  HideAccList() {
    this.mybankList.hide();
  }

  withdrawDelete(payment_id: any, bank_acc_id: any, del: any) {
    this.withdrawalBankAccDelete.payment_id = payment_id;
    this.withdrawalBankAccDelete.bank_acc_id = bank_acc_id;
    this.isDeleteBtn = del;
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.post(this.funct.ipaddress + 'userbankaccount/deleteuserBankAccount', this.withdrawalBankAccDelete, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          if (this.dto.Response.status == "Success") {
            return;
          }
        }
      );
    this.mybankList.hide();
  }
  insertWithdrawlAcc() {
    this.router.navigate(["/wallet/withdraw-add-acc"]);
  }
  changeAction(id, bankName, paymentId) {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'userbankaccount/getuserbankaccount-byPaymentId?paymentId=' + paymentId, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.bankaccoutlistwithpaymentid = this.dto.Response;
          if (this.bankaccoutlistwithpaymentid.length == 0) {
            this.showMyDialog();
          }
        })

    this.withdrawpaymentImg = id;
    if (this.clickId.length == 0) {
      $("#" + id).css('filter', 'grayscale(0%)');
      this.clickId.push(id);
      this.paymentId = id;
      this.bankName = bankName;
      this.changeBankName(this.bankName);
    }
    else {
      for (var i = 0; i < this.clickId.length; i++) {
        if (this.clickId[i] != id) {
          $("#" + this.clickId[i]).css('filter', 'grayscale(100%)');
          $("#" + id).css('filter', 'grayscale(0%)');
          this.clickId[i] = id;
          this.paymentId = id;
          this.bankName = bankName;
          this.changeBankName(this.bankName);
        }
        else {
          $("#" + this.clickId[i]).css('filter', 'grayscale(0%)');
          this.clickId[i] = id;
          this.paymentId = id;
          this.bankName = bankName;
          this.changeBankName(this.bankName);
        }
      }
    }
    $("#dataForm").show();
  }

  changeBankName(bankName) {
    this.add_withdraw_account_name = this.translateService.instant("add_withdraw_account_name");
    $("#add_withdraw_account_name").html(this.add_withdraw_account_name);

    this.add_withdraw_account_name_hint = this.translateService.instant("add_withdraw_account_name_hint");
    document.querySelector('#add_withdraw_account_name_hint').setAttribute('placeholder', this.add_withdraw_account_name_hint);

    this.add_withdraw_account = this.translateService.instant("add_withdraw_account");
    this.add_withdraw_account = this.add_withdraw_account.toString().replace("@account", bankName);
    $("#add_withdraw_account").html(this.add_withdraw_account);
    this.add_withdraw_account_hint = this.translateService.instant("add_withdraw_account_hint");
    this.add_withdraw_account_hint = this.add_withdraw_account_hint.toString().replace("@account", bankName);
    document.querySelector('#add_withdraw_account_hint').setAttribute('placeholder', this.add_withdraw_account_hint);

    this.add_withdraw_account_confirm = this.translateService.instant("add_withdraw_account_confirm");
    this.add_withdraw_account_confirm = this.add_withdraw_account_confirm.toString().replace("@account", bankName);
    $("#add_withdraw_account_confirm").html(this.add_withdraw_account_confirm);

    this.add_withdraw_account_confirm_hint = this.translateService.instant("add_withdraw_account_confirm_hint");
    this.add_withdraw_account_confirm_hint = this.add_withdraw_account_confirm_hint.toString().replace("@account", bankName);
    document.querySelector('#add_withdraw_account_confirm_hint').setAttribute('placeholder', this.add_withdraw_account_confirm_hint);


    //  this.add_withdraw_account_image_hint =  this.translateService.instant("add_withdraw_account_image_hint");
    //  document.querySelector('#add_withdraw_account_image_hint').setAttribute('placeholder',this.add_withdraw_account_image_hint);
    // $("#add_withdraw_account_name").html(this.add_withdraw_account_image_hint);


  }

  getMyaccountList() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'userbankaccount/getuserbankaccount-byUserId', { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.storage.store('localMyBankAccList', this.dto.Response);

        }
      );
  }

  InsertBankAccount() {
    if (!this.isValidForm()) return;
    if (this.loadingInsertBankAcc) return;

    this.prepareImageBase64();
    this.prepareBankAccountList();

    const headers = new HttpHeaders().set(
      'Authorization',
      this.storage.retrieve('token')
    );

    this.loadingInsertBankAcc = true;
    this.spinner.show("loadingInsertBankAcc");

    this.storage.store('localInsertBankAccountList', this.bankAccountList);

    this.checkInsertAccount(headers);
  }

  private checkInsertAccount(headers: HttpHeaders) {
    this.http.post(
      `${this.funct.ipaddress}userbankaccount/check_insertuserBankAccount`,
      this.bankAccountList,
      { headers }
    )
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe(res => {
        if (res.status !== 'Success') {
          this.stopLoading();
          this.showAlreadyExist();
          return;
        }
        this.getUserAccounts(headers);
      });
  }

  private getUserAccounts(headers: HttpHeaders) {
    this.http.get(
      `${this.funct.ipaddress}userbankaccount/getuserbankaccount-byUserId`,
      { headers }
    )
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe((accounts: any[]) => {

        const exists = accounts.some(x =>
          x.account_number === this.bankAccModel.bankAccount &&
          x.payment_id === this.paymentId
        );

        if (exists) {
          this.stopLoading();
          this.showAlreadyExist();
          return;
        }

        this.requestOtp(headers, accounts.length);
      });
  }

  private requestOtp(headers: HttpHeaders, accountCount: number) {
    this.http.get(
      `${this.funct.apaddressv1}transaction/getWithdrawOTP`,
      { headers }
    )
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe(res => {
        this.stopLoading();
        this.handleOtpResponse(res, accountCount);
      });
  }

  private stopLoading() {
    this.loadingInsertBankAcc = false;
    this.spinner.hide("loadingInsertBankAcc");
  }

  private async handleOtpResponse(res: any, accountCount: number) {
    if (res.status === true) {
      this.storage.clear('successmsg');
      this.storage.store('localInsertAccountOtpSms', res);
      let requestIdList = this.storage.retrieve('requestId');
      if (requestIdList) {
        requestIdList += ',' + res.request_id;
      } else {
        requestIdList = res.request_id;
      }
      this.storage.store('requestId', requestIdList);
      this.storage.store('bankAccountList', this.bankAccountList);
      if (accountCount === 0) {
        this.storage.store("localInsertAccount", 'insertAccount');
      }
      this.storage.store('otptype', 'smsotp');
      this.storage.store('actionType', 'insertAccount');
      this.storage.store('formPageType', 'withdrawaladd');
      await this.getCountDown();
      this.router.navigate(['/login/otp'], {
        state: {
          localInsertAccountOtpSms: res,
          bankAccountList: this.bankAccountList
        }
      });
      return;
    }
    if (res.status === 'Error' && res.message?.includes('180 seconds')) {
      this.toastr.error("", this.translateService.instant("otp-request-time"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
    if (res.status === 'Error' && res.message?.includes('60 seconds')) {
      this.toastr.error("", this.translateService.instant("otp-request-time-onemin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
  }

  async getCountDown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.clear('Timer');
      this.prefix = this.storage.retrieve('localPhonePrefix')
      let phoneNumber;
      if (this.phoneValue.startsWith("0")) {
        phoneNumber = this.prefix + this.phoneValue.substring(
          1, this.phoneValue.length);
      }
      if (!this.phoneValue.startsWith("0")) //XXXX
      {
        phoneNumber = this.prefix + this.phoneValue;
      }
      let headers = new HttpHeaders();
      this.http.post(
        this.funct.ipaddress +
        'countdown/get?phoneno=' + phoneNumber +
        '&type=' + this.smstype +
        '&functionName=' + this.functionName,
        {},
        { headers: headers }
      )
        .pipe(catchError(this.handleError.bind(this)))
        .subscribe({
          next: (result: any) => {
            this.dto.Response = result;
            if (this.dto.Response.status === 'Success') {
              const data = this.dto.Response.data;
              this.Timer = data.remainingSeconds;
              this.storage.store('Timer', this.Timer);
            }

            resolve();
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }
  private isValidForm(): boolean {
    return (
      this.checkbankaccountname() &&
      this.checkbankAccount() &&
      this.confirmbankAccount() &&
      this.bankAccModel.bankAccount === this.bankAccModel.confirmbankAccount
    );
  }


  private prepareImageBase64() {
    if (!this.imgURL) return;

    ['jpeg', 'png', 'gif'].some(type => {
      const prefix = `data:image/${type};base64,`;
      if (this.imgURL.includes(prefix)) {
        this.bankAccModel.bankaccQRbase64 = this.imgURL.replace(prefix, '');
        return true;
      }
      return false;
    });
  }

  private showAlreadyExist() {
    this.toastr.error(
      "",
      this.translateService.instant('withdraw_already_exist'),
      { timeOut: 1000, positionClass: 'toast-top-center' }
    );
  }

  private prepareBankAccountList() {
    this.bankAccountList = [{
      payment_id: this.paymentId,
      account_number: this.bankAccModel.bankAccount,
      account_name: this.bankAccModel.bankaccountName,
      imageUrl: this.bankAccModel.bankaccQRbase64
    }];
  }

  refreshPage(): void {
    this.ngOnInit();
    //  this.getUserProfile();
    this.showPass = false;
    setTimeout(() => {
      this.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 1000);
  }

  GetSMSProvider() {
    this.http.get(this.funct.ipaddress + 'user/getSMSProvider')
      .pipe(
        //catchError(this.HandleErrorMessageService)
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.SMSprovider = this.dto.Response.message;
          this.storage.store('SMSprovider', this.SMSprovider);
        });

  }

  getSMSOperators() {

    var phoneno = this.phoneValue.substring(2, this.phoneValue.length);
    this.http.get(this.funct.ipaddress + 'user/getSMSOperators')
      .pipe(
        //catchError(this.HandleErrorMessageService)
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.SMSoperatorList = this.dto.Response;
          if (this.SMSoperatorList != undefined || this.SMSoperatorList != null || this.SMSoperatorList != "") {

            for (let i = 0; i < this.SMSoperatorList.length; i++) {
              if (this.SMSoperatorList[i].operatorType == "MPT") {
                for (let i = 0; i < this.MPTarraylist.length; i++)
                  if (phoneno.startsWith(this.MPTarraylist[i])) {
                    this.Usefirebase = true;
                  }

              }
              else if (this.SMSoperatorList[i].operatorType == "Ooredoo") {
                for (let i = 0; i < this.OoredooList.length; i++)
                  if (phoneno.startsWith(this.OoredooList[i])) {
                    this.Usefirebase = true;
                  }

              }
              else if (this.SMSoperatorList[i].operatorType == "MYTEL") {
                for (let i = 0; i < this.MYTELList.length; i++)
                  if (phoneno.startsWith(this.MYTELList[i])) {
                    this.Usefirebase = true;
                  }

              }
              else if (this.SMSoperatorList[i].operatorType == "Telenor") {
                for (let i = 0; i < this.TelenorList.length; i++)
                  if (phoneno.startsWith(this.TelenorList[i])) {
                    this.Usefirebase = true;
                  }

              }
            }
          }
          else {
            return;
          }

        });

  }
  checkbankAccount() {
    $("#bankAccountErr").html("");
    let pattern = RegExp(/^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/);
    if (this.bankAccModel.bankAccount.length == 0) {
      var phoneRequired = this.translateService.instant("requiredFiled");
      phoneRequired = phoneRequired.toString().replace("@value", this.translateService.instant("withdraw_account_error"));
      $("#bankAccountErr").html(phoneRequired);
      return false;
    }
    if (!pattern.test(this.bankAccModel.bankAccount)) {
      $("#bankAccountErr").html(this.translateService.instant("accountInvaild"));
      return false;
    }
    //if (!this.bankAccModel.bankAccount.startsWith("0")) {
    // if (this.bankAccModel.bankAccount.startsWith("6")) {
    //   var checkNumber = this.translateService.instant("not-allowed-phone-withdraw");
    //   checkNumber = checkNumber.toString().replace("@number", "06");
    //   $("#bankAccountErr").html(checkNumber);
    //   return false;
    // }
    // if (this.bankAccModel.bankAccount.startsWith("8")) {
    //   var checkNumber = this.translateService.instant("not-allowed-phone-withdraw");
    //   checkNumber = checkNumber.toString().replace("@number", "08");
    //   $("#bankAccountErr").html(checkNumber);
    //   return false;
    // }
    // else {
    //   var checkNumber = this.translateService.instant("not-allowed-phone-withdraw");
    //   checkNumber = checkNumber.toString().replace("@number", "09");
    //   $("#bankAccountErr").html(checkNumber);
    //   return false;
    // }

    //}
    if (this.bankAccModel.confirmbankAccount != '') {
      if (this.bankAccModel.bankAccount == this.bankAccModel.confirmbankAccount) {
        $("#confirmbankAccountErr").html("");

      }
      return true;
    }

    else {
      $("#bankAccountErr").html("");
      return true;
    }


  }
  confirmbankAccount() {

    $("#confirmbankAccountErr").html("");

    if (this.bankAccModel.confirmbankAccount.length == 0) {
      var phoneRequired = this.translateService.instant("requiredFiled");
      phoneRequired = phoneRequired.toString().replace("@value", this.translateService.instant("withdraw_account_confirm_name"));
      $("#confirmbankAccountErr").html(phoneRequired);
      return false;
    }

    // let pattern = RegExp('/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/');// ;

    if (this.bankAccModel.bankAccount != this.bankAccModel.confirmbankAccount) {
      $("#confirmbankAccountErr").html(this.translateService.instant("withdraw_account_confirm_error"));
      return false;
    }
    return true;
  }

  checkbankaccountname() {
    $("#bankNameErr").html("");
    //let pattern = RegExp(/^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/);
    if (this.bankAccModel.bankaccountName.length == 0) {
      var phoneRequired = this.translateService.instant("requiredFiled");
      phoneRequired = phoneRequired.toString().replace("@value", this.translateService.instant("withdrawal_account_name"));
      $("#bankNameErr").html(phoneRequired);
      return false;
    }
    else {
      return true;
    }
    // if (!pattern.test(this.bankAccModel.bankaccountName)) {
    //   $("#bankAccountErr").html(this.translateService.instant("accountInvaild"));
    //   return false;
    // }
  }
  getUserProfile() {
    let params = new HttpParams();
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
      .pipe
      (
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.userBalance = this.dto.Response.balance;

        }
      );
  }
  /*need to check*/
  checkAmount(balance: any) {
    if (this.withdrawalRequestModel.amount != undefined && this.withdrawalRequestModel.amount != null && this.withdrawalRequestModel.amount != '') {
      if (this.withdrawalRequestModel.amount > balance) {
        $("#withdrawAmountErr").html(this.translateService.instant("low_balance"));
        return false;
      }
      if (this.withdrawalRequestModel.amount < 1000) {
        $("#withdrawAmountErr").html(this.translateService.instant("amount_error"));
        return false;
      }
      else {
        $("#withdrawAmountErr").html("");
        return true;
      }
    }
    else {
      var amount = this.translateService.instant("requiredFiled");
      amount = amount.toString().replace("@value", this.translateService.instant("withdrawal_cash_amount"));
      $("#withdrawAmountErr").html(amount);
      return false;
    }
  }

  restrictPoint(event: KeyboardEvent): void {
    if (event.key === '.' || event.key === ',') {
      event.preventDefault();
    }
  }

  onAmountInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let currentValue = inputElement.value;
    currentValue = currentValue.replace('.', '');
    inputElement.value = currentValue;

  }




  amountKeyEnter(id) {
    document.getElementById(id).focus();
  }
  loginPassError() {
    const myanmarRegex = /[\u1000-\u109F]/;

    if (myanmarRegex.test(this.withdrawalRequestModel.login_password)) {
      this.withdrawalRequestModel.login_password = this.withdrawalRequestModel.login_password.slice(0, -1);
    }
    if (this.withdrawalRequestModel.login_password != '' && this.withdrawalRequestModel.login_password != undefined && this.withdrawalRequestModel.login_password != null) {
      $("#loginPassErr").html("");
      if (this.withdrawalRequestModel.login_password.length > 20) {
        $("#loginPassErr").html(this.translateService.instant("charlength"));
        return false;
      }
      if (this.withdrawalRequestModel.login_password.length < 6) {
        var passlen = this.translateService.instant("lenghtInvaild1");
        passlen = passlen.toString().replace("@filed", this.translateService.instant("length_field"));
        passlen = passlen.toString().replace("@size", '6');
        if (this.storage.retrieve('localLanguage') == "zh") {
          $("#loginPassErr").html(passlen)
          return false;
        } else {
          $("#loginPassErr").html(this.translateService.instant("requiredFiled").toString().replace("@value", passlen))
          return false;
        }
      }
      else {
        $("#loginPassErr").html("");
        return true;
      }
    }
    else {
      var pass = this.translateService.instant("requiredFiled");
      pass = pass.toString().replace("@value", this.translateService.instant("withdrawal_login_password"));
      $("#loginPassErr").html(pass);
      return false;
    }
  }

  requestWithdrawal() {
    this.common.submitLoading = true;
    this.spinner.hide("submitLoading");

    let amountCheck = this.checkAmount(this.userBalance);
    let pwCheck = this.loginPassError();
    if (!amountCheck || !pwCheck) {
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      return;
    }
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.withdrawalRequestModel.remark = this.withdrawalRequestModel.remark.toString();
    this.http.post(this.funct.ipaddress + 'transaction/withdrawalRequest', this.withdrawalRequestModel, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.common.submitLoading = false;
          this.spinner.hide("submitLoading");
          if (this.dto.Response.message == 'error') {
            this.toastr.error("", this.translateService.instant("submitting-request-time"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return;
          }
          if (this.dto.Response.status == 'Success') {
            this.router.navigate(['/wallet/transcation-waiting-page'], { replaceUrl: true });
            this.storage.store("withdrawaltranObj", this.withdrawalRequestModel);
          }
        }
      );
  }

  getPhoneNumber(phoneNumber: any) {
    if (phoneNumber != null) {
      phoneNumber = "*******" +
        phoneNumber.substring(
          phoneNumber.length - 4, phoneNumber.length).toString();
      return phoneNumber;
    }
  }
  showPassword(show: boolean) {
    this.showPass = show;
    if (this.showPass == true) {
      this.passwordType = "text";
    }
    else {
      this.passwordType = "password";
    }
  }
  withdrawalChangePage() {
    this.router.navigate(['/wallet/withdraw-change-acc'], { replaceUrl: false });
  }
  wavePasswordTypeErr() {

    $('#wavePassErr').html("");
    if (this.withdrawalRequestModel.remark == null || this.withdrawalRequestModel.remark == undefined) {
      $('#wavePassErr').html(this.translateService.instant('withdrawal_wave_shop_hint'));
      return false;
    }
    if (this.withdrawalRequestModel.remark.length < 6) {
      $('#wavePassErr').html(this.translateService.instant('withdrawal_wave_shop_hint'));
      return false;
    }
    if (this.withdrawalRequestModel.remark.length >= 6) {
      $('#wavePassErr').html("");
      return true;
    }
  }


  enter(event) {
    event.target.blur();
  }

  getWithdrawMaintenance(id) {

    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'paymentMaintain/getWithdrawalMaintenance?paymentMethodId=' + id, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;

          if (this.dto.Response != null || this.dto.Response != undefined) {
            this.showWithdrawMaintenanceDialog(this.dto.Response);
          }

        }
      );
  }

  showWithdrawMaintenanceDialog(data) {
    this.storage.store("localWithdrawMaintenance", true);
    const initialState = {
      title: '',
      closeBtnName: '',
      data: data,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(TopupAlertMaintenanceComponent, { class: 'modal-sm topup-maintenance-alert', initialState });
  }

  onPasswordInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = inputElement.value.slice(0, 6);
  }

  keyPressNumberfornumberintput(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const charCode = (event.which) ? event.which : event.keyCode;
    const allowedChars = /^[0-9]*$/;
    if (inputElement.value.length >= 10 && allowedChars.test(event.key)) {
      event.preventDefault();
      return false;
    }
    if (!allowedChars.test(event.key) || charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }


  preview(files) {
    if (files.length === 0)
      return;
    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }
  }
  removeFns() {
    this.imgURL = null;
  }

  getsmstype() {
    this.prefix = this.storage.retrieve('localPhonePrefix')
    let phoneNumber;
    if (this.phoneValue.startsWith("0")) {
      phoneNumber = this.prefix + this.phoneValue.substring(
        1, this.phoneValue.length);
    }
    if (!this.phoneValue.startsWith("0")) //XXXX
    {
      phoneNumber = this.prefix + this.phoneValue;
    }
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'user/userSmsType?phone_no=' + phoneNumber, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.smstype = this.dto.Response.smstype;
        });
  }
}

//com
@Component({
  selector: 'modal-content',
  template: `
    <div class="modal-body pb-2">
    <div class="row px-2">
    <ul>
    <li>{{newTitle[0]}}</li>
    <li>{{newTitle[1]}}</li>
    <li>{{newTitle[2]}}</li>
    <!-- <li>{{newTitle[3]}}</li> -->
    </ul>
    </div>

    <div class="row" style="justify-content: center;">
    <button  type="button" class="btn button-notRound mt-2 mr-1 mb-1" style="width: 125px;height: 40px;color: red;border: 2px solid #ddd;border-radius: 5px;" (click)="goWallet()">{{closeBtnName}}</button>

    <button type="button" class="mt-2 button-notRound"  style="width: 125px;height: 40px;"  (click)="goOk()" >{{ok}}</button>
    </div>

    </div>
  ` ,
  styleUrls: ['./withdraw-alert.component.scss'],
  providers: [BsModalService]
})

export class ModalContentComponent implements OnInit {
  title: string;
  closeBtnName: string;
  ok: string;
  newTitle: any;
  constructor(
    public bsModalRef: BsModalRef,
    private translateService: TranslateService,
    private router: Router,
    private _location: Location) { }

  ngOnInit() {

    // this.title= this.translateService.instant('withdraw_alert_description');
    this.title = this.translateService.instant('withdraw_alert_description');
    this.newTitle = this.title.split('\n');
    this.closeBtnName = this.translateService.instant('login_no');
    this.ok = this.translateService.instant('login_yes');
  }
  goWallet() {
    this.bsModalRef.hide();
    this._location.back();

  }

  goOk() {
    this.bsModalRef.hide();
  }

}


