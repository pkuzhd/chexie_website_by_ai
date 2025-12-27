# 认证接口API规范

## 1. 文档概述

本文档描述了论坛项目后端的认证接口规范，包括用户登录、登出和获取当前用户信息功能。

## 2. 认证方式

- **认证类型**：JWT (JSON Web Token)
- **认证方式**：在请求头中添加 `Authorization: Bearer <token>`
- **令牌有效期**：1小时

## 3. API接口列表

| 接口URL | 请求方法 | 功能描述 | 是否需要认证 |
|---------|----------|----------|--------------|
| `/auth/login` | POST | 用户登录，获取JWT令牌 | 否 |
| `/auth/logout` | POST | 用户登出，使令牌失效 | 是 |
| `/auth/current` | GET | 获取当前登录用户信息 | 是 |

## 4. 接口详细说明

### 4.1 登录接口

#### 请求信息
- **URL**: `/auth/login`
- **方法**: `POST`
- **Content-Type**: `application/json`

#### 请求参数

| 参数名 | 类型 | 必选 | 描述 |
|--------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

#### 请求示例

```json
{
  "username": "test",
  "password": "test123"
}
```

#### 响应信息

##### 成功响应 (200 OK)

```json
{
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjE0NjUxLCJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3NjY4MTkyMTcsImV4cCI6MTc2NjgyMjgxN30.FJDMj90v5MPlo4W5XoCxgE8iA3i34At5AlhuUX1R11U",
  "user": {
    "userid": 14651,
    "username": "test",
    "email": null,
    "sex": "男",
    "icon": null,
    "intro": null
  }
}
```

##### 失败响应

- **400 Bad Request**：参数验证失败
  ```json
  {
    "errors": [
      { "msg": "用户名不能为空", "param": "username", "location": "body" },
      { "msg": "密码不能为空", "param": "password", "location": "body" }
    ]
  }
  ```

- **401 Unauthorized**：用户名或密码错误
  ```json
  {
    "message": "用户名或密码错误"
  }
  ```

- **500 Internal Server Error**：服务器错误
  ```json
  {
    "message": "服务器错误"
  }
  ```

### 4.2 登出接口

#### 请求信息
- **URL**: `/auth/logout`
- **方法**: `POST`
- **Authorization**: `Bearer <token>`

#### 请求参数

无请求体参数，需要在请求头中携带JWT令牌。

#### 请求示例

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 响应信息

##### 成功响应 (200 OK)

```json
{
  "message": "登出成功"
}
```

##### 失败响应

- **401 Unauthorized**：未提供令牌或令牌无效
  ```json
  {
    "message": "未提供认证令牌"
  }
  ```
  或
  ```json
  {
    "message": "认证失败或令牌过期"
  }
  ```

### 4.3 获取当前用户信息接口

#### 请求信息
- **URL**: `/auth/current`
- **方法**: `GET`
- **Authorization**: `Bearer <token>`

#### 请求参数

无请求体参数，需要在请求头中携带JWT令牌。

#### 请求示例

```bash
curl -X GET http://localhost:3000/auth/current \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 响应信息

##### 成功响应 (200 OK)

```json
{
  "userid": 14651,
  "username": "test",
  "mail": null,
  "sex": "男",
  "icon": null,
  "intro": null,
  "regdate": null,
  "post": null,
  "reply": null,
  "score": 0
}
```

##### 失败响应

- **401 Unauthorized**：未提供令牌或令牌无效
  ```json
  {
    "message": "未提供认证令牌"
  }
  ```
  或
  ```json
  {
    "message": "认证失败或令牌过期"
  }
  ```

## 5. 错误代码说明

| 状态码 | 描述 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权或认证失败 |
| 500 | 服务器内部错误 |

## 6. 安全说明

1. **密码安全**：密码在数据库中以MD5加密存储，传输过程中应使用HTTPS
2. **令牌保护**：JWT令牌应妥善保管，避免泄露
3. **令牌过期**：令牌有效期为1小时，过期后需要重新登录
4. **登出处理**：登出后令牌会被从数据库中清除，即使令牌未过期也会失效

## 7. 版本信息

- **API版本**: v1
- **更新时间**: 2025-12-27
- **作者**: TraeAI
