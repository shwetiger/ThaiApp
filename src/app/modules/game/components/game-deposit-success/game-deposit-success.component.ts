import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { FunctService } from 'src/app/shared/service/funct.service';

@Component({
  selector: 'app-game-deposit-success',
  templateUrl: './game-deposit-success.component.html',
  styleUrls: ['./game-deposit-success.component.scss']
})
export class GameDepositSuccessComponent implements OnInit {
  gameFrom: any;
  gameTo: any;
  transferAmount: any;
  gameProviderId: any;
  granParent: any;
  gameWalletTransfer: any;
  isFromGameAccountLogin: any;
  providerId:any;
  gameUserBalance:any;
  token:any;
  GameBalanceResponse:any;
  gameName:any;
  isUserLoggedIn = false;

  constructor(
    private router: Router,
    private storage: LocalStorageService,
    private _location: Location,
    private funct: FunctService) {
  }

  async  ngOnInit(): Promise<void>  {
    this.gameFrom = this.storage.retrieve("gameFrom");
    this.gameTo = this.storage.retrieve("gameTo");
    this.transferAmount = this.storage.retrieve("transferAmount");
    this.gameProviderId = this.storage.retrieve("localGameProviderId");
    this.providerId = this.storage.retrieve('localGamePlayProviderId');
    this.isFromGameAccountLogin = this.storage.retrieve("from-game-account-login");
    //await this.getGameUserBalance();
  }

  goToGameList() {
    if (this.isFromGameAccountLogin == "fg") {
      if (this.providerId == 8 || this.providerId == 2) {
        this.router.navigate(['/game/gamecategory', this.providerId], { state: { catId: this.providerId, gameProviderId: this.providerId }, replaceUrl: true });
      }
      else {
        localStorage.setItem("from-game-account-login", null)
        this.router.navigate(['game/gameList/' + this.gameProviderId], { replaceUrl: true })
      }
    }
    else {
      this._location.back();
    }
  }

}
