import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { OtpType, OtpDisplayType, OtpScenario } from '../models/otp-type.enum';
import { OtpResponse, UpdateDeviceIdRequest, ServicePhone } from '../models/otp-models';
import { OtpStorageKeys } from '../models/otp-storage-keys';
import { OtpErrorHandlerService } from './otp-error-handler.service';
import { OtpResponseValidatorService } from './otp-response-validator.service';

/**
 * OTP 类型和发送者信息结果
 */
export interface OtpTypeResult {
  otpType: OtpType;
  displayType: OtpDisplayType;
  sender: string;
  smstype?: string; // 用于非注册场景，保存从后端获取的 smstype
  email?: string; // 用于非注册场景，保存从后端获取的 email
  fullResponse?: any; // 完整的响应对象（用于非注册场景）
}

/**
 * OTP 发送配置接口
 */
export interface OtpSendConfig {
  url: string; // API 端点路径（不包含基础URL）
  method: 'GET' | 'POST'; // HTTP 方法
  requiresAuth: boolean; // 是否需要认证 token
  storageKey?: string; // 存储响应数据的 localStorage 键名
  baseUrl?: 'ipaddress' | 'apaddressv1'; // 使用哪个基础URL（默认 ipaddress）
  requestBody?: any; // POST 请求的请求体（可选）
}

/**
 * OTP 发送场景类型
 */
