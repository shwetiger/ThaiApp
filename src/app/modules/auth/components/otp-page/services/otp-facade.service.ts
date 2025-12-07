import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { OtpCountdownService, CountdownState } from './otp-countdown.service';
import { OtpStateService, FormState, UiState, ScenarioState, ServicePhoneState } from './otp-state.service';
import { OtpVerificationService } from './otp-verification.service';
import { OtpAuthService } from './otp-auth.service';
import { OtpService } from './otp-service';
import isUAWebview from 'is-ua-webview';
import { OtpScenario } from '../models/otp-type.enum';
import { OTP_CODE, SPINNER_NAMES, OTP_ERROR_MESSAGES, TOASTR_CONFIG } from '../models/otp.constants';

/**
 * OTP 页面的统一状态
 */
export interface OtpPageState {
  /** 倒计时状态 */
  countdown: CountdownState;
  /** 表单状态 */
  form: FormState;
  /** UI 状态 */
  ui: UiState;
  /** 场景信息 */
  scenario: ScenarioState;
  /** 客服电话 */
  servicePhones: ServicePhoneState;
  /** 设备信息 */
  device: {
    deviceId: string | null;
    openUrl: string;
  };
}

/**
 * OTP 门面服务
 * 职责：
 * - 作为组件与底层服务之间的唯一接口
 * - 协调多个服务的调用
 * - 提供统一的状态 Observable
 * - 简化组件的复杂度
 */
@Injectable()
export class OtpFacadeService {
  /** 统一的页面状态 */
  readonly pageState$: Observable<OtpPageState>;
  
  /** 是否在 WebView 中（固定值，避免重复计算） */
  private readonly isWebview = isUAWebview(navigator.userAgent);
  
  constructor(
    private countdown: OtpCountdownService,
    private state: OtpStateService,
    private verification: OtpVerificationService,
    private auth: OtpAuthService,
    private otpService: OtpService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    // 组合所有状态为一个 Observable
    this.pageState$ = combineLatest([
      this.countdown.getState(),
      this.state.getFormState(),
      this.state.getUiState(),
      this.state.getScenarioState(),
      this.state.getServicePhoneState()
    ]).pipe(
      map(([countdown, form, ui, scenario, servicePhones]) => {
        const deviceId = this.state.getDeviceId();
        return {
          countdown,
          form,
          ui,
          scenario,
          servicePhones,
          device: {
            deviceId,
            openUrl: (deviceId !== null || this.isWebview) ? '?openinnewtap=1' : ''
          }
        };
      })
    );
  }
    
  /**
   * 初始化 OTP 页面
   * 
   * 执行顺序：
   * 1. 加载状态（同步）
   * 2. 校验场景（同步）
   * 3. 加载 OTP 类型（异步，优先加载避免页面抖动）
   * 4. 恢复倒计时（同步，在 OTP 类型加载完成后执行）
   * 5. 显示页面
   */
  initialize(): Observable<void> {
    // 1. 加载状态
    this.state.loadFromStorage();
    
    // 2. 校验必要参数（防止错误场景）
    const scenarioState = this.state.getCurrentScenarioState();
    if (!scenarioState.scenario) {
      this.showError('Invalid OTP session. Please try again.');
      this.spinner.hide();
      // 2秒后自动返回上一页，避免用户被困
      setTimeout(() => this.goBack(), 2000);
      return of(void 0);
    }
    
    // 3. 优先加载 OTP 类型信息（核心UI文案，避免页面抖动）
    return this.initializeOtpType().pipe(
      map(() => {
        
        // 3.5. 确保 request_ids 存在（在 OTP 类型加载完成后，此时类型信息已就绪）
        this.ensureRequestIdsExist();
        
        // 4. OTP 类型加载完成后，从 OTP 响应恢复倒计时
        this.initializeCountdownFromStorage();
        
        // 5. 隐藏 spinner，显示页面（此时 OTP 类型和倒计时都已就绪）
        this.spinner.hide();
        
        // 7. 异步加载客服电话（次要信息，不阻塞页面显示）
        this.state.loadServicePhones().subscribe({
          error: (error) => {
            console.error('Load service phones failed:', error);
            // 失败不影响主流程
          }
        });
        
        return void 0;
      }),
      catchError(error => {
        console.error('Initialize OTP type failed:', error);
        this.spinner.hide();
        return of(void 0);
      })
    );
  }
  
  /**
   * 从 localStorage 初始化倒计时
   */
  private initializeCountdownFromStorage(): void {
    const scenario = this.state.getCurrentScenarioState().scenario;
    const param = scenario === OtpScenario.NEW_DEVICE ? 'newDevice' :
                  (scenario === OtpScenario.WITHDRAW_INSERT || scenario === OtpScenario.WITHDRAWAL_ADD) ? 'withdraw' :
                  'register';
    const otpResponse = this.state.getOtpResponse(param);
    otpResponse && this.countdown.startFromResponse(otpResponse);
  }
  
  /**
   * 初始化 OTP 类型
   */
  private initializeOtpType(): Observable<void> {
    const scenarioState = this.state.getCurrentScenarioState();
    const form = this.state.getCurrentFormState();
    return this.state.loadOtpType(scenarioState.scenario, form.phoneNumber, form.email);
  }

