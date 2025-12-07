import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { OtpService } from './otp-service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { OtpStorageKeys } from '../models/otp-storage-keys';
import { OTP_ROUTES } from '../models/otp.constants';

/**
 * OTP 认证服务
 * 职责：
 * - 处理自动登录逻辑
 * - 管理登录后的导航和历史记录
 * - 防止浏览器后退（popstate 监听器）
 */
@Injectable()
export class OtpAuthService implements OnDestroy {
  // 事件监听器引用（用于清理）
  private popstateListeners: (() => void)[] = [];
  
  constructor(
    private otpService: OtpService,
    private storage: LocalStorageService,
    private router: Router,
    private dto: DtoService,
    private util: UtilService
  ) {}
  
  /**
   * 执行自动登录
   * @returns Observable<boolean> 登录是否成功
   */
  performAutoLogin(): Observable<boolean> {
    const loginModel = this.storage.retrieve(OtpStorageKeys.LOGIN_MODEL);
    
    if (!loginModel) {
      return new Observable(subscriber => {
        subscriber.error(new Error('Login model not found'));
      });
    }
    
    return this.otpService.autoLogin(loginModel)
      .pipe(
        tap(result => {
          this.dto.Response = result;
          
          if (result.status !== 'Error' && result.token) {
            // 更新登录状态
            this.util.isLogged = true;
            this.dto.token = 'Bearer ' + result.token;
            this.storage.store('token', this.dto.token);  // 注：未在 OtpStorageKeys 中定义
            this.storage.store('isUserLoggedIn', this.util.isLogged);  // 注：未在 OtpStorageKeys 中定义
            this.storage.clear(OtpStorageKeys.LOGIN_MODEL);
            
            // 导航到首页并防止后退
            this.navigateToHomeWithBackPrevention();
          }
        }),
        map(result => {
          if (result.status === 'Error' || !result.token) {
            throw new Error(result.message || 'Auto login failed');
          }
          return true;
        })
      );
  }
  
  /**
   * 导航到首页并防止浏览器后退
   */
  private navigateToHomeWithBackPrevention(): void {
    this.router.navigate([OTP_ROUTES.HOME], { replaceUrl: true }).then(() => {
      history.replaceState(null, '', location.href);
      const listener = () => {
        history.replaceState(null, '', location.href);
      };
      this.addPopstateListener(listener);
    });
  }
  
  /**
   * 导航到指定路径并防止浏览器后退
   * @param path 导航路径
   */
  navigateWithBackPrevention(path: string): void {
    this.router.navigate([path], { replaceUrl: true }).then(() => {
      history.pushState(null, '', location.href);
      const listener = () => {
        history.pushState(null, '', location.href);
      };
      this.addPopstateListener(listener);
    });
  }
  
  /**
   * 添加 popstate 事件监听器并自动加入清理列表
   * @param listener 监听器函数
   */
  private addPopstateListener(listener: () => void): void {
    this.popstateListeners.push(listener);
    window.addEventListener('popstate', listener);
  }
  
  /**
   * 清理事件监听器
   */
  ngOnDestroy(): void {
    this.popstateListeners.forEach(listener => {
      window.removeEventListener('popstate', listener);
    });
    this.popstateListeners = [];
  }
}

