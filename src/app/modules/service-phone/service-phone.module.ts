import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicePhoneRoutingModule } from './service-phone-routing.module';
import { ServiceComponent } from './components/service/service.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonService } from 'src/app/shared/service/common.service';

@NgModule({
  declarations: [ServiceComponent],
  imports: [
    CommonModule,
    ServicePhoneRoutingModule,
    SharedModule
  ],
  providers: [
    CommonService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ServicePhoneModule { }
