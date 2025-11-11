# API 文档

## 概述

这是一个基于Node.js和Express的后端API服务，提供文章管理和用户管理功能。所有API响应格式为JSON，支持CORS跨域请求。

## 基础信息

- **基础URL**: `http://localhost:3000` (本地开发)
- **数据格式**: JSON
- **字符编码**: UTF-8
- **跨域支持**: 已启用，允许 `https://duwuzhou.github.io`

## 文章管理 API

### 1. 获取所有文章

获取所有文章列表，支持分页功能。

**请求信息**
```http
GET /articles
```

**请求参数**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认为1 |
| pageSize | number | 否 | 每页数量，默认为10 |

**响应示例**
```json
[
  {
    "id": 1,
    "title": "Vue3组合式API入门指南",
    "summary": "详细介绍Vue3中组合式API的使用方法和最佳实践",
    "date": "2024-01-15",
    "tags": ["Vue3", "前端", "JavaScript"]
  },
  {
    "id": 2,
    "title": "Node.js性能优化技巧",
    "summary": "分享Node.js应用性能优化的实用技巧和经验",
    "date": "2024-01-10",
    "tags": ["Node.js", "性能优化", "后端"]
  }
]
```

**状态码**
- `200 OK`: 请求成功
- `500 Internal Server Error`: 服务器内部错误

### 2. 创建新文章

创建一篇新的文章。

**请求信息**
```http
POST /articles
Content-Type: application/json
```

**请求体**
```json
{
  "title": "新文章标题",
  "summary": "文章内容摘要",
  "date": "2024-01-20",
  "tags": ["标签1", "标签2", "标签3"]
}
```

**字段说明**
| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题，长度限制255字符 |
| summary | string | 是 | 文章摘要 |
| date | string | 是 | 文章日期，格式：YYYY-MM-DD |
| tags | array | 是 | 标签数组，每个标签为字符串 |

**响应示例**
```json
{
  "id": 3,
  "title": "新文章标题",
  "summary": "文章内容摘要",
  "date": "2024-01-20",
  "tags": ["标签1", "标签2", "标签3"]
}
```

**状态码**
- `201 Created`: 创建成功
- `400 Bad Request`: 请求参数错误
- `500 Internal Server Error`: 服务器内部错误

### 3. 删除文章

删除指定的文章。

**请求信息**
```http
DELETE /articles/:id
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 文章ID |

**响应**
- 成功：返回 `204 No Content`
- 失败：返回错误信息

**状态码**
- `204 No Content`: 删除成功
- `404 Not Found`: 文章未找到
- `500 Internal Server Error`: 服务器内部错误

## 用户管理 API

### 1. 获取用户列表

获取所有用户列表（目前返回模拟数据）。

**请求信息**
```http
GET /users
```

**响应示例**
```json
[
  {
    "id": 1,
    "name": "用户1"
  },
  {
    "id": 2,
    "name": "用户2"
  }
]
```

**状态码**
- `200 OK`: 请求成功

## 错误处理

所有API在发生错误时会返回统一的错误格式：

```json
{
  "message": "错误描述信息"
}
```

### 常见错误码

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

## 使用示例

### JavaScript (Fetch API)

```javascript
// 获取文章列表
fetch('/articles')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// 创建新文章
fetch('/articles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '新文章',
    summary: '文章摘要',
    date: '2024-01-20',
    tags: ['JavaScript', 'Node.js']
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// 删除文章
fetch('/articles/1', {
  method: 'DELETE'
})
  .then(response => {
    if (response.ok) {
      console.log('删除成功');
    } else {
      console.error('删除失败');
    }
  })
  .catch(error => console.error('Error:', error));
```

### Python (requests)

```python
import requests
import json

# 获取文章列表
response = requests.get('http://localhost:3000/articles')
articles = response.json()
print(articles)

# 创建新文章
article_data = {
    "title": "Python测试文章",
    "summary": "这是用Python创建的文章",
    "date": "2024-01-20",
    "tags": ["Python", "API"]
}
response = requests.post('http://localhost:3000/articles', 
                        json=article_data)
new_article = response.json()
print(new_article)

# 删除文章
response = requests.delete('http://localhost:3000/articles/1')
if response.status_code == 204:
    print("删除成功")
else:
    print("删除失败")
```

## 数据库结构

### 文章表 (articles)
```sql
CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 标签表 (tags)
```sql
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);
```

### 文章标签关联表 (article_tags)
```sql
CREATE TABLE article_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT,
  tag_id INT,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## 注意事项

1. **日期格式**: 所有日期字段使用 `YYYY-MM-DD` 格式
2. **标签处理**: 创建文章时，如果标签不存在会自动创建
3. **分页**: 获取文章列表时，默认每页10条记录
4. **事务处理**: 文章创建和删除操作使用数据库事务，确保数据一致性
5. **CORS**: API已配置CORS，允许来自 `https://duwuzhou.github.io` 的请求

## 更新日志

### v1.0.0 (2024-01-20)
- 初始版本发布
- 文章管理功能（获取、创建、删除）
- 标签系统支持
- 用户API
- 基础错误处理