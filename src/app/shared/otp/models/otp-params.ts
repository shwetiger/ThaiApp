/**
 * OTP 参数接口定义
 * 用于各种 OTP 操作的参数类型
 */

import { OtpType, OtpScenario, OtpDisplayType } from './otp-type.enum';
import { IBankAccount } from './otp-models';

/**
 * 注册 OTP 参数
 */
export interface IRegisterOtpParams {
  phoneNumber: string;
  email: string;
  type: OtpType;
}

/**
 * 忘记密码 OTP 参数
 */
export interface IForgetPasswordOtpParams {
  phoneNumber: string;
}

/**
 * 新设备 OTP 参数
 */
export interface INewDeviceOtpParams {
  phoneNumber: string;
  token?: string;
}

/**
 * 提现 OTP 参数
 */
export interface IWithdrawOtpParams {
  token: string;
  bankAccountList: IBankAccount[];
}

/**
 * 切换 OTP 类型参数
 */
export interface ISwitchOtpTypeParams {
  scenario: OtpScenario | string;
  phoneNumber: string;
  email?: string;
  token?: string;
  otpType?: OtpType; // 可选：如果提供，直接使用，不调用 getOtpType
}

/**
 * OTP 验证参数
 */
export interface IOtpVerificationParams {
  code: string;
  requestId: string | number;
  phoneNumber?: string;
  smsType?: string;
  token?: string;
  isForgetPassword?: boolean;
}

/**
 * 提现 OTP 验证参数
 */
export interface IWithdrawOtpVerificationParams {
  code: string;
  requestId: string | number;
  token: string;
}

/**
 * 设置用户短信类型并发送 OTP 参数
 */
export interface ISetUserSmsTypeAndSendOtpParams {
  type: OtpType;              // OTP 类型（'sms_poh' | 'email' | 'vmg_viber'）
  phoneNumber: string;         // 电话号码
  scenario: OtpScenario;       // 场景标识
  funcionName: string;         // 功能名称（必须）
  token?: string;              // 认证 token（可选）
}
