# 帖子信息接口API规范

## 1. 文档概述

本文档描述了论坛项目后端的帖子信息接口规范，包括获取分页帖子列表、通过查询参数获取单个楼层信息、通过路径参数获取单个楼层信息以及通过fid获取单个楼层信息功能。

## 2. 认证方式

- **认证类型**：无
- **访问权限**：公开接口，无需登录即可访问

## 3. API接口列表

| 接口URL | 请求方法 | 功能描述 | 是否需要认证 |
|---------|----------|----------|--------------|
| `/api/posts` | GET | 通过查询参数获取分页帖子列表或单个楼层信息 | 否 |
| `/api/posts/:bid/:tid/:pid` | GET | 通过路径参数获取单个楼层信息 | 否 |
| `/api/posts/:fid` | GET | 通过fid获取单个楼层信息 | 否 |

## 4. 接口详细说明

### 4.1 通过查询参数获取帖子信息接口

#### 请求信息
- **URL**: `/api/posts`
- **方法**: `GET`

#### 请求参数

| 参数名 | 类型 | 必选 | 描述 |
|--------|------|------|------|
| bid | Number | 是 | 板块ID |
| tid | Number | 是 | 主题帖ID |
| p | Number | 否 | 页码，默认值为1 |
| p_size | Number | 否 | 每页大小，默认值为12 |
| pid | Number | 否 | 楼层ID，提供此参数时返回单个楼层信息 |

#### 请求示例

##### 获取分页帖子列表
```bash
curl -X GET http://localhost:3000/api/posts?bid=1&tid=4&p=1&p_size=10
```

##### 获取单个楼层信息
```bash
curl -X GET http://localhost:3000/api/posts?bid=1&tid=4&pid=1
```

#### 响应信息

##### 成功响应 - 获取分页帖子列表 (200 OK)

```json
{
  "message": "获取帖子列表成功",
  "data": {
    "posts": [
      {
        "bid": 1,
        "tid": 4,
        "pid": 1,
        "fid": 597870,
        "title": "A的主题帖",
        "author": "A",
        "text": "大家好，我是用户A，这是我的第一个主题帖！",
        "ishtml": "",
        "attachs": "",
        "replytime": 1068101171,
        "updatetime": 1068101171,
        "sig": 0,
        "type": "",
        "ip": "127.0.0.1",
        "lzl": 0
      },
      {
        "bid": 1,
        "tid": 4,
        "pid": 2,
        "fid": 597872,
        "title": "Re: A的主题帖",
        "author": "C",
        "text": "用户A你好！很高兴看到你的主题帖。",
        "ishtml": "",
        "attachs": "",
        "replytime": 1068101200,
        "updatetime": 1068101200,
        "sig": 0,
        "type": "",
        "ip": "127.0.0.1",
        "lzl": 0
      }
      // 更多帖子信息...
    ],
    "pagination": {
      "current_page": 1,
      "page_size": 10,
      "total": 20,
      "total_pages": 2
    }
  }
}
```

##### 成功响应 - 获取单个楼层信息 (200 OK)

```json
{
  "message": "获取帖子信息成功",
  "data": {
    "bid": 1,
    "tid": 4,
    "pid": 1,
    "fid": 597870,
    "title": "A的主题帖",
    "author": "A",
    "text": "大家好，我是用户A，这是我的第一个主题帖！",
    "ishtml": "",
    "attachs": "",
    "replytime": 1068101171,
    "updatetime": 1068101171,
    "sig": 0,
    "type": "",
    "ip": "127.0.0.1",
    "lzl": 0
  }
}
```

##### 失败响应

- **400 Bad Request**：参数验证失败
  ```json
  {
    "message": "缺少必填参数bid或tid"
  }
  ```
  或
  ```json
  {
    "message": "bid或tid参数不是有效的整数"
  }
  ```
  或
  ```json
  {
    "message": "pid参数不是有效的整数"
  }
  ```

- **404 Not Found**：帖子不存在
  ```json
  {
    "message": "帖子不存在"
  }
  ```

- **500 Internal Server Error**：服务器错误
  ```json
  {
    "message": "服务器错误"
  }
  ```

### 4.2 通过路径参数获取单个楼层信息接口

#### 请求信息
- **URL**: `/api/posts/:bid/:tid/:pid`
- **方法**: `GET`

#### 请求参数

| 参数名 | 类型 | 必选 | 描述 |
|--------|------|------|------|
| bid | Number | 是 | 板块ID（通过URL路径传递） |
| tid | Number | 是 | 主题帖ID（通过URL路径传递） |
| pid | Number | 是 | 楼层ID（通过URL路径传递） |

#### 请求示例

```bash
curl -X GET http://localhost:3000/api/posts/1/4/1
```

#### 响应信息

##### 成功响应 (200 OK)

```json
{
  "message": "获取帖子信息成功",
  "data": {
    "bid": 1,
    "tid": 4,
    "pid": 1,
    "fid": 597870,
    "title": "A的主题帖",
    "author": "A",
    "text": "大家好，我是用户A，这是我的第一个主题帖！",
    "ishtml": "",
    "attachs": "",
    "replytime": 1068101171,
    "updatetime": 1068101171,
    "sig": 0,
    "type": "",
    "ip": "127.0.0.1",
    "lzl": 0
  }
}
```

##### 失败响应

- **400 Bad Request**：参数验证失败
  ```json
  {
    "message": "bid、tid或pid参数不是有效的整数"
  }
  ```

- **404 Not Found**：帖子不存在
  ```json
  {
    "message": "帖子不存在"
  }
  ```

- **500 Internal Server Error**：服务器错误
  ```json
  {
    "message": "服务器错误"
  }
  ```

### 4.3 通过fid获取单个楼层信息接口

#### 请求信息
- **URL**: `/api/posts/:fid`
- **方法**: `GET`

#### 请求参数

| 参数名 | 类型 | 必选 | 描述 |
|--------|------|------|------|
| fid | Number | 是 | 楼层唯一ID（通过URL路径传递） |

#### 请求示例

```bash
curl -X GET http://localhost:3000/api/posts/597870
```

#### 响应信息

##### 成功响应 (200 OK)

```json
{
  "message": "获取帖子信息成功",
  "data": {
    "bid": 1,
    "tid": 4,
    "pid": 1,
    "fid": 597870,
    "title": "A的主题帖",
    "author": "A",
    "text": "大家好，我是用户A，这是我的第一个主题帖！",
    "ishtml": "",
    "attachs": "",
    "replytime": 1068101171,
    "updatetime": 1068101171,
    "sig": 0,
    "type": "",
    "ip": "127.0.0.1",
    "lzl": 0
  }
}
```

##### 失败响应

- **400 Bad Request**：参数验证失败
  ```json
  {
    "message": "fid参数不是有效的整数"
  }
  ```

- **404 Not Found**：帖子不存在
  ```json
  {
    "message": "帖子不存在"
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
| 404 | 帖子不存在 |
| 500 | 服务器内部错误 |

## 6. 安全说明

1. **数据安全**：返回结果中不包含敏感信息
2. **访问控制**：无需认证即可访问，所有用户均可查看帖子内容
3. **输入验证**：对请求参数进行验证，防止恶意输入

## 7. 版本信息

- **API版本**: v1
- **更新时间**: 2025-12-28
- **作者**: TraeAI