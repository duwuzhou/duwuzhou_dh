# 文章管理系统后端 API

一个基于 Node.js + Express + MySQL 的现代化文章管理系统后端服务，提供完整的 RESTful API 接口。

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [API 文档](#api-文档)
- [数据库设计](#数据库设计)
- [安全特性](#安全特性)
- [配置说明](#配置说明)
- [部署指南](#部署指南)

## 🚀 项目概述

这是一个功能完善的文章管理系统后端 API，支持：

- ✅ 文章的完整 CRUD 操作
- ✅ 标签系统（多对多关系）
- ✅ 分页查询和排序
- ✅ 请求限流保护
- ✅ 密码认证机制
- ✅ 完善的错误处理
- ✅ 数据库连接池管理
- ✅ CORS 跨域支持
- ✅ 优雅关闭机制

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | 14+ | JavaScript 运行环境 |
| Express | ^4.18.2 | Web 应用框架 |
| MySQL | 5.7+ | 关系型数据库 |
| mysql2 | ^3.14.0 | MySQL 客户端（Promise 支持） |
| express-rate-limit | ^8.2.1 | 请求限流中间件 |
| cors | ^2.8.5 | 跨域资源共享 |
| dotenv | ^16.5.0 | 环境变量管理 |

## 📁 项目结构

```
hd/
├── config/                 # 配置文件目录
│   ├── server.js          # 服务器配置（端口、CORS）
│   ├── security.js        # 安全配置（限流、认证）
│   ├── database.js        # 数据库管理模块
│   ├── db.js             # 数据库连接池
│   └── routes.js         # 路由配置
├── models/                # 数据模型目录
│   └── article.js        # 文章模型（CRUD 操作）
├── routes/                # API 路由目录
│   └── articles.js       # 文章相关路由
├── public/                # 静态文件目录
│   ├── article_list.html # 文章列表页面
│   ├── create_article.html # 创建文章页面
│   └── 404.html          # 404 错误页面
├── .env                   # 环境变量配置
├── .gitignore            # Git 忽略文件
├── index.js              # 应用入口文件
├── package.json          # 项目依赖配置
├── vercel.json           # Vercel 部署配置
├── README.md             # 项目文档
├── API.md                # API 详细文档
├── DEVELOPMENT.md        # 开发指南
├── QUICK_START.md        # 快速开始指南
└── SECURITY.md           # 安全说明文档
```

## 🎯 快速开始

### 1. 环境要求

- Node.js >= 14.0.0
- MySQL >= 5.7
- npm 或 yarn

### 2. 安装依赖

```bash
cd hd
npm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database
DB_WAIT_FOR_CONNECTIONS=true
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# 服务器配置
PORT=3000

# 管理员密码（用于创建、更新、删除文章）
ADMIN_PASSWORD=your_secure_password
```

### 4. 初始化数据库

执行以下 SQL 语句创建数据表：

```sql
-- 创建文章表
CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  date DATE,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建标签表
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建文章标签关联表
CREATE TABLE article_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_article_tag (article_id, tag_id),
  INDEX idx_article_id (article_id),
  INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 5. 启动服务

```bash
npm start
```

服务将在 `http://localhost:3000` 启动。

### 6. 验证服务

访问健康检查端点：

```bash
curl http://localhost:3000/health
```

预期响应：

```json
{
  "status": "ok",
  "timestamp": "2024-12-25T14:30:00.000Z",
  "uptime": 123.456
}
```

## 📚 API 文档

### 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **认证方式**: 请求头 `x-password` 或请求体 `password` 字段

### 统一响应格式

**成功响应：**

```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-12-25T14:30:00.000Z"
}
```

**错误响应：**

```json
{
  "success": false,
  "error": "Error Type",
  "message": "错误描述",
  "details": "详细错误信息"
}
```

### 端点列表

#### 1. 获取文章列表

```http
GET /articles?page=1&pageSize=10&sortBy=date&order=DESC
```

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码（≥1） |
| pageSize | number | 否 | 10 | 每页数量（1-100） |
| sortBy | string | 否 | date | 排序字段（id/title/date/created_at） |
| order | string | 否 | DESC | 排序方向（ASC/DESC） |

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "文章标题",
      "summary": "文章摘要",
      "date": "2024-01-01",
      "content": "文章内容",
      "tags": ["Vue", "JavaScript"],
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5
  },
  "timestamp": "2024-12-25T14:30:00.000Z"
}
```

#### 2. 获取单篇文章

```http
GET /articles/:id
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 文章ID |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "文章标题",
    "summary": "文章摘要",
    "date": "2024-01-01",
    "content": "文章内容",
    "tags": ["Vue", "JavaScript"],
    "created_at": "2024-01-01T10:00:00.000Z"
  },
  "timestamp": "2024-12-25T14:30:00.000Z"
}
```

#### 3. 创建文章

```http
POST /articles
Content-Type: application/json
x-password: your_admin_password
```

**请求体：**

```json
{
  "title": "新文章标题",
  "summary": "文章摘要",
  "date": "2024-01-15",
  "content": "文章内容",
  "tags": ["Vue", "TypeScript"]
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题 |
| summary | string | 是 | 文章摘要 |
| date | string | 是 | 发布日期（YYYY-MM-DD） |
| content | string | 否 | 文章内容 |
| tags | array | 否 | 标签数组 |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "新文章标题",
    "summary": "文章摘要",
    "date": "2024-01-15",
    "content": "文章内容",
    "tags": ["Vue", "TypeScript"]
  },
  "message": "文章创建成功",
  "timestamp": "2024-12-25T14:30:00.000Z"
}
```

#### 4. 更新文章

```http
PUT /articles/:id
Content-Type: application/json
x-password: your_admin_password
```

**请求体：** 同创建文章

**响应示例：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "更新后的标题",
    "summary": "更新后的摘要",
    "date": "2024-01-15",
    "content": "更新后的内容",
    "tags": ["Vue", "TypeScript"]
  },
  "message": "文章更新成功",
  "timestamp": "2024-12-25T14:30:00.000Z"
}
```

