/**
 * OTP 相关枚举定义
 */

/**
 * OTP 类型枚举
 * 定义 OTP 发送方式的类型
 */
export enum OtpType {
  VMG_VIBER = 'vmg_viber',
  EMAIL = 'email',
  SMS = 'sms'
}

/**
 * OTP 显示类型枚举
 * 定义在 UI 中显示的 OTP 类型名称
 */
export enum OtpDisplayType {
  VIBER = 'Viber',
  EMAIL = 'Email',
  SMS = 'SMS'
}

/**
 * OTP 业务场景枚举（统一标识）
 * 
 * 用于替代原有的 FormType 和 ActionType，统一所有 OTP 验证场景的标识
 */
export enum OtpScenario {
  /** 注册 */
  REGISTER = 'register',
  
  /** 忘记密码 */
  FORGET_PASSWORD = 'forgetPassword',
  
  /** 新设备登录 */
  NEW_DEVICE = 'NEWDIVICE',  // 保持原值以兼容现有数据
  
  /** 提现/插入银行账户 */
  WITHDRAW_INSERT = 'insertAccount'
}

/**
 * OTP 错误码枚举
 */
export enum OtpErrorCode {
  INVALID_CODE = 0,
  TOKEN_EXPIRED = 11,
  DEVICE_TOKEN_EXPIRED = 10
}
