import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Location } from '@angular/common';

@Component({
  selector: 'app-game-deposit-error',
  templateUrl: './game-deposit-error.component.html',
  styleUrls: ['./game-deposit-error.component.scss']
})
export class GameDepositErrorComponent implements OnInit {

  errorCode : any;
  gameProviderId: any;
  constructor(
    private _location: Location,
    private storage: LocalStorageService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.errorCode = this.route.snapshot.paramMap.get("errorCode");
    this.gameProviderId = this.storage.retrieve("localGameProviderId");
  }
  async goToGameList()
  {
    this._location.back();
    // var aaa=await this.storage.retrieve('returnUrl');    
    // if(aaa !=null && aaa.length > 0){
    //  // this.storage.clear('returnUrl');
    //  // this.router.navigate([aaa], {replaceUrl: true});
    //  this.router.navigate(["/gameList/"+this.gameProviderId], {replaceUrl: true});       
    // }
    // else{
    //   this.router.navigate(["/wallet"], {replaceUrl: true});
    // }
  }
}
