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
 */
export interface OtpResponse {
  request_id?: string | number;
  
  // 时间字段 - 格式1-2（7个接口使用）
  start_at?: string;
  expired_at?: string;
  
  // 时间字段 - 格式3（提现接口使用）
  created_at?: string;
  expire_at?: string;
  
  // 状态字段
  status?: boolean | string;
  statusCode?: number;
  body?: string;
  code?: number;
  message?: string;
  errorCode?: string;
  errorMessage?: string;
  
  // 接收者信息
  number?: string;
  to?: string;
  email?: string;
  
  // 新设备相关
  guid?: string;
  
  // 其他字段
  token?: string;
  [key: string]: any; // 允许其他字段（保持向后兼容）
}

/**
 * 设备更新请求接口
 */
export interface UpdateDeviceIdRequest {
  deviceId: string;
  phone_no: string;
  ipAddress: string;
  guid: string;
  request_id: string;
  code: string;
}

/**
 * 登录模型接口
 */
export interface LoginModel {
  phone_no?: string;
  ipAddress?: string;
  deviceId?: string;
  password?: string;
  [key: string]: any;
}

/**
 * 服务电话对象接口
 */
export interface ServicePhone {
  title?: string;
  phone_no?: string;
  telegram_id?: string;
  viber?: string;
  otp_page_show?: boolean;
  [key: string]: any;
}

/**
 * 银行账户接口
 */
export interface BankAccount {
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  [key: string]: any;
}

