# 🚀 快速开始指南

5分钟快速启动文章管理系统后端服务。

## 📋 前置要求

- Node.js >= 14.0.0
- MySQL >= 5.7
- npm 或 yarn

## ⚡ 快速启动

### 1. 克隆项目

```bash
git clone <repository-url>
cd hd
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=article_db
DB_WAIT_FOR_CONNECTIONS=true
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

PORT=3000
ADMIN_PASSWORD=admin123
```

### 4. 初始化数据库

连接到 MySQL 并执行：

```sql
-- 创建数据库
CREATE DATABASE article_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE article_db;

-- 创建文章表
CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  date DATE,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建标签表
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建关联表
CREATE TABLE article_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_article_tag (article_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 5. 启动服务

```bash
npm start
```

看到以下输出表示启动成功：

```
✅ 安全设置已配置
✅ 路由设置已配置
✅ 成功连接数据库
🚀 服务器运行在: http://localhost:3000
🏥 健康检查: http://localhost:3000/health
```

### 6. 测试 API

**健康检查：**

```bash
curl http://localhost:3000/health
```

**获取文章列表：**

```bash
curl http://localhost:3000/articles
```

**创建文章：**

```bash
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -H "x-password: admin123" \
  -d '{
    "title": "我的第一篇文章",
    "summary": "这是一篇测试文章",
    "date": "2024-12-25",
    "tags": ["测试", "入门"]
  }'
```

## 🎯 下一步

- 📖 阅读完整 [API 文档](./API.md)
- 🔒 查看 [安全说明](./SECURITY.md)
- 💻 了解 [开发指南](./DEVELOPMENT.md)
- 🚀 学习 [部署方法](./README.md#部署指南)

## ❓ 常见问题

**Q: 数据库连接失败？**

A: 检查 MySQL 服务是否启动，`.env` 配置是否正确。

**Q: 端口被占用？**

A: 修改 `.env` 中的 `PORT` 为其他端口。

**Q: 如何修改管理员密码？**

A: 修改 `.env` 中的 `ADMIN_PASSWORD`。

## 📞 获取帮助

遇到问题？查看 [完整文档](./README.md) 或提交 Issue。
