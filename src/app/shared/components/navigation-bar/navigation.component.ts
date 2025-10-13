import { Component, OnInit,Input } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { DtoService } from '../../service/dto.service';
import { UtilService } from '../../service/util.service';
import { FunctService } from '../../service/funct.service';
import { AppVersionService } from '../../service/app-version.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})

export class AppNavigationBarComponent implements OnInit {
   version: string | null = null;
  promotionCount : any;
  promotionList : any;
  token : any;
  routerName: any;
  isUserLoggedIn: any;
  deviceId: any;
  deviceRouterName: any;
  @Input() routeUrl;
  constructor(
    private toastr: ToastrService, 
    private spinner: NgxSpinnerService,
    private dto: DtoService, 
    private http: HttpClient, 
    private util: UtilService, 
    private router: Router, 
    private storage: LocalStorageService,
    private funct: FunctService,
    private versionService:AppVersionService) 
    {
    
    }
  ngOnInit(): void 
  {
    this.deviceId=this.storage.retrieve('localDeviceId');
    this.isUserLoggedIn= this.storage.retrieve('isUserLoggedIn');
    this.routerName=this.router.url;
    this.promotionCount = this.storage.retrieve('localpromotionCount');
      this.versionService.currentVersion$.subscribe(v => {
      this.version = v;
    });
    // this.getAllPromotions();
    this.openPage(this.routeUrl)
  }

  openPage(routeUrl:string) {  
    if(routeUrl =='/home')
    {
      this.deviceId=this.storage.retrieve('localDeviceId'); 
      if(this.deviceId != null){      
        this.router.navigate([routeUrl,this.deviceId],{replaceUrl: true});       
        return;
      }     
    }

    this.router.navigate([routeUrl],{replaceUrl: true});   
    
  }

}
