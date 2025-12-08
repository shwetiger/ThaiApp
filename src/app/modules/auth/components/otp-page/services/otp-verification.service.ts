import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { OtpService, OtpSendScenario } from './otp-service';
import { OtpResponse } from '../models/otp-models';
import { OtpErrorCode, OtpScenario, OtpDisplayType } from '../models/otp-type.enum';
import { FunctService } from 'src/app/shared/service/funct.service';
import { OtpStorageKeys } from '../models/otp-storage-keys';
import { OTP_ERROR_MESSAGES, OTP_IDENTIFIERS, OTP_ROUTES } from '../models/otp.constants';

/**
 * OTP 验证结果
 */
export interface OtpVerificationResult {
  success: boolean;
  shouldNavigate: boolean;
  navigationPath?: string;
  errorMessage?: string;
  requiresAuth?: boolean;      // 是否需要自动登录
  requiresBankInsert?: boolean; // 是否需要插入银行账户
}

/**
 * OTP 验证服务
 * 职责：
 * - 处理所有 OTP 验证逻辑
 * - 根据场景调用不同的验证 API
 * - 返回验证结果（不处理后续操作）
 */
@Injectable()
export class OtpVerificationService {
  constructor(
    private otpService: OtpService,
    private storage: LocalStorageService,
    private router: Router,
    private funct: FunctService
  ) {}
  
  /**
   * 验证 OTP
   * @param code OTP 验证码
   * @param scenario 业务场景
   * @returns Observable<OtpVerificationResult>
   */
  verify(
    code: string,
    scenario: string
  ): Observable<OtpVerificationResult> {
    // 使用统一的场景判断（清晰的 switch-case）
    switch (scenario) {
      case OtpScenario.WITHDRAW_INSERT:
      case OtpScenario.WITHDRAWAL_ADD:  // 兼容旧值
        return this.verifyWithdrawAccount(code);
      
      case OtpScenario.NEW_DEVICE:
        return this.verifyNewDevice(code);
      
      case OtpScenario.REGISTER:
      case OtpScenario.FORGET_PASSWORD:
        return this.verifyStandard(code, scenario);
      
      default:
        // 未知场景：明确抛出错误（不再静默兜底）
        return throwError(() => new Error(`Unknown OTP scenario: ${scenario}`));
    }
  }
  
  /**
   * 重发 OTP
   * @param scenario 业务场景
   * @param phoneNumber 电话号码
   * @returns Observable<OtpResponse>
   */
  resend(
    scenario: string,
    phoneNumber: string
  ): Observable<OtpResponse> {
    // 使用统一的场景判断
    switch (scenario) {
      case OtpScenario.NEW_DEVICE:
        return this.otpService.resendOtp(OtpSendScenario.NEW_DEVICE, phoneNumber);
      
      case OtpScenario.WITHDRAW_INSERT:
      case OtpScenario.WITHDRAWAL_ADD:  // 兼容旧值
        const token = this.storage.retrieve('token');
        const bankAccountList = this.storage.retrieve(OtpStorageKeys.BANK_ACCOUNT_LIST) || [];
        
        // 前置条件检查：token 必须存在
        if (!token) {
          return throwError(() => new Error('Please login again to continue. Your session may have expired.'));
        }
        
        return this.otpService.resendOtp(
          OtpSendScenario.WITHDRAW,
          undefined,
          token,
          bankAccountList
        ).pipe(
          tap(result => {
            this.storage.store(OtpStorageKeys.WITHDRAW_ACCOUNT_OTP_RESPONSE, result);
          })
        );
      
      case OtpScenario.FORGET_PASSWORD:
        return this.otpService.resendOtp(OtpSendScenario.FORGET_PASSWORD, phoneNumber);
      
      case OtpScenario.REGISTER:
        return this.otpService.resendOtp(OtpSendScenario.REGISTER, phoneNumber);
      
      default:
        // 未知场景：明确抛出错误
        return throwError(() => new Error(`Unknown scenario for resend: ${scenario}`));
    }
  }
  
  // ========== 私有验证方法 ==========
  
  /**
   * 验证提现账户 OTP
   */
  private verifyWithdrawAccount(code: string): Observable<OtpVerificationResult> {
    const otpSms = this.storage.retrieve(OtpStorageKeys.WITHDRAW_ACCOUNT_OTP_RESPONSE);
    const token = this.storage.retrieve('token');  // 注：token 未在 OtpStorageKeys 中定义
    
    // 前置条件检查
    if (!otpSms?.request_id || !token) {
      return throwError(() => new Error('Missing required data for withdraw verification'));
    }
    
    // 获取当前 OTP 类型对应的 request_id（支持切换 OTP 类型）
    const currentDisplayType = this.storage.retrieve(OtpStorageKeys.OTP_TYPE) as OtpDisplayType;
    const requestId = otpSms.request_ids?.[currentDisplayType] || otpSms.request_id;  // 优先从 request_ids 读取，降级使用 request_id
    
    if (!requestId) {
      return throwError(() => new Error('Missing request_id'));
    }
    
    return this.otpService.checkWithdrawOtp(code, requestId, token)
      .pipe(
        map(result => this.handleWithdrawOtpResult(result)),
        catchError(error => throwError(() => error))
      );
  }
  
