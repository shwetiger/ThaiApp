import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-game-category-transfer',
  templateUrl: './game-category-transfer.component.html',
  styleUrls: ['./game-category-transfer.component.scss']
})
export class GameCategoryTransferComponent implements OnInit {
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

  goTo()
  {
    this.bsModalRef.hide();   
    this.storage.store('localLiveGameLaunch',this.data.LiveGameLaunch);   
    this.router.navigate(['/game/wallet'], {state: {providerType: this.data.id,gameType: "in"},replaceUrl: false});
  }

}