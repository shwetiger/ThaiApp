import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';
import { DtoService } from '../../service/dto.service';
import { FunctService } from '../../service/funct.service';

@Component({
  selector: 'app-forget-login-device-dialog',
  templateUrl: './forget-login-device-dialog.component.html',
  styleUrls: ['./forget-login-device-dialog.component.scss']
})
export class ForgetLoginDeviceDialogComponent implements OnInit  {
  title: string;
  closeBtnName: string; 
  @Input() data: any=[];  

  launchGameResModel: any;
  constructor(
    private toastr: ToastrService,
    private http: HttpClient,
    private dto: DtoService, 
    private route: ActivatedRoute, 
    private funct: FunctService,
    private storage: LocalStorageService,
    public bsModalRef: BsModalRef,
    private translateService: TranslateService,
    private router: Router,) {
   
  } 
  ngOnInit() 
  {     
    this.closeBtnName= this.translateService.instant('cancel');    
  }
  close(){
    this.bsModalRef.hide();
  }
  handleError(error: HttpErrorResponse){
      
   
    if(error.status == 0){
      this.toastr.error("", 'check your internet connection', {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
        return;
    }
    
    if(error.status == 423 || error.status== 417)
    {
      
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
        this.storage.clear('token');
        this.storage.clear('isUserLoggedIn');
         this.router.navigate(['/login'], { replaceUrl: true });
        return;
    }
    if(error.status == 400)
    {
       this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
        return;
    }

    if(error.status == 404)
    {
      //  this.toastr.error("No game list.", 'Invalid!', {
      //   timeOut: 3000,
      //   positionClass: 'toast-top-center',
      //   });
        return;
    }

    if(error.status == 429)
    {
      //  this.toastr.error("Please contact us.", 'Invalid!', {
      //   timeOut: 3000,
      //   positionClass: 'toast-top-center',
      //   });
        return;
    }
    else{
      this.toastr.error("", error.message, {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        return;
    }
  
    }
    otpNextPage(){  
      this.bsModalRef.hide();
      this.storage.store('localForgetLoginDevice', 'loginDevice');
      this.router.navigate(['/login/login-verify-phone'], {state: {actionType: 'NEWDIVICE'},replaceUrl: false} )
    }
}