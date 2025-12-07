/**
 * OTP 相关 localStorage 键名常量
 * 统一管理所有存储键名，避免硬编码字符串
 */
export class OtpStorageKeys {
  // OTP 响应数据
  static readonly OTP_RESPONSE = 'localOtpSms';
  static readonly NEW_DEVICE_OTP_RESPONSE = 'localNewDeviceOtpSms';
  static readonly WITHDRAW_ACCOUNT_OTP_RESPONSE = 'localInsertAccountOtpSms';
  
  // OTP 类型和配置
  static readonly OTP_TYPE = 'localotptype';
  static readonly REGISTER_OTP_TYPE = 'registeropttype';
  
  // 场景标识
  static readonly SCENARIO = 'otpScenario';
  
  // 用户信息
  static readonly PHONE_VALUE = 'localPhoneValue';
  static readonly PHONE_PREFIX = 'localPhonePrefix';
  static readonly EMAIL_ADDRESS = 'localEmail';
  static readonly REGISTER_EMAIL = 'registeremail';
  
  // 账户相关
  static readonly BANK_ACCOUNT_LIST = 'localInsertBankAccountList';
  static readonly INSERT_ACCOUNT = 'localInsertAccount';
  
  // 登录相关
  static readonly LOGIN_MODEL = 'localLoginModel';
  static readonly FORGET_LOGIN_DEVICE = 'localForgetLoginDevice';
  
  // 倒计时相关
  static readonly TIMER = 'Timer';
  static readonly OTP_EXPIRES_AT = 'OtpExpiresAt';
  
  // 服务电话列表
  static readonly SERVICE_PHONE_LIST = 'localservicePhoneList';
  
  // 其他
  static readonly OTP_SMS = 'otpSms';
  static readonly SUCCESS_MSG = 'successmsg';
  static readonly CHANGE_OTP_PROCESS = 'changeotpprocess';
}

