import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { Location } from '@angular/common';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-profile-edit-page',
  templateUrl: './profile-edit-page.component.html',
  styleUrls: ['./profile-edit-page.component.scss']
})
export class ProfileEditPageComponent implements OnInit {
  logout: BsModalRef;
  delete: BsModalRef;
  fileInput: any;
  active: string;
  activeLang: any;
  supportLanguages = ['en', 'my', 'th', 'zh'];
  userModel: any;
  token: any;
  imagePath: any;
  imgURL: any;
  message: string;
  phoneNumber: any;
  parentLink: any;
  refreshLoading: boolean;
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
    if (this.storage.retrieve('localLanguage') == null || this.storage.retrieve('localLanguage') == '') {
      this.storage.store('localLanguage', 'en');
      this.activeLang = this.storage.store('localLanguage', 'en');
    }
    else {
      this.translateService.setDefaultLang(this.storage.retrieve('localLanguage'));
      this.activeLang = this.storage.retrieve('localLanguage');
    }
  }

  ngOnInit(): void {
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.userModel = {
      name: '',
      phone_no: '',
      imageUrl: '',
      image64BaseData: ''
    }
    this.getUserProfile();
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
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = {};
          this.dto.Response = result;
          this.userModel = this.dto.Response;
          this.getPhoneNumber(this.userModel.phone_no);
        });
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

  changeProfile() {
    this.common.submitLoading = true;
    this.spinner.show("submitLoading");
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    if (this.userModel.name.length == 0 || this.userModel.name == null || this.userModel.name == undefined) {
      this.common.submitLoading = false;
      this.spinner.hide("submitLoading");
      this.toastr.error('', this.translateService.instant("editByUserName"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      return;
    }
    if (this.imgURL != undefined) {
      if (this.imgURL.includes('data:image/jpeg;base64,'))
        this.userModel.image64BaseData = this.imgURL.replace("data:image/jpeg;base64,", "");
      if (this.imgURL.includes('data:image/png;base64,'))
        this.userModel.image64BaseData = this.imgURL.replace("data:image/png;base64,", "");
      if (this.imgURL.includes('data:image/gif;base64,'))
        this.userModel.image64BaseData = this.imgURL.replace("data:image/gif;base64,", "");
    }
    this.http.post(this.funct.ipaddress + 'user/editByUser', this.userModel, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.common.submitLoading = false;
          this.spinner.hide("submitLoading");
          this.dto.Response = result;
          if (this.dto.Response.status == 'Success') {
            this.toastr.success("", this.translateService.instant("success_message"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            this._location.back();
          }
        }
      );
  }

  selectLang(lang: string) {
    this.translateService.use(lang);
    this.storage.store('localLanguage', lang);
    this.active = 'active';
  }

  getPhoneNumber(phone: any) {
    if (phone != null) {
      this.userModel.phone_no = phone.substring(1, 3).toString() +
        phone.substring(3, 6).toString() + "*****" + phone.substring(phone.length - 2, phone.length).toString();
    }
  }

  enter(event) {
    event.target.blur();
  }

  refreshPage() {
    this.ngOnInit();
    setTimeout(() => {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 1000);
  }

  logoutModel(logout: TemplateRef<any>) {
    this.logout = this.modalService.show(logout,
      {
        class: "logout-modal",
        ignoreBackdropClick: true,
        keyboard: false
      });
  }

  HidelogoutModel() {
    this.logout.hide();
  }

  onFileSelected(event: any) {
    this.fileInput = event.target;
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageUrl = e.target.result;
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  deleteprofilephoto() {
    if( this.userModel.imageUrl=='' || this.userModel==undefined)
    {
            this.toastr.error("", this.translateService.instant("no_profilimage"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            return;
    }
    else{
    this.userModel.imageUrl = '';
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'user/deleteByUser', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.common.submitLoading = false;
          this.spinner.hide("submitLoading");
          this.dto.Response = result;
          if (this.dto.Response.status == 'Success') {
            this.HidelogoutModel();
            this.toastr.success("", this.translateService.instant("success_message"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }
        }
      );
  }
}
}
