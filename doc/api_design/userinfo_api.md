# 用户信息接口API规范

## 1. 文档概述

本文档描述了论坛项目后端的用户信息接口规范，包括获取单个用户信息和获取多个用户信息功能。

## 2. 认证方式

- **认证类型**：无认证
- **说明**：用户信息接口无需登录即可访问

## 3. API接口列表

| 接口URL | 请求方法 | 功能描述 | 是否需要认证 |
|---------|----------|----------|--------------|
| `/api/userinfo/:username` | GET | 获取单个用户信息 | 否 |
| `/api/userinfo` | POST | 获取多个用户信息 | 否 |

## 4. 接口详细说明

### 4.1 获取单个用户信息接口

#### 请求信息
- **URL**: `/api/userinfo/:username`
- **方法**: `GET`

#### 请求参数

| 参数名 | 类型 | 必选 | 描述 |
|--------|------|------|------|
| username | String | 是 | 用户名（通过URL路径传递） |

#### 请求示例

```bash
curl -X GET http://localhost:3000/api/userinfo/test
```

#### 响应信息

##### 成功响应 (200 OK)

```json
{
  "message": "获取用户信息成功",
  "data": {
    "test": {
      "username": "test",
      "sex": "男",
      "icon": null,
      "intro": null,
      "regdate": null,
      "post": null,
      "reply": null,
      "score": 0
    }
  }
}
```

##### 失败响应

- **404 Not Found**：用户不存在
  ```json
  {
    "message": "用户不存在"
  }
  ```

- **500 Internal Server Error**：服务器错误
  ```json
  {
    "message": "服务器错误"
  }
  ```

### 4.2 获取多个用户信息接口

#### 请求信息
- **URL**: `/api/userinfo`
- **方法**: `POST`
- **Content-Type**: `application/json`

#### 请求参数

| 参数名 | 类型 | 必选 | 描述 |
|--------|------|------|------|
| usernames | Array | 是 | 用户名数组 |

#### 请求示例

```json
{
  "usernames": ["test", "user,name", "nonexistent"]
}
```

#### 响应信息

##### 成功响应 (200 OK)

```json
{
  "message": "获取用户列表成功",
  "data": {
    "test": {
      "username": "test",
      "sex": "男",
      "icon": null,
      "intro": null,
      "regdate": null,
      "post": null,
      "reply": null,
      "score": 0
    },
    "user,name": {
      "username": "user,name",
      "sex": "女",
      "icon": null,
      "intro": null,
      "regdate": null,
      "post": null,
      "reply": null,
      "score": 0
    }
  },
  "notFound": ["nonexistent"]
}
```

##### 失败响应

- **400 Bad Request**：请求参数错误
  ```json
  {
    "message": "请提供JSON格式的用户名列表：{\"usernames\": [\"user1\", \"user2\"]}"
  }
  ```

- **500 Internal Server Error**：服务器错误
  ```json
  {
    "message": "服务器错误"
  }
  ```

## 5. 错误代码说明

| 状态码 | 描述 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

## 6. 安全说明

1. **数据安全**：返回结果中不包含密码等敏感信息
2. **访问控制**：无需认证即可访问，但仅返回公开的用户信息
3. **输入验证**：对请求参数进行验证，防止恶意输入

## 7. 版本信息

- **API版本**: v1
- **更新时间**: 2025-12-27
- **作者**: TraeAI