# 💻 开发指南

文章管理系统后端开发完整指南。

## 📋 目录

- [开发环境搭建](#开发环境搭建)
- [项目架构](#项目架构)
- [代码规范](#代码规范)
- [开发流程](#开发流程)
- [测试指南](#测试指南)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)

## 🛠️ 开发环境搭建

### 必需工具

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 14.0.0 | JavaScript 运行环境 |
| MySQL | >= 5.7 | 数据库 |
| Git | >= 2.0 | 版本控制 |
| VS Code | 最新版 | 代码编辑器（推荐） |

### 推荐 VS Code 插件

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### 环境配置

**1. 克隆项目：**

```bash
git clone <repository-url>
cd hd
```

**2. 安装依赖：**

```bash
npm install
```

**3. 配置环境变量：**

```bash
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

**4. 初始化数据库：**

```bash
mysql -u root -p < database/schema.sql
```

**5. 启动开发服务器：**

```bash
npm start
```

## 🏗️ 项目架构

### 目录结构详解

```
hd/
├── config/                 # 配置模块
│   ├── server.js          # 服务器配置（端口、CORS）
│   ├── security.js        # 安全配置（限流、认证）
│   ├── database.js        # 数据库管理
│   ├── db.js             # 数据库连接池
│   └── routes.js         # 路由配置
├── models/                # 数据模型
│   └── article.js        # 文章模型
├── routes/                # API 路由
│   └── articles.js       # 文章路由
├── public/                # 静态文件
├── index.js              # 应用入口
└── package.json          # 项目配置
```

### 架构设计

```
┌─────────────────────────────────────────┐
│           Client (Browser/App)          │
└──────────────────┬──────────────────────┘
                   │ HTTP/HTTPS
┌──────────────────▼──────────────────────┐
│         Express Application             │
│  ┌────────────────────────────────────┐ │
│  │  Security Middleware               │ │
│  │  - CORS                            │ │
│  │  - Rate Limiting                   │ │
│  │  - Authentication                  │ │
│  └────────────────┬───────────────────┘ │
│  ┌────────────────▼───────────────────┐ │
│  │  Routes Layer                      │ │
│  │  - /articles                       │ │
│  │  - /health                         │ │
│  └────────────────┬───────────────────┘ │
│  ┌────────────────▼───────────────────┐ │
│  │  Business Logic (Models)           │ │
│  │  - Article CRUD                    │ │
│  │  - Tag Management                  │ │
│  └────────────────┬───────────────────┘ │
└───────────────────┼─────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│         MySQL Database                  │
│  ┌────────────────────────────────────┐ │
│  │  Tables:                           │ │
│  │  - articles                        │ │
│  │  - tags                            │ │
│  │  - article_tags                    │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 请求流程

```
1. Client Request
   ↓
2. Security Middleware
   - CORS Check
   - Rate Limiting
   - Authentication (if needed)
   ↓
3. Route Handler
   - Parse Request
   - Validate Input
   ↓
4. Model Layer
   - Database Query
   - Business Logic
   ↓
5. Response
   - Format Data
   - Send JSON
```

## 📝 代码规范

### JavaScript 规范

**1. 使用 ES6+ 语法：**

```javascript
// ✅ 推荐：使用 const/let
const articles = await Article.findAll();
let count = 0;

// ❌ 避免：使用 var
var articles = await Article.findAll();
```

**2. 异步操作使用 async/await：**

```javascript
// ✅ 推荐：async/await
async function getArticles() {
  try {
    const articles = await Article.findAll();
    return articles;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ❌ 避免：回调地狱
function getArticles(callback) {
  Article.findAll((err, articles) => {
    if (err) return callback(err);
    callback(null, articles);
  });
}
```

**3. 使用箭头函数：**

```javascript
// ✅ 推荐
const numbers = [1, 2, 3].map(n => n * 2);

// ❌ 避免
const numbers = [1, 2, 3].map(function(n) {
  return n * 2;
});
```

**4. 解构赋值：**

```javascript
// ✅ 推荐
const { title, summary, date } = req.body;

// ❌ 避免
const title = req.body.title;
const summary = req.body.summary;
const date = req.body.date;
```

### 命名规范

**1. 变量和函数：camelCase**

```javascript
const articleList = [];
function getArticleById(id) {}
```

**2. 类名：PascalCase**

```javascript
class Article {}
class ArticleController {}
```

**3. 常量：UPPER_SNAKE_CASE**

```javascript
const MAX_PAGE_SIZE = 100;
const DEFAULT_PORT = 3000;
```

**4. 文件名：kebab-case**

```
article-controller.js
user-service.js
```

### 注释规范

**1. 函数注释：**

```javascript
/**
 * 获取所有文章
 * @param {Object} options - 查询选项
 * @param {number} options.page - 页码
 * @param {number} options.pageSize - 每页数量
 * @returns {Promise<Object>} 文章列表和分页信息
 */
static async findAll({ page = 1, pageSize = 10 } = {}) {
  // 实现代码
}
```

**2. 复杂逻辑注释：**

```javascript
// 验证排序字段，防止 SQL 注入
const validSortFields = ['id', 'title', 'date', 'created_at'];
const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
```

### 错误处理

**1. 统一错误格式：**

```javascript
try {
  const article = await Article.findById(id);
  if (!article) {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: '文章未找到'
    });
  }
  res.json({ success: true, data: article });
} catch (error) {
  console.error('获取文章失败:', error);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: '获取文章失败',
    details: error.message
  });
}
```

**2. 输入验证：**

```javascript
// 在处理前验证所有输入
if (!title || !summary || !date) {
  return res.status(400).json({
    success: false,
    error: 'Bad Request',
    message: '缺少必填字段',
    required: ['title', 'summary', 'date']
  });
}
```

## 🔄 开发流程

### 添加新功能

**1. 创建功能分支：**

```bash
git checkout -b feature/new-feature
```

**2. 开发步骤：**

```
a. 设计数据模型（如需要）
   ↓
b. 创建数据库表（如需要）
   ↓
c. 编写 Model 层代码
   ↓
d. 编写 Route 层代码
   ↓
e. 测试功能
   ↓
f. 更新文档
```

**3. 提交代码：**

```bash
git add .
git commit -m "feat: 添加新功能描述"
git push origin feature/new-feature
```

### 修复 Bug

**1. 创建修复分支：**

```bash
git checkout -b fix/bug-description
```

**2. 修复步骤：**

```
a. 复现问题
   ↓
b. 定位问题代码
   ↓
c. 编写修复代码
   ↓
d. 测试修复效果
   ↓
e. 提交代码
```

### Git 提交规范

```bash
# 新功能
git commit -m "feat: 添加文章搜索功能"

# Bug 修复
git commit -m "fix: 修复分页计算错误"

# 文档更新
git commit -m "docs: 更新 API 文档"

# 代码重构
git commit -m "refactor: 重构文章查询逻辑"

# 性能优化
git commit -m "perf: 优化数据库查询性能"

# 测试相关
git commit -m "test: 添加文章创建测试"
```

## 🧪 测试指南

### 手动测试

**1. 使用 cURL：**

```bash
# 测试健康检查
curl http://localhost:3000/health

# 测试获取文章列表
curl http://localhost:3000/articles

# 测试创建文章
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -H "x-password: admin123" \
  -d '{"title":"测试","summary":"测试","date":"2024-12-25"}'
```

**2. 使用 Postman：**

创建 Postman Collection：

```json
{
  "info": {
    "name": "Article API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Articles",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/articles"
      }
    },
    {
      "name": "Create Article",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "x-password",
            "value": "admin123"
          }
        ],
        "url": "http://localhost:3000/articles",
        "body": {
          "mode": "raw",
          "raw": "{\"title\":\"测试\",\"summary\":\"测试\",\"date\":\"2024-12-25\"}"
        }
      }
    }
  ]
}
```

### 测试清单

**功能测试：**

- [ ] 获取文章列表
- [ ] 获取单篇文章
- [ ] 创建文章
- [ ] 更新文章
- [ ] 删除文章
- [ ] 分页功能
- [ ] 排序功能
- [ ] 标签关联

**安全测试：**

- [ ] 密码认证
- [ ] 请求限流
- [ ] SQL 注入防护
- [ ] XSS 防护
- [ ] CORS 配置

**性能测试：**

- [ ] 并发请求处理
- [ ] 数据库连接池
- [ ] 响应时间
- [ ] 内存使用

## 🐛 调试技巧

### 日志调试

**1. 添加调试日志：**

```javascript
console.log('📝 请求参数:', req.body);
console.log('🔍 查询结果:', articles);
console.log('⚠️ 警告信息:', warning);
console.error('❌ 错误信息:', error);
```

**2. 使用 debug 模块：**

```javascript
const debug = require('debug')('app:article');

debug('查询文章列表', { page, pageSize });
```

### 数据库调试

**1. 查看执行的 SQL：**

```javascript
const [rows] = await pool.query(
  'SELECT * FROM articles WHERE id = ?',
  [id]
);
console.log('执行的 SQL:', pool.format('SELECT * FROM articles WHERE id = ?', [id]));
```

**2. 分析慢查询：**

```sql
-- 启用慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- 查看慢查询
SELECT * FROM mysql.slow_log;
```

### 性能分析

**1. 使用 Node.js Profiler：**

```bash
node --prof index.js
node --prof-process isolate-*.log > profile.txt
```

**2. 监控内存使用：**

```javascript
setInterval(() => {
  const used = process.memoryUsage();
  console.log('内存使用:', {
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`
  });
}, 5000);
```

## ❓ 常见问题

### Q1: 数据库连接失败

**问题：**
```
❌ 数据库连接失败: connect ECONNREFUSED
```

**解决方案：**
1. 检查 MySQL 服务是否启动
2. 验证 `.env` 配置是否正确
3. 检查防火墙设置
4. 确认数据库用户权限

### Q2: 端口被占用

**问题：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案：**

```bash
# 查找占用端口的进程
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# 杀死进程
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Linux/Mac

# 或修改端口
# 在 .env 中设置 PORT=3001
```

### Q3: 依赖安装失败

**问题：**
```
npm ERR! code ELIFECYCLE
```

**解决方案：**

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### Q4: 请求被限流

**问题：**
```json
{
  "error": "Too Many Requests",
  "message": "请求过于频繁"
}
```

**解决方案：**
1. 等待 15 分钟后重试
2. 减少请求频率
3. 开发环境可临时调整限流配置

### Q5: 事务回滚

**问题：**
```
❌ 创建文章失败: 标签必须是数组
```

**解决方案：**
1. 检查请求数据格式
2. 确保 tags 字段是数组类型
3. 查看详细错误日志

## 📚 学习资源

### 官方文档

- [Node.js 文档](https://nodejs.org/docs/)
- [Express 文档](https://expressjs.com/)
- [MySQL 文档](https://dev.mysql.com/doc/)

### 推荐教程

- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [Express 安全最佳实践](https://expressjs.com/en/advanced/best-practice-security.html)
- [MySQL 性能优化](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 发起 Pull Request

**Pull Request 要求：**
- 代码符合规范
- 包含必要的测试
- 更新相关文档
- 通过 CI 检查

---

**文档版本**: 1.0.0
**最后更新**: 2024-12-25
