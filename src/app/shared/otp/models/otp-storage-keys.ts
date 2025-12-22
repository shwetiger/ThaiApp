/**
 * OTP 相关 localStorage 键名常量
 * 
 * 简化原则：
 * 1. 所有场景使用统一的响应存储键
 * 2. 倒计时只存储过期时间，计算 = 过期时间 - 当前时间
 * 3. 移除冗余的用户信息存储（从响应中获取）
 * 4. 只保留必要的业务数据
 */
export class OtpStorageKeys {
  // ========== 核心数据 ==========
  
  /** OTP 响应数据（统一存储，所有场景共用） */
  static readonly OTP_RESPONSE = 'otpResponse';
  
  /** 当前场景标识 */
  static readonly SCENARIO = 'otpScenario';
  
  /** 当前 OTP 类型（SMS/Email/Viber） */
  static readonly OTP_TYPE = 'otpType';
  
  /** OTP 过期时间（用于倒计时计算） */
  static readonly OTP_EXPIRES_AT = 'otpExpiresAt';

  /** 保存每次发送 otp 后服务器返回的 request_id 和 otp过期时间 */
  // 保存的数据格式 { vmg_viber: { request_id: string | number, expires_at: string }, email: { ... }, sms_poh: { ... } }
  static readonly OTP_REQUEST_INFO = 'otpRequestInfo';
  
  // ========== 业务特定数据 ==========
  
  /** 银行账户列表（仅提现场景需要） */
  static readonly BANK_ACCOUNT_LIST = 'bankAccountList';

  /** 插入账户标识（仅提现场景需要） */
  static readonly INSERT_ACCOUNT = 'localInsertAccount';
  
  /** 登录模型（仅新设备场景需要） */
  static readonly LOGIN_MODEL = 'localLoginModel';
  
  // ========== 服务电话（可选缓存）==========
  
  /** 服务电话列表（可选的缓存，提升性能） */
  static readonly SERVICE_PHONE_LIST = 'otpServicePhoneList';

  // ========== 注册场景专用 ==========
  static readonly REGISTER_EMAIL = 'registeremail';

  /** 电话号码 */
  static readonly PHONE_NUMBER = 'localPhoneValue';
  static readonly PHONE_PREFIX = 'localPhonePrefix';
  
  // ========== 倒计时缓存（新增）==========
  
  /**
   * 倒计时缓存 Map
   * 
   * 数据格式：
   * {
   *   "sms_poh": {
   *     clientFirstAccess: 1704096000000,  // 客户端第一次访问时间戳
   *     requestId: "SMS_12345"              // 关联的 request_id
   *   },
   *   "email": {
   *     clientFirstAccess: 1704096030000,
   *     requestId: "EMAIL_67890"
   *   }
   * }
   * 
   * 用途：
   * 1. 记录每个 OTP 类型的客户端基准时间
   * 2. 通过 request_id 检测 OTP 变化（重发/切换类型）
   * 3. 使用客户端相对时间计算，不受时钟偏差影响
   */
  static readonly COUNTDOWN_CACHE_MAP = 'otpCountdownCacheMap';
}
