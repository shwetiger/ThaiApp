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
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonService } from 'src/app/shared/service/common.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-invite-code',
  templateUrl: './invite-code.component.html',
  styleUrls: ['./invite-code.component.scss']
})
export class InviteCodeComponent implements OnInit {

  token: any;
  refModel: any;
  userProfileModel: any;
  inviteCodeForm!: FormGroup;
  regularExpressionPhone = "^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$";
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
    private fb: FormBuilder,
    private _location: Location) {
    this.validation();
  }

  ngOnInit(): void {
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.getUserProfile();
    this.userProfileModel = {
      referral_code: '',
      referral_phone_no: ''
    }
    this.refModel = {
      referral_code: '',
      referral_phone_no: ''
    }
  }

  validation() {
    this.inviteCodeForm = this.fb.group({
      refCode: ['', Validators.required],
      refPhoneNumber: ['', Validators.required],
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
          if (this.userProfileModel.referral_code != null) {
            this.refModel = {
              referral_code: this.userProfileModel.referral_code
            }
            $(".refCode").prop('disabled', true);
            $(".saveBtn").css("display", "none");
            this.common.refreshLoading = false;
            this.spinner.hide("refreshLoading");
          }
          if (this.userProfileModel.referral_code == null) {
            this.refModel = {
              referral_code: ''
            }
            this.common.refreshLoading = false;
            this.spinner.hide("refreshLoading");
          }
          if (this.userProfileModel.referral_phone_no != null) {
            this.refModel = {
              referral_phone_no: this.userProfileModel.referral_phone_no
            }
            $(".refPhoneNumber").prop('disabled', true);
            $(".saveBtn").css("display", "none");
            this.common.refreshLoading = false;
            this.spinner.hide("refreshLoading");
          }
          if (this.userProfileModel.referral_phone_no == null) {
            this.refModel = {
              referral_phone_no: ''
            }
            this.common.refreshLoading = false;
            this.spinner.hide("refreshLoading");
          }
        });
    this.spinner.hide();
  }

  // onSubmitting_1() {
  //   this.refModel.referral_code = this.inviteCodeForm.value['refCode'];
  //   this.refModel.referral_phone_no = this.inviteCodeForm.value['refPhoneNumber'];
  //   if (!this.refModel.referral_code && !this.refModel.referral_phone_no) {
  //     this.toastr.error("", this.translateService.instant('enter_ref_code_phno'), {
  //       timeOut: 3000,
  //       positionClass: 'toast-top-center',
  //     });
  //     return;
  //   }
  //   if (this.userProfileModel.referral_code != null && this.userProfileModel.referral_code != '' && !this.refModel.referral_phone_no) {
  //     this.toastr.error("", this.translateService.instant('enter_ref_phno'), {
  //       timeOut: 3000,
  //       positionClass: 'toast-top-center',
  //     });
  //     return;
  //   }

  //   if ((this.userProfileModel.referral_phone_no != '' && this.userProfileModel.referral_phone_no != null) && !this.refModel.referral_code) {
  //     this.toastr.error("", this.translateService.instant('enter_ref'), {
  //       timeOut: 3000,
  //       positionClass: 'toast-top-center',
  //     });
  //     return;
  //   }

  //   this.token = this.storage.retrieve('token');
  //   let headers = new HttpHeaders();
  //   headers = headers.set('Authorization', this.token);
  //   let url = this.funct.ipaddress + 'user/updateReferralcode';
  //   if (this.refModel.referral_code) {
  //     url += `?referral_code=${this.refModel.referral_code}`;
  //   }
  //   if (this.refModel.referral_phone_no) {
  //     url += `${this.refModel.referral_code ? '&' : '?'}referral_phone_no=${this.refModel.referral_phone_no}`;
  //   }
  //   this.http.post(url, null, { headers: headers })
  //     .pipe(
  //       catchError(this.handleErrorMessage.handleError.bind(this, 'referralInvaild'))
  //     )
  //     .subscribe(
  //       result => {
  //         this.dto.Response = result;
  //         if (this.dto.Response.isSuccess === true) {
  //           this._location.back();
  //         }
  //         else {
  //           if (this.dto.Response.message == 'Agent not found') {
  //             this.toastr.error("", this.translateService.instant('invalid_invitecode'), {
  //               timeOut: 3000,
  //               positionClass: 'toast-top-center',
  //             });
  //           }
  //           if (this.dto.Response.message == 'Recommender not found') {
  //             this.toastr.error("", this.translateService.instant('invalid_ref_phoneno'), {
  //               timeOut: 3000,
  //               positionClass: 'toast-top-center',
  //             });
  //           }

  //           if (this.dto.Response.message == 'Recommender not found,The agent was saved successfully') {
  //             this.toastr.error("", this.translateService.instant('invalid_ref_phoneno'), {
  //               timeOut: 3000,
  //               positionClass: 'toast-top-center',
  //             });
  //           }
  //           if (this.dto.Response.message == 'Agent not found,Recommender saved successfully') {
  //             this.toastr.success("", this.translateService.instant('invalid_invitecode'), {
  //               timeOut: 3000,
  //               positionClass: 'toast-top-center',
  //             });
  //             this.toastr.error("", this.translateService.instant('invalid_invitecode'), {
  //               timeOut: 3000,
  //               positionClass: 'toast-top-center',
  //             });
  //           }
  //           if (this.dto.Response.message == 'Users cannot serve as their own recommenders.,The agent was saved successfully' || this.dto.Response.message == 'Users cannot serve as their own recommenders.') {
  //             this.toastr.error("", this.translateService.instant('own_referal_phone'), {
  //               timeOut: 3000,
  //               positionClass: 'toast-top-center',
  //             });
  //           }
  //         }
  //       }
  //     );
  // }
  onSubmitting() {
    this.refModel.referral_code = this.inviteCodeForm.value['refCode'];
    this.refModel.referral_phone_no = this.inviteCodeForm.value['refPhoneNumber'];
    if (!this.refModel.referral_code && !this.refModel.referral_phone_no) {
      this.toastr.error("", this.translateService.instant('enter_ref_code_phno'), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (this.userProfileModel.referral_code != null && this.userProfileModel.referral_code != '' && !this.refModel.referral_phone_no) {
      this.toastr.error("", this.translateService.instant('enter_ref_phno'), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }

    if ((this.userProfileModel.referral_phone_no != '' && this.userProfileModel.referral_phone_no != null) && !this.refModel.referral_code) {
      this.toastr.error("", this.translateService.instant('enter_ref'), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    let url = this.funct.ipaddress + 'user/updateReferralcode';
    //let urlph = this.funct.ipaddress + 'user/updateReferralPhoneNO';
    if (!this.userProfileModel.referral_code && !this.userProfileModel.referral_phone_no && this.refModel.referral_code && this.refModel.referral_phone_no) {
      url += `?referral_code=${this.refModel.referral_code}`;
      url += `${this.refModel.referral_code ? '&' : '?'}referral_phone_no=${this.refModel.referral_phone_no}`;
      this.http.post(url, null, { headers: headers })
        .pipe(
          catchError(this.handleErrorMessage.handleError.bind(this, 'referralInvaild'))
        )
        .subscribe(
          result => {
            this.dto.Response = result;
            if (this.dto.Response.isSuccess === true) {
              if (this.dto.Response.message === "The agent was saved successfully,Recommender saved successfully") {
                this.toastr.success("", this.translateService.instant('bankacc_addsuccess'), {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
                this._location.back();
                return;
              }
            }
            else {
              if (this.dto.Response.message == 'Agent not found,Recommender saved successfully') {
                $("#codeErr").html(this.translateService.instant("invalid_invitecode"));
                this.toastr.success("", this.translateService.instant('refreral_ph_save_success'), {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
                return;
              }
              if (this.dto.Response.message == 'Recommender not found,The agent was saved successfully') {
                $("#phoneErr").html(this.translateService.instant("invalid_ref_phoneno"));
                this.toastr.success("", this.translateService.instant('referral_code_save_success'), {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
                return;
              }
              else {
                this.toastr.error("", this.translateService.instant('invalid'), {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
                return;
              }
            }
          });
      return;
    }
    if (this.refModel.referral_code && !this.userProfileModel.referral_code) {
      url += `?referral_code=${this.refModel.referral_code}`;
      this.http.post(url, null, { headers: headers })
        .pipe(
          catchError(this.handleErrorMessage.handleError.bind(this, 'referralInvaild'))
        )
        .subscribe(
          result => {
            this.dto.Response = result;
            if (this.dto.Response.isSuccess === true) {
              if (this.dto.Response.message === "The agent was saved successfully") {
                this.toastr.success("", this.translateService.instant('referral_code_save_success'), {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
                this._location.back();
                return;
              }
            }
            else {
              this.toastr.error("", this.translateService.instant('invalid_invitecode'), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
              });
            }
          });
      return;
    }
    if (this.refModel.referral_phone_no && !this.userProfileModel.referral_phone_no) {
      url = this.funct.ipaddress + 'user/updateReferralPhoneNO';
      url += `?referral_phone_no=${this.refModel.referral_phone_no}`;
      this.http.post(url, null, { headers: headers })
        .pipe(
          catchError(this.handleErrorMessage.handleError.bind(this, 'referralInvaild'))
        )
        .subscribe(
          result => {
            this.dto.Response = result;
            if (this.dto.Response.isSuccess === true) {
              if (this.dto.Response.message === "Recommender saved successfully") {
                this.toastr.success("", this.translateService.instant('refreral_ph_save_success'), {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
                this._location.back();
                return;
              }

            }
            else {
              this.toastr.error("", this.translateService.instant('invalid_ref_phoneno'), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
              });
            }
          });
      return;
    }
  }

  checkPhoneNumber() {
    if (!this.refModel.referral_phone_no) {
      $("#phoneErr").html("");
      return true;
    }
    const pattern = new RegExp(this.regularExpressionPhone);
    if (!pattern.test(this.refModel.referral_phone_no)) {
      $("#phoneErr").html(this.translateService.instant("phoneInvaild"));
      return false;
    }

    $("#phoneErr").html("");
    return true;
  }

  refCodeRequired() {
    let title = this.translateService.instant("requiredFiled");
    title = title.toString().replace("@value", this.translateService.instant("enterRef"));
    return title;
  }

  refPhoneNumberRequired() {
    let title = this.translateService.instant("enter_ref_phno_alert");
    return title;
  }
}
