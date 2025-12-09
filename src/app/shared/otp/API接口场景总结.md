# Controllers/V1 接口场景总结

## 响应格式矩阵表

### 成功响应格式

| 响应格式                                                      | getRegisterOTP    | getRegisterOTPNew | getNewDeviceOTP    | getRegisterDeviceOTP | getemailotp     | getForgotPassowrdOTP | setUserSmsTypeAndGetOTP | getWithdrawOTP  |
|---------------------------------------------------------------|------------------|-------------------|-------------------|---------------------|----------------|---------------------|------------------------|-----------------|
| **格式1**: 标准OTP成功响应 (start_at/expired_at)               | ✅                | ✅               | -                  | -                    | ✅              | ✅                  | -                       | -                |
| **格式2**: 带GUID的OTP成功响应 (start_at/expired_at + guid)    | -                 | -                 | ✅                 | ✅                   | -              | -                   | ✅                      | -                |
| **格式3**: 标准OTP成功响应 (created_at/expire_at)              | -                 | -                 | -                  | -                    | -              | -                   | -                       | ✅               |
| **格式4**: 布尔值false                                         | -                 | -                 | -                  | -                    | -              | -                   | ✅                      | -                |

### 错误响应格式

| 响应格式                                                      | getRegisterOTP    | getRegisterOTPNew | getNewDeviceOTP    | getRegisterDeviceOTP | getemailotp     | getForgotPassowrdOTP | setUserSmsTypeAndGetOTP | getWithdrawOTP  |
|--------------------------------------------------------------|------------------|-------------------|-------------------|---------------------|----------------|---------------------|------------------------|-----------------|
| **格式5**: 400 - 手机号无效                                   | ✅                | ✅                 | ✅                 | ✅                   | -              | ✅                  | -                       | -                |
| **格式6**: 400 - 邮箱无效                                     | ✅                | ✅                 | -                  | -                    | ✅              | -                   | -                       | -                |
| **格式7**: 400 - 异常错误（字符串）                            | -                 | -                   | -                  | -                    | -               | -                   | -                       | ✅               |
| **格式8**: 403 - 发送过于频繁（so_close）                      | ✅                | -                  | ✅                 | ✅                   | -              | ✅                  | ✅                      | ✅               |
| **格式9**: 403 - 超过限制次数                                 | ✅                | ✅                 | ✅                 | ✅                   | ✅              | ✅                  | ✅                      | ✅               |
| **格式10**: 403 - 临时被阻止                                  | ✅                | ✅                 | ✅                 | ✅                   | ✅              | ✅                  | ✅                      | ✅               |
| **格式11**: 403 - 其他错误                                    | ✅                | ✅                 | ✅                 | ✅                   | ✅              | ✅                  | ✅                      | ✅               |
| **格式12**: 203 - 频率限制（按用户180秒）                      | ✅                | ✅                 | ✅                 | ✅                   | ✅              | ✅                  | ✅                      | ✅               |
| **格式13**: 203 - 频率限制（按IP60秒）                         | ✅                | ✅                 | ✅                 | ✅                   | ✅              | ✅                  | ✅                      | ✅               |
| **格式14**: 406 - 用户手机号已存在                             | ✅                | ✅                 | -                  | -                    | -              | -                   | -                       | -                |
| **格式15**: 406 - 用户邮箱已存在                               | ✅                | ✅                 | -                  | -                    | ✅              | -                   | -                       | -                |
| **格式16**: 406 - 无效输入                                     | -                 | -                 | ✅                 | ✅                   | -              | -                   | -                       | -                |
| **格式17**: 404 - 用户不存在（Please register!）                | -                 | -                 | -                  | -                    | -              | ✅                  | -                       | -                |
| **格式18**: 404 - 用户不存在（User does not exist!）            | -                 | -                 | -                  | -                    | -              | -                   | ✅                      | -                |
| **格式19**: 404 - 用户不存在（User not found）                  | -                 | -                 | -                  | -                    | -              | -                   | -                       | ✅               |
| **格式20**: 404 - Viber不支持国际号码                           | -                 | -                 | -                  | -                    | -              | -                   | ✅                      | -                |
| **格式21**: 404 - 用户未添加邮箱                                | -                 | -                 | -                  | -                    | -              | -                   | ✅                      | -                |
| **格式22**: 404 - 异常错误                                      | -                 | -                 | ✅                 | ✅                  | -              | -                   | -                       | -                |
| **格式23**: 200 - 发送失败（status=false, start_at/expired_at） | ✅                | ✅               | ✅                 | ✅                  | ✅             | ✅                 | ✅                      | -                |
| **格式24**: 200 - 发送失败（status=false, created_at/expire_at） | -                 | -                 | -                  | -                   | -              | -                   | -                       | ✅               |

