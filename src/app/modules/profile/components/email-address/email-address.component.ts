
import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-email-address',
  templateUrl: './email-address.component.html',
  styleUrls: ['./email-address.component.scss']
})
export class EmailAddressComponent implements OnInit {
  emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$"
  token: any;
  emailModel: any;
  userProfileModel: any;
  inviteCodeForm!: FormGroup;
  request_id: any;
  code: any;
  submitLoading: boolean = false;

  constructor(
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
    private router: Router,
    private fb: FormBuilder,
    private _location: Location) {
    this.validation();
  }

  ngOnInit(): void {
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.getUserProfile();
    this.userProfileModel = {
      email_address: ''
    }
    this.emailModel = {
      email_address: ''
    }
  }

  validation() {
    this.inviteCodeForm = this.fb.group({
      refCode: ['', Validators.required],
    });
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
          this.dto.Response = {};
          this.dto.Response = result;
          this.userProfileModel = this.dto.Response;
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          if (this.userProfileModel.email != null) {
            this.emailModel = {
              email_address: this.userProfileModel.email
            }
            $(".refCode").prop('disabled', true);
            $(".saveBtn").css("display", "none");
            this.common.refreshLoading = false;
            this.spinner.hide("refreshLoading");
          }
          if (this.userProfileModel.referral_code == null) {
            this.emailModel = {
              email_address: ''
            }
            this.common.refreshLoading = false;
            this.spinner.hide("refreshLoading");
          }
        });
    this.spinner.hide();
  }

  validateEmail() {
    let emailPattern = RegExp(this.emailPattern);
    if (this.emailModel.email_address == '') {
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      this.toastr.error("", this.translateService.instant("invalid_email"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return false;
    }
    else if (!emailPattern.test(this.emailModel.email_address)) {
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      this.toastr.error("", this.translateService.instant("invalid_email"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return false;
    }
    else {
      return true;
    }
  }

  onSubmitting() {
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");
    var isValidEmail = this.validateEmail();
    if (isValidEmail == true) {
      let headers = new HttpHeaders();
      headers = headers.set('Authorization', this.token);
      let params = new HttpParams();
      params = params.set("email", this.emailModel.email_address.trim());
      this.http.get(this.funct.apaddressv1 + 'user/getemailotp?email=' + this.emailModel.email_address, { headers: headers })
        .pipe(
          catchError(this.handleErrorMessage.handleError.bind(this, 'emailRequired'))
        )
        .subscribe(
          result => {
            this.dto.Response = result;
            if (this.dto.Response.status == true) {
              this.request_id = parseInt(this.dto.Response.request_id as string, 10);
              this.code = this.dto.Response.code;
              this.storage.store("emailrequestId", this.request_id);
              this.storage.store("emailaddress", this.emailModel.email_address);
              this.common.submitLoading = false;
              this.spinner.hide("submitLoading");
              this.storage.clear('Timer');
              this.router.navigate(['/me-page/email-otp-comfirm'], { replaceUrl: true });
            }
            if(this.dto.Response.message=" Only one text message can be sent within 180 seconds ")
            {
              this.common.submitLoading = false;
              this.spinner.hide("submitLoading");
              this.router.navigate(['/me-page/email-otp-comfirm'], { replaceUrl: true });
            }
              if(this.dto.Response.message=='too many request'){
              this.common.submitLoading = false;
              this.spinner.hide("submitLoading");
              this.toastr.error("", this.translateService.instant("transaction_wait_5sec"), {
                timeOut: 3000,
                positionClass: 'toast-bottom-center',
              });
            }


          }
        );
    }
  }

  refCodeRequired() {
    let title = this.translateService.instant("emailRequired");
    return title;
  }
}
