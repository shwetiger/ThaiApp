import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WalletPageComponent } from './components/wallet-page/wallet-page.component';
import { TopUpComponent } from './components/top-up/top-up.component';
import { TopUpSubmitComponent } from './components/top-up-submit/top-up-submit.component';
import { TopupTranscationWaitingPageComponent } from './components/topup-transcation-waiting-page/topup-transcation-waiting-page.component';
import { TutorialVideoPageComponent } from './components/tutorial-video-page/tutorial-video-page.component';
import { WithdrawComponent } from './components/withdraw/withdraw.component';
import { WithdrawPendingComponent } from './components/withdraw-pending/withdraw-pending.component';
import { WithdrawChangeAccountComponent } from './components/withdraw-change-account/withdraw-change-account.component';
import { GameWalletComponent } from './components/game-wallet/game-wallet.component';
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history.component';
import { GameTransactionHistoryComponent } from './components/game-transaction-history/game-transaction-history.component';
import { TransactionHistoryDetailComponent } from './components/transaction-history-detail/transaction-history-detail.component';
import { AuthGuard } from '../../shared/service/auth.guard';

const routes: Routes = [
  { path: '', component: WalletPageComponent },
  {
    path: 'top-up', component: TopUpComponent,canActivate: [AuthGuard]
  },
  {
    path: 'top-up-submit', component: TopUpSubmitComponent,canActivate: [AuthGuard]
  },
  {
    path: 'transcation-waiting-page', component: TopupTranscationWaitingPageComponent,canActivate: [AuthGuard]
  },
  {
    path: 'tutorial-video', component: TutorialVideoPageComponent,canActivate: [AuthGuard]
  },
  {
    path: 'withdraw', component: WithdrawComponent,canActivate: [AuthGuard]
  },
  {
    path: 'withdraw/:isFromAdd', component: WithdrawComponent,canActivate: [AuthGuard]
  },
  {
    path: 'withdraw-success', component: WithdrawPendingComponent,canActivate: [AuthGuard]
  },
  {
    path: 'withdraw-change-acc', component: WithdrawChangeAccountComponent,canActivate: [AuthGuard]
  },
  {
    path: 'game-wallet', component: GameWalletComponent,canActivate: [AuthGuard]
  },
  {
    path: 'history', component: TransactionHistoryComponent,canActivate: [AuthGuard]
  },
  {
    path: 'game-transaction-history', component: GameTransactionHistoryComponent,canActivate: [AuthGuard]
  },
  {
    path: 'transaction-history-detail', component: TransactionHistoryDetailComponent,canActivate: [AuthGuard]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletRoutingModule { }
