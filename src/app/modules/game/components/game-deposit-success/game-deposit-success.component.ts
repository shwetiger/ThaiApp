import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Location } from '@angular/common';

@Component({
  selector: 'app-game-deposit-success',
  templateUrl: './game-deposit-success.component.html',
  styleUrls: ['./game-deposit-success.component.scss']
})
export class GameDepositSuccessComponent implements OnInit {

  gameFrom : any;
  gameTo : any;
  transferAmount : any;
  gameProviderId: any;
  granParent : any;
  gameWalletTransfer: any;
  isFromGameAccountLogin :any;
  constructor(  
    private router: Router,
    private storage: LocalStorageService,
    private _location: Location) {
   }

  ngOnInit(): void {
    this.gameFrom = this.storage.retrieve("gameFrom");
    this.gameTo = this.storage.retrieve("gameTo");
    this.transferAmount = this.storage.retrieve("transferAmount");
    this.gameProviderId = this.storage.retrieve("localGameProviderId");   
    this.isFromGameAccountLogin = this.storage.retrieve("from-game-account-login");
  }
  
  goToGameList()
  {
    if(this.isFromGameAccountLogin == "fg")
    {
      localStorage.setItem("from-game-account-login",null)
      this.router.navigate(['game/gameList/'+this.gameProviderId],{replaceUrl: true});
    }
    else
    {
      this._location.back();
    }
  }
}