#### 5. 删除文章

```http
DELETE /articles/:id
x-password: your_admin_password
```

**响应示例：**

```json
{
  "success": true,
  "message": "文章删除成功",
  "articleId": "1",
  "timestamp": "2024-12-25T14:30:00.000Z"
}
```

#### 6. 健康检查

```http
GET /health
```

**响应示例：**

```json
{
  "status": "ok",
  "timestamp": "2024-12-25T14:30:00.000Z",
  "uptime": 123.456
}
```

## 🗄️ 数据库设计

### ER 图

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│  articles   │         │  article_tags    │         │    tags     │
├─────────────┤         ├──────────────────┤         ├─────────────┤
│ id (PK)     │────┐    │ id (PK)          │    ┌────│ id (PK)     │
│ title       │    └───<│ article_id (FK)  │    │    │ name (UQ)   │
│ summary     │         │ tag_id (FK)      │>───┘    └─────────────┘
│ date        │         └──────────────────┘
│ content     │
│ created_at  │
└─────────────┘
```

### 表结构说明

**articles 表：**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 文章ID |
| title | VARCHAR(255) | NOT NULL | 文章标题 |
| summary | TEXT | - | 文章摘要 |
| date | DATE | - | 发布日期 |
| content | TEXT | - | 文章内容 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**tags 表：**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 标签ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | 标签名称 |

**article_tags 表：**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 关联ID |
| article_id | INT | FOREIGN KEY | 文章ID |
| tag_id | INT | FOREIGN KEY | 标签ID |

## 🔒 安全特性

### 1. 请求限流

**通用限流：**
- 时间窗口：15分钟
- 最大请求数：100次/IP
- 超出限制返回 429 状态码

**严格限流（敏感操作）：**
- 时间窗口：15分钟
- 最大请求数：10次/IP
- 适用于：创建、更新、删除文章

### 2. 密码认证

所有写操作（POST、PUT、DELETE）需要提供管理员密码：

**方式一：请求头**
```http
x-password: your_admin_password
```

**方式二：请求体**
```json
{
  "password": "your_admin_password",
  "title": "文章标题",
  ...
}
```

### 3. 安全响应头

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 4. CORS 配置

仅允许以下来源访问：
- `https://duwuzhou.github.io`

