/**
 * OTP 配置接口定义和配置数据
 */

import { OtpType, OtpDisplayType, OtpScenario } from './otp-type.enum';

/**
 * OTP 发送配置接口
 */
export interface IOtpSendConfig {
  url: string; // API 端点路径（不包含基础URL）
  requiresAuth: boolean; // 是否需要认证 token
  baseUrl?: 'ipaddress' | 'apaddressv1'; // 使用哪个基础URL（默认 ipaddress）
}

/**
 * OTP 类型配置接口
 */
export interface IOtpTypeConfig {
  displayType: OtpDisplayType;
  getSender: (phone?: string, email?: string) => string;
}

/**
 * OTP 类型配置映射
 * 定义每种 OTP 类型对应的显示类型和发送者获取方式
 */
export const OTP_TYPE_CONFIG: Record<OtpType, IOtpTypeConfig> = {
  [OtpType.VMG_VIBER]: {
    displayType: OtpDisplayType.VIBER,
    getSender: (phone?: string, email?: string) => phone || ''
  },
  [OtpType.EMAIL]: {
    displayType: OtpDisplayType.EMAIL,
    getSender: (phone?: string, email?: string) => email || ''
  },
  [OtpType.SMS]: {
    displayType: OtpDisplayType.SMS,
    getSender: (phone?: string, email?: string) => phone || ''
  }
} as const;

/**
 * OTP 发送配置映射
 * 定义每种发送场景的配置
 */
export const OTP_SEND_CONFIG: Record<OtpScenario, IOtpSendConfig> = {
  [OtpScenario.REGISTER]: {
    url: 'user/getRegisterOTP?phoneNo=',
    requiresAuth: false,
    baseUrl: 'apaddressv1'
  },
  [OtpScenario.FORGET_PASSWORD]: {
    url: 'user/getForgotPassowrdOTP?phoneNo=',
    requiresAuth: false,
    baseUrl: 'apaddressv1'
  },
  [OtpScenario.NEW_DEVICE]: {
    url: 'user/getRegisterDeviceOTP?phoneNo=',
    requiresAuth: false,
    baseUrl: 'ipaddress'
  },
  [OtpScenario.WITHDRAW_INSERT]: {
    url: 'transaction/getWithdrawOTP',
    requiresAuth: true,
    baseUrl: 'apaddressv1'
  }
} as const;
