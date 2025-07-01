import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-topup-alert-maintenance',
  templateUrl: './topup-alert-maintenance.component.html',
  styleUrls: ['./topup-alert-maintenance.component.scss']
})
export class TopupAlertMaintenanceComponent implements OnInit {
  
  title: string;
  closeBtnName: string; 
  term_conditions: any;
  @Input() data: any=[];  
  description: any;
  maintenance: boolean=false;  
  constructor(private storage: LocalStorageService,public bsModalRef: BsModalRef,private translateService: TranslateService, private router: Router,) {
   

  }
 
  ngOnInit() 
  {      
    this.changeLanguage();  
    this.closeBtnName= this.translateService.instant('ok');
    this.term_conditions=this.translateService.instant('term_conditions'); 
  }

  goWallet()
  {
    this.bsModalRef.hide();
    
    this.maintenance=this.storage.retrieve("localWithdrawMaintenance");    
    if(this.maintenance){
      this.router.navigate(['/wallet/withdraw'],{replaceUrl:true});
    }
    else{
      this.router.navigate(['/wallet/top-up'],{replaceUrl:true});
    }
    
  }
  
  changeLanguage() { 
     var des_lang;     
     let language= this.storage.retrieve('localLanguage');
     if (language == "my") {
      des_lang=this.data.description_my;      
      this.description=des_lang != null?des_lang.split('\n'):"";
      return;
     } else if (language == "en") {
      des_lang= this.data.description_en;    
      this.description=des_lang != null?des_lang.split('\n'):"";     
      return;
     }else if (language == "th") {
      des_lang= this.data.description_th;
      this.description=des_lang != null?des_lang.split('\n'):"";
      return;
     } else if (language == "zh") {
      des_lang= this.data.description_zh; 
      this.description=des_lang != null?des_lang.split('\n'):""; 
      return;   
     } 
    
   }

}