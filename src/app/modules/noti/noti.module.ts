import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { NotiRoutingModule } from './noti-routing.module';
import { NotiListComponent } from './components/noti-list/noti-list.component';
import { NotiDetailComponent } from './components/noti-detail/noti-detail.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonService } from 'src/app/shared/service/common.service';

@NgModule({
  declarations: [
    NotiListComponent, 
    NotiDetailComponent
  ],
  imports: [
    CommonModule,
    NotiRoutingModule,
    SharedModule
  ],
  providers: [
    CommonService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class NotiModule { }
