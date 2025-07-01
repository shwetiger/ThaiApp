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


const routes: Routes = [
  { path: '', component: WalletPageComponent },  
  {
    path: 'top-up', component: TopUpComponent
  },    
  {
    path: 'top-up-submit', component: TopUpSubmitComponent
  },
  {
    path: 'transcation-waiting-page', component: TopupTranscationWaitingPageComponent
  },
  {
    path: 'tutorial-video', component: TutorialVideoPageComponent
  }, 
  {
    path: 'withdraw', component: WithdrawComponent
  },
  {
    path: 'withdraw/:isFromAdd', component: WithdrawComponent
  },
  {
    path: 'withdraw-success', component: WithdrawPendingComponent
  },
  {
    path: 'withdraw-change-acc', component: WithdrawChangeAccountComponent
  },
  {
    path: 'game-wallet', component: GameWalletComponent
  },
  {
    path: 'history', component: TransactionHistoryComponent
  },
  {
    path: 'game-transaction-history', component: GameTransactionHistoryComponent
  },
  {
    path: 'transaction-history-detail', component: TransactionHistoryDetailComponent
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletRoutingModule { }
