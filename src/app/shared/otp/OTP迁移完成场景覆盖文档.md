# OTP 迁移完成场景覆盖文档

## 覆盖场景汇总表

| # | 场景 | 组件 | 路由 | OtpService 方法 | 导航目标 |
|---|------|------|------|----------------|----------|
| 1 | 注册 | `RegisterPageComponent` | `/login/register` | `sendRegisterOtp()` | `/login/otp` |
| 2 | 忘记密码（初始） | `InitialForgotPasswordComponent` | `/login/initial-forgot-password` | `sendForgetPasswordOtp()` | `/login/otp` |
| 3 | 忘记密码（验证个人信息） | `CheckingPersonalInfoComponent` | `/login/forgot-password-validation` | `sendForgetPasswordOtp()` | `/login/otp` |
| 4 | 新设备登录 | `LoginVerifyPhonePageComponent` | `/login/login-verify-phone` | `sendNewDeviceOtp()` | `/login/otp` |
| 5 | 提现添加账户 | `WithdrawComponent` | `/wallet/withdraw` | `sendWithdrawOtp()` | `/login/otp` |
| 6 | 切换类型并发送 | `DefaultOptSettingComponent` | `/me-page/default-otp` | `sendOtpBySettingType()` | 返回上一页 |
| 7 | 注册场景切换 | `DefaultOptSettingComponent` | `/me-page/default-otp` | `sendRegisterOtp()` | 返回上一页 |

## 详细说明

### 1. 注册场景
- **组件**: `RegisterPageComponent`
- **路由**: `/login/register`
- **方法**: `otpService.sendRegisterOtp()`
- **参数**: `{ phoneNumber, email, type: OtpType.SMS }`
- **导航**: 发送成功后导航到 `/login/otp`

### 2. 忘记密码场景（初始）
- **组件**: `InitialForgotPasswordComponent`
- **路由**: `/login/initial-forgot-password`
- **方法**: `otpService.sendForgetPasswordOtp()`
- **参数**: `{ phoneNumber }`
- **导航**: 发送成功后导航到 `/login/otp`

### 3. 忘记密码场景（验证个人信息）
- **组件**: `CheckingPersonalInfoComponent`
- **路由**: `/login/forgot-password-validation`
- **方法**: `otpService.sendForgetPasswordOtp()`
- **参数**: `{ phoneNumber }`
- **导航**: 发送成功后导航到 `/login/otp`

### 4. 新设备登录场景
- **组件**: `LoginVerifyPhonePageComponent`
- **路由**: `/login/login-verify-phone`
- **方法**: `otpService.sendNewDeviceOtp()`
- **参数**: `{ phoneNumber }`
- **导航**: 发送成功后导航到 `/login/otp`

### 5. 提现添加账户场景
- **组件**: `WithdrawComponent`
- **路由**: `/wallet/withdraw`
- **方法**: `otpService.sendWithdrawOtp()`
- **参数**: `{ token, bankAccountList }`
- **导航**: 发送成功后导航到 `/login/otp`

### 6. 切换类型并发送场景
- **组件**: `DefaultOptSettingComponent`
- **路由**: `/me-page/default-otp`
- **方法**: `otpService.sendOtpBySettingType()`
- **参数**: `{ type, phoneNumber, scenario, funcionName, token }`
- **导航**: 发送成功后返回上一页（`_location.back()`）

### 7. 注册场景切换
- **组件**: `DefaultOptSettingComponent`
- **路由**: `/me-page/default-otp`
- **方法**: `otpService.sendRegisterOtp()`
- **参数**: `{ phoneNumber, email, type }`
- **导航**: 发送成功后返回上一页（`_location.back()`）

## 统一 OTP 验证页面

所有场景发送 OTP 成功后，都会导航到统一的 OTP 验证页面：
- **路由**: `/login/otp`
- **组件**: `OtpPageComponent`

## 迁移状态

✅ **所有 OTP 发送场景已迁移完成**

- 所有组件已使用新的 `OtpService`（位于 `src/app/shared/otp/services/otp.service.ts`）
- 所有直接 HTTP 调用已替换为统一的服务方法
- 所有错误处理已统一
- 所有存储逻辑已统一
