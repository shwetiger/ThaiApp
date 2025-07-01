import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-game-category-maintenance',
  templateUrl: './game-category-maintenance.component.html',
  styleUrls: ['./game-category-maintenance.component.scss']
})
export class GameCategoryMaintenanceComponent implements OnInit {
  
  title: string;
  closeBtnName: string; 
  @Input() data: any=[];  
 
  constructor(private storage: LocalStorageService,public bsModalRef: BsModalRef,private translateService: TranslateService, private router: Router,) {
   
  } 
  ngOnInit() 
  {     
    this.closeBtnName= this.translateService.instant('cancel');
    
  }
  close(){
    this.bsModalRef.hide();
  }
 
  changeLanguageGameAlert(data:any)
  {
    let language= this.storage.retrieve('localLanguage');
    if (language == "my") {
      return data.description_my != null ? data.description_my : data.description_en;
    } else if (language == "th") {
      return data.description_th != null ? data.description_th : data.description_en;
    } else if (language == "zh") {
      return data.description_zh != null ? data.description_zh : data.description_en;
    } else {
      return data.description_en;
    }
  }
}