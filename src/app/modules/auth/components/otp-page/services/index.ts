/**
 * OTP 页面服务层统一导出
 * 
 * 使用方式：
 * import { OtpFacadeService, OTP_PAGE_SERVICES } from './services';
 */

// 导入服务（用于 OTP_PAGE_SERVICES 数组）
import { OtpFacadeService } from './otp-facade.service';
import { OtpCountdownService } from './otp-countdown.service';
import { OtpStateService } from './otp-state.service';
import { OtpVerificationService } from './otp-verification.service';
import { OtpAuthService } from './otp-auth.service';

// 导出服务和类型
export { OtpFacadeService, OtpPageState } from './otp-facade.service';
export { OtpCountdownService, CountdownState } from './otp-countdown.service';
export { OtpStateService, FormState, UiState, ScenarioState, ServicePhoneState } from './otp-state.service';
export { OtpVerificationService, OtpVerificationResult } from './otp-verification.service';
export { OtpAuthService } from './otp-auth.service';

// HTTP 服务
export { OtpService, OtpSendScenario } from './otp-service';

// 错误处理服务（root 级别提供，无需在组件中重复提供）
export { OtpErrorHandlerService } from './otp-error-handler.service';
export { OtpResponseValidatorService } from './otp-response-validator.service';

/**
 * 所有服务的提供者数组
 * 在组件的 providers 中使用
 * 
 * 注意：OtpErrorHandlerService 和 OtpResponseValidatorService 
 * 已在 root 级别提供，无需在此数组中包含
 */
export const OTP_PAGE_SERVICES = [
  OtpFacadeService,
  OtpCountdownService,
  OtpStateService,
  OtpVerificationService,
  OtpAuthService
];

