import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicePhoneRoutingModule } from './service-phone-routing.module';
import { ServiceComponent } from './components/service/service.component';
import { appInitializerFactory, SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonService } from 'src/app/shared/service/common.service';


@NgModule({
  declarations: [ServiceComponent],
  imports: [
    CommonModule,
    ServicePhoneRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: (http:HttpClient) => { return new TranslateHttpLoader(http, './assets/i18n/', '.json');},
          deps: [HttpClient]         
      }
    }),
  ],
  providers: [
    CommonService,   
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true
    }
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ServicePhoneModule { }