  /**
   * 验证新设备 OTP
   */
  private verifyNewDevice(code: string): Observable<OtpVerificationResult> {
    const loginModel = this.storage.retrieve(OtpStorageKeys.LOGIN_MODEL);
    const otpSms = this.storage.retrieve(OtpStorageKeys.NEW_DEVICE_OTP_RESPONSE);
    
    // 前置条件检查
    if (!loginModel || !otpSms) {
      return throwError(() => new Error('Missing required data for new device verification'));
    }
    
    // 获取当前 OTP 类型对应的 request_id（支持切换 OTP 类型）
    const currentDisplayType = this.storage.retrieve(OtpStorageKeys.OTP_TYPE) as OtpDisplayType;
    const requestId = otpSms.request_ids?.[currentDisplayType] || otpSms.request_id;  // 优先从 request_ids 读取，降级使用 request_id
    
    if (!requestId) {
      return throwError(() => new Error('Missing request_id'));
    }
    
    const updateRequest = {
      phone_no: loginModel.phone_no || '',
      ipAddress: loginModel.ipAddress || '',
      guid: otpSms.guid || '',
      request_id: String(requestId),
      code: code,
      deviceId: loginModel.deviceId || ''
    };
    
    return this.otpService.updateDeviceId(updateRequest)
      .pipe(
        map(result => this.handleNewDeviceOtpResult(result)),
        catchError(error => throwError(() => error))
      );
  }
  
  /**
   * 验证标准 OTP（注册/忘记密码）
   */
  private verifyStandard(code: string, scenario: string): Observable<OtpVerificationResult> {
    const otpSms = this.storage.retrieve(OtpStorageKeys.OTP_RESPONSE);
    
    // 前置条件检查
    if (!otpSms?.to) {
      return throwError(() => new Error('Missing OTP data'));
    }
    
    // 获取当前 OTP 类型对应的 request_id
    const currentDisplayType = this.storage.retrieve(OtpStorageKeys.OTP_TYPE) as OtpDisplayType;
    const requestId = otpSms.request_ids?.[currentDisplayType] || otpSms.request_id;  // 优先从 request_ids 读取，降级使用 request_id
    
    if (!requestId) {
      return throwError(() => new Error('Missing request_id'));
    }
    
    const isForgetPassword = scenario === OtpScenario.FORGET_PASSWORD;
    // 注册和忘记密码都是未登录状态，不需要token
    // token 仅作为可选参数，如果存在则传递（某些特殊场景可能需要）
    const token = this.storage.retrieve('token') || undefined;
    const registerOtpType = this.storage.retrieve(OtpStorageKeys.REGISTER_OTP_TYPE);
    
    return this.otpService.checkOtp(
      otpSms.to,
      code,
      requestId,
      registerOtpType ?? undefined,
      token ?? undefined,
      isForgetPassword
    ).pipe(
      map(result => this.handleStandardOtpResult(result, scenario)),
      catchError(error => throwError(() => error))
    );
  }
  
  // ========== 结果处理 ==========
  
  /**
   * 检查并处理通用的 OTP 错误（401 状态）
   * @returns 错误结果对象，如果不是错误返回 null
   */
  private handleCommonOtpError(result: OtpResponse): OtpVerificationResult | null {
    if (String(result.status) !== '401') {
      return null;
    }
    
    const errorMap: Record<number, string> = {
      [OtpErrorCode.INVALID_CODE]: OTP_ERROR_MESSAGES.INVALID_CODE,
      [OtpErrorCode.TOKEN_EXPIRED]: OTP_ERROR_MESSAGES.TOKEN_EXPIRED,
      [OtpErrorCode.DEVICE_TOKEN_EXPIRED]: OTP_ERROR_MESSAGES.TOKEN_EXPIRED
    };
    
    const errorMessage = errorMap[result.code as number];
    if (errorMessage) {
      return {
        success: false,
        shouldNavigate: false,
        errorMessage
      };
    }
    
    return null;
  }
  
