import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import isUAWebview from 'is-ua-webview';

// Shared 服务
import { 
  OtpService, 
  OtpStateService, 
  IOtpState,
  OtpCountdownService
} from 'src/app/shared/otp/services';

// 模型
import { OtpScenario, OtpErrorCode } from 'src/app/shared/otp/models/otp-type.enum';
import { IOtpResponse } from 'src/app/shared/otp/models/otp-models';
import { OtpStorageKeys } from 'src/app/shared/otp/models/otp-storage-keys';
import { 
  OTP_CODE, 
  OTP_ROUTES, 
  OTP_ERROR_MESSAGES, 
  OTP_IDENTIFIERS,
  SPINNER_NAMES
} from 'src/app/shared/otp/models/otp-constants';
import { environment } from 'src/environments/environment';

/**
 * OTP 页面 Facade 服务
 * 职责：
 * - 协调 Shared 服务的调用
 * - 处理后续操作（自动登录、银行账户插入、导航）
 * - UI 操作（Spinner 控制、错误提示）
 */
@Injectable()
export class OtpPageFacadeService {
  /** 页面状态 Observable（直接使用 IOtpState） */
  readonly pageState$: Observable<IOtpState>;
  
  /** 是否在 WebView 中 */
  private readonly isWebview = isUAWebview(navigator.userAgent);
  
  constructor(
    private otpService: OtpService,
    private state: OtpStateService,
    private countdown: OtpCountdownService,
    private storage: LocalStorageService,
    private router: Router,
    private location: Location,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private util: UtilService,
    private funct: FunctService
  ) {
    // 直接使用 state.getState()，无需组合
    this.pageState$ = this.state.getState();
    
    // 同步 countdown 状态到 state
    this.countdown.getState().subscribe(countdown => {
      this.state.updateCountdown({
        remainingSeconds: countdown.remainingSeconds,
        canResend: countdown.canResend
      });
    });
    
    // 更新 device 状态
    this.updateDeviceState();
  }
    
  /**
   * 初始化 OTP 页面
   */
  initialize(): Observable<void> {
    // 1. 从 localStorage 加载状态
    this.state.loadFromStorage();
    
    // 2. 验证场景是否有效
    const currentState = this.state.getCurrentState();

    // 判断 是否再 OtpScenario 业务场景中
    if (!Object.values(OtpScenario).includes(currentState.scenario.scenario as OtpScenario)) {
      this.showError('Invalid OTP session. Please try again.');
      this.setSubmitLoading(false);
      setTimeout(() => this.goBack(), 2000);
      return of(void 0);
    }

    // 3. 加载 OTP 类型信息
    console.log('initialize loadOtpType scenario:', currentState.form.phoneNumber);

    
    return this.state.loadOtpType(
      currentState.scenario.scenario,
      currentState.form.phoneNumber,
      currentState.form.email
    ).pipe(
      tap((result) => {
        // 4. 恢复倒计时
        this.countdown.restoreFromCache();
        // 5. 隐藏 spinner
        this.setSubmitLoading(false);
        // 6. 异步加载客服电话（不阻塞）
        this.state.loadServicePhones().subscribe({
          error: (error) => console.error('Load service phones failed:', error)
        });
      }),
      catchError(error => {
        console.error('Initialize failed:', error);
        this.setSubmitLoading(false);
        return of(void 0);
      })
    );
  }
  
  // ========== 验证 ==========
  
  /**
   * 验证输入格式
   */
  validateOtpInput(code: string): { valid: boolean; errorKey?: string } {
    if (!code || code.length < OTP_CODE.LENGTH) {
      return { valid: false, errorKey: OTP_ERROR_MESSAGES.REQUIRED };
    }
    if (!/^\d+$/.test(code)) {
      return { valid: false, errorKey: OTP_ERROR_MESSAGES.INVALID_FORMAT };
    }
    return { valid: true };
  }
  
  /**
   * 验证 OTP
   */
  verifyOtp(code: string): Observable<boolean> {
    this.setSubmitLoading(true);
    this.state.clearError();

    // 直接使用统一方法，无需场景判断
    return this.otpService.verifyOtpByScenario(code).pipe(
      switchMap(result => {
        this.setSubmitLoading(false);
        return this.handleVerificationResult(result);
      }),
      catchError(error => {
        console.log('verifyOtp error:', error)
        this.setSubmitLoading(false);
        this.showError(error.message || OTP_ERROR_MESSAGES.VERIFICATION_FAILED);
        return of(false);
      })
    );
  }
  
  // ========== 重发 ==========
  
  /**
   * 重发 OTP
   */
  resendOtp(): Observable<void> {
    const currentState = this.state.getCurrentState();
    if (currentState.ui.isResending) {
      return of(void 0);
    }
    
    this.state.setResending(true);
    this.countdown.stop();
    
    // 直接使用统一方法，无需场景判断
    return this.otpService.resendOtp().pipe(
      tap(result => {
        // storeOtpResponse() 已经存储到 OTP_REQUEST_INFO，统一从缓存恢复
        this.countdown.restoreFromCache();
        this.state.setResending(false);
      }),
      catchError(error => {
        this.countdown.reset(0);
        this.state.setResending(false);
        this.showError(error.message || OTP_ERROR_MESSAGES.RESEND_FAILED);
        return of(void 0);
      }),
      map(() => void 0)
    );
  }

