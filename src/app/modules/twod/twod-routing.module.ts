import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TwodInitialPageComponent } from './components/twod-initial-page/twod-initial-page.component';
import { TwodBetComponent } from './components/twod-bet/twod-bet.component';
import { TwodDreamBookComponent } from './components/twod-dream-book/twod-dream-book.component';
import { TwodBetConfirmPageComponent } from './components/twod-bet-confirm-page/twod-bet-confirm-page.component';
import { TwodBetFinalComponentPageComponent } from './components/twod-bet-final-component-page/twod-bet-final-component-page.component';
import { BetResultSuccessUnsuccessPageComponent } from '../pages/bet-result-success-unsuccess-page/bet-result-success-unsuccess-page.component';
import { BetHistoryPageComponent } from '../pages/bet-history-page/bet-history-page.component';
import { TwoDThreeDWinnerComponent } from '../pages/two-dthree-dwinner/two-dthree-dwinner.component';
import { HolidayListPageComponent } from './components/holiday-list-page/holiday-list-page.component';
import { BetHistoryDetailPageComponent } from '../pages/bet-history-detail-page/bet-history-detail-page.component';
import { TwodHistoryComponent } from './components/twod-history/twod-history.component';

const routes: Routes = [
  {
    path: '' , component: TwodInitialPageComponent
  },
  {      
    path: 'bet', component: TwodBetComponent
  },
  {
    path: 'dream-book', component: TwodDreamBookComponent
  },
  {
    path: 'bet-confirm', component: TwodBetConfirmPageComponent
  },
  {
    path: 'bet-final-confirm', component: TwodBetFinalComponentPageComponent
  },
  {
    path: 'bet-success-unsuccess-page', component: BetResultSuccessUnsuccessPageComponent
  },
  {
    path: 'bet-history/:betType', component: BetHistoryPageComponent
  },
  {
    path: 'bet-history-detail/:betType', component: BetHistoryDetailPageComponent
  },
  {
    path: 'winner-page/:type', component: TwoDThreeDWinnerComponent
  },
  {
    path: 'holiday', component: HolidayListPageComponent
  },
  {
    path: 'history/:section/:showdateHistory', component: TwodHistoryComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TwodRoutingModule { }
