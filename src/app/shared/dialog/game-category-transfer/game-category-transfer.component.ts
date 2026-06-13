import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef ,BsModalService} from 'ngx-bootstrap/modal';
import { LocalStorageService } from 'ngx-webstorage';
import { GameWalletInOutComponent } from 'src/app/shared/dialog/game-wallet-in-out/game-wallet-in-out.component';

@Component({
  selector: 'app-game-category-transfer',
  templateUrl: './game-category-transfer.component.html',
  styleUrls: ['./game-category-transfer.component.scss']
})
export class GameCategoryTransferComponent implements OnInit {
  title: string;
  closeBtnName: string;
  @Input() data: any=[];
  transferdata:any;
  constructor(private storage: LocalStorageService,public bsModalRef: BsModalRef,private translateService: TranslateService,private modalService: BsModalService, private router: Router,) {

  }

  ngOnInit()
  {
    this.closeBtnName= this.translateService.instant('cancel');
    this.transferdata = {
    display_name: '',
    providerId: ''
      }

  }
  close(){
    this.bsModalRef.hide();
  }

  goTo()
  {
    this.bsModalRef.hide();
    this.storage.store('localLiveGameLaunch',this.data.LiveGameLaunch);
    this.transferdata.display_name = this.data.name;
    this.transferdata.providerId = this.data.id;
    const list = { list: this.transferdata, tranfer: 'in' };
    this.showGameInOutDialog(list);
   // this.router.navigate(['/game/wallet'], {state: {providerType: this.data.id,gameType: "in"},replaceUrl: false});
  }

   showGameInOutDialog(data) {
          const initialState= {
            title: '',
            data: data,
            closeBtnName: '',
            backdrop: true,
            ignoreBackdropClick: true
          };
          this.storage.store("from-game-account-login","fg")
          this.bsModalRef = this.modalService.show(GameWalletInOutComponent, { class: 'modal-sm game-in-out-alert', initialState });
        }

}