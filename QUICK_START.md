# 快速开始指南

🚀 在5分钟内运行这个Node.js后端项目

## 📋 前提条件

确保您的系统已安装：
- **Node.js** (版本14或更高) - [下载](https://nodejs.org/)
- **MySQL** (版本5.7或更高) - [下载](https://dev.mysql.com/downloads/mysql/)
- **Git** (可选) - [下载](https://git-scm.com/)

## 🏃‍♂️ 快速启动 (3步)

### 1️⃣ 安装项目依赖

```bash
# 进入项目目录
cd hd

# 安装依赖
npm install
```

### 2️⃣ 配置数据库

#### 创建MySQL数据库

```sql
-- 登录MySQL后执行
CREATE DATABASE article_management;
USE article_management;
```

#### 创建数据表

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

#### 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=article_management
DB_WAIT_FOR_CONNECTIONS=true
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# 服务器配置
PORT=3000
```

> 💡 **提示**: 将 `your_mysql_password` 替换为您的MySQL密码

### 3️⃣ 启动服务器

```bash
# 启动服务器
npm start
```

如果一切正常，您将看到：
```
成功连接数据库
服务器运行在:3000
```

## 🧪 测试API

### 验证服务器运行

打开浏览器访问：
- **主页**: http://localhost:3000
- **文章列表**: http://localhost:3000/article_list.html
- **创建文章**: http://localhost:3000/create_article.html

### 使用curl测试API

```bash
# 获取文章列表
curl http://localhost:3000/articles

# 创建新文章
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "我的第一篇文章",
    "summary": "这是文章摘要",
    "date": "2024-01-20",
    "tags": ["测试", "Node.js"]
  }'

# 获取用户列表
curl http://localhost:3000/users
```

### JavaScript测试代码

创建 `test.js` 文件：

```javascript
// 快速测试API
async function testAPI() {
  const baseURL = 'http://localhost:3000';

  try {
    // 测试获取文章
    console.log('📖 获取文章列表...');
    const articlesResponse = await fetch(`${baseURL}/articles`);
    const articles = await articlesResponse.json();
    console.log('文章数量:', articles.length);

    // 测试创建文章
    console.log('✍️ 创建新文章...');
    const newArticle = {
      title: '快速开始指南',
      summary: '学习如何快速使用这个API',
      date: '2024-01-20',
      tags: ['教程', 'API']
    };

    const createResponse = await fetch(`${baseURL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newArticle)
    });

    const createdArticle = await createResponse.json();
    console.log('创建的文章ID:', createdArticle.id);

    // 测试获取用户
    console.log('👥 获取用户列表...');
    const usersResponse = await fetch(`${baseURL}/users`);
    const users = await usersResponse.json();
    console.log('用户数量:', users.length);

    console.log('✅ 所有测试通过！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testAPI();
```

运行测试：
```bash
node test.js
```

## 🔧 常见问题

### ❌ 数据库连接失败

**问题**: `数据库连接失败: Error: connect ECONNREFUSED 127.0.0.1:3306`

**解决方案**:
1. 确保MySQL服务正在运行
2. 检查端口是否正确 (默认3306)
3. 验证用户名和密码

```bash
# Windows检查MySQL服务
net start mysql

# macOS检查MySQL
brew services start mysql

# Linux检查MySQL
sudo systemctl start mysql
```

### ❌ 端口已被占用

**问题**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:
1. 关闭占用端口的程序
2. 或使用不同端口

```bash
# 查看端口占用
netstat -ano | findstr :3000

# 终止进程 (Windows)
taskkill /PID <进程ID> /F
```

### ❌ 依赖安装失败

**解决方案**:
1. 清理npm缓存：`npm cache clean --force`
2. 删除node_modules：`rmdir /s node_modules` (Windows)
3. 重新安装：`npm install`

## 📁 项目文件结构

```
hd/
├── config/db.js           # 数据库配置
├── models/article.js      # 文章数据模型
├── routes/
│   ├── articles.js        # 文章API
│   └── users.js           # 用户API
├── public/                # 前端页面
│   ├── article_list.html  # 文章列表
│   └── create_article.html # 创建文章
├── index.js               # 主服务器
└── package.json           # 依赖配置
```

## 🎯 接下来做什么

### 1. 探索功能
- 🌐 访问 http://localhost:3000/article_list.html 查看文章
- ✍️ 访问 http://localhost:3000/create_article.html 创建新文章
- 📱 使用提供的API进行开发

### 2. 扩展功能
- 添加用户认证
- 实现文件上传
- 添加评论系统
- 集成缓存

### 3. 部署到生产
- 查看 [DEVELOPMENT.md](DEVELOPMENT.md) 了解部署详情
- 使用Vercel一键部署
- 配置生产环境数据库

## 🆘 需要帮助？

- 📖 查看 [README.md](README.md) 了解完整功能
- 🔌 查看 [API.md](API.md) 了解API文档
- 🛠️ 查看 [DEVELOPMENT.md](DEVELOPMENT.md) 了解开发详情

## ⚡ 一键命令

```bash
# 快速启动脚本 (创建 start.bat 或 start.sh)
@echo off
echo 启动Node.js后端服务...
npm start
pause
```

## 🎉 恭喜！

您已经成功运行了Node.js后端项目！

现在可以：
- ✅ 访问文章管理页面
- ✅ 使用API创建和管理文章
- ✅ 集成到您的前端项目

**下一步**: 查看 [API.md](API.md) 了解更多API功能，或查看 [DEVELOPMENT.md](DEVELOPMENT.md) 学习如何扩展功能。