  /**
   * 处理提现 OTP 验证结果
   */
  private handleWithdrawOtpResult(result: OtpResponse): OtpVerificationResult {
    // 检查通用错误
    const commonError = this.handleCommonOtpError(result);
    if (commonError) {
      return commonError;
    }
    
    // 验证成功
    if (result.status === true) {
      return {
        success: true,
        shouldNavigate: false,
        requiresBankInsert: true  // 标识需要插入银行账户
      };
    }
    
    // 其他错误
    if (result.status === 'Error' && result.message === 'too many request') {
      return {
        success: false,
        shouldNavigate: false,
        errorMessage: OTP_ERROR_MESSAGES.TOO_MANY_REQUESTS
      };
    }
    
    return {
      success: false,
      shouldNavigate: false,
      errorMessage: OTP_ERROR_MESSAGES.INCORRECT
    };
  }
  
  /**
   * 处理新设备 OTP 验证结果
   */
  private handleNewDeviceOtpResult(result: OtpResponse): OtpVerificationResult {
    // 检查通用错误
    const commonError = this.handleCommonOtpError(result);
    if (commonError) {
      return commonError;
    }
    
    // 验证成功
    if (result.status === 'Success') {
      this.storage.clear(OtpStorageKeys.NEW_DEVICE_OTP_RESPONSE);
      this.storage.clear(OtpStorageKeys.SCENARIO);
      
      return {
        success: true,
        shouldNavigate: false,
        requiresAuth: true  // 标识需要自动登录
      };
    }
    
    return {
      success: false,
      shouldNavigate: false,
      errorMessage: result.message?.toString() || 'Verification failed'
    };
  }
  
  /**
   * 处理标准 OTP 验证结果
   */
  private handleStandardOtpResult(result: OtpResponse, scenario: string): OtpVerificationResult {
    // 清理注册邮箱
    this.storage.clear(OtpStorageKeys.REGISTER_EMAIL);
    
    // 检查通用错误
    const commonError = this.handleCommonOtpError(result);
    if (commonError) {
      return commonError;
    }
    
    // 验证成功
    if (result.status === true) {
      this.storage.clear(OtpStorageKeys.OTP_RESPONSE);
      this.storage.clear(OtpStorageKeys.SCENARIO);
      
      const registerKey = this.funct.encrypt();
      const navigationPath = scenario === OtpScenario.FORGET_PASSWORD
        ? OTP_ROUTES.RESET_PASSWORD
        : OTP_ROUTES.REGISTRATION;
      
      this.router.navigate([navigationPath], {
        state: { registerKey },
        replaceUrl: true
      });
      
      return {
        success: true,
        shouldNavigate: true,
        navigationPath
      };
    }
    
    return {
      success: false,
      shouldNavigate: false,
      errorMessage: OTP_ERROR_MESSAGES.INCORRECT
    };
  }
  
  /**
   * 插入银行账户
   * @returns Observable<boolean>
   */
  insertBankAccount(): Observable<boolean> {
    const token = this.storage.retrieve('token');
    const bankAccountList = this.storage.retrieve(OtpStorageKeys.BANK_ACCOUNT_LIST) || [];
    
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }
    
    return this.otpService.insertUserBankAccount(bankAccountList, token)
      .pipe(
        tap(() => {
          // 存储成功标识
          this.storage.store(OtpStorageKeys.OTP_SMS, OTP_IDENTIFIERS.OTP_INSERT_FLAG);
          this.storage.store(OtpStorageKeys.SUCCESS_MSG, OTP_IDENTIFIERS.WITHDRAW_SUCCESS_MSG);
          
          // 清理数据
          this.storage.clear(OtpStorageKeys.INSERT_ACCOUNT);
          this.storage.clear(OtpStorageKeys.WITHDRAW_ACCOUNT_OTP_RESPONSE);
          this.storage.clear(OtpStorageKeys.SCENARIO);
          this.storage.clear('bankAccountList');  // 注：未在 OtpStorageKeys 中定义
        }),
        map(() => true),
        catchError(error => {
          console.error('Insert bank account failed:', error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * 获取插入账户后的导航路径
   */
  getBankInsertNavigationPath(): string {
    const insertAccount = this.storage.retrieve(OtpStorageKeys.INSERT_ACCOUNT);
    return insertAccount === OTP_IDENTIFIERS.INSERT_ACCOUNT_FLAG ? OTP_ROUTES.WITHDRAW_CHANGE_ACC : '';
  }
  
  /**
   * 是否需要返回两页（history.go(-2)）
   */
  shouldGoBackTwoPages(): boolean {
    const insertAccount = this.storage.retrieve(OtpStorageKeys.INSERT_ACCOUNT);
    return insertAccount !== OTP_IDENTIFIERS.INSERT_ACCOUNT_FLAG;
  }
}

