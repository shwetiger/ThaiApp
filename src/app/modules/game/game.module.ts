import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { GameListComponent } from './components/game-list/game-list.component';
import { GameRoutingModule } from './game-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonService } from 'src/app/shared/service/common.service';
import { GamecategoryComponent } from './components/gamecategory/gamecategory.component';
import { FormsModule } from '@angular/forms';
import { GameWinLosePageComponent } from './components/game-win-lose-page/game-win-lose-page.component';
import { GameWalletComponent } from './components/game-wallet/game-wallet.component';
import { GameDepositSuccessComponent } from './components/game-deposit-success/game-deposit-success.component';
import { GameDepositErrorComponent } from './components/game-deposit-error/game-deposit-error.component';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { CountryBlackListComponent } from './components/country-black-list/country-black-list.component';

@NgModule({
  declarations: [
    GameListComponent,
    GamecategoryComponent,
    GameWinLosePageComponent,
    GameWalletComponent,
    GameDepositSuccessComponent,
    GameDepositErrorComponent,
    CountryBlackListComponent,
  ],

  imports: [
    CommonModule,
    GameRoutingModule,
    SharedModule
  ],
  providers: [
    BsModalService,
    CommonService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GameModule { }
