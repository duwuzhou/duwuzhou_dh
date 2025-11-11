# 开发指南

## 项目概述

这是一个基于Node.js和Express的后端API项目，提供了文章管理和用户管理功能。本指南将帮助开发者了解项目结构、扩展功能以及最佳实践。

## 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: MySQL (使用 mysql2 连接器)
- **ORM/查询**: 原生SQL查询 + 连接池
- **部署**: Vercel
- **开发工具**: 任何现代IDE/编辑器

## 项目结构详解

```
hd/
├── config/
│   └── db.js              # 数据库连接配置，使用连接池
├── models/
│   └── article.js         # 文章数据模型，包含业务逻辑
├── public/                # 静态前端文件
│   ├── article_list.html  # 文章列表页面
│   └── create_article.html # 创建文章页面
├── routes/                # API路由定义
│   ├── articles.js        # 文章相关API端点
│   └── users.js           # 用户相关API端点
├── index.js               # 主应用入口点
├── package.json           # 项目依赖和脚本
├── vercel.json            # Vercel部署配置
└── README.md              # 项目说明文档
```

## 核心组件分析

### 1. 数据库层 (config/db.js)

```javascript
const mysql = require("mysql2/promise");
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT)
});

module.exports = pool;
```

**关键特性:**
- 使用连接池管理数据库连接
- 支持环境变量配置
- 异步/等待模式

### 2. 模型层 (models/article.js)

文章模型包含三个主要方法：
- `findAll()`: 获取文章列表
- `create()`: 创建新文章（包含事务处理）
- `delete()`: 删除文章（包含事务处理）

**事务处理示例:**
```javascript
static async create({ title, summary, date, tags }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // 业务逻辑...
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
```

### 3. 路由层 (routes/articles.js)

每个路由处理函数都包含：
- 错误处理
- 适当的HTTP状态码
- CORS支持

## 开发工作流

### 1. 本地开发环境设置

```bash
# 1. 克隆项目
git clone [your-repo-url]
cd hd

# 2. 安装依赖
npm install

# 3. 创建环境变量文件
cp .env.example .env
# 编辑 .env 文件配置数据库信息

# 4. 设置数据库
# 创建数据库并执行建表SQL

# 5. 启动开发服务器
npm start
```

### 2. 数据库设置

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS article_management;
USE article_management;

-- 创建文章表
CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建标签表
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建文章标签关联表
CREATE TABLE article_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT,
  tag_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 创建索引优化查询性能
CREATE INDEX idx_articles_date ON articles(date);
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_article_tags_article_id ON article_tags(article_id);
```

### 3. 环境变量配置

创建 `.env` 文件：

```env
# 开发环境
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=article_management
DB_WAIT_FOR_CONNECTIONS=true
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# 服务器配置
PORT=3000
```

## 扩展功能指南

### 1. 添加新的API端点

#### 步骤1: 创建新的路由文件

在 `routes/` 目录下创建 `categories.js`：

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新分类
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
```

#### 步骤2: 在主应用中注册路由

在 `index.js` 中添加：

```javascript
const categoriesRouter = require('./routes/categories');
app.use('/categories', categoriesRouter);
```

### 2. 添加新的数据模型

创建 `models/category.js`：

```javascript
const pool = require('../config/db');

class Category {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    return rows;
  }

  static async create({ name, description }) {
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    return { id: result.insertId, name, description };
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, { name, description }) {
    const [result] = await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Category;
```

### 3. 添加身份验证

#### 安装JWT库

```bash
npm install jsonwebtoken bcryptjs
```

#### 创建中间件

在 `middleware/auth.js`：

```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: '访问被拒绝' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: '无效令牌' });
  }
};

module.exports = auth;
```

#### 在路由中使用

```javascript
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// 需要认证的路由
router.post('/', auth, async (req, res) => {
  // 业务逻辑...
});

module.exports = router;
```

## 前端开发

### 1. 添加新的前端页面

