import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { NavigationService } from '../../service/navigation.service';
import {Location} from '@angular/common';
@Component({
  selector: 'app-not-refresh-appbar',
  templateUrl: './not-refresh-appbar.component.html',
  styleUrls: ['./not-refresh-appbar.component.scss']
})
export class NotRefreshAppbarComponent implements OnInit {
 
  @Input() rootLevel=1;
  @Input() parentLink:string;
  @Input() typeUrl: string;  
  @Input() type: string;  
  constructor(
    public navigation: NavigationService,
    private router: Router,
    private storage: LocalStorageService,
    private _location: Location) { 
   
  }
  ngOnInit(): void {  
  }  
  refreshPage(): void{
    this.ngOnInit();  
  }
  goBack(){    
    this._location.back();   
  }
 
}