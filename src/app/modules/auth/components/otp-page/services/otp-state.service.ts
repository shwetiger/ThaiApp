import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { OtpType, OtpDisplayType, OtpScenario, FormType, ActionType } from '../models/otp-type.enum';
import { ServicePhone } from '../models/otp-models';
import { OtpService } from './otp-service';
import { OtpStorageKeys } from '../models/otp-storage-keys';
import { SERVICE_PHONE } from '../models/otp.constants';

/**
 * 表单状态
 */
export interface FormState {
  phoneNumber: string;
  email: string;
  otpType: OtpDisplayType;
  otpHeader: string;
  otpDescription: string;
  sender: string;
}

/**
 * UI 状态
 */
export interface UiState {
  isLoading: boolean;
  errorMessage: string;
}

/**
 * 场景状态
 */
export interface ScenarioState {
  /** 业务场景（统一标识） */
  scenario: OtpScenario | string;
  /** 注册时的 OTP 类型 */
  registerOtpType: OtpType | string;
  
  /** @deprecated 使用 scenario 替代 */
  formType?: FormType | string;
  /** @deprecated 使用 scenario 替代 */
  actionType?: string;
}

/**
 * 客服电话服务状态
 */
export interface ServicePhoneState {
  phones: ServicePhone[];
  showOnOtpPage: boolean;
}

/**
 * OTP 状态管理服务
 * 职责：
 * - 管理所有 localStorage 操作
 * - 提供统一的状态访问接口
 * - 初始化和清理状态
 */
@Injectable()
export class OtpStateService {
  // 状态 Subjects
  private formState$ = new BehaviorSubject<FormState>({
    phoneNumber: '',
    email: '',
    otpType: OtpDisplayType.SMS,
    otpHeader: '',
    otpDescription: '',
    sender: ''
  });
  
  private uiState$ = new BehaviorSubject<UiState>({
    isLoading: false,
    errorMessage: ''
  });
  
  private scenarioState$ = new BehaviorSubject<ScenarioState>({
    scenario: '',
    registerOtpType: ''
  });
  
  private servicePhoneState$ = new BehaviorSubject<ServicePhoneState>({
    phones: [],
    showOnOtpPage: false
  });
  
  constructor(
    private storage: LocalStorageService,
    private location: Location,
    private translate: TranslateService,
    private otpService: OtpService
  ) {}
  
  // ========== 获取状态 Observable ==========
  
  getFormState(): Observable<FormState> {
    return this.formState$.asObservable();
  }
  
  getUiState(): Observable<UiState> {
    return this.uiState$.asObservable();
  }
  
  getScenarioState(): Observable<ScenarioState> {
    return this.scenarioState$.asObservable();
  }
  
  getServicePhoneState(): Observable<ServicePhoneState> {
    return this.servicePhoneState$.asObservable();
  }
  
  // ========== 获取当前状态值（同步）==========
  
  getCurrentFormState(): FormState {
    return this.formState$.value;
  }
  
  getCurrentUiState(): UiState {
    return this.uiState$.value;
  }
  
  getCurrentScenarioState(): ScenarioState {
    return this.scenarioState$.value;
  }
  
  // ========== 初始化 ==========
  
  /**
   * 从 localStorage 加载状态
   */
  loadFromStorage(): void {
    // 读取新的场景标识
    let scenario = this.storage.retrieve(OtpStorageKeys.SCENARIO) as OtpScenario | string;
    
    const registerOtpType = this.storage.retrieve(OtpStorageKeys.REGISTER_OTP_TYPE) || '';
    
    this.scenarioState$.next({
      scenario,
      registerOtpType
    });
    
    // 加载基础表单信息
    const email = this.storage.retrieve(OtpStorageKeys.EMAIL_ADDRESS) || '';
    
    this.formState$.next({
      ...this.formState$.value,
      email
    });
    
    // 加载电话号码（有优先级逻辑）
    this.loadPhoneNumber();
    
    // 从缓存预设 OTP 类型文案（避免页面抖动）
    this.preloadOtpTypeFromCache();
  }
  