在 `public/` 目录下创建新的HTML文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>分类管理</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .category-item {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <h1>分类管理</h1>
    <div id="categoriesContainer"></div>

    <script>
        async function loadCategories() {
            try {
                const response = await fetch('/categories');
                const categories = await response.json();
                
                const container = document.getElementById('categoriesContainer');
                container.innerHTML = categories.map(category => `
                    <div class="category-item">
                        <h3>${category.name}</h3>
                        <p>${category.description}</p>
                    </div>
                `).join('');
            } catch (error) {
                console.error('加载失败:', error);
            }
        }

        // 初始化加载
        loadCategories();
    </script>
</body>
</html>
```

### 2. 使用现代前端框架

如果需要使用Vue、React等现代框架：

1. 在 `public/` 目录创建子目录
2. 设置构建流程
3. 将构建结果复制到 `public/` 目录

## 性能优化

### 1. 数据库优化

- 使用索引优化查询
- 实现分页查询
- 使用连接池

### 2. 缓存策略

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache();

// 缓存文章列表5分钟
router.get('/', async (req, res) => {
  const cacheKey = 'articles_all';
  let articles = cache.get(cacheKey);
  
  if (!articles) {
    articles = await Article.findAll();
    cache.set(cacheKey, articles, 300);
  }
  
  res.json(articles);
});
```

### 3. 错误监控

```javascript
// 在 index.js 中添加
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 发送到错误监控服务
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  // 发送到错误监控服务
});
```

## 测试

### 1. 单元测试

安装测试依赖：

```bash
npm install --save-dev jest supertest
```

创建测试文件 `tests/articles.test.js`：

```javascript
const request = require('supertest');
const app = require('../index');

describe('文章API测试', () => {
  test('GET /articles 应该返回文章列表', async () => {
    const response = await request(app)
      .get('/articles')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /articles 应该创建新文章', async () => {
    const newArticle = {
      title: '测试文章',
      summary: '这是测试摘要',
      date: '2024-01-20',
      tags: ['测试', 'API']
    };

    const response = await request(app)
      .post('/articles')
      .send(newArticle)
      .expect(201);

    expect(response.body.title).toBe(newArticle.title);
  });
});
```

### 2. API测试脚本

创建 `test-api.js`：

```javascript
const fetch = require('node-fetch');

async function testAPI() {
  try {
    // 测试获取文章
    const articlesResponse = await fetch('http://localhost:3000/articles');
    const articles = await articlesResponse.json();
    console.log('文章数量:', articles.length);

    // 测试创建文章
    const newArticle = {
      title: 'API测试文章',
      summary: '这是API测试的摘要',
      date: '2024-01-20',
      tags: ['测试', 'API']
    };

    const createResponse = await fetch('http://localhost:3000/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newArticle),
    });

    const createdArticle = await createResponse.json();
    console.log('创建的文章ID:', createdArticle.id);

  } catch (error) {
    console.error('API测试失败:', error);
  }
}

testAPI();
```

## 调试技巧

### 1. 使用日志

```javascript
// 添加日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### 2. 数据库查询日志

```javascript
// 在 db.js 中添加查询日志
const pool = mysql.createPool({
  // ... 其他配置
});

pool.on('connection', (connection) => {
  console.log('新的数据库连接已建立');
});

pool.on('error', (err) => {
  console.error('数据库连接错误:', err);
});
```

### 3. 错误调试

```javascript
// 详细的错误信息
app.use((err, req, res, next) => {
  console.error('错误堆栈:', err.stack);
  console.error('错误信息:', err.message);
  res.status(500).json({ 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
```

## 代码质量

### 1. ESLint配置

创建 `.eslintrc.js`：

```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
  },
};
```

### 2. 代码格式化

```bash
npm install --save-dev prettier
```

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{js,html,css,md}\"",
    "lint": "eslint ."
  }
}
```

## 部署准备

### 1. 生产环境配置

创建 `.env.production`：

```env
NODE_ENV=production
PORT=3000

# 生产数据库配置
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_DATABASE=your-production-db-name
```

### 2. 构建脚本

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "echo 'Build step completed'",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

## 最佳实践

1. **错误处理**: 始终处理异步操作的错误
2. **数据验证**: 验证所有输入数据
3. **安全性**: 使用参数化查询防止SQL注入
4. **日志记录**: 记录关键操作和错误
5. **测试覆盖**: 为关键功能编写测试
6. **文档更新**: 及时更新API文档

## 常见问题

### 1. 数据库连接失败

- 检查数据库服务是否运行
- 验证连接参数
- 检查防火墙设置

### 2. CORS错误

- 确认CORS配置正确
- 检查请求头设置
- 验证域名白名单

### 3. 性能问题

- 优化数据库查询
- 实现缓存机制
- 使用分页查询

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 编写测试
4. 提交代码
5. 创建Pull Request

## 许可证

本项目采用MIT许可证。