  /**
   * 显示/隐藏提交 loading
   * @param loading 是否显示 loading
   */
  setSubmitLoading(loading: boolean): void {
    this.state.setSubmited(loading);
    if (loading) {
      this.spinner.show(SPINNER_NAMES.SUBMIT);
    } else {
      this.spinner.hide(SPINNER_NAMES.SUBMIT);
    }
  }
  
  // ========== 错误处理 ==========
  
  clearError(): void {
    this.state.clearError();
  }
  
  showError(errorKey: string): void {
    const translatedMessage = this.translate.instant(errorKey);
    this.state.setError(translatedMessage);
  }
  
  // ========== 导航 ==========
  
  goBack(): void {
    this.location.back();
  }
  
  // ========== 清理 ==========
  
  cleanup(): void {
    this.countdown.stop();
    this.state.clearAll();
  }
  
  // ========== 私有方法 ==========
  
  /**
   * 更新设备状态
   */
  private updateDeviceState(): void {
    const deviceId = this.storage.retrieve('localDeviceId');
    const openUrl = (deviceId !== null || this.isWebview) ? '?openinnewtap=1' : '';
    this.state.updateDevice({ openUrl });
  }
  
  /**
   * 处理验证结果
   */
  private handleVerificationResult(result: IOtpResponse): Observable<boolean> {
    const scenario = this.state.getCurrentState().scenario.scenario;
    
    !environment.production && console.log('handleVerificationResult And Scenario:', { scenario, result })
    // 第一层：检查通用错误（401 状态码）
    const commonError = this.handleCommonOtpError(result);
    if (commonError) {
      console.log('commonError:', commonError);
      this.showError(commonError.errorMessage);
      return of(false);
    }
    
    // 第二层：检查特殊错误（提现场景的 "too many request"）
    if (scenario === OtpScenario.WITHDRAW_INSERT) {
      if (result.status === 'Error' && result.message === 'too many request') {
        console.log('too many request');
        this.showError(OTP_ERROR_MESSAGES.TOO_MANY_REQUESTS);
        return of(false);
      }
    }
    
    // 第三层：检查一般错误
    if (result.status === 'Error') {
      console.log('result.status === Error');
      this.showError(result.message || OTP_ERROR_MESSAGES.VERIFICATION_FAILED);
      return of(false);
    }
    
    // 第四层：检查验证成功状态（根据场景判断）
    let isSuccess = false;
    if (scenario === OtpScenario.NEW_DEVICE) {
      // 新设备验证：status === 'Success'（字符串）
      isSuccess = result.status === 'Success';
    } else {
      // 其他场景（注册/忘记密码/提现）：status === true（布尔值）
      isSuccess = result.status === true;
    }
    console.log('isSuccess:', isSuccess);
    
    if (!isSuccess) {
      // 验证失败：优先使用服务器返回的错误信息（特别是新设备验证场景）
      let errorMessage: string;
      if (scenario === OtpScenario.NEW_DEVICE) {
        // 新设备验证：优先使用服务器返回的具体错误信息
        errorMessage = result.message?.toString() || OTP_ERROR_MESSAGES.INCORRECT;
      } else {
        // 其他场景：使用固定错误消息（与原实现保持一致）
        errorMessage = OTP_ERROR_MESSAGES.INCORRECT;
      }
      this.showError(errorMessage);
      return of(false);
    }
    
    // 第五层：根据场景执行后续操作
    if (scenario === OtpScenario.NEW_DEVICE) {
      // 验证成功，执行自动登录
      return this.performAutoLogin();
    }
    
    if (scenario === OtpScenario.WITHDRAW_INSERT) {
      // 提现验证成功：插入银行账户
      return this.insertBankAccount();
    }
    
    // 注册/忘记密码验证成功：清理数据并导航
    if (scenario === OtpScenario.REGISTER || scenario === OtpScenario.FORGET_PASSWORD) {
      this.navigateAfterVerification(scenario, result);
      return of(true);
    }
    
    // 未知场景
    this.showError(OTP_ERROR_MESSAGES.VERIFICATION_FAILED);
    return of(false);
  }
  
  /**
   * 检查并处理通用的 OTP 错误（401 状态码）
   * @returns 错误信息对象，如果不是错误返回 null
   */
  private handleCommonOtpError(result: IOtpResponse): { errorMessage: string } | null {
    // 检查 status === '401'（字符串）
    if (String(result.status) !== '401') {
      return null;
    }
    
    // 错误码映射
    const errorMap: Record<number, string> = {
      [OtpErrorCode.INVALID_CODE]: OTP_ERROR_MESSAGES.INVALID_CODE,
      [OtpErrorCode.TOKEN_EXPIRED]: OTP_ERROR_MESSAGES.TOKEN_EXPIRED,
      [OtpErrorCode.DEVICE_TOKEN_EXPIRED]: OTP_ERROR_MESSAGES.TOKEN_EXPIRED
    };
    
    const errorMessage = errorMap[result.code as number];
    if (errorMessage) {
      return { errorMessage };
    }
    
    return null;
  }
  
