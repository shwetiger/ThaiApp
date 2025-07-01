import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Location } from '@angular/common';

@Component({
  selector: 'app-country-black-list',
  templateUrl: './country-black-list.component.html',
  styleUrls: ['./country-black-list.component.scss']
})
export class CountryBlackListComponent implements OnInit {

  qmBlackList :[];
  providerId : any;
  constructor(
    private _location: Location,
    private router: Router,
    private storage: LocalStorageService) { }

  ngOnInit(): void {
   this.qmBlackList =  this.storage.retrieve('localcountryBlackList');
   this.providerId = this.storage.retrieve("localproviderId");
  }
  gameList(){  
   this._location.back()
  }
}
