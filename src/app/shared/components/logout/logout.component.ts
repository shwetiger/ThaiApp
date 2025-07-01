import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UtilService } from '../../service/util.service';
import { DtoService } from '../../service/dto.service';
import { FunctService } from '../../service/funct.service';
@Component({
  selector: 'logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  deviceId: any;
  logout: BsModalRef;
  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService, 
    private spinner: NgxSpinnerService,
    private dto: DtoService, 
    private http: HttpClient,
    private util: UtilService, 
    private router: Router, 
    private storage: LocalStorageService, 
    private funct: FunctService) {
    
   }

  ngOnInit(): void {
    this.deviceId=this.storage.retrieve('localDeviceId');
  }
  logoutModel(logout: TemplateRef<any>){
    this.logout=this.modalService.show(logout,
      {
        class: "logout-modal",
        ignoreBackdropClick: true, 
        keyboard: false
      });       
  }
  HidelogoutModel(){
    this.logout.hide();
  }
  
  goLogOut()
  {   
           this.logout.hide();
            this.util.isLogged = false;
            this.dto.token = ""; 
            this.storage.store('token', this.dto.token);
            this.storage.store('isUserLoggedIn', this.util.isLogged);
            if(this.deviceId != null){
              this.router.navigate(['/home',this.deviceId],{replaceUrl: false});
              return;
            }
            this.router.navigate(['/home'],{replaceUrl: false});
           
  }

}
