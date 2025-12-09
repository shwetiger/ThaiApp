import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { OtpType, OtpDisplayType, OtpScenario } from '../models/otp-type.enum';
import { IServicePhone } from '../models/otp-models';
import { OtpService } from './otp.service';
import { OtpStorageKeys } from '../models/otp-storage-keys';
import { SERVICE_PHONE } from '../models/otp-constants';

/**
 * OTP 状态接口
 */
export interface IOtpState {
  /** 表单状态 */
  form: {
    phoneNumber: string;
    email: string;
    otpType: OtpDisplayType;
    otpHeader: string;
    otpDescription: string;
    sender: string;
  };
  /** UI 状态 */
  ui: {
    isLoading: boolean;
    isResending: boolean;
    errorMessage: string;
  };
  /** 场景状态 */
  scenario: {
    scenario: OtpScenario | string;
    registerOtpType: OtpType | string;
  };
  /** 客服电话状态 */
  servicePhones: {
    phones: IServicePhone[];
    showOnOtpPage: boolean;
  };
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
  private formState$ = new BehaviorSubject<IOtpState['form']>({
    phoneNumber: '',
    email: '',
    otpType: OtpDisplayType.SMS,
    otpHeader: '',
    otpDescription: '',
    sender: ''
  });
  
  private uiState$ = new BehaviorSubject<IOtpState['ui']>({
    isLoading: false,
    isResending: false,
    errorMessage: ''
  });
  
  private scenarioState$ = new BehaviorSubject<IOtpState['scenario']>({
    scenario: '',
    registerOtpType: ''
  });
  
  private servicePhoneState$ = new BehaviorSubject<IOtpState['servicePhones']>({
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
  
  getState(): Observable<IOtpState> {
    return combineLatest([
      this.formState$,
      this.uiState$,
      this.scenarioState$,
      this.servicePhoneState$
    ]).pipe(
      map(([form, ui, scenario, servicePhones]) => ({
        form,
        ui,
        scenario,
        servicePhones
      }))
    );
  }
  
  getCurrentState(): IOtpState {
    return {
      form: this.formState$.value,
      ui: this.uiState$.value,
      scenario: this.scenarioState$.value,
      servicePhones: this.servicePhoneState$.value
    };
  }
  
  // ========== 场景管理 ==========
  
  setScenario(scenario: OtpScenario | string): void {
    this.storage.store(OtpStorageKeys.SCENARIO, scenario);
    this.scenarioState$.next({
      ...this.scenarioState$.value,
      scenario
    });
  }
  
  // ========== 获取 OTP 响应 ==========
  
  /**
   * 获取 OTP 响应（统一从 OTP_RESPONSE 读取）
   */
  getOtpResponse(): any {
    return this.storage.retrieve(OtpStorageKeys.OTP_RESPONSE);
  }
  
  // ========== 表单状态管理 ==========
  
  setPhoneNumber(phone: string): void {
    // 简化方案：电话号码从响应中获取，不单独存储
    this.formState$.next({
      ...this.formState$.value,
      phoneNumber: phone
    });
  }
  
  setEmail(email: string): void {
    // 简化方案：邮箱从响应中获取，不单独存储
    this.formState$.next({
      ...this.formState$.value,
      email
    });
  }
  
  /**
   * 设置 OTP 业务类型
   * 注意：存储的是业务类型（OtpType），UI 显示类型（OtpDisplayType）不存储，需要时从业务类型转换
   */
  setOtpType(type: OtpType): void {
    // 存储业务类型到 localStorage
    this.storage.store(OtpStorageKeys.OTP_TYPE, type);
    
    // 转换为显示类型用于 UI（不存储，仅用于内存状态）
    const displayType = this.convertToDisplayType(type);
    this.formState$.next({
      ...this.formState$.value,
      otpType: displayType
    });
  }
  
  /**
   * 将业务类型转换为显示类型
   */
  private convertToDisplayType(otpType: OtpType): OtpDisplayType {
    const typeMap: Record<OtpType, OtpDisplayType> = {
      [OtpType.VMG_VIBER]: OtpDisplayType.VIBER,
      [OtpType.EMAIL]: OtpDisplayType.EMAIL,
      [OtpType.SMS]: OtpDisplayType.SMS
    };
    return typeMap[otpType] || OtpDisplayType.SMS;
  }
  
  // ========== UI 状态管理 ==========
  
  setLoading(loading: boolean): void {
    this.uiState$.next({
      ...this.uiState$.value,
      isLoading: loading
    });
  }
  
  setError(error: string | null): void {
    this.uiState$.next({
      ...this.uiState$.value,
      errorMessage: error || ''
    });
  }
  
  clearError(): void {
    this.uiState$.next({
      ...this.uiState$.value,
      errorMessage: ''
    });
  }
  
  // ========== 清理 ==========
  
  clearAll(): void {
    // 清理内存状态
    this.formState$.next({
      phoneNumber: '',
      email: '',
      otpType: OtpDisplayType.SMS,
      otpHeader: '',
      otpDescription: '',
      sender: ''
    });
    
    this.uiState$.next({
      isLoading: false,
      isResending: false,
      errorMessage: ''
    });
    
    this.scenarioState$.next({
      scenario: '',
      registerOtpType: ''
    });
    
    this.servicePhoneState$.next({
      phones: [],
      showOnOtpPage: false
    });
    
    // 注意：不清理 localStorage，因为刷新页面需要恢复状态
  }
}
