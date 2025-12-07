import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { DownloadPageRoutingModule } from './download-page-routing.module';
import { DownloadPageComponent } from './components/download-page/download-page.component';
import { IosDownloadPageComponent } from './components/ios-download-page/ios-download-page.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonService } from 'src/app/shared/service/common.service';

@NgModule({
  declarations: [
    DownloadPageComponent,
    IosDownloadPageComponent,
  ],
  imports: [
    CommonModule,
    DownloadPageRoutingModule,
    SharedModule
  ],
  providers: [
    CommonService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class DownloadPageModule { }
