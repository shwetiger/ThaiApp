import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThreedInitialPageComponent } from './components/threed-initial-page/threed-initial-page.component';
import { ThreedBetComponent } from './components/threed-bet/threed-bet.component';
import { ThreedchancePageComponent } from './components/threedchance-page/threedchance-page.component';
import { Quickselect3dComponent } from './components/quickselect3d/quickselect3d.component';
import { DreamBookPageComponent } from './components/dream-book-page/dream-book-page.component';
import { ThreedBetFinalConfirmPageComponent } from './components/threed-bet-final-confirm-page/threed-bet-final-confirm-page.component';
import { ThreedBetConfirmPageComponent } from './components/threed-bet-confirm-page/threed-bet-confirm-page.component';
import { BetResultSuccessUnsuccessPageComponent } from '../pages/bet-result-success-unsuccess-page/bet-result-success-unsuccess-page.component';
import { BetHistoryPageComponent } from '../pages/bet-history-page/bet-history-page.component';
import { BetHistoryDetailPageComponent } from '../pages/bet-history-detail-page/bet-history-detail-page.component';
import { TwoDThreeDWinnerComponent } from '../pages/two-dthree-dwinner/two-dthree-dwinner.component';
const routes: Routes = [
  {
    path: '' , component: ThreedInitialPageComponent
  },
  {      
    path: 'bet', component: ThreedBetComponent
  },
  {
    path: 'chancepage',component:ThreedchancePageComponent
  },
  {
    path: 'quick-select3d',component: Quickselect3dComponent
  }, 
  {
    path : 'dream-book', component: DreamBookPageComponent
  },
  {
    path: 'bet-confirm', component: ThreedBetConfirmPageComponent
  },
  {
    path: 'final-bet-confirm', component: ThreedBetFinalConfirmPageComponent
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
];
 
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThreedRoutingModule { }
