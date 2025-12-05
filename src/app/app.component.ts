import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from './shared/service/navigation.service';
import { SwUpdate } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppVersionService } from './shared/service/app-version.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private updates: SwUpdate,
    public navigation: NavigationService,
    private versionService: AppVersionService,
    private ngZone: NgZone,
    private router: Router) {
    this.updates.available.subscribe(() => {
      this.updates.activateUpdate().then(() => document.location.reload());
    });
  }

  ngOnInit(): void {
    this.versionService.startVersionCheck();
  }

  onActivate() {
    window.scroll(0, 0);
  }


}