  /**
   * 执行自动登录
   * 注意：数据清理已在 handleVerificationResult 中完成
   */
  performAutoLogin(): Observable<boolean> {
    const loginModel = this.storage.retrieve(OtpStorageKeys.LOGIN_MODEL);
    if (!loginModel) {
      this.showError('Login model not found');
      return of(false);
    }
    
    return this.otpService.autoLogin(loginModel).pipe(
      tap(result => {
        this.dto.Response = result;
        if (result.status !== 'Error' && result.token) {
          // 更新登录状态
          this.util.isLogged = true;
          this.dto.token = 'Bearer ' + result.token;
          this.storage.store('token', this.dto.token);
          this.storage.store('isUserLoggedIn', this.util.isLogged);
          
          // 清理otp相关的缓存
          this.cleanup();
          this.otpService.clearOtpData();
          // 导航到首页并防止后退
          this.navigateToHomeWithBackPrevention();
        }
      }),
      map(result => {
        if (result.status === 'Error' || !result.token) {
          throw new Error(result.message || OTP_ERROR_MESSAGES.AUTO_LOGIN_FAILED);
        }
        return true;
      }),
      catchError(error => {
        this.showError(error.message || OTP_ERROR_MESSAGES.AUTO_LOGIN_FAILED);
        setTimeout(() => this.goBack(), 2000);
        return of(false);
      })
    );
  }
  
  /**
   * 插入银行账户
   */
  private insertBankAccount(): Observable<boolean> {
    const token = this.storage.retrieve('token');
    const bankAccountList = this.storage.retrieve(OtpStorageKeys.BANK_ACCOUNT_LIST) || [];
    
    if (!token) {
      this.showError('Token not found');
      return of(false);
    }
    
    // 先获取 insertAccount 标识（在清理之前）
    const insertAccount = this.storage.retrieve(OtpStorageKeys.INSERT_ACCOUNT);
    
    return this.otpService.insertUserBankAccount(bankAccountList, token).pipe(
      tap(() => {
        // 存储成功标识（使用字符串键，因为这些是业务特定的）
        this.storage.store('otpSms', OTP_IDENTIFIERS.OTP_INSERT_FLAG);
        this.storage.store('successmsg', OTP_IDENTIFIERS.WITHDRAW_SUCCESS_MSG);
        
        // 清理数据
        // this.storage.clear(OtpStorageKeys.INSERT_ACCOUNT);
        // this.storage.clear(OtpStorageKeys.BANK_ACCOUNT_LIST);
        // this.storage.clear(OtpStorageKeys.OTP_RESPONSE);
        // this.storage.clear(OtpStorageKeys.SCENARIO);
        // this.countdown.clearAllCache();
        this.cleanup();
        this.otpService.clearOtpData();
      }),
      map(() => true),
      catchError(error => {
        this.showError(error.message || OTP_ERROR_MESSAGES.BANK_INSERT_FAILED);
         // 插入失败，2秒后返回提现页面让用户重新操作
        setTimeout(() => {
          this.location.back();
        }, 2000);
        return of(false);
      }),
      switchMap(() => {
        // 处理导航（使用之前获取的 insertAccount）
        const navPath = insertAccount === OTP_IDENTIFIERS.INSERT_ACCOUNT_FLAG 
          ? OTP_ROUTES.WITHDRAW_CHANGE_ACC 
          : '';
        
        if (navPath) {
          this.router.navigate([navPath], { replaceUrl: true });
        } else {
          history.go(-2);
        }
        return of(true);
      })
    );
  }
  
  /**
   * 验证后导航（注册/忘记密码）
   * 注意：数据清理已在 handleVerificationResult 中完成
   */
  private navigateAfterVerification(scenario: string, result: IOtpResponse): void {
    const registerKey = this.funct.encrypt();
    const navigationPath = scenario === OtpScenario.FORGET_PASSWORD
      ? OTP_ROUTES.RESET_PASSWORD
      : OTP_ROUTES.REGISTRATION;
    
    // 清理组件状态和 OTP 服务数据
    this.cleanup();
    this.otpService.clearOtpData();
    
    this.router.navigate([navigationPath], {
      state: { registerKey },
      replaceUrl: true
    });
  }
  
  /**
   * 导航到首页并防止后退
   */
  private navigateToHomeWithBackPrevention(): void {
    this.router.navigate([OTP_ROUTES.HOME], { replaceUrl: true }).then(() => {
      history.replaceState(null, '', location.href);
      const listener = () => {
        history.replaceState(null, '', location.href);
      };
      window.addEventListener('popstate', listener);
    });
  }
  
}
