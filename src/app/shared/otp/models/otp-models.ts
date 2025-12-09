/**
 * OTP 相关接口定义
 * 提供类型安全的数据结构
 */

/**
 * OTP 响应接口
 * 
 * 支持多种响应格式：
 * - 格式1-2: 使用 start_at / expired_at（大部分接口）
 * - 格式3: 使用 created_at / expire_at（提现接口）
 * 
 * 注意：API 实际返回使用 snake_case（request_id, expired_at）
 */
export interface IOtpResponse {
  // request_id（API 实际格式）
  request_id?: string | number;
  
  // 时间字段 - 格式1-2（7个接口使用）
  start_at?: string;
  expired_at?: string;
  
  // 时间字段 - 格式3（提现接口使用）
  created_at?: string;
  expire_at?: string;
  
  // 状态字段
  status?: boolean | string;

  // http状态, 大于等于200 成功信息, 小于200 错误信息
  message?: string; 

  // 错误码, 000 成功, 其他 错误
  errorCode?: string;
  errorMessage?: string;
  
  // 接收者信息
  to?: string;
  
  // 新设备相关
  guid?: string;
  
  [key: string]: any; // 允许其他字段（保持向后兼容）
}

/**
 * 用户短信类型查询响应接口
 * 用于 user/userSmsType API
 */
export interface IUserSmsTypeResponse {
  smstype: string;  // OTP 类型（'sms', 'email', 'vmg_viber'）
  phone_no: string;
  email?: string;   // 邮箱地址（当 smstype 为 'email' 时存在）
}

/**
 * 设备更新请求接口
 */
export interface IUpdateDeviceIdRequest {
  deviceId: string;
  phoneNo: string;
  ipAddress: string;
  guid: string;
  requestId: string;
  code: string;
}

/**
 * 登录模型接口
 */
export interface ILoginModel {
  phoneNo?: string;
  ipAddress?: string;
  deviceId?: string;
  password?: string;
  [key: string]: any;
}

/**
 * 服务电话对象接口
 */
export interface IServicePhone {
  title?: string;
  phoneNo?: string;
  telegramId?: string;
  viber?: string;
  otpPageShow?: boolean;
  [key: string]: any;
}

/**
 * 银行账户接口
 */
export interface IBankAccount {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  [key: string]: any;
}

/**
 * OTP 请求信息接口
 * 用于存储每个 OTP 类型的 request_id 和过期时间
 */
export interface IOtpRequestInfo {
  request_id: string | number;
  expires_at: string;  // 服务器返回的过期时间字符串
}

/**
 * OTP 请求信息集合
 * key 为 OtpType（'vmg_viber', 'email', 'sms'）
 */
export type IOtpRequestInfoMap = {
  [key: string]: IOtpRequestInfo;
};
