import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameListComponent } from './components/game-list/game-list.component';
import { GamecategoryComponent } from './components/gamecategory/gamecategory.component';
import { GameWinLosePageComponent } from './components/game-win-lose-page/game-win-lose-page.component';
import { GameWalletComponent } from './components/game-wallet/game-wallet.component';
import { GameDepositSuccessComponent } from './components/game-deposit-success/game-deposit-success.component';
import { GameDepositErrorComponent } from './components/game-deposit-error/game-deposit-error.component';
import { CountryBlackListComponent } from './components/country-black-list/country-black-list.component';
import { AuthGuard } from '../../shared/service/auth.guard';
import { TelegramGameComponent } from './components/telegram-game/telegram-game.component';

const routes: Routes = [
  { path: '', component: GameListComponent },
  {
    path: 'gameList/:providerId', component: GameListComponent, canActivate: [AuthGuard]
  },
  {
    path: 'gamecategory/:catId', component: GamecategoryComponent, canActivate: [AuthGuard]
  },
  {
    path: 'play', component: GameWinLosePageComponent, canActivate: [AuthGuard]
  },
  {
    path: 'wallet', component: GameWalletComponent, canActivate: [AuthGuard]
  },
  {
    path: 'deposit-success/:successCode', component: GameDepositSuccessComponent, canActivate: [AuthGuard]
  },
  {
    path: 'deposit-error/:errorCode', component: GameDepositErrorComponent, canActivate: [AuthGuard]
  },
  {
    path: 'country-black-list', component: CountryBlackListComponent, canActivate: [AuthGuard]
  },
  {
    path: 'telegram_game', component: TelegramGameComponent, canActivate: [AuthGuard]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
