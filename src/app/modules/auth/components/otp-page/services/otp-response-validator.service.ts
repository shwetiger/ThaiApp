import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * OTP 响应验证服务
 * 
 * 职责：
 * - 验证 OTP API 响应的完整性
 * - 处理 HTTP 200 但 status=false 的情况（格式23-24）
 * - 处理 HTTP 203 错误响应（格式12-13）
 * - 抛出包含错误信息的异常（UI 提示由 Facade 层统一处理）
 * 
 * 支持的响应格式：
 * - 格式1-3：成功响应（status=true）
 * - 格式4：布尔值 false
 * - 格式12-13：HTTP 203 频率限制（Status="Error"）
 * - 格式23：发送失败（status=false, start_at/expired_at）
 * - 格式24：发送失败（status=false, created_at/expire_at）
 */
@Injectable({
  providedIn: 'root'
})
export class OtpResponseValidatorService {
  constructor(
    private translate: TranslateService
  ) {}

  /**
   * 验证 OTP 发送响应
   * @param response API 响应
   * @throws Error 如果响应表示失败
   * @returns 验证后的响应
   */
  validateSendResponse(response: any): any {
    // 格式4: 布尔值 false（设置失败）
    if (response === false) {
      // 只抛出异常，由 Facade 层统一处理 UI 提示
      throw new Error(this.translate.instant('otp-send-failed'));
    }

    // 格式12-13: HTTP 203 频率限制（Status="Error" 或 status="Error"）
    // 注意：HTTP 203 是成功状态码（2xx），会进入 map 而不是 catchError
    if (response?.Status === "Error" || response?.status === "Error") {
      // 直接抛出原始错误信息，由 Facade 层统一处理 UI 提示
      const message = (response.Message || response.message) || 'Rate limit exceeded';
      throw new Error(message);
    }

    // 格式23-24: HTTP 200 但 status=false
    if (response?.status === false) {
      return this.handleStatusFalse(response);
    }

    // 格式1-3: 正常成功响应（status=true）
    if (response?.status === true) {
      return response;
    }

    // 格式2: 带 guid 的成功响应（某些接口没有 status 字段，但有 guid）
    if (response?.guid && response?.request_id) {
      return response;
    }

    // 未知响应格式，需要检查是否有必要的字段
    if (this.hasRequiredFields(response)) {
      return response;
    }

    // 响应格式不符合预期
    console.warn('Unexpected OTP response format:', response);
    return response;
  }

  /**
   * 处理 status=false 的情况
   * 格式23: { status: false, errorCode: "333", errorMessage: "...", start_at, expired_at }
   * 格式24: { status: false, errorCode: "333", errorMessage: "...", created_at, expire_at }
   */
  private handleStatusFalse(response: any): never {
    const errorMessage = response.errorMessage;

    // 直接抛出错误信息，由 Facade 层统一处理 UI 提示
    const message = errorMessage || this.translate.instant('otp-send-failed');
    throw new Error(message);
  }

  /**
   * 检查响应是否包含必要的字段
   */
  private hasRequiredFields(response: any): boolean {
    // 标准响应需要包含 to 和 request_id
    const hasBasicFields = response?.to && response?.request_id !== undefined;
    
    // 或者包含时间字段（start_at/expired_at 或 created_at/expire_at）
    const hasTimeFields = (response?.start_at && response?.expired_at) 
      || (response?.created_at && response?.expire_at);

    return hasBasicFields || hasTimeFields;
  }
}
