import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-game-list-transfer',
  templateUrl: './game-list-transfer.component.html',
  styleUrls: ['./game-list-transfer.component.scss']
})
export class GameListTransferComponent implements OnInit {
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
    this.storage.store('localLiveGameLaunch',{'providerId':this.data.id,'providerName':this.data.name,'list':this.data.LiveGameLaunch});        
    this.router.navigate(['/game/wallet'], {state: {providerType: this.data.id,gameType: "in"},replaceUrl: false});
  }

}