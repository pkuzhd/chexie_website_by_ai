# 主题帖信息接口API规范

## 1. 文档概述

本文档描述了论坛项目后端的主题帖信息接口规范，包括通过查询参数获取主题帖列表或单个主题帖信息，以及通过路径参数获取单个主题帖信息功能。

## 2. 认证方式

- **认证类型**：无
- **访问权限**：公开接口，无需登录即可访问

## 3. API接口列表

| 接口URL | 请求方法 | 功能描述 | 是否需要认证 |
|---------|----------|----------|--------------|
| `/api/threads` | GET | 通过查询参数获取主题帖列表或单个主题帖信息 | 否 |
| `/api/threads/:bid/:tid` | GET | 通过路径参数获取单个主题帖信息 | 否 |

## 4. 接口详细说明

### 4.1 通过查询参数获取主题帖信息接口

#### 请求信息
- **URL**: `/api/threads`
- **方法**: `GET`

#### 请求参数

| 参数名 | 类型 | 必选 | 描述 |
|--------|------|------|------|
| bid | Number | 是 | 板块ID |
| tid | Number | 否 | 主题帖ID，提供此参数时返回单个主题帖信息 |
| p | Number | 否 | 页码，默认值为1 |
| p_size | Number | 否 | 每页大小，默认值为10 |
| extr | Number | 否 | 精华帖级别，默认值为0。0表示普通帖子，大于0表示精华帖 |

#### 请求示例

##### 获取分页主题帖列表
```bash
curl -X GET http://localhost:3000/api/threads?bid=1&p=1&p_size=10
```

##### 获取分页主题帖列表（指定extr参数）
```bash
curl -X GET http://localhost:3000/api/threads?bid=1&p=1&extr=1
```

##### 获取单个主题帖信息
```bash
curl -X GET http://localhost:3000/api/threads?bid=1&tid=2
```

#### 响应信息

##### 成功响应 - 获取分页主题帖列表 (200 OK)

```json
{
  "message": "获取主题帖列表成功",
  "data": {
    "threads": [
      {
        "bid": 1,
        "tid": 1,
        "title": "主题帖标题1",
        "author": "用户1",
        "timestamp": 1622547600000,
        "views": 100,
        "replies": 10
      },
      {
        "bid": 1,
        "tid": 2,
        "title": "主题帖标题2",
        "author": "用户2",
        "timestamp": 1622461200000,
        "views": 200,
        "replies": 20
      }
      // 更多主题帖信息...
    ],
    "pagination": {
      "current_page": 1,
      "page_size": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

##### 成功响应 - 获取单个主题帖信息 (200 OK)

```json
{
  "message": "获取主题帖信息成功",
  "data": {
    "bid": 1,
    "tid": 2,
    "title": "主题帖标题2",
    "author": "用户2",
    "timestamp": 1622461200000,
    "views": 200,
    "replies": 20
  }
}
```

##### 失败响应

- **400 Bad Request**：参数验证失败
  ```json
  {
    "message": "缺少必填参数bid"
  }
  ```
  或
  ```json
  {
    "message": "bid参数不是有效的整数"
  }
  ```
  或
  ```json
  {
    "message": "tid参数不是有效的整数"
  }
  ```

- **404 Not Found**：主题帖不存在
  ```json
  {
    "message": "主题帖不存在"
  }
  ```

- **500 Internal Server Error**：服务器错误
  ```json
  {
    "message": "服务器错误"
  }
  ```

### 4.2 通过路径参数获取单个主题帖信息接口

#### 请求信息
- **URL**: `/api/threads/:bid/:tid`
- **方法**: `GET`

#### 请求参数

| 参数名 | 类型 | 必选 | 描述 |
|--------|------|------|------|
| bid | Number | 是 | 板块ID（通过URL路径传递） |
| tid | Number | 是 | 主题帖ID（通过URL路径传递） |

#### 请求示例

```bash
curl -X GET http://localhost:3000/api/threads/1/2
```

#### 响应信息

##### 成功响应 (200 OK)

```json
{
  "message": "获取主题帖信息成功",
  "data": {
    "bid": 1,
    "tid": 2,
    "title": "主题帖标题2",
    "author": "用户2",
    "timestamp": 1622461200000,
    "views": 200,
    "replies": 20
  }
}
```

##### 失败响应

- **400 Bad Request**：参数验证失败
  ```json
  {
    "message": "bid或tid参数不是有效的整数"
  }
  ```

- **404 Not Found**：主题帖不存在
  ```json
  {
    "message": "主题帖不存在"
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
| 404 | 主题帖不存在 |
| 500 | 服务器内部错误 |

## 6. 安全说明

1. **数据安全**：返回结果中不包含敏感信息
2. **访问控制**：无需认证即可访问，所有用户均可查看主题帖内容
3. **输入验证**：对请求参数进行验证，防止恶意输入

## 7. 版本信息

- **API版本**: v1
- **更新时间**: 2025-12-28
- **作者**: TraeAI