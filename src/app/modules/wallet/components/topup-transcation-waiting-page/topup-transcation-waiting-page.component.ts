import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { LocationStrategy } from '@angular/common';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { Location } from '@angular/common'

@Component({
  selector: 'app-topup-transcation-waiting-page',
  templateUrl: './topup-transcation-waiting-page.component.html',
  styleUrls: ['./topup-transcation-waiting-page.component.scss']
})
export class TopupTranscationWaitingPageComponent implements OnInit {
  supportLanguages = ['en','my','th','zh'];
  type: any;
  
  tran_waiting_withdrawal_desc1: any;
  tran_waiting_topup_desc1: any;
  rootLevel: any;
  parentLink: any;
  constructor(   
    private Location: LocationStrategy, 
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
    private _location: Location) { 
    
      this.translateService.addLangs(this.supportLanguages);
      this.translateService.setDefaultLang(this.storage.retrieve('localLanguage')); 
      this.type=history.state.type;
     
    }

  ngOnInit(): void {
    this.storage.clear('transfer_amount')
    this.storage.clear('transfer_payment_id')
    this.tran_waiting_topup_desc1=this.translateService.instant("tran_waiting_topup_desc1");
    this.tran_waiting_topup_desc1=this.tran_waiting_topup_desc1.toString().replace("@time", 10);


    this.tran_waiting_withdrawal_desc1=this.translateService.instant("tran_waiting_withdrawal_desc1");
    this.tran_waiting_withdrawal_desc1=this.tran_waiting_withdrawal_desc1.toString().replace("@time", 30);

  }

  goHomePage()
  {
    this._location.back();
  }
}
