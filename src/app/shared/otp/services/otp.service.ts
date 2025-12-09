import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { OtpType, OtpDisplayType, OtpScenario } from '../models/otp-type.enum';
import { IOtpResponse, IUpdateDeviceIdRequest, IServicePhone, IUserSmsTypeResponse, IOtpRequestInfo, IOtpRequestInfoMap, IBankAccount } from '../models/otp-models';
import { OtpStorageKeys } from '../models/otp-storage-keys';
import { IRegisterOtpParams, IForgetPasswordOtpParams, INewDeviceOtpParams, IWithdrawOtpParams, ISwitchOtpTypeParams, IOtpVerificationParams, IWithdrawOtpVerificationParams } from '../models/otp-params';
import { OTP_TYPE_CONFIG, OTP_SEND_CONFIG } from '../models/otp-config';
import { OtpErrorHandlerService } from './otp-error-handler.service';
import { OtpResponseValidatorService } from './otp-response-validator.service';

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  constructor(
    private http: HttpClient,
    private storage: LocalStorageService,
    private funct: FunctService,
    private dto: DtoService,
    private errorHandler: OtpErrorHandlerService,
    private responseValidator: OtpResponseValidatorService
  ) {}

  /**
   * 发送注册 OTP
   */
  sendRegisterOtp(params: IRegisterOtpParams): Observable<IOtpResponse> {
    const phoneNumber = params.phoneNumber;
    const config = OTP_SEND_CONFIG[OtpScenario.REGISTER];
    const baseUrl = config.baseUrl === 'apaddressv1' ? this.funct.apaddressv1 : this.funct.ipaddress;
    
    // 构建完整的 URL，包含 phoneNo、type 和 email 参数
    const otpType = (params.type as OtpType) || OtpType.SMS;
    const email = params.email || '';
    const fullUrl = `${baseUrl}${config.url}${phoneNumber}&type=${otpType}&email=${email}`;

    return this.http.get(fullUrl).pipe(
      catchError(error => this.errorHandler.handleError(OtpScenario.REGISTER, error)),
      map((result: any) => {
        // 验证响应（处理 status=false 等情况）
        const validatedResult = this.responseValidator.validateSendResponse(result);
                
        // 设置场景标识和 OTP 类型，并存储响应（封装方法确保执行顺序）
        this.storeOtpResponse(OtpScenario.REGISTER, validatedResult, otpType);

        return validatedResult as IOtpResponse;
      })
    );
  }

  /**
   * 发送忘记密码 OTP
   */
  sendForgetPasswordOtp(params: IForgetPasswordOtpParams): Observable<IOtpResponse> {
    const phoneNumber = params.phoneNumber;
    const config = OTP_SEND_CONFIG[OtpScenario.FORGET_PASSWORD];
    const baseUrl = config.baseUrl === 'apaddressv1' ? this.funct.apaddressv1 : this.funct.ipaddress;
    const fullUrl = baseUrl + config.url + phoneNumber;

    return this.http.get(fullUrl).pipe(
      catchError(error => this.errorHandler.handleError(OtpScenario.FORGET_PASSWORD, error)),
      map((result: any) => {
        const validatedResult = this.responseValidator.validateSendResponse(result);
                
        // 存储响应（OTP_TYPE 已在 getUserSmsType 中设置，封装方法确保执行顺序）
        this.storeOtpResponse(OtpScenario.FORGET_PASSWORD, validatedResult);

        return validatedResult as IOtpResponse;
      })
    );
  }

  /**
   * 发送新设备 OTP
   */
  sendNewDeviceOtp(params: INewDeviceOtpParams): Observable<IOtpResponse> {
    const phoneNumber = params.phoneNumber;
    const config = OTP_SEND_CONFIG[OtpScenario.NEW_DEVICE];
    const baseUrl = config.baseUrl === 'apaddressv1' ? this.funct.apaddressv1 : this.funct.ipaddress;
    const fullUrl = baseUrl + config.url + phoneNumber;

    let headers = new HttpHeaders();
    if (params.token) {
      headers = headers.set('Authorization', params.token);
    }

    return this.http.get(fullUrl, { headers }).pipe(
      catchError(error => this.errorHandler.handleError(OtpScenario.NEW_DEVICE, error)),
      map((result: any) => {
        const validatedResult = this.responseValidator.validateSendResponse(result);
                
        // 存储响应（OTP_TYPE 已在 getUserSmsType 中设置，封装方法确保执行顺序）
        this.storeOtpResponse(OtpScenario.NEW_DEVICE, validatedResult);

        return validatedResult as IOtpResponse;
      })
    );
  }

  /**
   * 发送提现 OTP
   */
  sendWithdrawOtp(params: IWithdrawOtpParams): Observable<IOtpResponse> {
    const config = OTP_SEND_CONFIG[OtpScenario.WITHDRAW_INSERT];
    const baseUrl = config.baseUrl === 'apaddressv1' ? this.funct.apaddressv1 : this.funct.ipaddress;
    const fullUrl = baseUrl + config.url;

    let headers = new HttpHeaders();
    if (params.token) {
      headers = headers.set('Authorization', params.token);
    }

    return this.http.get(fullUrl, { headers }).pipe(
      catchError(error => this.errorHandler.handleError(OtpScenario.WITHDRAW_INSERT, error)),
      map((result: any) => {
        const validatedResult = this.responseValidator.validateSendResponse(result);
                
        // 存储银行账户列表
        if (params.bankAccountList) {
          this.storage.store(OtpStorageKeys.BANK_ACCOUNT_LIST, params.bankAccountList);
        }

        // 存储响应（OTP_TYPE 已在 getUserSmsType 中设置，封装方法确保执行顺序）
        this.storeOtpResponse(OtpScenario.WITHDRAW_INSERT, validatedResult);

        return validatedResult as IOtpResponse;
      })
    );
  }

  /**
   * 切换 OTP 类型并发送
   * 
   * 功能：
   * - 如果提供了 otpType，直接使用，不调用 getOtpType（避免重复请求）
   * - 如果没有提供 otpType，从服务端获取 OTP 类型
   * - 从 localStorage 读取场景相关参数（如 bankAccountList）
   * - 调用对应的发送方法，传递完整参数
   * 
   * @param params 切换参数
   * @returns Observable<IOtpResponse>
   */
  switchOtpTypeAndSend(params: ISwitchOtpTypeParams): Observable<IOtpResponse> {
    // 如果提供了 otpType，直接使用，不调用 getOtpType
    if (params.otpType) {
      // 先存储 OTP 类型，确保后续方法能获取到
      this.storage.store(OtpStorageKeys.OTP_TYPE, params.otpType);
      return this.sendOtpByScenario(params, params.otpType);
    }
    
    // 如果没有提供 otpType，从服务端获取（保持向后兼容）
    return this.getOtpType(
      params.scenario,
      undefined,
      params.phoneNumber,
      params.email,
      params.token
    ).pipe(
      map(otpTypeResult => {
        // 存储 OTP 类型（getOtpType 内部已存储，但确保一致性）
        this.storage.store(OtpStorageKeys.OTP_TYPE, otpTypeResult.otpType);
        return this.sendOtpByScenario(params, otpTypeResult.otpType);
      }),
      // 展开嵌套的 Observable
      switchMap(obs => obs)
    );
  }

  /**
   * 根据场景发送 OTP（私有方法，提取公共逻辑）
   * 
   * @param params 切换参数
   * @param otpType OTP 类型（仅用于注册场景）
   * @returns Observable<IOtpResponse>
   */
  private sendOtpByScenario(params: ISwitchOtpTypeParams, otpType: OtpType): Observable<IOtpResponse> {
    if (params.scenario === OtpScenario.REGISTER) {
      return this.sendRegisterOtp({
        phoneNumber: params.phoneNumber,
        email: params.email || '',
        type: otpType
      });
    } else if (params.scenario === OtpScenario.FORGET_PASSWORD) {
      return this.sendForgetPasswordOtp({ 
        phoneNumber: params.phoneNumber
       });
    } else if (params.scenario === OtpScenario.NEW_DEVICE) {
      return this.sendNewDeviceOtp({ 
        phoneNumber: params.phoneNumber, 
        token: params.token 
      });
    } else if (params.scenario === OtpScenario.WITHDRAW_INSERT) {
      // 提现场景：需要从 localStorage 读取 bankAccountList
      const bankAccountList = this.storage.retrieve(OtpStorageKeys.BANK_ACCOUNT_LIST) as IBankAccount[] || [];
      
      if (!params.token) {
        throw new Error('Token is required for withdraw scenario');
      }
      
      return this.sendWithdrawOtp({
        token: params.token,
        bankAccountList: bankAccountList
      });
    } else {
      throw new Error(`Unsupported scenario for switch: ${params.scenario}`);
    }
  }

  /**
   * 验证 OTP
   */
  verifyOtp(params: IOtpVerificationParams): Observable<IOtpResponse> {
    let headers = new HttpHeaders();
    if (params.token) {
      headers = headers.set('Authorization', params.token);
    }

    let link: string;
    if (params.isForgetPassword) {
      link = `user/checkOTPXXx?phone_no=${params.phoneNumber}&code=${params.code}&request_id=${params.requestId}`;
    } else {
      const smsTypeParam = params.smsType != null ? params.smsType : '';
      link = `user/checkOTP?phone_no=${params.phoneNumber}&code=${params.code}&request_id=${params.requestId}&smstype=${smsTypeParam}`;
    }

    const url = this.funct.ipaddress + link;

    return this.http.get(url, { headers }).pipe(
      catchError(error => this.errorHandler.handleError('checkOtp', error)),
      map((result: any) => {
        this.dto.Response = result;
        return result as IOtpResponse;
      })
    );
  }

  /**
   * 验证提现 OTP
   */
  verifyWithdrawOtp(params: IWithdrawOtpVerificationParams): Observable<IOtpResponse> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', params.token);
    
    const url = this.funct.ipaddress + `transaction/withdrawcheckOTP?code=${params.code}&request_id=${params.requestId}`;
    
    return this.http.get(url, { headers }).pipe(
      catchError(error => this.errorHandler.handleError('checkWithdrawOtp', error)),
      map((result: any) => {
        this.dto.Response = result;
        return result as IOtpResponse;
      })
    );
  }

  /**
   * 获取 OTP 类型和发送者信息
   */
  getOtpType(
    formType: string,
    registerOtpType?: string,
    phoneNumber?: string,
    emailAddress?: string,
    token?: string
  ): Observable<any> {
    // 注册场景：直接返回结果
    if (formType === OtpScenario.REGISTER) {
      return of(this.getRegisterOtpType(registerOtpType, phoneNumber, emailAddress));
    }
    
    // 非注册场景：需要调用 API
    return this.getUserSmsType(phoneNumber, token);
  }

  /**
   * 根据 OTP 类型获取配置信息
   */
  private getOtpTypeConfig(
    otpType: OtpType,
    phoneNumber?: string,
    emailAddress?: string
  ): { otpType: OtpType; displayType: OtpDisplayType; sender: string } {
    const config = OTP_TYPE_CONFIG[otpType];

    return {
      otpType: otpType,
      displayType: config.displayType,
      sender: config.getSender(phoneNumber, emailAddress)
    };
  }

  /**
   * 获取注册场景的 OTP 类型
   */
  private getRegisterOtpType(
    registerOtpType?: string,
    phoneNumber?: string,
    emailAddress?: string
  ): any {
    const otpType = (registerOtpType as OtpType) || OtpType.SMS;
    const config = this.getOtpTypeConfig(otpType, phoneNumber, emailAddress);

    this.storage.store(OtpStorageKeys.OTP_TYPE, otpType);

    return {
      otpType: config.otpType,
      displayType: config.displayType,
      sender: config.sender
    };
  }

  /**
   * 获取用户短信类型（非注册场景）
   */
  private getUserSmsType(phoneNumber?: string, token?: string): Observable<any> {
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', token);
    }

    return this.http.get<IUserSmsTypeResponse>(this.funct.ipaddress + 'user/userSmsType?phone_no=' + phoneNumber, { headers })
      .pipe(
        catchError(error => this.errorHandler.handleError('getUserSmsType', error)),
        map((result: IUserSmsTypeResponse) => {

          const smstype = result?.smstype;

          const otpType = (smstype as OtpType) || OtpType.SMS;
          const emailAddress = otpType === OtpType.EMAIL ? result?.email : undefined;
          const config = this.getOtpTypeConfig(otpType, phoneNumber, emailAddress);

          this.storage.store(OtpStorageKeys.OTP_TYPE, otpType);

          return {
            otpType: config.otpType,
            displayType: config.displayType,
            sender: config.sender,
            smstype: smstype,
            email: result?.email,
            fullResponse: result
          };
        })
      );
  }

  /**
   * 存储 OTP 响应到 localStorage
   * 
   * 封装了完整的存储流程，确保执行顺序：
   * 1. 设置场景标识（SCENARIO）
   * 2. 设置 OTP 业务类型（OTP_TYPE）
   * 3. 存储响应到 OTP_RESPONSE（保持原样，不修改）
   * 4. 存储当前类型的请求信息到 OTP_REQUEST_INFO
   * 
   * @param scenario OTP 场景
   * @param response OTP 响应
   * @param otpType OTP 业务类型（可选，如果未提供则从 localStorage 读取）
   */
  private storeOtpResponse(
    scenario: OtpScenario,
    response: IOtpResponse,
    otpType?: OtpType
  ): void {
    // 1. 设置场景标识
    this.storage.store(OtpStorageKeys.SCENARIO, scenario);
    
    // 2. 设置 OTP 业务类型（如果未提供，从 localStorage 读取）
    if (!otpType) {
      otpType = this.storage.retrieve(OtpStorageKeys.OTP_TYPE) as OtpType;
      if (!otpType) {
        console.error('OTP type is required but not found');
        return;
      }
    }
    this.storage.store(OtpStorageKeys.OTP_TYPE, otpType);
    
    // 3. 存储服务端返回的响应
    this.storage.store(OtpStorageKeys.OTP_RESPONSE, response);
    
    // 4. 存储当前类型的请求信息到 OTP_REQUEST_INFO
    if (response.request_id && (response.expired_at || response.expire_at)) {
      const requestInfoMap: IOtpRequestInfoMap = this.storage.retrieve(OtpStorageKeys.OTP_REQUEST_INFO) || {};
      
      requestInfoMap[otpType] = {
        request_id: response.request_id,
        expires_at: response.expired_at || response.expire_at!
      };
      
      this.storage.store(OtpStorageKeys.OTP_REQUEST_INFO, requestInfoMap);
    }
  }

  /**
   * 插入用户银行账户
   */
  insertUserBankAccount(bankAccountList: any[], token: string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', token);

    const url = this.funct.ipaddress + 'userbankaccount/insertuserBankAccount';

    return this.http.post(url, bankAccountList, { headers }).pipe(
      catchError(error => this.errorHandler.handleError('insertUserBankAccount', error)),
      map((result: any) => {
        return result;
      })
    );
  }

  /**
   * 更新设备ID（新设备验证）
   */
  updateDeviceId(updateDeviceIdRequest: IUpdateDeviceIdRequest): Observable<IOtpResponse> {
    const headers = new HttpHeaders();
    const url = this.funct.ipaddress + 'user/updateDeviceId';

    return this.http.post(url, updateDeviceIdRequest, { headers }).pipe(
      catchError(error => this.errorHandler.handleError('updateDeviceId', error)),
      map((result: any) => {
        return result as IOtpResponse;
      })
    );
  }

  /**
   * 自动登录
   */
  autoLogin(loginModel: any): Observable<any> {
    const headers = new HttpHeaders();
    const url = this.funct.ipaddress + 'Authenticate/login';

    return this.http.post(url, loginModel, { headers }).pipe(
      catchError(error => this.errorHandler.handleError('autoLogin', error)),
      map((result: any) => {
        return result;
      })
    );
  }

  /**
   * 获取服务电话列表
   */
  listServicePhones(): Observable<IServicePhone[]> {
    const headers = new HttpHeaders();
    const url = this.funct.ipaddress + 'service/listService?otp_page_show=true';

    return this.http.get(url, { headers }).pipe(
      catchError(error => this.errorHandler.handleError('listServicePhones', error)),
      map((result: any) => {
        return (result as IServicePhone[]) || [];
      })
    );
  }

  // ========== 外部接口方法：统一提供数据访问 ==========

  /**
   * 获取当前 OTP 类型的 request_id
   * @returns request_id，如果不存在返回 null
   */
  getCurrentRequestId(): string | number | null {
    return this.getRequestInfo()?.request_id || null;
  }

  /**
   * 获取当前 OTP 类型的过期时间
   * @returns expires_at 字符串，如果不存在返回 null
   */
  getCurrentExpiresAt(): string | null {
    return this.getRequestInfo()?.expires_at || null;
  }

  /**
   * 获取指定 OTP 类型的请求信息
   * @param otpType OTP 类型，如果不提供则使用当前类型
   * @returns IOtpRequestInfo 或 null
   */
  getRequestInfo(): IOtpRequestInfo | null {
    const currentOtpType = this.storage.retrieve(OtpStorageKeys.OTP_TYPE) as OtpType;
    const requestInfoMap = this.storage.retrieve(OtpStorageKeys.OTP_REQUEST_INFO) as IOtpRequestInfoMap;
    return requestInfoMap?.[currentOtpType] || null;
  }

  /**
   * 获取当前 OTP 响应（保持原样，不修改）
   * @returns IOtpResponse 或 null
   */
  getCurrentOtpResponse(): IOtpResponse | null {
    return this.storage.retrieve(OtpStorageKeys.OTP_RESPONSE) as IOtpResponse || null;
  }

  /**
   * 清理所有 OTP 相关数据
   */
  clearOtpData(): void {
    this.storage.clear(OtpStorageKeys.OTP_RESPONSE);
    this.storage.clear(OtpStorageKeys.OTP_REQUEST_INFO);
    this.storage.clear(OtpStorageKeys.SCENARIO);
    this.storage.clear(OtpStorageKeys.OTP_TYPE);
    this.storage.clear(OtpStorageKeys.OTP_EXPIRES_AT);
    this.storage.clear(OtpStorageKeys.BANK_ACCOUNT_LIST);
    this.storage.clear(OtpStorageKeys.LOGIN_MODEL);
    this.storage.clear(OtpStorageKeys.INSERT_ACCOUNT);
  }
}
