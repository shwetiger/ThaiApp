import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';

import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";

import { DtoService } from '../../service/dto.service';
import { UtilService } from '../../service/util.service';
import { FunctService } from '../../service/funct.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Location } from '@angular/common';
import { ModalDialogService } from 'ngx-modal-dialog';

@Component({
  selector: 'app-language-page',
  templateUrl: './language-page.component.html',
  styleUrls: ['./language-page.component.css']
})
export class LanguagePageComponent implements OnInit {

  isDropdownOpen = false;
  selectedIndex: any;
  // supportLanguages: any;
  lang: any;
  supportLanguages = ['en','my','th','zh'];
  constructor(private modalService: ModalDialogService, private viewRef: ViewContainerRef,private translateService: TranslateService,private toastr: ToastrService, private spinner: NgxSpinnerService, private dto: DtoService, private http: HttpClient, private util: UtilService, 
    private router: Router, private storage: LocalStorageService, private funct: FunctService,private location: Location,) {
   
  }

  ngOnInit() {
    if(this.storage.retrieve('localLanguageIndex') == null){
      let index = this.supportLanguages.indexOf(this.storage.retrieve('localLanguage')); 
      this.selectedIndex = this.storage.store('localLanguageIndex',index);
    }
    else{
      this.selectedIndex=this.storage.retrieve('localLanguageIndex');
    }  
    if(this.storage.retrieve('localLanguage') == null || this.storage.retrieve('localLanguage') == '')
    {
      this.storage.store('localLanguage', 'my');
      this.lang=this.storage.store('localLanguage', 'my');     
    }     
    else{
      this.translateService.setDefaultLang(this.storage.retrieve('localLanguage')); 
      this.lang=this.storage.retrieve('localLanguage');     
    }   
   
    this. changeLanguage(); 
    this.lang=this.storage.retrieve('localLanguage');    
  }

  changeLanguage(){        
    this.lang=this.supportLanguages[this.selectedIndex]; 
  }

  // selectedLanguageCountry(lang: string,index: number){ 
  //   this.selectedIndex = index;
  //   this.translateService.use(lang);
  //   this.changeLanguage();
  //   this.storage.store('localLanguage', lang); 
  //   this.storage.store('localLanguageIndex', this.selectedIndex);    
  // }

  toggleDropdown() {
   this.isDropdownOpen = !this.isDropdownOpen;
}

selectedLanguageCountry(lang: string, index: number) { 
  this.selectedIndex = index;
  this.lang = lang;  // ✅ ဒီလိုနဲ့ သက်ဆိုင်ရာ flag ပြောင်းမယ်
  this.translateService.use(lang);
  this.storage.store('localLanguage', lang); 
  this.storage.store('localLanguageIndex', index);    
   this.isDropdownOpen = false;
}

}
