import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AppVersionService {
  private versionUrl = 'assets/version.json';

  // app version observable - 用于UI显示版本号
  public currentVersion$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    // 启动时读取一次版本文件，用于UI显示
    this.loadVersion();
  }

  /**
   * 加载版本信息（仅用于显示，不触发自动刷新）
   * 版本更新检测由 Service Worker 负责
   */
  private loadVersion(): void {
    this.http.get<{ version: string }>(
      this.versionUrl
    ).pipe(
      catchError(err => {
        console.error('Failed to load version:', err);
        return of({ version: null });
      })
    ).subscribe((data) => {
      if (data.version) {
        this.currentVersion$.next(data.version);
      }
    });
  }
}
