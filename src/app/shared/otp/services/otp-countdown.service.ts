import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { OtpService } from './otp.service';
import { OtpStorageKeys } from '../models/otp-storage-keys';

/**
 * 倒计时状态接口
 */
export interface ICountdownState {
  /** 剩余秒数 */
  remainingSeconds: number;
  /** 是否已过期 */
  isExpired: boolean;
  /** 是否可以重发 */
  canResend: boolean;
  /** OTP 发送时间 */
  sentAt: Date | null;
  /** 到期时间 */
  expiresAt: Date | null;
}

/**
 * 倒计时缓存数据接口
 */
interface ICountdownCacheData {
  /** 客户端第一次访问时间（客户端时间戳） */
  clientFirstAccess: number;
  /** 当前 OTP 的 request_id（用于检测变化） */
  requestId: string | number;
}

/**
 * 倒计时缓存 Map 类型
 */
type CountdownCacheMap = {
  [otpType: string]: ICountdownCacheData;
};

/**
 * OTP 倒计时服务
 * 职责：
 * - 管理倒计时逻辑
 * - 持久化倒计时状态（刷新页面可恢复）
 * - 提供倒计时状态的 Observable
 * - 以服务器时间为准，不受客户端时间偏差影响
 */
@Injectable()
export class OtpCountdownService implements OnDestroy {
  // OTP 最大有效期为 180 秒（3分钟）
  private readonly MAX_OTP_DURATION_SECONDS = 180;
  
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private targetTime: Date | null = null;
  private sentAt: Date | null = null;
  
  // 使用 BehaviorSubject 管理状态，组件可订阅
  private countdownState$ = new BehaviorSubject<ICountdownState>({
    remainingSeconds: 0,
    isExpired: true,
    canResend: true,
    sentAt: null,
    expiresAt: null,
  });
  
  constructor(
    private otpService: OtpService,
    private storage: LocalStorageService
  ) {}
  

  /**
   * 从缓存恢复倒计时（统一启动入口）
   * 
   * 核心逻辑：
   * 1. 获取服务器时间数据（expires_at, sent_at, request_id）
   * 2. 计算总时长（服务器时间差，准确）
   * 3. 检测 OTP 变化（通过 request_id）
   * 4. 计算客户端认为的到期时间（固定基准 + 总时长）
   * 5. 计算剩余时间（客户端相对时间，准确）
   */
  restoreFromCache(): void {
    this.stop();
    
    // ========== 步骤1: 获取服务器数据 ==========
    const currentOtpType = this.getCurrentOtpType();
    const requestInfo = this.otpService.getRequestInfo();
    
    if (!requestInfo || !currentOtpType) {
      console.warn('OTP countdown: missing request info or OTP type');
      this.reset(0);
      return;
    }
    
    const { request_id, expires_at, sent_at } = requestInfo;
    
    if (!request_id || !expires_at || !sent_at) {
      console.warn('OTP countdown: incomplete request info', { request_id, expires_at, sent_at });
      this.reset(0);
      return;
    }
    
    // ========== 步骤2: 解析服务器时间 ==========
    const expiredAt = this.parseServerTime(expires_at);
    const serverStartAt = this.parseServerTime(sent_at);
    
    if (!this.isValidDate(expiredAt) || !this.isValidDate(serverStartAt)) {
      console.error('OTP countdown: invalid time format', { expires_at, sent_at });
      this.reset(0);
      return;
    }
    
    // ========== 步骤3: 计算总时长（服务器时间差，准确）✅ ==========
    const totalDurationMs = expiredAt.getTime() - serverStartAt.getTime();
    const totalDurationSeconds = Math.min(
      this.MAX_OTP_DURATION_SECONDS,
      Math.floor(totalDurationMs / 1000)
    );
    
    if (totalDurationSeconds <= 0) {
      console.warn('OTP countdown: invalid duration', { totalDurationSeconds });
      this.reset(0);
      return;
    }
    
    // ========== 步骤4: 获取或创建客户端缓存 ==========
    const cacheMap = this.getCountdownCacheMap();
    let cacheData = cacheMap[currentOtpType];
    
    // 检测 OTP 变化（重发或切换类型后首次访问）
    const isOtpChanged = !cacheData || cacheData.requestId !== request_id;
    
    if (isOtpChanged) {
      // OTP 变化了，创建新的缓存
      const clientNow = Date.now();
      cacheData = {
        clientFirstAccess: clientNow,
        requestId: request_id
      };
      cacheMap[currentOtpType] = cacheData;
      this.saveCountdownCacheMap(cacheMap);
      
      console.log('OTP countdown: cache updated', {
        otpType: currentOtpType,
        requestId: request_id,
        clientFirstAccess: new Date(clientNow).toISOString()
      });
    }
    
    // ========== 步骤5: 计算客户端认为的到期时间（固定值）✅ ==========
    const clientExpiresAt = cacheData.clientFirstAccess + (totalDurationSeconds * 1000);
    
    // ========== 步骤6: 计算剩余时间（客户端相对时间，准确）✅ ==========
    const clientNow = Date.now();
    const remainingMs = clientExpiresAt - clientNow;
    
    // ========== 步骤7: 检查是否过期 ==========
    if (remainingMs <= 0) {
      console.log('OTP countdown: expired');
      this.clearCacheForType(currentOtpType);
      this.reset(0);
      return;
    }
    
    // ========== 步骤8: 设置目标时间并启动倒计时 ==========
    let remainingSeconds = Math.floor(remainingMs / 1000);
    remainingSeconds = Math.min(this.MAX_OTP_DURATION_SECONDS, remainingSeconds);
    
    this.targetTime = new Date(clientExpiresAt);
    this.sentAt = serverStartAt;
    
    console.log('OTP countdown: started', {
      otpType: currentOtpType,
      remainingSeconds,
      expiresAt: this.targetTime.toISOString()
    });
    
    this.updateState();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }
  
