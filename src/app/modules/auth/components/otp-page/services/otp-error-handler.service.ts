import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

/**
 * OTP 错误处理服务（独立）
 * 
 * 职责：
 * - 专门处理 OTP 相关的所有 HTTP 错误响应
 * - 解析错误并抛出包含翻译后消息的异常
 * - UI 提示由 Facade 层统一处理
 * 
 * 支持的错误格式：
 * - 格式5-24：所有错误响应格式（HTTP 400/403/404/406）
 */
@Injectable({
  providedIn: 'root'
})
export class OtpErrorHandlerService {
  constructor(
    private translate: TranslateService,
    private router: Router,
    private storage: LocalStorageService
  ) {}

  /**
   * 处理 OTP 相关的 HTTP 错误
   * @param context 上下文信息（用于区分不同场景）
   * @param error HTTP 错误响应
   * @returns Observable that throws the error
   */
  handleError(context: string = '', error: HttpErrorResponse): Observable<never> {
    console.error('OTP Error:', {
      status: error.status,
      context,
      error: error.error,
      message: error.message
    });

    // ========== HTTP 400 - 无效输入 ==========
    if (error.status === 400) {
      return this.handle400BadRequest(error);
    }

    // ========== HTTP 401 - 验证失败 ==========
    if (error.status === 401) {
      return this.handle401Unauthorized(error);
    }

    // ========== HTTP 403 - 禁止访问 ==========
    if (error.status === 403) {
      return this.handle403Forbidden(error);
    }

    // ========== HTTP 404 - 未找到 ==========
    if (error.status === 404) {
      return this.handle404NotFound(error);
    }

    // ========== HTTP 406 - 不可接受 ==========
    if (error.status === 406) {
      return this.handle406NotAcceptable(error);
    }

    // ========== HTTP 423/417 - 需要重新登录 ==========
    if (error.status === 423 || error.status === 417) {
      return this.handleAuthExpired();
    }

    // ========== HTTP 0 - 网络错误 ==========
    if (error.status === 0) {
      return this.handleNetworkError();
    }

    // ========== 默认错误处理 ==========
    return this.handleUnknownError(error);
  }

  // ========== 格式5-7: HTTP 400 - 无效输入 ==========
  /**
   * 处理 400 错误
   * 格式5: 手机号无效
   * 格式6: 邮箱无效
   * 格式7: 异常错误（字符串）
   */
  private handle400BadRequest(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.Message || error.error;

    // 格式5: 手机号无效
    if (errorMessage === 'please enter a valid phone number') {
      return throwError(() => new Error(this.translate.instant('invalid-phone-number')));
    }

    // 格式6: 邮箱无效
    if (errorMessage === 'please enter a valid email') {
      return throwError(() => new Error(this.translate.instant('invalid-email-address')));
    }

    // 格式7: 异常错误（字符串响应）
    if (typeof error.error === 'string') {
      return throwError(() => new Error(error.error));
    }

    // 其他400错误
    return throwError(() => new Error(this.translate.instant('invalid-input')));
  }

  // ========== HTTP 401 - 验证失败 ==========
  /**
   * 处理 401 验证错误
   * OTP 验证失败的各种情况
   */
  private handle401Unauthorized(error: HttpErrorResponse): Observable<never> {
    // 所有 401 错误统一返回无效 OTP 提示
    return throwError(() => new Error(this.translate.instant('invalid-otp')));
  }

  // ========== 格式8-11: HTTP 403 - 禁止访问 ==========
  /**
   * 处理 403 禁止访问错误
   * 格式8: 发送过于频繁（so_close）
   * 格式9: 超过限制次数（over_limited）
   * 格式10: 临时被阻止（temporary_blocked）
   * 格式11: 其他错误
   */
  private handle403Forbidden(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || error.error?.Message;

    // 格式8: 发送过于频繁
    if (errorMessage === 'so_close') {
      return throwError(() => new Error(this.translate.instant('otp-request-time')));
    }

    // 格式9: 超过限制次数
    if (errorMessage === 'over_limited.') {
      return throwError(() => new Error(this.translate.instant('otp-request-time-ten')));
    }

    // 格式10: 临时被阻止
    if (errorMessage === 'temporary_blocked') {
      return throwError(() => new Error(this.translate.instant('tem_block')));
    }

    // 邮箱已被使用（特殊情况）
    if (errorMessage === 'This email address is already used by another user.') {
      return throwError(() => new Error(this.translate.instant('email_already_used')));
    }

    // 格式11: 其他 403 错误
    const message = errorMessage || this.translate.instant('access-forbidden');
    return throwError(() => new Error(message));
  }