### 5. 输入验证

- 所有用户输入都经过严格验证
- SQL 注入防护（使用参数化查询）
- XSS 防护（输入过滤）

### 6. 数据库安全

- 使用连接池管理
- 事务处理确保数据一致性
- 外键约束保证引用完整性
- 自动释放连接防止泄漏

## ⚙️ 配置说明

### 环境变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| DB_HOST | string | - | 数据库主机地址 |
| DB_PORT | number | 3306 | 数据库端口 |
| DB_USER | string | - | 数据库用户名 |
| DB_PASSWORD | string | - | 数据库密码 |
| DB_DATABASE | string | - | 数据库名称 |
| DB_CONNECTION_LIMIT | number | 10 | 连接池最大连接数 |
| PORT | number | 3000 | 服务器端口 |
| ADMIN_PASSWORD | string | admin123 | 管理员密码 |

### 数据库连接池配置

```javascript
{
  connectionLimit: 10,        // 最大连接数
  queueLimit: 0,             // 队列限制（0=无限制）
  waitForConnections: true,  // 等待可用连接
  enableKeepAlive: true,     // 启用保活
  connectTimeout: 10000,     // 连接超时（10秒）
  timezone: '+08:00',        // 时区（东八区）
  charset: 'utf8mb4'         // 字符集
}
```

## 🚀 部署指南

### Vercel 部署

1. **安装 Vercel CLI**

```bash
npm install -g vercel
```

2. **登录 Vercel**

```bash
vercel login
```

3. **部署项目**

```bash
vercel
```

4. **配置环境变量**

在 Vercel 项目设置中添加所有环境变量。

5. **生产部署**

```bash
vercel --prod
```

### 传统服务器部署

1. **使用 PM2 管理进程**

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start index.js --name "article-api"

# 设置开机自启
pm2 startup
pm2 save
```

2. **使用 Nginx 反向代理**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 📊 性能优化

### 1. 数据库优化

- ✅ 使用索引加速查询
- ✅ 连接池复用连接
- ✅ 事务批量处理
- ✅ 查询结果缓存

### 2. API 优化

- ✅ 分页查询减少数据量
- ✅ 请求限流防止滥用
- ✅ GZIP 压缩响应
- ✅ 异步处理提高并发

### 3. 监控建议

- 使用 PM2 监控进程状态
- 配置日志收集系统
- 设置性能监控告警
- 定期备份数据库

## 🐛 故障排查

### 常见问题

**1. 数据库连接失败**

```
❌ 数据库连接失败: connect ECONNREFUSED
```

**解决方案：**
- 检查数据库服务是否启动
- 验证 `.env` 配置是否正确
- 确认防火墙规则

**2. 密码验证失败**

```
⚠️ 密码验证失败 - IP: xxx.xxx.xxx.xxx
```

**解决方案：**
- 检查 `ADMIN_PASSWORD` 环境变量
- 确认请求头或请求体包含正确密码

**3. 请求被限流**

```json
{
  "error": "Too Many Requests",
  "message": "请求过于频繁，请稍后再试"
}
```

**解决方案：**
- 等待15分钟后重试
- 减少请求频率
- 联系管理员调整限流配置

## 📝 开发指南

### 添加新的 API 端点

1. 在 `routes/` 目录创建路由文件
2. 在 `models/` 目录创建数据模型
3. 在 `config/routes.js` 中注册路由
4. 更新 API 文档

### 代码规范

- 使用 ES6+ 语法
- 异步操作使用 async/await
- 统一错误处理格式
- 添加详细的注释

### 测试建议

```bash
# 使用 curl 测试 API
curl -X GET http://localhost:3000/articles

# 使用 Postman 或 Insomnia 进行完整测试
```

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 👥 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 联系方式

- **邮箱**: 1503965150@qq.com
- **GitHub**: [@duwuzhou](https://github.com/duwuzhou)
- **网站**: https://duwuzhou.github.io

## 🙏 致谢

感谢所有开源项目的贡献者！

---

**最后更新时间**: 2024-12-25

**版本**: 2.0.0
