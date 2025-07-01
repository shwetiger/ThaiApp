import { Component, OnInit } from '@angular/core';
import { Router , ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { TranslateService } from '@ngx-translate/core';
import { LocationStrategy } from '@angular/common';
import { Location } from '@angular/common';


@Component({
  selector: 'app-withdraw-pending',
  templateUrl: './withdraw-pending.component.html',
  styleUrls: ['./withdraw-pending.component.scss']
})
export class WithdrawPendingComponent implements OnInit {

  servicePhoneList : any;
  tranObj : any;
  supportLanguages = ['en','my','th','zh'];
  tran_waiting_withdrawal_desc1 : any;
  
  constructor(
    private Location: LocationStrategy, 
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: LocalStorageService,
    private _location: Location) { 
    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage')); 

  }

  ngOnInit(): void {
    this.servicePhoneList = this.storage.retrieve("localservicePhoneList");
    this.tranObj = this.storage.retrieve("withdrawaltranObj");
    this.tran_waiting_withdrawal_desc1 = this.translateService.instant("tran_waiting_withdrawal_desc1");
    this.tran_waiting_withdrawal_desc1 = this.tran_waiting_withdrawal_desc1.toString().replace("@time", "30");
  }
  goBack(){
    this._location.back();
  }
 
}
