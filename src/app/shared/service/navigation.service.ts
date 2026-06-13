import { Injectable } from '@angular/core'
import { Location } from '@angular/common'
import { Router, NavigationEnd } from '@angular/router'
import { LocalStorageService } from 'ngx-webstorage'

@Injectable({
  providedIn: 'root',
})

export class NavigationService {
  private history: string[] = []
  constructor(
    private storage: LocalStorageService,
    private router: Router, private location: Location) {
    this.location.isCurrentPathEqualTo
  }

  public startSaveHistory():void{
    this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          var rootUrl=sessionStorage.getItem('rootUrl');
          var balanceRootUrl=sessionStorage.getItem('balanceRootUrl');
          var errorCodeUrl=sessionStorage.getItem('errorCode');
          if((event.urlAfterRedirects == "/threed-bet-confirm" || event.urlAfterRedirects == "/bet-confirm") && (rootUrl == "/twod-bet" || rootUrl == "/threed-bet")){
            this.goBack();
            this.goBack();
            sessionStorage.clear();
            return;
          }
          if(event.urlAfterRedirects == "/login" && rootUrl == "waiting-one"){
            this.goBack();
            sessionStorage.clear();
            return;
          }
          if(event.urlAfterRedirects == "/home" && rootUrl == "waiting-one"){
            this.goBack();
            this.goBack();
            sessionStorage.clear();
            return;
          }
          if(event.urlAfterRedirects == "/initial-forgot-password" && rootUrl == "waiting-two"){
            this.goBack();
            this.goBack();
            sessionStorage.clear();
            return;
          }
          if(event.urlAfterRedirects == "/home" && rootUrl == "waiting-two"){
            this.goBack();
            this.goBack();
            this.goBack();
            sessionStorage.clear();
            return;
          }
           if(event.urlAfterRedirects == "/initial-forgot-password" && rootUrl == "service-phone"){
            this.goBack();
            this.goBack();
            return;
          }
          if((event.urlAfterRedirects == "/home" || event.urlAfterRedirects == "/me-page") && rootUrl == "service-phone"){
            this.router.navigate(["/service-phone"],{replaceUrl: true});
            sessionStorage.clear();

            return;
          }
          if(event.urlAfterRedirects == "/initial-forgot-password" && rootUrl !=null){
            this.goBack();
            sessionStorage.clear();

            return;
          }

          if((event.urlAfterRedirects == "/register") && rootUrl =="/register" ){
            this.goBack();
            this.goBack();
            return;
          }
          if((event.urlAfterRedirects == "/login") && rootUrl =="/register" ){
            this.router.navigate(["/home"],{ replaceUrl: true });
            sessionStorage.clear();
            return;
          }
          if((event.urlAfterRedirects == "/withdraw/add") && rootUrl !=null ){
            this.goBack();
            this.goBack();
            sessionStorage.clear();
            return;
          }
          if((event.urlAfterRedirects == "/withdraw") && rootUrl !=null ){
            this.router.navigate([rootUrl],{replaceUrl: true});
            sessionStorage.clear();
            return;
          }

          if(event.urlAfterRedirects == "/top-up" && balanceRootUrl !=null ){
            this.goBack();
            sessionStorage.clear();
            return;
          }
          if(event.urlAfterRedirects == "/home" && rootUrl == "forget-noti"){
            this.router.navigate(["/login"],{ replaceUrl: false });
            return;
          }
          if(event.urlAfterRedirects == "/login" && rootUrl == "forget-noti"){
            this.router.navigate(["/initial-forgot-password"],{ replaceUrl: false });
            sessionStorage.clear();
            return;
          }

          if(event.urlAfterRedirects == "/login-verify-phone" && errorCodeUrl == "304"){
            this.goBack();
            return;
          }
          if(rootUrl == null || balanceRootUrl == null){
            this.history.push(event.urlAfterRedirects);
          }
        }
      })
  }

  public getHistory(): string[] {
    return this.history;
  }

  public goBack(): void {
    this.history.pop();
    if (this.history.length > 0) {
      this.location.back()
    } else {
      this.router.navigateByUrl("/");
    }
  }

  public getPreviousUrl(): string {
    if (this.history.length > 0) {
        return this.history[this.history.length - 2];
    }
    return '';
  }
}