  /**
   * 停止倒计时
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * 重置倒计时
   * @param seconds 新的倒计时秒数（默认0）
   */
  reset(seconds: number = 0): void {
    if (seconds <= 0) {
      this.stop();
      this.sentAt = null;
      this.targetTime = null;
      this.updateState();
    } else {
      //TODO 扩展
    }
  }
  
  /**
   * 清理所有状态
   */
  clear(): void {
    this.stop();
    this.targetTime = null;
    this.sentAt = null;
    this.countdownState$.next({
      remainingSeconds: 0,
      isExpired: true,
      canResend: true,
      sentAt: null,
      expiresAt: null,
    });
  }

   /**
   * 获取倒计时状态的 Observable
   */
  getState(): Observable<ICountdownState> {
    return this.countdownState$.asObservable();
  }
  
  /**
   * 获取当前状态（同步）
   */
  getCurrentState(): ICountdownState {
    return this.countdownState$.value;
  }
  
  /**
   * 每秒执行一次的倒计时逻辑
   */
  private tick(): void {
    if (!this.targetTime) {
      this.stop();
      return;
    }
    
    this.updateState();
  }
  
  /**
   * 更新倒计时状态
   */
  private updateState(): void {
    if (!this.targetTime) {
      this.countdownState$.next({
        remainingSeconds: 0,
        isExpired: true,
        canResend: true,
        sentAt: this.sentAt,
        expiresAt: null,
      });
      return;
    }
    
    // ✅ 使用客户端认为的到期时间计算
    const clientNow = Date.now();
    const remainingMs = this.targetTime.getTime() - clientNow;
    
    if (remainingMs <= 0) {
      // 倒计时结束
      const currentOtpType = this.getCurrentOtpType();
      if (currentOtpType) {
        this.clearCacheForType(currentOtpType);
      }
      this.stop();
      this.countdownState$.next({
        remainingSeconds: 0,
        isExpired: true,
        canResend: true,
        sentAt: this.sentAt,
        expiresAt: this.targetTime,
      });
      return;
    }
    
    let remainingSeconds = Math.floor(remainingMs / 1000);
    remainingSeconds = Math.min(this.MAX_OTP_DURATION_SECONDS, remainingSeconds);
    
    this.countdownState$.next({
      remainingSeconds,
      isExpired: false,
      canResend: false,
      sentAt: this.sentAt,
      expiresAt: this.targetTime,
    });
  }
  
  /**
   * 解析服务器返回的时间字符串或时间戳
   * 转换为 ISO 格式并指定时区，确保解析正确
   * @param timeString 时间字符串或时间戳
   * @returns Date 对象
   */
  private parseServerTime(timeString: string | number): Date {
    // 如果已经是时间戳，直接解析
    if (typeof timeString === 'number') {
      return new Date(timeString);
    }
    
    // 如果已经是 ISO 格式（包含 T、Z 或 +），直接解析
    if (timeString.includes('T') || timeString.includes('Z') || timeString.includes('+')) {
      return new Date(timeString);
    }
    
    const isoString = timeString.replace(' ', 'T') + '+06:30';
    return new Date(isoString);
  }
  
  /**
   * 验证日期对象是否有效
   * @param date Date 对象
   * @returns 是否为有效日期
   */
  private isValidDate(date: Date): boolean {
    if (!(date instanceof Date)) {
      return false;
    }
    
    const timestamp = date.getTime();
    
    // 检查是否为 NaN
    if (!Number.isFinite(timestamp)) {
      return false;
    }
    
    return true;
  }
  
  // ========== 缓存管理方法 ==========
  
  /**
   * 获取倒计时缓存 Map
   */
  private getCountdownCacheMap(): CountdownCacheMap {
    return this.storage.retrieve(OtpStorageKeys.COUNTDOWN_CACHE_MAP) || {};
  }
  
  /**
   * 保存倒计时缓存 Map
   */
  private saveCountdownCacheMap(cacheMap: CountdownCacheMap): void {
    this.storage.store(OtpStorageKeys.COUNTDOWN_CACHE_MAP, cacheMap);
  }
  
  /**
   * 清除指定类型的缓存
   */
  private clearCacheForType(otpType: string): void {
    const cacheMap = this.getCountdownCacheMap();
    delete cacheMap[otpType];
    this.saveCountdownCacheMap(cacheMap);
    console.log('OTP countdown: cache cleared for type', otpType);
  }
  
  /**
   * 获取当前 OTP 类型
   */
  private getCurrentOtpType(): string | null {
    return this.storage.retrieve(OtpStorageKeys.OTP_TYPE) as string | null;
  }
  
  /**
   * 清理所有缓存（退出 OTP 流程时调用）
   */
  clearAllCache(): void {
    this.storage.clear(OtpStorageKeys.COUNTDOWN_CACHE_MAP);
    console.log('OTP countdown: all cache cleared');
  }
  
  ngOnDestroy(): void {
    this.stop();
    this.countdownState$.complete();
  }
}
