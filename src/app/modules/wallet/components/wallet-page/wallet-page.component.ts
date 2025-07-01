import { LocationStrategy } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { WalletAccountPageComponent } from 'src/app/shared/components/wallet-account-page/wallet-account-page.component';

@Component({
  selector: 'app-wallet-page',
  templateUrl: './wallet-page.component.html',
  styleUrls: ['./wallet-page.component.scss']
})
export class WalletPageComponent implements OnInit {
@ViewChild(WalletAccountPageComponent) child:WalletAccountPageComponent;

spinnerName : string;
  showBackButton: any;
  parentLink:any;
  routeUrl='/wallet';
  constructor(private Location: LocationStrategy,  private route: ActivatedRoute,private spinner: NgxSpinnerService,) {
    this.spinnerName = "refreshLoading";
    this.parentLink=history.state.parentLink;
    this.showBackButton=this.route.snapshot.paramMap.get("showBackButton");
    
   }

  ngOnInit(): void {
    
  }
  
  refreshPage()
  {
    this.spinner.show(this.spinnerName);
    this.ngOnInit();
    this.child.getUserProfile();
    setTimeout(() => {
      this.spinner.hide(this.spinnerName);
    }, 1000);
    //window.location.reload();
  }
}
