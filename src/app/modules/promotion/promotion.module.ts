import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { PromotionListComponent } from './components/promotion-list/promotion-list.component';
import { PromotionRoutingModule } from './promotion-routing.module';
import { PromotionDetailComponent } from './components/promotion-detail/promotion-detail.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonService } from 'src/app/shared/service/common.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    PromotionListComponent,
    PromotionDetailComponent,
  ],
  imports: [
    CommonModule,
    PromotionRoutingModule,
    SharedModule
  ],
  providers: [
    CommonService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class PromotionModule { }