  /**
   * 加载电话号码（按优先级）
   * 优先级（从高到低）：
   * 1. localPhoneValue（用户直接输入）
   * 2. localInsertAccountOtpSms（提现OTP响应）
   * 3. localNewDeviceOtpSms（新设备OTP响应）
   */
  private loadPhoneNumber(): void {
    // 优先级1（最高）：从用户直接输入获取
    const localPhoneValue = this.storage.retrieve(OtpStorageKeys.PHONE_VALUE);
    if (localPhoneValue) {
      const prefix = this.storage.retrieve(OtpStorageKeys.PHONE_PREFIX) || '';
      const phoneNumber = localPhoneValue.startsWith('0')
        ? prefix + localPhoneValue.substring(1)
        : prefix + localPhoneValue;
      this.updatePhoneNumber(phoneNumber);
      return;
    }
    
    // 优先级2：从提现账户 OTP 响应获取
    const localInsertAccountOtpSms = this.storage.retrieve(OtpStorageKeys.WITHDRAW_ACCOUNT_OTP_RESPONSE);
    if (localInsertAccountOtpSms?.number) {
      this.updatePhoneNumber('+' + localInsertAccountOtpSms.number);
      return;
    }
    
    // 优先级3（最低）：从新设备 OTP 响应获取
    const localNewDeviceOtpSms = this.storage.retrieve(OtpStorageKeys.NEW_DEVICE_OTP_RESPONSE);
    if (localNewDeviceOtpSms?.number) {
      this.updatePhoneNumber('+' + localNewDeviceOtpSms.number);
    }
  }
  
  /**
   * 从缓存预加载 OTP 类型信息（避免页面抖动）
   * 立即使用缓存值设置文案，后续 API 会更新为最新值
   */
  private preloadOtpTypeFromCache(): void {
    const cachedOtpType = this.storage.retrieve(OtpStorageKeys.OTP_TYPE) as OtpDisplayType;
    
    if (!cachedOtpType) {
      return; // 没有缓存时不处理，等待 API
    }
    
    // 获取当前的 phoneNumber 和 email（刚在 loadPhoneNumber 中设置）
    const currentState = this.formState$.value;
    const sender = cachedOtpType === OtpDisplayType.EMAIL 
      ? currentState.email 
      : currentState.phoneNumber;
    
    // 生成文案
    const header = this.translate.instant('otpheader').replace('@type', cachedOtpType);
    const description = this.translate.instant('otpdescription').replace('@type', cachedOtpType);
    
    // 更新状态（使用缓存值）
    this.formState$.next({
      ...currentState,
      otpType: cachedOtpType,
      otpHeader: header,
      otpDescription: description,
      sender
    });
  }
  
  // ========== 更新状态 ==========
  
  updatePhoneNumber(phoneNumber: string): void {
    this.formState$.next({
      ...this.formState$.value,
      phoneNumber
    });
  }
  
  updateOtpTypeInfo(
    otpType: OtpDisplayType,
    sender: string,
    header: string,
    description: string
  ): void {
    this.formState$.next({
      ...this.formState$.value,
      otpType,
      sender,
      otpHeader: header,
      otpDescription: description
    });
  }
  
  setLoading(loading: boolean): void {
    this.uiState$.next({
      ...this.uiState$.value,
      isLoading: loading
    });
  }
  
  setError(message: string): void {
    this.uiState$.next({
      ...this.uiState$.value,
      errorMessage: message
    });
  }
  
  clearError(): void {
    this.uiState$.next({
      ...this.uiState$.value,
      errorMessage: ''
    });
  }
  
  // ========== 获取 localStorage 数据 ==========
  
  getDeviceId(): string | null {
    return this.storage.retrieve('localDeviceId');
  }
  
  getToken(): string | null {
    return this.storage.retrieve('token');
  }
  
  getOtpResponse(scenario: 'register' | 'newDevice' | 'withdraw'): any {
    const keyMap = {
      register: OtpStorageKeys.OTP_RESPONSE,
      newDevice: OtpStorageKeys.NEW_DEVICE_OTP_RESPONSE,
      withdraw: OtpStorageKeys.WITHDRAW_ACCOUNT_OTP_RESPONSE
    };
    
    return this.storage.retrieve(keyMap[scenario]);
  }
  
  getBankAccountList(): any[] {
    return this.storage.retrieve(OtpStorageKeys.BANK_ACCOUNT_LIST) || [];
  }
  
  getLoginModel(): any {
    return this.storage.retrieve(OtpStorageKeys.LOGIN_MODEL);
  }
  
  navigateBack(): void {
    this.location.back();
  }
  
  // ========== OTP 类型管理（从 OtpTypeService 合并）==========
  
