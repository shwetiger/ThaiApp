import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { TwodRoutingModule } from './twod-routing.module';
import { TwodInitialPageComponent } from './components/twod-initial-page/twod-initial-page.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonService } from 'src/app/shared/service/common.service';
import { TwodBetComponent } from './components/twod-bet/twod-bet.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { TwodDreamBookComponent } from './components/twod-dream-book/twod-dream-book.component';
import { FormsModule } from '@angular/forms';
import { TwodBetConfirmPageComponent } from './components/twod-bet-confirm-page/twod-bet-confirm-page.component';
import { TwodBetFinalComponentPageComponent } from './components/twod-bet-final-component-page/twod-bet-final-component-page.component';
import { BetResultSuccessUnsuccessPageComponent } from '../pages/bet-result-success-unsuccess-page/bet-result-success-unsuccess-page.component';
import { BetHistoryPageComponent } from '../pages/bet-history-page/bet-history-page.component';
import { TwoDThreeDWinnerComponent } from '../pages/two-dthree-dwinner/two-dthree-dwinner.component';
import { HolidayListPageComponent } from './components/holiday-list-page/holiday-list-page.component';
import { BetHistoryDetailPageComponent } from '../pages/bet-history-detail-page/bet-history-detail-page.component';
import { TwodHistoryComponent } from './components/twod-history/twod-history.component';

@NgModule({
  declarations: [
    TwodInitialPageComponent,
    TwodBetComponent,
    TwodDreamBookComponent,
    TwodBetConfirmPageComponent,
    TwodBetFinalComponentPageComponent,
    BetResultSuccessUnsuccessPageComponent,
    BetHistoryPageComponent,
    BetHistoryDetailPageComponent,
    TwoDThreeDWinnerComponent,
    HolidayListPageComponent,
    TwodHistoryComponent
  ],
  imports: [
    CommonModule,
    TwodRoutingModule,
    SharedModule
  ],
  providers: [
    BsModalService,
    CommonService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})

export class TwodModule { }