export enum OtpSendScenario {
  REGISTER = 'register',
  FORGET_PASSWORD = 'forgetPassword',
  NEW_DEVICE = 'newDevice',
  WITHDRAW = 'withdraw'
}

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  /**
   * OTP 类型配置映射
   * 定义每种 OTP 类型对应的显示类型和发送者获取方式
   */
  private readonly otpTypeConfig = {
    [OtpType.VMG_VIBER]: {
      displayType: OtpDisplayType.VIBER,
      getSender: (phone?: string, email?: string) => phone || ''
    },
    [OtpType.EMAIL]: {
      displayType: OtpDisplayType.EMAIL,
      getSender: (phone?: string, email?: string) => email || ''
    },
    [OtpType.SMS]: {
      displayType: OtpDisplayType.SMS,
      getSender: (phone?: string, email?: string) => phone || ''
    }
  } as const;

  /**
   * 场景到存储键的映射（统一管理）
   * @param scenario 业务场景标识
   * @returns 对应的 localStorage 键名
   */
  public getStorageKeyByScenario(scenario: string): string {
    if (scenario === OtpScenario.NEW_DEVICE) {
      return OtpStorageKeys.NEW_DEVICE_OTP_RESPONSE;
    }
    if (scenario === OtpScenario.WITHDRAW_INSERT || scenario === OtpScenario.WITHDRAWAL_ADD) {
      return OtpStorageKeys.WITHDRAW_ACCOUNT_OTP_RESPONSE;
    }
    return OtpStorageKeys.OTP_RESPONSE; // 默认：注册、忘记密码等
  }

  /**
   * OTP 发送配置映射
   * 定义每种发送场景的配置
   */
  private readonly sendConfig: Record<string, OtpSendConfig> = {
    [OtpSendScenario.REGISTER]: {
      url: 'user/getRegisterOTP?phoneNo=',
      method: 'GET',
      requiresAuth: false,
      storageKey: 'localOtpSms',
      baseUrl: 'apaddressv1'
    },
    [OtpSendScenario.FORGET_PASSWORD]: {
      url: 'user/getForgotPassowrdOTP?phoneNo=',
      method: 'GET',
      requiresAuth: false,
      storageKey: 'localOtpSms',
      baseUrl: 'apaddressv1'
    },
    [OtpSendScenario.NEW_DEVICE]: {
      url: 'user/getRegisterDeviceOTP?phoneNo=',
      method: 'GET',
      requiresAuth: false,
      storageKey: 'localNewDeviceOtpSms',
      baseUrl: 'ipaddress'
    },
    [OtpSendScenario.WITHDRAW]: {
      url: 'transaction/getWithdrawOTP',
      method: 'GET',
      requiresAuth: true,
      storageKey: 'localInsertAccountOtpSms',
      baseUrl: 'apaddressv1'
    }
  };

  constructor(
    private http: HttpClient,
    private storage: LocalStorageService,
    private funct: FunctService,
    private dto: DtoService,
    private errorHandler: OtpErrorHandlerService,
    private responseValidator: OtpResponseValidatorService
  ) {}

  /**
   * 获取 OTP 类型和发送者信息
   * @param formType 表单类型（'register' 或其他）
   * @param registerOtpType 注册时的 OTP 类型（仅注册场景需要）
   * @param phoneNumber 电话号码
   * @param emailAddress 邮箱地址（仅注册场景需要）
   * @param token 认证 token（非注册场景需要）
   * @returns Observable<OtpTypeResult> OTP 类型结果
   */
  getOtpType(
    formType: string,
    registerOtpType?: string,
    phoneNumber?: string,
    emailAddress?: string,
    token?: string
  ): Observable<OtpTypeResult> {
    // 注册场景：直接返回结果
    if (formType === 'register') {
      return of(this.getRegisterOtpType(registerOtpType, phoneNumber, emailAddress));
    }
    
    // 非注册场景：需要调用 API
    return this.getUserSmsType(phoneNumber, token);
  }

  /**
   * 根据 OTP 类型获取配置信息
   * @param otpType OTP 类型
   * @param phoneNumber 电话号码
   * @param emailAddress 邮箱地址（可选）
   * @returns OTP 类型配置结果
   */
  private getOtpTypeConfig(
    otpType: OtpType,
    phoneNumber?: string,
    emailAddress?: string
  ): { otpType: OtpType; displayType: OtpDisplayType; sender: string } {
    // 如果配置不存在，默认使用 SMS 类型
    const hasConfig = this.otpTypeConfig[otpType] !== undefined;
    const config = hasConfig ? this.otpTypeConfig[otpType] : this.otpTypeConfig[OtpType.SMS];
    const finalOtpType = hasConfig ? otpType : OtpType.SMS;

    return {
      otpType: finalOtpType,
      displayType: config.displayType,
      sender: config.getSender(phoneNumber, emailAddress)
    };
  }

  /**
   * 获取注册场景的 OTP 类型
   * @param registerOtpType 注册时的 OTP 类型
   * @param phoneNumber 电话号码
   * @param emailAddress 邮箱地址
   * @returns OtpTypeResult
   */
  private getRegisterOtpType(
    registerOtpType?: string,
    phoneNumber?: string,
    emailAddress?: string
  ): OtpTypeResult {
    // 将字符串转换为 OtpType，默认使用 SMS
    const otpType = (registerOtpType as OtpType) || OtpType.SMS;
    const config = this.getOtpTypeConfig(otpType, phoneNumber, emailAddress);

    // 存储到 localStorage
    this.storage.store("localotptype", config.displayType);

    return {
      otpType: config.otpType,
      displayType: config.displayType,
      sender: config.sender
    };
  }

  /**
   * 获取用户短信类型（非注册场景）
   * @param phoneNumber 电话号码
   * @param token 认证 token
   * @returns Observable<OtpTypeResult>
   */
  private getUserSmsType(phoneNumber?: string, token?: string): Observable<OtpTypeResult> {
    // 保持与原始代码一致：HttpHeaders 是不可变的，set() 返回新对象
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', token);
    }

    return this.http.get(this.funct.ipaddress + 'user/userSmsType?phone_no=' + phoneNumber, { headers })
      .pipe(
        catchError(error => this.errorHandler.handleError('getUserSmsType', error)),
        map((result: any) => {
          // 保存完整响应到 dto（保持与原始代码一致）
          this.dto.Response = result;
          const smstype = result?.smstype;

          // 将字符串转换为 OtpType，默认使用 SMS
          const otpType = (smstype as OtpType) || OtpType.SMS;
          // 非注册场景中，EMAIL 类型的 sender 从 result.email 获取
          const emailAddress = otpType === OtpType.EMAIL ? result?.email : undefined;
          const config = this.getOtpTypeConfig(otpType, phoneNumber, emailAddress);

          // 存储到 localStorage
          this.storage.store("localotptype", config.displayType);

          return {
            otpType: config.otpType,
            displayType: config.displayType,
            sender: config.sender,
            smstype: smstype,
            email: result?.email,
            fullResponse: result // 保存完整响应，供组件使用
          };
        })
      );
  }

  /**
   * 设置 OTP 类型和发送者信息到组件属性
   * 这个方法用于保持向后兼容，直接更新存储和返回结果
   * @param displayType 显示类型
   * @param sender 发送者
   * @returns 更新后的信息
   */
  setOtpTypeAndSender(displayType: OtpDisplayType, sender: string): { displayType: OtpDisplayType; sender: string } {
    this.storage.store("localotptype", displayType);
    return {
      displayType,
      sender: sender || ''
    };
  }

  /**
   * 类型字符串到显示类型的映射
   */
  private readonly typeMap: Record<string, OtpDisplayType> = {
    'vmg_viber': OtpDisplayType.VIBER,
    'email': OtpDisplayType.EMAIL,
    'sms': OtpDisplayType.SMS,
    'sms_poh': OtpDisplayType.SMS
  };

  /**
   * 将 OTP 类型字符串转换为 OtpDisplayType
   * @param type OTP 类型字符串（如 'vmg_viber', 'email', 'sms', 'sms_poh'）
   * @returns OtpDisplayType 显示类型
   */
  convertToDisplayType(type: string): OtpDisplayType {
    return this.typeMap[type] || OtpDisplayType.SMS;
  }

  /**
   * 从响应中推断 OTP 显示类型
   */
  inferDisplayTypeFromResponse(response: OtpResponse): OtpDisplayType | null {
    if (!response) return null;
    
    // 优先级1: 从 smstype 推断
    if (response.smstype) {
      return this.convertToDisplayType(response.smstype);
    }
    
    // 优先级2: 从 email 字段推断
    if (response.email || (response.to && response.to.includes('@'))) {
      return OtpDisplayType.EMAIL;
    }
    
    // 优先级3: 从 registeropttype 推断
    const registerOtpType = this.storage.retrieve(OtpStorageKeys.REGISTER_OTP_TYPE);
    if (registerOtpType) {
      return this.convertToDisplayType(registerOtpType);
    }
    
    return OtpDisplayType.SMS; // 默认
  }

  /**
   * 扩展 OTP 响应，添加按类型隔离的 request_ids
   * @param storageKey 存储键
   * @param newResponse 新的 OTP 响应
   * @param displayType 可选的显示类型（如果不提供，会尝试从响应或 localStorage 推断）
   * @returns 扩展后的响应对象
   */
  enhanceResponseWithRequestIds(storageKey: string, newResponse: OtpResponse, displayType?: OtpDisplayType): any {
    if (!newResponse?.request_id) {
      return newResponse;
    }
    
    // 获取显示类型：优先使用传入参数，其次从 localStorage 读取，最后从响应推断
    const currentDisplayType = displayType || 
                               (this.storage.retrieve(OtpStorageKeys.OTP_TYPE) as OtpDisplayType) ||
                               this.inferDisplayTypeFromResponse(newResponse);
    
    if (!currentDisplayType) {
      return newResponse;
    }
    
    // 合并 request_ids：从 storage 读取现有的 request_ids，避免覆盖
    const existingResponse = this.storage.retrieve(storageKey) || {};

    return {
      ...newResponse,
      request_ids: {
        ...(existingResponse.request_ids || {}),
        [currentDisplayType]: newResponse.request_id
      }
    };
  }

  /**
   * 确保 request_ids 存在（统一处理所有场景）
   * 在 OTP 页面初始化时调用，自动扩展 request_ids
   * @param scenario 场景枚举
   * @param currentDisplayType 当前显示类型（可选，如果不提供会从响应推断）
   */
  ensureRequestIdsExist(scenario: string, currentDisplayType?: OtpDisplayType): void {
    const storageKey = this.getStorageKeyByScenario(scenario);
    const otpResponse = this.storage.retrieve(storageKey);
    
    if (!otpResponse?.request_id || otpResponse.request_ids) {
      return;
    }
    
    const displayType = currentDisplayType || this.inferDisplayTypeFromResponse(otpResponse);
    if (!displayType) {
      console.warn('OTP: Cannot infer display type for request_ids extension');
      return;
    }
    
    this.storage.store(
      storageKey,
      this.enhanceResponseWithRequestIds(storageKey, otpResponse, displayType)
    );
  }

  /**
   * 统一发送 OTP 方法
   * @param scenario 发送场景
   * @param phoneNumber 电话号码（可选，某些场景需要）
   * @param token 认证 token（可选，某些场景需要）
   * @param additionalData 额外数据（可选，如 bankAccountList）
   * @returns Observable<OtpResponse> OTP 响应
   */
  sendOtp(
    scenario: OtpSendScenario | string,
    phoneNumber?: string,
    token?: string,
    additionalData?: any
  ): Observable<OtpResponse> {
    // 获取配置
    const config = this.sendConfig[scenario];
    if (!config) {
      throw new Error(`Unknown OTP send scenario: ${scenario}`);
    }

    // 构建完整 URL
    const baseUrl = config.baseUrl === 'apaddressv1' ? this.funct.apaddressv1 : this.funct.ipaddress;
    let fullUrl = baseUrl + config.url;
    
    // 如果 URL 包含 phoneNo 参数占位符，替换它
    if (phoneNumber && fullUrl.includes('phoneNo=')) {
      fullUrl = fullUrl + phoneNumber;
    }

    // 构建请求头
    let headers = new HttpHeaders();
    if (config.requiresAuth && token) {
      headers = headers.set('Authorization', token);
    }

    // 执行请求
    const request = config.method === 'POST'
      ? this.http.post(fullUrl, config.requestBody || additionalData, { headers })
      : this.http.get(fullUrl, { headers });

    return request.pipe(
      catchError(error => this.errorHandler.handleError(scenario, error)),
      map((result: any) => {
        // 验证响应（处理 status=false 等情况）
        const validatedResult = this.responseValidator.validateSendResponse(result);
        
        // 保存响应到 dto（保持与原始代码一致）
        this.dto.Response = validatedResult;
        
        // 存储到 localStorage（如果配置了 storageKey）
        if (config.storageKey) {
          // 对于注册和忘记密码场景，扩展响应对象以支持多个 request_id
          if (scenario === OtpSendScenario.REGISTER || scenario === OtpSendScenario.FORGET_PASSWORD) {
            const enhancedResponse = this.enhanceResponseWithRequestIds(config.storageKey, validatedResult);
            this.storage.store(config.storageKey, enhancedResponse);
          } else {
            this.storage.store(config.storageKey, validatedResult);
          }
        }

        // 存储额外数据（如 bankAccountList）
        if (additionalData && scenario === OtpSendScenario.WITHDRAW) {
          this.storage.store('localInsertBankAccountList', additionalData);
        }

        return validatedResult as OtpResponse;
      })
    );
  }

  /**
   * 重发 OTP（与 sendOtp 相同，但语义更清晰）
   * @param scenario 发送场景
   * @param phoneNumber 电话号码（可选）
   * @param token 认证 token（可选）
   * @param additionalData 额外数据（可选）
   * @returns Observable<OtpResponse> OTP 响应
   */
  resendOtp(
    scenario: OtpSendScenario | string,
    phoneNumber?: string,
    token?: string,
    additionalData?: any
  ): Observable<OtpResponse> {
    return this.sendOtp(scenario, phoneNumber, token, additionalData);
  }

  /**
   * 验证提现账户 OTP
   * @param code OTP 验证码
   * @param requestId 请求 ID
   * @param token 认证 token
   * @returns Observable<OtpResponse> OTP 验证响应
   */
  checkWithdrawOtp(code: string, requestId: string | number, token: string): Observable<OtpResponse> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', token);
    
    const url = this.funct.ipaddress + `transaction/withdrawcheckOTP?code=${code}&request_id=${requestId}`;
    
    return this.http.get(url, { headers })
      .pipe(
        catchError(error => this.errorHandler.handleError('checkWithdrawOtp', error)),
        map((result: any) => {
          this.dto.Response = result;
          return result as OtpResponse;
        })
      );
  }

  /**
   * 验证普通 OTP（注册/忘记密码场景）
   * @param phoneNo 电话号码
   * @param code OTP 验证码
   * @param requestId 请求 ID
   * @param smsType OTP 类型（可选）
   * @param token 认证 token（可选，忘记密码场景需要）
   * @param isForgetPassword 是否为忘记密码场景
   * @returns Observable<OtpResponse> OTP 验证响应
   */
  checkOtp(
    phoneNo: string,
    code: string,
    requestId: string | number,
    smsType?: string,
    token?: string,
    isForgetPassword: boolean = false
  ): Observable<OtpResponse> {
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', token);
    }

    let link: string;
    if (isForgetPassword) {
      link = `user/checkOTPXXx?phone_no=${phoneNo}&code=${code}&request_id=${requestId}`;
    } else {
      // 保持与原代码一致：如果 smsType 是 null/undefined，会转换为字符串 "null"/"undefined"
      // 但为了更安全，使用空字符串作为默认值
      const smsTypeParam = smsType != null ? smsType : '';
      link = `user/checkOTP?phone_no=${phoneNo}&code=${code}&request_id=${requestId}&smstype=${smsTypeParam}`;
    }

    const url = this.funct.ipaddress + link;

    return this.http.get(url, { headers })
      .pipe(
        catchError(error => this.errorHandler.handleError('checkOtp', error)),
        map((result: any) => {
          this.dto.Response = result;
          return result as OtpResponse;
        })
      );
  }

  /**
   * 插入用户银行账户
   * @param bankAccountList 银行账户列表
   * @param token 认证 token
   * @returns Observable<any> 插入结果
   */
  insertUserBankAccount(bankAccountList: any[], token: string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', token);

    const url = this.funct.ipaddress + 'userbankaccount/insertuserBankAccount';

    return this.http.post(url, bankAccountList, { headers })
      .pipe(
        catchError(error => this.errorHandler.handleError('insertUserBankAccount', error)),
        map((result: any) => {
          this.dto.Response = result;
          return result;
        })
      );
  }

  /**
   * 更新设备ID（新设备验证）
   * @param updateDeviceIdRequest 设备更新请求数据
   * @returns Observable<OtpResponse> 更新结果
   */
  updateDeviceId(updateDeviceIdRequest: UpdateDeviceIdRequest): Observable<OtpResponse> {
    const headers = new HttpHeaders();
    const url = this.funct.ipaddress + 'user/updateDeviceId';

    return this.http.post(url, updateDeviceIdRequest, { headers })
      .pipe(
        catchError(error => this.errorHandler.handleError('updateDeviceId', error)),
        map((result: any) => {
          this.dto.Response = result;
          return result as OtpResponse;
        })
      );
  }

  /**
   * 自动登录
   * @param loginModel 登录模型数据
   * @returns Observable<any> 登录响应
   */
  autoLogin(loginModel: any): Observable<any> {
    const headers = new HttpHeaders();
    const url = this.funct.ipaddress + 'Authenticate/login';

    return this.http.post(url, loginModel, { headers })
      .pipe(
        catchError(error => this.errorHandler.handleError('autoLogin', error)),
        map((result: any) => {
          this.dto.Response = result;
          return result;
        })
      );
  }

  /**
   * 获取服务电话列表
   * @returns Observable<ServicePhone[]> 服务电话列表
   */
  listServicePhones(): Observable<ServicePhone[]> {
    const headers = new HttpHeaders();
    const url = this.funct.ipaddress + 'service/listService?otp_page_show=true';

    return this.http.get(url, { headers })
      .pipe(
        catchError(error => this.errorHandler.handleError('listServicePhones', error)),
        map((result: any) => {
          this.dto.Response = result;
          return (result as ServicePhone[]) || [];
        })
      );
  }
}
