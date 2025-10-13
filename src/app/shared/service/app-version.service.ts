import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer, of } from 'rxjs';
import { switchMap,catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AppVersionService {
  private versionUrl = 'assets/version.json';
  private checkInterval = 60 * 1000; // 1 minute

  // app version observable
  public currentVersion$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

startVersionCheck() {
  timer(0, this.checkInterval)
    .pipe(
      switchMap(() =>
        this.http.get<{ version: string }>(
          this.versionUrl + '?t=' + new Date().getTime()
        ).pipe(
          catchError(err => {
            console.error('Version check failed inside pipe', err);
            return of({ version: null }); // fallback to keep the stream alive
          })
        )
      )
    )
    .subscribe((data) => {
      if (data.version) {
       // console.log("Version>>>>", data.version);
        this.currentVersion$.next(data.version);
        this.handleVersion(data.version);
      } else {
        // Optionally: handle case where version is null
      }
    });
}

  private handleVersion(remoteVersion: string) {
    const localVersion = localStorage.getItem('app_version');

    if (!localVersion) {
      localStorage.setItem('app_version', remoteVersion);
      return;
    }

    if (localVersion !== remoteVersion) {
      console.warn('New version detected! Refreshing app...');
      localStorage.setItem('app_version', remoteVersion);
      window.location.reload();
    }
  }
}