**说明**：
- ✅ 表示该接口支持该响应格式
- - 表示该接口不支持该响应格式
- 相同格式在不同接口中标记为相同

---

## 响应格式详情

### ✅ 成功响应格式

#### 格式1: 标准OTP成功响应（start_at/expired_at）
**HTTP状态码**: `200 OK`  
**支持接口**: 获取注册OTP、获取注册OTP（新版本）、获取邮箱OTP、获取忘记密码OTP

```json
{
  "to": "959782222222",
  "errorCode": "000",
  "errorMessage": "",
  "start_at": "2024-01-01 12:00:00",
  "expired_at": "2024-01-01 12:03:00",
  "status": true,
  "request_id": 12345
}
```

#### 格式2: 带GUID的OTP成功响应（start_at/expired_at + guid）
**HTTP状态码**: `200 OK`  
**支持接口**: 获取新设备OTP、获取注册设备OTP、设置用户短信类型并获取OTP

```json
{
  "to": "959782222222",
  "errorCode": "000",
  "errorMessage": "",
  "start_at": "2024-01-01 12:00:00",
  "expired_at": "2024-01-01 12:03:00",
  "status": true,
  "request_id": 12345,
  "guid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

#### 格式3: 标准OTP成功响应（created_at/expire_at）
**HTTP状态码**: `200 OK`  
**支持接口**: 获取提现OTP

```json
{
  "to": "959782222222",
  "errorCode": "000",
  "errorMessage": "",
  "created_at": "2024-01-01 12:00:00",
  "expire_at": "2024-01-01 12:03:00",
  "status": true,
  "request_id": 12345
}
```

#### 格式4: 布尔值false
**HTTP状态码**: `200 OK`  
**支持接口**: 设置用户短信类型并获取OTP（设置失败时）

```json
false
```

---

### ❌ 错误响应格式

#### 格式5: 400 - 手机号无效
**HTTP状态码**: `400 Bad Request`  
**支持接口**: 获取注册OTP、获取注册OTP（新版本）、获取新设备OTP、获取注册设备OTP、获取忘记密码OTP

```json
{
  "Status": "Error",
  "Message": "please enter a valid phone number"
}
```

#### 格式6: 400 - 邮箱无效
**HTTP状态码**: `400 Bad Request`  
**支持接口**: 获取注册OTP、获取注册OTP（新版本）、获取邮箱OTP

```json
{
  "Status": "Error",
  "Message": "please enter a valid email"
}
```

#### 格式7: 400 - 异常错误（字符串）
**HTTP状态码**: `400 Bad Request`  
**支持接口**: 获取提现OTP

```json
"异常错误信息"
```

#### 格式8: 403 - 发送过于频繁（so_close）
**HTTP状态码**: `403 Forbidden`  
**支持接口**: 获取注册OTP、获取新设备OTP、获取注册设备OTP、获取忘记密码OTP、设置用户短信类型并获取OTP、获取提现OTP

```json
{
  "Status": "Error",
  "Message": "so_close"
}
```

#### 格式9: 403 - 超过限制次数
**HTTP状态码**: `403 Forbidden`  
**支持接口**: 所有接口

```json
{
  "Status": "Error",
  "Message": "over_limited."
}
```

#### 格式10: 403 - 临时被阻止
**HTTP状态码**: `403 Forbidden`  
**支持接口**: 所有接口

```json
{
  "Status": "Error",
  "Message": "temporary_blocked"
}
```

#### 格式11: 403 - 其他错误
**HTTP状态码**: `403 Forbidden`  
**支持接口**: 所有接口

```json
{
  "Status": "Error",
  "Message": "something wrong"
}
```

#### 格式12: 203 - 频率限制（按用户180秒）
**HTTP状态码**: `203 Non-Authoritative`  
**支持接口**: 所有接口

```json
{
  "Status": "Error",
  "Message": " Only one text message can be sent within 180 seconds ",
  "Data": {
    "ErrorCode": 1,
    "Second": 180
  }
}
```

#### 格式13: 203 - 频率限制（按IP60秒）
**HTTP状态码**: `203 Non-Authoritative`  
**支持接口**: 所有接口

```json
{
  "Status": "Error",
  "Message": " Only one text message can be sent within 60 seconds ",
  "Data": {
    "ErrorCode": 2,
    "Second": 60
  }
}
```

#### 格式14: 406 - 用户手机号已存在
**HTTP状态码**: `406 Not Acceptable`  
**支持接口**: 获取注册OTP、获取注册OTP（新版本）

```json
{
  "Status": "Error",
  "Message": "User's phone already exists!"
}
```

#### 格式15: 406 - 用户邮箱已存在
**HTTP状态码**: `406 Not Acceptable`  
**支持接口**: 获取注册OTP、获取注册OTP（新版本）、获取邮箱OTP

```json
{
  "Status": "Error",
  "Message": "User's email already exists!"
}
```

#### 格式16: 406 - 无效输入
**HTTP状态码**: `406 Not Acceptable`  
**支持接口**: 获取新设备OTP、获取注册设备OTP

```json
{
  "Status": "Error",
  "Message": "Invalid Input"
}
```

#### 格式17: 404 - 用户不存在（Please register!）
**HTTP状态码**: `404 Not Found`  
**支持接口**: 获取忘记密码OTP

```json
{
  "Status": "Error",
  "Message": "Please register!"
}
```

#### 格式18: 404 - 用户不存在（User does not exist!）
**HTTP状态码**: `404 Not Found`  
**支持接口**: 设置用户短信类型并获取OTP

```json
{
  "Status": "Error",
  "Message": "User does not exist!"
}
```

#### 格式19: 404 - 用户不存在（User not found）
**HTTP状态码**: `404 Not Found`  
**支持接口**: 获取提现OTP

```json
{
  "Status": "Error",
  "Message": "User not found"
}
```

#### 格式20: 404 - Viber不支持国际号码
**HTTP状态码**: `404 Not Found`  
**支持接口**: 设置用户短信类型并获取OTP

```json
{
  "Status": "Error",
  "Message": "viber verification code currently does not support international numbers!"
}
```

#### 格式21: 404 - 用户未添加邮箱
**HTTP状态码**: `404 Not Found`  
**支持接口**: 设置用户短信类型并获取OTP

```json
{
  "Status": "Error",
  "Message": "Please add user email first!"
}
```

#### 格式22: 404 - 异常错误
**HTTP状态码**: `404 Not Found`  
**支持接口**: 获取新设备OTP、获取注册设备OTP

```json
{
  "Status": "Error",
  "Message": "异常错误信息"
}
```

#### 格式23: 200 - 发送失败（status=false, start_at/expired_at）
**HTTP状态码**: `200 OK`（虽然返回200但status为false）  
**支持接口**: 获取注册OTP、获取注册OTP（新版本）、获取新设备OTP、获取注册设备OTP、获取邮箱OTP、获取忘记密码OTP、设置用户短信类型并获取OTP

```json
{
  "to": "959782222222",
  "errorCode": "333",
  "errorMessage": "错误信息（最多30字符）",
  "start_at": "2024-01-01 12:00:00",
  "expired_at": "2024-01-01 12:03:00",
  "status": false,
  "request_id": 0
}
```

#### 格式24: 200 - 发送失败（status=false, created_at/expire_at）
**HTTP状态码**: `200 OK`（虽然返回200但status为false）  
**支持接口**: 获取提现OTP

```json
{
  "to": "959782222222",
  "errorCode": "333",
  "errorMessage": "错误信息（最多30字符）",
  "created_at": "2024-01-01 12:00:00",
  "expire_at": "2024-01-01 12:03:00",
  "status": false,
  "request_id": 0
}
```

---

## 接口详情

### 1. 获取注册OTP
**场景**: 用户注册时获取验证码（支持SMS、Viber、Email三种方式）  
**API地址**: `GET /api/v1/user/getRegisterOTP`  
**权限**: 允许匿名访问

**支持的响应格式**:
- ✅ 格式1（成功）
- ✅ 格式5、6、8、9、10、11、12、13、14、15、23（错误）

---

### 2. 获取注册OTP（新版本）
**场景**: 用户注册时获取验证码（新版本，移除了WithinThreeMins检查）  
**API地址**: `GET /api/v1/user/getRegisterOTPNew`  
**权限**: 允许匿名访问

**支持的响应格式**:
- ✅ 格式1（成功）
- ✅ 格式5、6、9、10、11、12、13、14、15、23（错误）

**与上一个接口的区别**: 移除了格式8（so_close检查）

---

### 3. 获取新设备OTP
**场景**: 用户在已注册设备上登录新设备时获取验证码  
**API地址**: `GET /api/v1/user/getNewDeviceOTP`  
**权限**: 允许匿名访问

**支持的响应格式**:
- ✅ 格式2（成功，带guid）
- ✅ 格式5、8、9、10、11、12、13、16、22、23（错误）

---

### 4. 获取注册设备OTP
**场景**: 用户注册新设备时获取验证码  
**API地址**: `GET /api/v1/user/getRegisterDeviceOTP`  
**权限**: 允许匿名访问

**支持的响应格式**:
- ✅ 格式2（成功，带guid）
- ✅ 格式5、8、9、10、11、12、13、16、22、23（错误）

**与上一个接口的区别**: 格式完全相同

---

### 5. 获取邮箱OTP
**场景**: 已登录用户更新邮箱时获取验证码  
**API地址**: `GET /api/v1/user/getemailotp`  
**权限**: 需要用户认证（MyAuthorization）

**支持的响应格式**:
- ✅ 格式1（成功）
- ✅ 格式6、9、10、11、12、13、15、23（错误）

---

### 6. 获取忘记密码OTP
**场景**: 用户忘记密码时获取验证码用于重置密码  
**API地址**: `GET /api/v1/user/getForgotPassowrdOTP`  
**权限**: 允许匿名访问

**支持的响应格式**:
- ✅ 格式1（成功）
- ✅ 格式5、8、9、10、11、12、13、17、23（错误）

---

### 7. 设置用户短信类型并获取OTP
**场景**: 设置用户的短信类型（SMS/Viber/Email）并获取验证码  
**API地址**: `POST /api/v1/user/setUserSmsTypeAndGetOTP`  
**权限**: 允许匿名访问

**支持的响应格式**:
- ✅ 格式2、4（成功，带guid或布尔值false）
- ✅ 格式8、9、10、11、12、13、18、20、21、23（错误）

---

### 8. 获取提现OTP
**场景**: 用户进行提现添加新银行卡操作时获取验证码  
**API地址**: `GET /api/v1/transaction/getWithdrawOTP`  
**权限**: 需要用户认证（MyAuthorization）

**支持的响应格式**:
- ✅ 格式3（成功，使用created_at/expire_at）
- ✅ 格式7、8、9、10、11、12、13、19、24（错误）

---

## 通用说明

### OTP类型
- `sms_poh`: SMS短信（默认）
- `vmg_viber`: Viber消息
- `email`: 邮件

### 频率限制
- 用户级别限制: 默认180秒（可通过配置 `OTP_Limit_Time` 调整）
- IP级别限制: 默认60秒（可通过配置 `OTP_IP_Limit_Time` 调整）

### OTP有效期
- 所有OTP的有效期为3分钟

### 错误码说明
- `000`: 成功
- `333`: 失败

### 权限说明
- `AllowAnonymous`: 允许匿名访问
- `MyAuthorization`: 需要用户认证

### 字段命名差异
- **时间字段**：大部分接口使用 `start_at`/`expired_at`，但获取提现OTP使用 `created_at`/`expire_at`
- **GUID字段**：新设备相关接口（getNewDeviceOTP、getRegisterDeviceOTP、setUserSmsTypeAndGetOTP）会返回 `guid` 字段
