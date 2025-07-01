import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameListComponent } from './components/game-list/game-list.component';
import { GamecategoryComponent } from './components/gamecategory/gamecategory.component';
import { GameWinLosePageComponent } from './components/game-win-lose-page/game-win-lose-page.component';
import { GameWalletComponent } from './components/game-wallet/game-wallet.component';
import { GameDepositSuccessComponent } from './components/game-deposit-success/game-deposit-success.component';
import { GameDepositErrorComponent } from './components/game-deposit-error/game-deposit-error.component';
import { CountryBlackListComponent } from './components/country-black-list/country-black-list.component';

const routes: Routes = [
  {path:'', component: GameListComponent},
  {
    path: 'gameList/:providerId' , component: GameListComponent
  },
  {
    path: 'gamecategory/:catId',component: GamecategoryComponent
  },
  {
    path: 'play', component: GameWinLosePageComponent
  },
  {
    path: 'wallet', component: GameWalletComponent
  },
  {
    path: 'deposit-success/:successCode', component: GameDepositSuccessComponent
  },
  {
    path: 'deposit-error/:errorCode', component: GameDepositErrorComponent
  },
  {
    path: 'country-black-list' , component: CountryBlackListComponent
  },
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