  /**
   * 确保 request_ids 存在（统一处理所有场景）
   */
  private ensureRequestIdsExist(): void {
    const scenarioState = this.state.getCurrentScenarioState();
    this.otpService.ensureRequestIdsExist(
      scenarioState.scenario,
      this.state.getCurrentFormState().otpType
    );
  }
  
  // ========== OTP 操作 ==========
  
  validateOtpInput(code: string): { valid: boolean; errorKey?: string } {
    // 检查是否为空或长度不足
    if (!code || code.length < OTP_CODE.LENGTH) {
      return { valid: false, errorKey: OTP_ERROR_MESSAGES.REQUIRED };
    }
    
    // 检查是否只包含数字（防御性编程，虽然 input type="tel" 已限制）
    if (!/^\d+$/.test(code)) {
      return { valid: false, errorKey: OTP_ERROR_MESSAGES.INVALID_FORMAT };
    }
    
    return { valid: true };
  }
  
  /**
   * 提交验证 OTP
   */
  verifyOtp(code: string): Observable<boolean> {
    const scenarioState = this.state.getCurrentScenarioState();
    
    this.setLoading(true);
    this.state.clearError();
    
    return this.verification.verify(code, scenarioState.scenario)
      .pipe(
        switchMap(result => {
          this.setLoading(false);
          
          if (!result.success) {
            // 显示错误
            const errorMessage = result.errorMessage 
              ? this.translate.instant(result.errorMessage)
              : OTP_ERROR_MESSAGES.UNKNOWN;
            
            this.showError(errorMessage);
            return of(false);
          }
          
          // 处理后续操作
          if (result.requiresAuth) {
            // 需要自动登录
            return this.auth.performAutoLogin().pipe(
              map(() => true),
              catchError(error => {
                this.showError(error.message || OTP_ERROR_MESSAGES.AUTO_LOGIN_FAILED);
                // 自动登录失败，2秒后返回登录页让用户手动登录
                setTimeout(() => {
                  this.state.navigateBack();
                }, 2000);
                return of(false);
              })
            );
          }
          
          if (result.requiresBankInsert) {
            // 需要插入银行账户
            return this.verification.insertBankAccount().pipe(
              tap(() => {
                // 处理导航
                const navPath = this.verification.getBankInsertNavigationPath();
                if (navPath) {
                  this.auth.navigateWithBackPrevention(navPath);
                } else if (this.verification.shouldGoBackTwoPages()) {
                  history.go(-2);
                }
              }),
              map(() => true),
              catchError(error => {
                this.showError(error.message || OTP_ERROR_MESSAGES.BANK_INSERT_FAILED);
                // 插入失败，2秒后返回提现页面让用户重新操作
                setTimeout(() => {
                  history.go(-1); // 返回提现页面
                }, 2000);
                return of(false);
              })
            );
          }
          
          return of(true);
        }),
        catchError(error => {
          this.setLoading(false);
          this.showError(error.message || OTP_ERROR_MESSAGES.VERIFICATION_FAILED);
          return of(false);
        })
      );
  }
  
  /**
   * 重发 OTP
   */
  resendOtp(): Observable<void> {
    const scenarioState = this.state.getCurrentScenarioState();
    const form = this.state.getCurrentFormState();
    
    // 防止重复点击：如果正在重发中，直接返回
    if (this.state.getCurrentUiState().isResending) {
      console.warn('Resend OTP is already in progress, ignoring duplicate request');
      return of(void 0);
    }
    
    // 设置重发 loading 状态
    this.state.setResending(true);
    
    // 先停止当前倒计时（修复竞态条件问题）
    this.countdown.stop();
    
    return this.verification.resend(
      scenarioState.scenario,
      form.phoneNumber
    ).pipe(
      tap(result => {
        // 从新的响应启动倒计时
        this.countdown.startFromResponse(result);
        // 重置重发 loading 状态
        this.state.setResending(false);
      }),
      catchError(error => {
        // 重发失败时保持倒计时停止状态
        this.countdown.reset(0);
        // 重置重发 loading 状态
        this.state.setResending(false);
        this.showError(error.message || OTP_ERROR_MESSAGES.RESEND_FAILED);
        return of(void 0);
      }),
      map(() => void 0)
    );
  }
  
  // ========== UI 操作 ==========
  
  /**
   * 显示错误提示
   * @param messageKey 翻译键或已翻译的消息
   * @param title 标题
   * @param duration 持续时间
   */
  showError(messageKey: string, title: string = 'Tip', duration: number = TOASTR_CONFIG.DEFAULT_DURATION): void {
    // 翻译消息（如果已经是翻译后的文本，instant 会原样返回）
    const translatedMessage = this.translate.instant(messageKey);
    
    this.state.setError(translatedMessage);
    // TODO 统一提示框，不需要再提示了
    // this.toastr.error('', translatedMessage, {
    //   timeOut: duration,
    //   positionClass: TOASTR_CONFIG.DEFAULT_POSITION
    // });
  }
  
  clearError(): void {
    this.state.clearError();
  }
  
  /** 设置 loading 状态并同步更新 spinner */
  setLoading(loading: boolean): void {
    this.state.setLoading(loading);
    
    if (loading) {
      this.spinner.show(SPINNER_NAMES.SUBMIT);
    } else {
      this.spinner.hide(SPINNER_NAMES.SUBMIT);
    }
  }
  
  goBack(): void {
    this.state.navigateBack();
  }
  
  // ========== 清理 ==========
  
  cleanup(): void {
    this.countdown.stop();
    this.state.cleanup();
  }
}