  // ========== 格式17-22: HTTP 404 - 未找到 ==========
  /**
   * 处理 404 未找到错误
   * 格式17: 用户不存在（Please register!）
   * 格式18: 用户不存在（User does not exist!）
   * 格式19: 用户不存在（User not found）
   * 格式20: Viber不支持国际号码
   * 格式21: 用户未添加邮箱
   * 格式22: 异常错误
   */
  private handle404NotFound(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || error.error?.Message;

    // 格式17: 用户不存在（忘记密码场景）
    if (errorMessage === 'Please register!') {
      return throwError(() => new Error(this.translate.instant('user-not-registered')));
    }

    // 格式18: 用户不存在
    if (errorMessage === 'User does not exist!') {
      return throwError(() => new Error(this.translate.instant('user-not-exist')));
    }

    // 格式19: 用户未找到
    if (errorMessage === 'User not found') {
      return throwError(() => new Error(this.translate.instant('user-not-found')));
    }

    // 格式20: Viber 不支持国际号码
    if (errorMessage === 'viber verification code currently does not support international numbers!') {
      return throwError(() => new Error(this.translate.instant('viber-international-not-supported')));
    }

    // 格式21: 用户未添加邮箱
    if (errorMessage === 'Please add user email first!') {
      // 导航到邮箱设置页面
      this.router.navigate(['/me-page/email-address']);
      return throwError(() => new Error(this.translate.instant('emailRequired')));
    }

    // 格式22: 其他404错误（包含错误信息）
    if (errorMessage) {
      return throwError(() => new Error(errorMessage));
    }

    // 默认404错误
    return throwError(() => new Error(this.translate.instant('resource-not-found')));
  }

  // ========== 格式14-16: HTTP 406 - 不可接受 ==========
  /**
   * 处理 406 不可接受错误
   * 格式14: 用户手机号已存在
   * 格式15: 用户邮箱已存在
   * 格式16: 无效输入
   */
  private handle406NotAcceptable(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || error.error?.Message;

    // 格式14: 手机号已存在
    if (errorMessage === "User's phone already exists!") {
      return throwError(() => new Error(this.translate.instant('phone_already_used')));
    }

    // 格式15: 邮箱已存在
    if (errorMessage === "User's email already exists!") {
      return throwError(() => new Error(this.translate.instant('email_already_used')));
    }

    // 格式16: 无效输入
    if (errorMessage === 'Invalid Input') {
      return throwError(() => new Error(this.translate.instant('invalid-input')));
    }

    // OTP 验证失败次数限制
    if (error.error?.failCount && error.error?.maxFailCount) {
      const message = this.translate.instant('otp-fail')
        .replace('@time', error.error.maxFailCount);
      const fullMessage = this.translate.instant('invalidotp') + ' ' + message;
      return throwError(() => new Error(fullMessage));
    }

    // 默认406错误
    return throwError(() => new Error(this.translate.instant('not-acceptable')));
  }

  // ========== 认证过期处理 ==========
  /**
   * 处理认证过期（423/417）
   * 清除登录状态并导航到登录页
   */
  private handleAuthExpired(): Observable<never> {
    this.storage.clear('token');
    this.storage.clear('isUserLoggedIn');
    this.router.navigate(['/login'], { replaceUrl: true });
    return throwError(() => new Error(this.translate.instant('auth-expired')));
  }

  // ========== 网络错误处理 ==========
  /**
   * 处理网络错误（status = 0）
   */
  private handleNetworkError(): Observable<never> {
    // 静默处理网络错误，不显示提示（避免在开发环境频繁弹窗）
    return throwError(() => new Error('Network error'));
  }

  // ========== 未知错误处理 ==========
  /**
   * 处理未知错误
   */
  private handleUnknownError(error: HttpErrorResponse): Observable<never> {
    console.error('Unknown OTP error:', error);
    return throwError(() => new Error(this.translate.instant('unknown-error')));
  }
}
