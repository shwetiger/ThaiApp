import { LocationStrategy } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { NavigationService } from '../../service/navigation.service';
import { Location } from '@angular/common';
@Component({
  selector: 'appbar',
  templateUrl: './appbar.component.html',
  styleUrls: ['./appbar.component.scss']
})
export class AppbarComponent {
  @Output() myEvent = new EventEmitter();
  @Input() rootLevel=1;
  @Input() parentLink:string;
  @Input() backUrl?: string;  
  isClose = false;
  private history: string[] = []
  threedsuccessback:boolean=false;
  // @Input() props: { rootLevel: number; parentLink: string; };
  constructor(
    private _location: Location,
    public navigation: NavigationService,
    private Location: LocationStrategy,
    private router: Router,
    private storage: LocalStorageService,) {

  }

  ngOnInit(): void {
     this.isClose = true;
  }

  refreshPage(): void{

    this.ngOnInit();
    this.myEvent.emit();

  }
  // goBack(){
  //   this._location.back();
  // }

  goBack() {
    if (this.backUrl) {
      this.router.navigate([this.backUrl]);
    } else if (window.history.length > 1) {
      this._location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }


  // public getHistory(): string[] {
  //   return this.history;
  // }
  // public goBack(): void {

  //   this.history.pop();
  //   if (this.history.length > 0) {
  //     this._location.back()
  //   } else {
  //     this.router.navigateByUrl("/");
  //   }
  // }

}