  /**
   * 获取 OTP 类型信息
   * @param scenario 业务场景
   * @param phoneNumber 电话号码
   * @param email 邮箱
   * @returns Observable
   */
  loadOtpType(scenario: string, phoneNumber: string, email: string): Observable<void> {
    // 注册场景：同步获取
    if (scenario === OtpScenario.REGISTER) {
      const otpTypeInfo = this.getRegisterOtpTypeInfo(phoneNumber, email);
      this.updateOtpTypeInfo(
        otpTypeInfo.displayType,
        otpTypeInfo.sender,
        otpTypeInfo.header,
        otpTypeInfo.description
      );
      return new Observable(subscriber => {
        subscriber.next();
        subscriber.complete();
      });
    }
    
    // 其他场景：异步获取
    const registerOtpType = this.storage.retrieve(OtpStorageKeys.REGISTER_OTP_TYPE);
    const token = this.storage.retrieve('token');  // 注：未在 OtpStorageKeys 中定义
    
    return this.otpService.getOtpType(
      scenario,
      registerOtpType,
      phoneNumber,
      email,
      token
    ).pipe(
      tap(result => {
        // 存储 OTP 类型
        this.storage.store(OtpStorageKeys.OTP_TYPE, result.displayType);
        
        // 生成标题和描述
        const header = this.translate.instant('otpheader').replace('@type', result.displayType);
        const description = this.translate.instant('otpdescription').replace('@type', result.displayType);
        
        // 更新状态
        this.updateOtpTypeInfo(result.displayType, result.sender, header, description);
      }),
      map(() => void 0)
    );
  }
  
  /**
   * 为注册场景生成 OTP 类型信息（同步）
   */
  private getRegisterOtpTypeInfo(phoneNumber: string, email: string): {
    displayType: OtpDisplayType;
    sender: string;
    header: string;
    description: string;
  } {
    const registerOtpType = this.storage.retrieve(OtpStorageKeys.REGISTER_OTP_TYPE) as OtpType;
    
    let displayType: OtpDisplayType;
    let sender: string;
    
    if (registerOtpType === OtpType.VMG_VIBER) {
      displayType = OtpDisplayType.VIBER;
      sender = phoneNumber;
    } else if (registerOtpType === OtpType.EMAIL) {
      displayType = OtpDisplayType.EMAIL;
      sender = email;
    } else {
      displayType = OtpDisplayType.SMS;
      sender = phoneNumber;
    }
    
    // 存储类型
    this.storage.store(OtpStorageKeys.OTP_TYPE, displayType);
    
    // 生成标题和描述
    const header = this.translate.instant('otpheader').replace('@type', displayType);
    const description = this.translate.instant('otpdescription').replace('@type', displayType);
    
    return {
      displayType,
      sender,
      header,
      description
    };
  }
  
  // ========== 客服电话管理（从 ServicePhoneService 合并）==========
  
  /**
   * 加载客服电话列表
   */
  loadServicePhones(): Observable<ServicePhone[]> {
    // 先从缓存加载
    const cached = this.storage.retrieve(OtpStorageKeys.SERVICE_PHONE_LIST);
    if (cached) {
      this.updateServicePhoneState(cached);
    }
    
    // 从 API 加载最新数据
    return this.otpService.listServicePhones()
      .pipe(
        tap(phones => {
          this.updateServicePhoneState(phones);
          this.storage.store(OtpStorageKeys.SERVICE_PHONE_LIST, phones);
        })
      );
  }
  
  /**
   * 更新客服电话状态
   */
  private updateServicePhoneState(phones: ServicePhone[]): void {
    const showOnOtpPage = phones?.some(
      phone => phone.title === SERVICE_PHONE.CUSTOMER_SERVICE_TITLE && phone.otp_page_show === true
    ) || false;
    
    this.servicePhoneState$.next({
      phones,
      showOnOtpPage
    });
  }
    
  /**
   * 组件销毁时清理内存状态
   * 注意：不清理 localStorage，因为刷新页面需要恢复状态
   */
  cleanup(): void {
    // 重置 UI 状态
    this.uiState$.next({
      isLoading: false,
      errorMessage: ''
    });
    
    // 重置表单状态（避免下次进入时短暂显示旧数据）
    this.formState$.next({
      phoneNumber: '',
      email: '',
      otpType: OtpDisplayType.SMS,
      otpHeader: '',
      otpDescription: '',
      sender: ''
    });
  }
}


