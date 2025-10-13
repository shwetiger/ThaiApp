import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import 'rxjs/add/operator/map';
import { Location } from '@angular/common';
import { LocalStorageService } from 'ngx-webstorage';
@Component({
  selector: 'app-personal-info-pending',
  templateUrl: './fileupload-success.component.html',
  styleUrls: ['./fileupload-success.component.scss']
})
export class FileUploadSuccessComponent implements OnInit {

  constructor(
    private _location: Location,
    private storage: LocalStorageService,
  ) { }

  ngOnInit(): void {
  }
  goBackHome() {

    var slip = this.storage.retrieve('localBankSlipWaiting');
    if (slip != null && slip != undefined) {
      this.storage.clear('localBankSlipWaiting');
      history.go(-4);
    }
    else {
      this.storage.clear('localBankSlipWaiting');
      history.go(-3);
    }

  }
}
