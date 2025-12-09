import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { OtpStorageKeys } from '../models/otp-storage-keys';
import { IOtpResponse } from '../models/otp-models';
import { OtpService } from './otp.service';

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
  /** 总有效期秒数 */
  totalDuration: number;
}

/**
 * OTP 倒计时服务
 * 职责：
 * - 管理倒计时逻辑
 * - 持久化倒计时状态（刷新页面可恢复）
 * - 提供倒计时状态的 Observable
 */
@Injectable()
export class OtpCountdownService implements OnDestroy {
  // OTP 最大有效期为 180 秒（3分钟），防止客户端时间偏差导致显示异常
  private readonly MAX_OTP_DURATION_SECONDS = 180;
  
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private targetTime: Date | null = null;
  private sentAt: Date | null = null;
  private totalDuration: number = 0;
  
  // 使用 BehaviorSubject 管理状态，组件可订阅
  private countdownState$ = new BehaviorSubject<ICountdownState>({
    remainingSeconds: 0,
    isExpired: true,
    canResend: true,
    sentAt: null,
    expiresAt: null,
    totalDuration: 0
  });
  
  constructor(
    private storage: LocalStorageService,
    private otpService: OtpService
  ) {}
  
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
   * 从 OTP 响应启动倒计时
   * @param response OTP 响应对象
   * 
   * 支持两种时间字段格式：
   * - 格式1-2: start_at / expired_at（7个接口使用）
   * - 格式3: created_at / expire_at（提现接口使用）
   */
  startFromResponse(response: any): void {
    // 先停止并清除旧的倒计时缓存（防止切换 OTP 类型后恢复旧倒计时）
    this.stop();
    
    if (!response) {
      console.warn('OTP countdown: response is null or undefined');
      return;
    }
    
    // API 实际返回使用 snake_case（start_at, expired_at, created_at, expire_at）
    const startTime = response.start_at || response.created_at;
    const endTime = response.expired_at || response.expire_at;
    
    if (!endTime) {
      console.warn('OTP countdown: missing expired_at field', {
        hasStartAt: !!response.start_at,
        hasExpiredAt: !!response.expired_at,
        hasCreatedAt: !!response.created_at,
        hasExpireAt: !!response.expire_at
      });
      return;
    }
    
    // 解析过期时间并验证有效性
    // 后端返回格式："2025-12-07 01:10:02"（服务器本地时间，UTC+6:30 缅甸时间）
    const expiredAt = this.parseServerTime(endTime);
    
    // 验证过期时间是否有效
    if (!this.isValidDate(expiredAt)) {
      console.error('OTP countdown: invalid expired_at time', endTime);
      return;
    }
    
    // 解析发送时间（可选，如果有就记录）
    let startAt: Date | null = null;
    if (startTime) {
      startAt = this.parseServerTime(startTime);
      if (!this.isValidDate(startAt)) {
        console.warn('OTP countdown: invalid start time, will use current time', startTime);
        startAt = null;
      }
    }
    
    // 计算剩余时间（使用绝对过期时间，解决时区和时间偏差问题）
    const now = Date.now();
    const remainingMs = expiredAt.getTime() - now;
   
    // 如果已经过期，直接重置
    if (remainingMs <= 0) {
      this.reset(0);
      return;
    }
    
    let remainingSeconds = Math.floor(remainingMs / 1000);
    
    // 限制最大倒计时为 180 秒（3分钟），防止客户端时间偏差导致显示异常
    remainingSeconds = Math.min(this.MAX_OTP_DURATION_SECONDS, remainingSeconds);
    
    // 使用服务器返回的绝对过期时间（保持原有逻辑）
    this.targetTime = expiredAt;
    
    // 记录发送时间（如果有后端时间就用后端时间，否则使用当前时间）
    if (startAt) {
      this.sentAt = startAt;
    } else {
      this.sentAt = new Date();
    }
    
    // 使用调整后的倒计时启动
    this.stop();
    this.totalDuration = remainingSeconds;
    
    // 立即更新状态
    this.updateState();
    
    // 启动倒计时循环
    this.intervalId = setInterval(() => this.tick(), 1000);
  }
  
  /**
   * 启动倒计时
   * @param endTime 结束时间（字符串或Date对象）
   * @param duration 可选的持续时间（秒）
   */
  start(endTime: string | Date, duration?: number): void {
    this.stop();
    
    let targetTime: Date;
    if (typeof endTime === 'string') {
      targetTime = this.parseServerTime(endTime);
    } else {
      targetTime = endTime;
    }
    
    const now = Date.now();
    const remainingMs = targetTime.getTime() - now;
    let remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    
    // 限制最大倒计时为 180 秒
    remainingSeconds = Math.min(this.MAX_OTP_DURATION_SECONDS, remainingSeconds);
    
    if (duration !== undefined) {
      remainingSeconds = Math.min(duration, remainingSeconds);
    }
    
    this.totalDuration = remainingSeconds;
    this.targetTime = new Date(now + remainingSeconds * 1000);
    
    // 如果没有设置发送时间，使用当前时间
    if (!this.sentAt) {
      this.sentAt = new Date();
    }
    
    // 立即更新状态
    this.updateState();
    
    // 启动倒计时循环
    this.intervalId = setInterval(() => this.tick(), 1000);
  }
  
