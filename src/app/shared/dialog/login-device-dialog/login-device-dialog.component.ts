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
  selector: 'app-login-device-dialog',
  templateUrl: './login-device-dialog.component.html',
  styleUrls: ['./login-device-dialog.component.scss']
})
export class LoginDeviceDialogComponent implements OnInit  {
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
    private storage: LocalStorageService,public bsModalRef: BsModalRef,private translateService: TranslateService, private router: Router,) {
   
  } 
  ngOnInit() 
  {     
    this.closeBtnName= this.translateService.instant('cancel');
  }
  close(){
    this.bsModalRef.hide();
  }  
  otpNextPage(){  
    this.bsModalRef.hide();
    var phone= this.storage.retrieve('localLoginModel').phone_no;
    this.router.navigate(['/login/login-verify-phone'], {state: {actionType: 'NEWDIVICE', phoneNumber: phone}, replaceUrl: false} )
  }   
}