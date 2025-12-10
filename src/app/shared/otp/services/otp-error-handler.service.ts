import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';

/**
 * OTP 错误处理服务（独立）
 * 
 * 职责：
 * - 专门处理 OTP 相关的所有 HTTP 错误响应
 * - 解析错误并抛出包含翻译后消息的异常
 * - 组件中只需显示 error.message，无需复杂判断
 * 
 * 支持的错误格式：
 * - 格式5-24：所有错误响应格式（HTTP 400/403/404/406/423）
 */
@Injectable({
  providedIn: 'root'
})
export class OtpErrorHandlerService {
  constructor(
    private router: Router,
    private translate: TranslateService,
    private storage: LocalStorageService
  ) {}

  /**
   * 处理 OTP 相关的 HTTP 错误
   * @param context 上下文信息（用于区分不同场景）
   * @param error HTTP 错误响应
   * @returns Observable that throws the error（包含已翻译的错误消息）
   */
  handleError(context: string = '', error: HttpErrorResponse): Observable<never> {
    console.error('OTP Error:', {
      status: error.status,
      context,
      error: error.error,
      message: error.message
    });

    // 网络错误
    if (error.status === 0) {
      return throwError(new Error(this.translate.instant('check your internet connection') || 'Network error'));
    }

    // 403 错误：频率限制相关
    if (error.status === 403) {
      return this.handle403Forbidden(error);
    }

    // 404 错误：资源不存在
    if (error.status === 404) {
      return this.handle404NotFound(error);
    }

    // 406 错误：不可接受
    if (error.status === 406) {
      return this.handle406NotAcceptable(error);
    }

    // 423 错误：认证过期
    if (error.status === 423) {
      return this.handle423Locked(error);
    }

    // 400 错误：错误请求
    if (error.status === 400) {
      return this.handle400BadRequest(error);
    }

    // 其他错误：使用服务器返回的消息或默认消息
    const errorMessage = error.error?.Message || error.error?.message || error.error || error.message;
    return throwError(new Error(errorMessage || 'Unknown OTP error'));
  }

  /**
   * 处理 403 禁止访问错误
   */
  private handle403Forbidden(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.Message || error.error?.message;

    // so_close: 请求太频繁
    if (errorMessage === 'so_close') {
      return throwError(new Error(this.translate.instant('otp-request-time')));
    }

    // over_limited.: 超过限制
    if (errorMessage === 'over_limited.') {
      return throwError(new Error(this.translate.instant('otp-request-time-ten')));
    }

    // temporary_blocked: 临时封禁
    if (errorMessage === 'temporary_blocked') {
      return throwError(new Error(this.translate.instant('tem_block')));
    }

    // 其他 403 错误
    return throwError(new Error(errorMessage || this.translate.instant('Forbidden') || 'Forbidden'));
  }

  /**
   * 处理 404 未找到错误
   */
  private handle404NotFound(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.Message || error.error?.message;

    // 需要先添加邮箱
    if (errorMessage === 'Please add user email first!') {
      this.router.navigate(['/me-page/email-address']);
      console.warn('navigate to email address page');
      return throwError(new Error(this.translate.instant('emailRequired') || errorMessage));
    }

    // 其他 404 错误
    return throwError(new Error(errorMessage || this.translate.instant('Not found') || 'Not found'));
  }

  /**
   * 处理 406 不可接受错误
   */
  private handle406NotAcceptable(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.Message || error.error?.message;

    // 手机号已被使用
    if (errorMessage === "User's phone already exists!" || errorMessage === 'phone_already_used') {
      return throwError(new Error(this.translate.instant('phoneNumberTaken')));
    }

    // 其他 406 错误
    return throwError(new Error(errorMessage || this.translate.instant('Not acceptable') || 'Not acceptable'));
  }

  /**
   * 处理 423 锁定错误（认证过期）
   */
  private handle423Locked(error: HttpErrorResponse): Observable<never> {
    // 清除登录状态
    this.storage.clear('token');
    this.storage.clear('isUserLoggedIn');
    this.router.navigate(['/login'], { replaceUrl: true });

    // 返回已翻译的错误消息
    return throwError(new Error(this.translate.instant('youNeedLogin')));
  }

  /**
   * 处理 400 错误请求
   */
  private handle400BadRequest(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.Message || error.error?.message;

    // 如果错误消息是 "Invalid Otp"，翻译为无效 OTP 码
    if (errorMessage === 'Invalid Otp') {
      return throwError(new Error(this.translate.instant('invalid-otp-code')));
    }

    // 其他 400 错误
    return throwError(new Error(errorMessage || this.translate.instant('Bad request') || 'Bad request'));
  }
}
