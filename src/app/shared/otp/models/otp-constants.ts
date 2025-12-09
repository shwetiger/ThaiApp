/**
 * OTP 相关常量定义
 * 统一管理所有硬编码的值
 */

/**
 * OTP 验证码常量
 */
export const OTP_CODE = {
  /** OTP 验证码长度 */
  LENGTH: 6,
  /** 倒计时秒数 */
  COUNTDOWN_SECONDS: 180
} as const;

/**
 * 路由路径常量
 */
export const OTP_ROUTES = {
  HOME: '/home',
  RESET_PASSWORD: '/login/resetPassword',
  REGISTRATION: '/login/registration',
  WITHDRAW_CHANGE_ACC: '/wallet/withdraw-change-acc'
} as const;

/**
 * Spinner 名称常量
 */
export const SPINNER_NAMES = {
  SUBMIT: 'submitLoading'
} as const;

/**
 * 客服电话常量
 */
export const SERVICE_PHONE = {
  CUSTOMER_SERVICE_TITLE: 'customer_service'
} as const;

/**
 * 错误消息键常量
 */
export const OTP_ERROR_MESSAGES = {
  REQUIRED: 'otp_required',
  INVALID_CODE: 'invalid-otp-code',
  INVALID_FORMAT: 'OTP must contain only numbers',
  TOKEN_EXPIRED: 'otp-token-expired',
  TOO_MANY_REQUESTS: 'transaction_wait_5sec',
  INCORRECT: 'OTP is not correct',
  UNKNOWN: 'Unknown error',
  VERIFICATION_FAILED: 'Verification failed',
  RESEND_FAILED: 'Resend failed',
  AUTO_LOGIN_FAILED: 'Auto login failed',
  BANK_INSERT_FAILED: 'Insert bank account failed'
} as const;

/**
 * 成功消息常量
 */
export const OTP_SUCCESS_MESSAGES = {
  BANK_ACCOUNT_ADDED: 'bankacc_addsuccess'
} as const;

/**
 * 特殊标识符常量
 */
export const OTP_IDENTIFIERS = {
  INSERT_ACCOUNT_FLAG: 'insertAccount',
  OTP_INSERT_FLAG: 'insert',
  WITHDRAW_SUCCESS_MSG: 'withdrawalsuccess'
} as const;

/**
 * Toastr 配置常量
 */
export const TOASTR_CONFIG = {
  DEFAULT_DURATION: 3000,
  DEFAULT_POSITION: 'toast-top-center',
  BOTTOM_CENTER: 'toast-bottom-center'
} as const;