  /**
   * 从当前 OTP 类型启动倒计时
   * 通过 OtpService 获取过期时间
   */
  startFromCurrentType(): void {
    this.stop();
    
    // 通过 OtpService 获取当前类型的过期时间
    const expiresAt = this.otpService.getCurrentExpiresAt();
    if (!expiresAt) {
      console.warn('OTP countdown: missing expires_at for current type');
      return;
    }
    
    // 解析并启动倒计时
    const expiredAt = this.parseServerTime(expiresAt);
    if (!this.isValidDate(expiredAt)) {
      console.error('OTP countdown: invalid expires_at time', expiresAt);
      return;
    }
    
    // 使用过期时间启动倒计时
    this.startFromExpiresAt(expiresAt);
  }

  /**
   * 从过期时间字符串启动倒计时
   * @param expiresAt 过期时间字符串
   */
  private startFromExpiresAt(expiresAt: string): void {
    this.stop();
    
    const expiredAt = this.parseServerTime(expiresAt);
    
    // 计算剩余时间
    const now = Date.now();
    const remainingMs = expiredAt.getTime() - now;
   
    // 如果已经过期，直接重置
    if (remainingMs <= 0) {
      this.reset(0);
      return;
    }
    
    let remainingSeconds = Math.floor(remainingMs / 1000);
    
    // 限制最大倒计时为 180 秒（3分钟），防止客户端时间偏差导致显示异常
    remainingSeconds = Math.min(this.MAX_OTP_DURATION_SECONDS, remainingSeconds);
    
    // 使用服务器返回的绝对过期时间
    this.targetTime = expiredAt;
    
    // 记录发送时间（使用当前时间）
    this.sentAt = new Date();
    
    this.totalDuration = remainingSeconds;
    
    // 立即更新状态
    this.updateState();
    
    // 启动倒计时循环
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  /**
   * 从缓存恢复倒计时
   */
  restoreFromCache(): void {
    // 从 OTP_REQUEST_INFO 读取当前类型
    const expiresAt = this.otpService.getCurrentExpiresAt();
    if (expiresAt) {
      const expiredAt = this.parseServerTime(expiresAt);
      if (this.isValidDate(expiredAt) && expiredAt.getTime() > Date.now()) {
        this.startFromExpiresAt(expiresAt);
        return;
      }
    }
    
    // 降级：从 OTP 响应恢复
    const otpResponse = this.otpService.getCurrentOtpResponse();
    if (otpResponse) {
      this.startFromResponse(otpResponse);
    } else {
      // 如果都没有，重置
      this.reset(0);
    }
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
    this.stop();
    
    // 清空发送时间，允许 start 方法重新设置
    this.sentAt = null;
    
    if (seconds > 0) {
      this.start(new Date(Date.now() + seconds * 1000), seconds);
    } else {
      this.targetTime = null;
      this.totalDuration = 0;
      this.updateState();
    }
  }
  
  /**
   * 清理所有状态
   */
  clear(): void {
    this.stop();
    this.targetTime = null;
    this.sentAt = null;
    this.totalDuration = 0;
    this.countdownState$.next({
      remainingSeconds: 0,
      isExpired: true,
      canResend: true,
      sentAt: null,
      expiresAt: null,
      totalDuration: 0
    });
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
        totalDuration: this.totalDuration
      });
      return;
    }
    
    const distance = this.targetTime.getTime() - Date.now();
    
    if (distance <= 0) {
      // 倒计时结束
      this.stop();
      this.countdownState$.next({
        remainingSeconds: 0,
        isExpired: true,
        canResend: true,
        sentAt: this.sentAt,
        expiresAt: this.targetTime,
        totalDuration: this.totalDuration
      });
      return;
    }
    
    let remainingSeconds = Math.max(0, Math.floor(distance / 1000));
    
    // 最终限制：确保显示的剩余秒数不超过 180 秒（防止客户端时间偏差）
    remainingSeconds = Math.min(this.MAX_OTP_DURATION_SECONDS, remainingSeconds);
    
    this.countdownState$.next({
      remainingSeconds,
      isExpired: false,
      canResend: false,
      sentAt: this.sentAt,
      expiresAt: this.targetTime,
      totalDuration: this.totalDuration
    });
  }
  
  /**
   * 从 localStorage 读取数值
   */
  private getNumberFromStorage(key: string): number | null {
    const value = this.storage.retrieve(key);
    const num = Number(value);
    
    if (!Number.isFinite(num) || num < 0) {
      return null;
    }
    
    return Math.floor(num);
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
  
  ngOnDestroy(): void {
    this.stop();
    this.countdownState$.complete();
  }
}
