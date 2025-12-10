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
    isSubmit: boolean;
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
  /** 倒计时状态 */
  countdown: {
    remainingSeconds: number;
    canResend: boolean;
  };
  /** 设备信息 */
  device: {
    openUrl: string;
  };
}

/**
 * OTP 状态管理服务
 * 
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
    isSubmit: false,
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
  
  private countdownState$ = new BehaviorSubject<IOtpState['countdown']>({
    remainingSeconds: 0,
    canResend: true
  });
  
  private deviceState$ = new BehaviorSubject<IOtpState['device']>({
    openUrl: ''
  });
  
  constructor(
    private storage: LocalStorageService,
    private translate: TranslateService,
    private otpService: OtpService
  ) {}
  
  // ========== 获取状态 Observable ==========
  
  getState(): Observable<IOtpState> {
    return combineLatest([
      this.formState$,
      this.uiState$,
      this.scenarioState$,
      this.servicePhoneState$,
      this.countdownState$,
      this.deviceState$
    ]).pipe(
      map(([form, ui, scenario, servicePhones, countdown, device]) => ({
        form,
        ui,
        scenario,
        servicePhones,
        countdown,
        device
      }))
    );
  }
  
  getCurrentState(): IOtpState {
    return {
      form: this.formState$.value,
      ui: this.uiState$.value,
      scenario: this.scenarioState$.value,
      servicePhones: this.servicePhoneState$.value,
      countdown: this.countdownState$.value,
      device: this.deviceState$.value
    };
  }
  
  // ========== 场景管理 ==========
  
  /**
   * 设置场景（只更新内存状态，不存储到 localStorage）
   */
  setScenario(scenario: OtpScenario | string): void {
    this.scenarioState$.next({
      ...this.scenarioState$.value,
      scenario
    });
  }
  
  /**
   * 获取 OTP 响应（统一从 OTP_RESPONSE 读取）
   */
  getOtpResponse(): any {
    return this.storage.retrieve(OtpStorageKeys.OTP_RESPONSE);
  }
  
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
   * 设置 OTP 业务类型并更新所有相关字段
   * 
   * 注意：此方法只负责更新内存状态，不负责存储到 localStorage。
   * OTP 类型的存储由 OtpService 统一处理。
   * 
   * @param type OTP类型
   * @param phoneNumber 电话号码（用于生成 sender）
   * @param email 邮箱（用于生成 sender，当类型为 EMAIL 时）
   */
  private setOtpType(type: OtpType, phoneNumber?: string, email?: string): void {
    // 注意：不存储到 localStorage，存储由 OtpService 统一处理
    
    // 转换为显示类型
    const displayType = this.convertToDisplayType(type);
    
    // 生成 sender（根据类型选择 phoneNumber 或 email）
    const sender = type === OtpType.EMAIL ? (email || '') : (phoneNumber || '');
    
    // 生成 header 和 description
    const header = this.translate.instant('otpheader').replace('@type', displayType);
    const description = this.translate.instant('otpdescription').replace('@type', displayType);
    
    // 更新所有相关字段（只更新内存状态）
    this.formState$.next({
      ...this.formState$.value,
      otpType: displayType,
      otpHeader: header,
      otpDescription: description,
      sender: sender
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
  
  setSubmited(isSubmit: boolean): void {
    this.uiState$.next({
      ...this.uiState$.value,
      isSubmit: isSubmit
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
  
  setResending(resending: boolean): void {
    this.uiState$.next({
      ...this.uiState$.value,
      isResending: resending
    });
  }
  
  // ========== 倒计时状态管理 ==========
  
  updateCountdown(countdown: IOtpState['countdown']): void {
    this.countdownState$.next(countdown);
  }
  
  // ========== 设备状态管理 ==========
  
  updateDevice(device: IOtpState['device']): void {
    this.deviceState$.next(device);
  }
  
  // ========== 初始化方法 ==========
  
  /**
   * 从 localStorage 加载状态
   */
  loadFromStorage(): void {
    const scenario = this.storage.retrieve(OtpStorageKeys.SCENARIO) as OtpScenario | string;
    const email = this.storage.retrieve(OtpStorageKeys.REGISTER_EMAIL) || '';

    this.setScenario(scenario);
    this.setEmail(email);

    // 电话号码只能从缓存中获取，因为响应中 to 不一定是电话号码，有可能是邮箱地址
    const phoneNumber = this.otpService.getPhoneNumber();
    this.setPhoneNumber(phoneNumber);
    // 从响应中获取电话号码
    // const otpResponse = this.getOtpResponse();
    // if (otpResponse?.to) {
    //   this.setPhoneNumber(phoneNumber);
    // }
  }
  
  /**
   * 加载 OTP 类型信息
   * 
   */
  loadOtpType(scenario: string, phoneNumber: string, email: string): Observable<void> {
    return this.otpService.getOtpType(scenario, phoneNumber, email).pipe(
      tap(result => {
        console.log('loadOtpType result:', result)
        // 更新内存状态
        this.setOtpType(result.otpType, phoneNumber, result.email);
      }),
      map(() => void 0)
    );
  }
  
  /**
   * 加载客服电话
   */
  loadServicePhones(): Observable<void> {
    return this.otpService.listServicePhones().pipe(
      tap(phones => {
        const showOnOtpPage = phones?.some(
          phone => phone.title === SERVICE_PHONE.CUSTOMER_SERVICE_TITLE && phone.otp_page_show === true
        ) || false;
        
        this.servicePhoneState$.next({
          phones: phones || [],
          showOnOtpPage
        });
      }),
      map(() => void 0)
    );
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
      isSubmit: false,
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
    
    this.countdownState$.next({
      remainingSeconds: 0,
      canResend: true
    });
    
    this.deviceState$.next({
      openUrl: ''
    });
    
    // 注意：不清理 localStorage，因为刷新页面需要恢复状态
  }
}
