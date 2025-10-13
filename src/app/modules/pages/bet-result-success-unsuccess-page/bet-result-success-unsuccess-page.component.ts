import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Location } from '@angular/common';


@Component({
  selector: 'app-bet-result-success-unsuccess-page',
  templateUrl: './bet-result-success-unsuccess-page.component.html',
  styleUrls: ['./bet-result-success-unsuccess-page.component.scss']
})
export class BetResultSuccessUnsuccessPageComponent implements OnInit {
  status: any = 'success';
  supportLanguages = ['en', 'my', 'th', 'zh'];
  type: any;

  constructor(
    private Location: LocationStrategy,
    private router: Router,
    private translateService: TranslateService,
    private storage: LocalStorageService,
    private _location: Location
  ) {
    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang(this.storage.retrieve('localLanguage'));
    this.status = history.state.status;
    this.type = history.state.type;
  }

  ngOnInit(): void {
  }

  openHomePage() {
    var dream_book = this.storage.retrieve('localNewTwodDreamBookNumber');
    var threed = this.storage.retrieve('localThreedDPage');
    this.storage.clear('localNewTwodDreamBookNumber');
    this.storage.clear('localThreedDPage');
    if ((dream_book != null && dream_book != undefined) || threed == "quickSelect" || threed == "dreamBook") {
      if (this.type == 'threed') {
        history.go(-3);
      }
      else {
        history.go(-3);
      }
    }
    else {
      this.storage.clear('localSelectTwoDList')
      if (this.type == 'threed') {
        history.go(-2);
      }
      else {
        history.go(-2);
      }
    }
  }
}
