import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions } from 'ngx-modal-dialog';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { NavigationService } from '../../service/navigation.service';


@Component({
  selector: 'app-topup-dialog',
  templateUrl: './topup-dialog.component.html',
  styleUrls: ['./topup-dialog.component.scss']
})
export class TopupDialogComponent implements IModalDialog {
  private internalActionButtons = []; 
  topup: any;
  constructor(
    public navigation: NavigationService,
    private translateService: TranslateService,private storage: LocalStorageService,private router: Router,){

  }

  dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<string>>) {
    options.actionButtons = this.internalActionButtons;
    this.topup=this.storage.retrieve('localTopupAlertData');
    
    this.internalActionButtons.push({
      text: this.translateService.instant('login_no'),
      buttonClass: 'btn btn-danger confirm-btn',
      onAction: () => this.nextPage()
    });

    this.internalActionButtons.push({
      text: this.translateService.instant('login_yes'),
      buttonClass: 'btn btn-success confirm-btn',    
      onAction: () => true   
    });
  }
  nextPage(){  
    this.navigation.goBack();    
  }

}