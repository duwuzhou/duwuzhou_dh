# 基础Node.js后端项目

一个基于Node.js和Express的简单后端API服务，支持文章管理系统和用户API。

## 🚀 项目概述

这个项目是一个完整的后端API服务，包含：
- 文章管理系统的完整CRUD功能
- 简单的用户API
- MySQL数据库支持
- 标签系统
- CORS跨域支持
- Vercel部署配置

## 📁 项目结构

```
hd/
├── config/
│   └── db.js              # 数据库连接配置
├── models/
│   └── article.js         # 文章数据模型
├── public/                # 静态文件
│   ├── article_list.html  # 文章列表页面
│   └── create_article.html # 创建文章页面
├── routes/                # API路由
│   ├── articles.js        # 文章相关API
│   └── users.js           # 用户相关API
├── index.js               # 主服务器文件
├── package.json           # 项目依赖
├── vercel.json            # Vercel部署配置
└── README.md              # 项目文档
```

## ✨ 主要功能

### 1. 文章管理系统
- ✅ 获取所有文章（支持分页）
- ✅ 创建新文章
- ✅ 删除文章
- ✅ 标签系统支持
- ✅ 事务处理

### 2. 用户API
- ✅ 获取用户列表（返回模拟数据）

### 3. 技术特性
- CORS跨域支持
- MySQL数据库连接池
- 静态文件服务
- 错误处理中间件
- 环境变量配置

## 🗄️ 数据库设计

### 文章表 (articles)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| title | VARCHAR(255) | 文章标题 |
| summary | TEXT | 文章摘要 |
| date | DATE | 文章日期 |

### 标签表 (tags)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| name | VARCHAR(100) | 标签名称 |

### 文章标签关联表 (article_tags)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| article_id | INT | 文章ID（外键） |
| tag_id | INT | 标签ID（外键） |

## 🔌 API文档

### 文章API

#### 1. 获取所有文章
```http
GET /articles
```

**响应示例:**
```json
[
  {
    "id": 1,
    "title": "文章标题",
    "summary": "文章摘要",
    "date": "2024-01-01",
    "tags": ["标签1", "标签2"]
  }
]
```

#### 2. 创建新文章
```http
POST /articles
Content-Type: application/json

{
  "title": "新文章标题",
  "summary": "新文章摘要",
  "date": "2024-01-15",
  "tags": ["标签1", "标签2"]
}
```

**响应示例:**
```json
{
  "id": 2,
  "title": "新文章标题",
  "summary": "新文章摘要", 
  "date": "2024-01-15",
  "tags": ["标签1", "标签2"]
}
```

#### 3. 删除文章
```http
DELETE /articles/:id
```

**响应:** 204 No Content (成功) 或 404 Not Found (未找到)

### 用户API

#### 1. 获取用户列表
```http
GET /users
```

**响应示例:**
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

## 🛠️ 环境配置

创建 `.env` 文件在项目根目录：

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
```

## 📦 安装与运行

### 1. 安装依赖
```bash
npm install
```

### 2. 配置数据库
- 创建MySQL数据库
- 执行SQL建表语句
- 配置`.env`文件

### 3. 启动服务
```bash
npm start
```

### 4. 访问服务
- 主页: http://localhost:3000
- 文章列表: http://localhost:3000/article_list.html
- 创建文章: http://localhost:3000/create_article.html

## 🚀 部署说明

项目已配置Vercel部署支持：

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 设置环境变量
4. 自动部署

### Vercel环境变量设置
在Vercel项目设置中添加以下环境变量：
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_DATABASE`

## 🏗️ 开发指南

### 添加新的API端点

1. 在 `routes/` 目录下创建路由文件
2. 在 `index.js` 中引入和使用路由
3. 如需数据库操作，在 `models/` 目录下创建模型

### 前端页面开发

1. 在 `public/` 目录下创建HTML文件
2. 使用JavaScript调用API
3. 样式使用内联CSS或外部CSS文件

### 数据库迁移

```sql
-- 创建文章表
CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建标签表
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- 创建文章标签关联表
CREATE TABLE article_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT,
  tag_id INT,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## 🔧 技术栈

- **后端**: Node.js + Express.js
- **数据库**: MySQL + mysql2
- **部署**: Vercel
- **CORS**: cors中间件
- **配置**: dotenv

## 📝 注意事项

1. 数据库连接使用连接池模式，提高性能
2. 文章删除操作使用事务，确保数据一致性
3. 标签系统支持自动创建新标签
4. CORS配置允许GitHub Pages域名访问
5. 所有API响应都使用JSON格式

## 🤝 贡献指南

1. Fork本项目
2. 创建功能分支
3. 提交修改
4. 发起Pull Request

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 📞 联系方式

如有问题或建议，请通过GitHub Issues联系。