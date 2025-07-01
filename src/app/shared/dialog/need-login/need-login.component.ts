import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions } from 'ngx-modal-dialog';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';


@Component({
  selector: 'app-need-login',
  templateUrl: './need-login.component.html',
  styleUrls: ['./need-login.component.scss']
})
export class NeedLoginComponent implements IModalDialog {
  private internalActionButtons = []; 
  //topup: any;
  constructor(private translateService: TranslateService,private storage: LocalStorageService,private router: Router,){

  }

  dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<string>>) {
    options.actionButtons = this.internalActionButtons;
    //this.topup=this.storage.retrieve('localTopupAlertData');
    
    this.internalActionButtons.push({
      text: this.translateService.instant('loginNow'),
      buttonClass: 'btn text-danger',
      onAction: () => this.loginPage()
    });

    this.internalActionButtons.push({
      text: this.translateService.instant('cancel'),
      buttonClass: 'btn',    
      onAction: () => true   
    });
  }
  loginPage(){  
    this.router.navigate(['/login'])
  }

}