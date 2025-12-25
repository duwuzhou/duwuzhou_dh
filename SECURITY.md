# 🔒 安全说明文档

文章管理系统后端安全特性和最佳实践指南。

## 📋 目录

- [安全特性概览](#安全特性概览)
- [认证与授权](#认证与授权)
- [请求限流](#请求限流)
- [输入验证](#输入验证)
- [数据库安全](#数据库安全)
- [网络安全](#网络安全)
- [安全配置](#安全配置)
- [安全最佳实践](#安全最佳实践)
- [安全审计](#安全审计)

## 🛡️ 安全特性概览

本系统实现了多层安全防护机制：

| 安全层级 | 实现方式 | 防护目标 |
|---------|---------|---------|
| 应用层 | 密码认证、请求限流 | 未授权访问、暴力破解 |
| 传输层 | HTTPS、安全响应头 | 中间人攻击、XSS |
| 数据层 | 参数化查询、输入验证 | SQL注入、数据篡改 |
| 网络层 | CORS、IP白名单 | 跨域攻击、恶意访问 |

## 🔐 认证与授权

### 密码认证机制

所有写操作（POST、PUT、DELETE）需要提供管理员密码。

**实现方式：**

```javascript
// 方式一：请求头（推荐）
headers: {
  'x-password': 'your_admin_password'
}

// 方式二：请求体
body: {
  'password': 'your_admin_password',
  ...其他字段
}
```

**安全特性：**

- ✅ 密码验证失败会记录日志（包含 IP 和时间）
- ✅ 密码错误返回 403 状态码
- ✅ 缺少密码返回 401 状态码
- ✅ 支持通过环境变量配置密码

**配置密码：**

```env
# .env 文件
ADMIN_PASSWORD=your_secure_password_here
```

**密码强度建议：**

- 最少 12 个字符
- 包含大小写字母、数字和特殊字符
- 避免使用常见密码
- 定期更换密码

**示例强密码：**

```
Xk9#mP2$vL8@qR5!
```

### 认证日志

系统会记录所有认证尝试：

**成功日志：**
```
✅ 密码验证成功 - IP: 192.168.1.100, 时间: 2024-12-25T14:30:00.000Z
```

**失败日志：**
```
⚠️ 密码验证失败 - IP: 192.168.1.100, 时间: 2024-12-25T14:30:00.000Z
```

## 🚦 请求限流

### 通用限流

防止 API 滥用和 DDoS 攻击。

**配置：**

```javascript
{
  windowMs: 15 * 60 * 1000,  // 15分钟时间窗口
  max: 100,                   // 最多100个请求
  standardHeaders: true,      // 返回标准限流头部
  legacyHeaders: false        // 不返回旧版头部
}
```

**响应头：**

```http
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

**超出限制响应：**

```json
{
  "error": "Too Many Requests",
  "message": "请求过于频繁，请稍后再试",
  "retryAfter": "15分钟"
}
```

### 严格限流

针对敏感操作的额外保护。

**配置：**

```javascript
{
  windowMs: 15 * 60 * 1000,  // 15分钟时间窗口
  max: 10,                    // 最多10个请求
  standardHeaders: true
}
```

**适用端点：**

- POST /articles（创建文章）
- PUT /articles/:id（更新文章）
- DELETE /articles/:id（删除文章）

### 限流绕过

健康检查端点不受限流限制：

```javascript
skip: (req) => req.path === '/health'
```

## ✅ 输入验证

### 参数验证

所有用户输入都经过严格验证。

**文章 ID 验证：**

```javascript
if (!id || isNaN(id)) {
  throw new Error('无效的文章ID');
}
```

**必填字段验证：**

```javascript
if (!title || !summary || !date) {
  throw new Error('标题、摘要和日期为必填项');
}
```

**数组类型验证：**

```javascript
if (!Array.isArray(tags)) {
  throw new Error('标签必须是数组');
}
```

**分页参数验证：**

```javascript
// 页码验证
if (isNaN(pageNum) || pageNum < 1) {
  return res.status(400).json({
    message: '页码必须是大于0的整数'
  });
}

// 每页数量验证
if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
  return res.status(400).json({
    message: '每页数量必须在1-100之间'
  });
}
```

### SQL 注入防护

使用参数化查询防止 SQL 注入：

**安全示例：**

```javascript
// ✅ 正确：使用参数化查询
const [rows] = await pool.query(
  'SELECT * FROM articles WHERE id = ?',
  [id]
);

// ❌ 错误：字符串拼接（易受 SQL 注入攻击）
const [rows] = await pool.query(
  `SELECT * FROM articles WHERE id = ${id}`
);
```

### XSS 防护

**响应头设置：**

```javascript
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('X-Content-Type-Options', 'nosniff');
```

**输入过滤：**

- 所有用户输入都经过验证
- 特殊字符会被正确转义
- 使用 JSON 格式传输数据

## 🗄️ 数据库安全

### 连接池配置

```javascript
{
  connectionLimit: 10,        // 限制最大连接数
  waitForConnections: true,   // 等待可用连接
  queueLimit: 0,             // 无队列限制
  enableKeepAlive: true,     // 启用保活
  connectTimeout: 10000,     // 10秒连接超时
  charset: 'utf8mb4'         // 支持完整 Unicode
}
```

### 事务处理

所有写操作都使用事务确保数据一致性：

```javascript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();

  // 执行数据库操作
  await connection.query('INSERT INTO ...');
  await connection.query('INSERT INTO ...');

  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

### 外键约束

使用外键确保引用完整性：

```sql
FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
```

### 数据库凭证

**安全存储：**

- ✅ 使用环境变量存储凭证
- ✅ 不在代码中硬编码密码
- ✅ .env 文件添加到 .gitignore
- ✅ 生产环境使用强密码

**示例：**

```env
# .env 文件
DB_HOST=localhost
DB_USER=app_user
DB_PASSWORD=strong_password_here
DB_DATABASE=article_db
```

## 🌐 网络安全

### CORS 配置

限制跨域访问来源：

```javascript
{
  origin: ['https://duwuzhou.github.io'],  // 仅允许指定域名
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-password'],
  credentials: true
}
```

### 安全响应头

```javascript
// 防止点击劫持
res.setHeader('X-Frame-Options', 'DENY');

// 防止 MIME 类型嗅探
res.setHeader('X-Content-Type-Options', 'nosniff');

// XSS 保护
res.setHeader('X-XSS-Protection', '1; mode=block');

// HTTPS 强制
res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

// Referrer 策略
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
```

### HTTPS 配置

**生产环境必须使用 HTTPS：**

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## ⚙️ 安全配置

### 环境变量

**必需配置：**

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=strong_db_password
DB_DATABASE=article_db

# 应用配置
PORT=3000
ADMIN_PASSWORD=strong_admin_password

# 连接池配置
DB_CONNECTION_LIMIT=10
DB_WAIT_FOR_CONNECTIONS=true
DB_QUEUE_LIMIT=0
```

### 生产环境配置

**1. 禁用调试信息：**

```javascript
// 生产环境不输出详细错误
if (process.env.NODE_ENV === 'production') {
  console.error = () => {};
}
```

**2. 使用进程管理器：**

```bash
# 使用 PM2 管理进程
pm2 start index.js --name article-api
pm2 startup
pm2 save
```

**3. 配置防火墙：**

```bash
# 仅允许必要端口
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

## 🎯 安全最佳实践

### 1. 密码管理

- ✅ 使用强密码（至少12位，包含大小写字母、数字、特殊字符）
- ✅ 定期更换密码（建议每3个月）
- ✅ 不在代码中硬编码密码
- ✅ 使用环境变量或密钥管理服务

### 2. 数据库安全

- ✅ 使用最小权限原则
- ✅ 定期备份数据库
- ✅ 启用数据库审计日志
- ✅ 限制数据库远程访问

### 3. 网络安全

- ✅ 使用 HTTPS 加密传输
- ✅ 配置防火墙规则
- ✅ 使用 CDN 和 DDoS 防护
- ✅ 定期更新 SSL 证书

### 4. 应用安全

- ✅ 及时更新依赖包
- ✅ 使用安全扫描工具
- ✅ 实施日志监控
- ✅ 定期安全审计

### 5. 部署安全

- ✅ 使用非 root 用户运行应用
- ✅ 限制文件系统权限
- ✅ 禁用不必要的服务
- ✅ 配置入侵检测系统

## 📊 安全审计

### 日志记录

系统记录以下安全事件：

**1. 认证事件：**
```
✅ 密码验证成功 - IP: xxx.xxx.xxx.xxx, 时间: 2024-12-25T14:30:00.000Z
⚠️ 密码验证失败 - IP: xxx.xxx.xxx.xxx, 时间: 2024-12-25T14:30:00.000Z
```

**2. 数据库事件：**
```
📊 新数据库连接已建立
🔗 连接 123 已从池中获取
🔓 连接 123 已释放回池
✅ 文章创建成功 - ID: 1
✅ 文章更新成功 - ID: 1
✅ 文章删除成功 - ID: 1
```

**3. 错误事件：**
```
❌ 数据库连接失败: connect ECONNREFUSED
❌ 创建文章失败: 标题为必填项
❌ 查询文章失败: 无效的文章ID
```

### 监控建议

**1. 实时监控：**
- 使用 PM2 监控进程状态
- 配置告警通知
- 监控 CPU 和内存使用

**2. 日志分析：**
- 使用 ELK Stack 收集日志
- 分析异常访问模式
- 检测潜在攻击

**3. 性能监控：**
- 监控 API 响应时间
- 跟踪数据库查询性能
- 分析慢查询日志

### 安全检查清单

**部署前检查：**

- [ ] 所有密码已更改为强密码
- [ ] 环境变量已正确配置
- [ ] HTTPS 已启用
- [ ] 防火墙规则已配置
- [ ] 数据库已备份
- [ ] 依赖包已更新到最新版本
- [ ] 安全响应头已配置
- [ ] CORS 已正确配置
- [ ] 日志系统已启用
- [ ] 监控告警已配置

**定期检查：**

- [ ] 检查异常登录尝试
- [ ] 审查访问日志
- [ ] 更新依赖包
- [ ] 检查安全漏洞
- [ ] 测试备份恢复
- [ ] 审查权限配置

## 🚨 安全事件响应

### 发现安全问题

**1. 立即行动：**
- 隔离受影响系统
- 停止可疑进程
- 保存日志证据

**2. 评估影响：**
- 确定受影响范围
- 检查数据完整性
- 评估损失程度

**3. 修复问题：**
- 修补安全漏洞
- 更改所有密码
- 更新安全配置

**4. 恢复服务：**
- 从备份恢复数据
- 验证系统安全性
- 逐步恢复服务

**5. 事后分析：**
- 分析攻击原因
- 改进安全措施
- 更新应急预案

## 📞 安全联系方式

发现安全问题请联系：

- **邮箱**: 1503965150@qq.com
- **GitHub Issues**: https://github.com/duwuzhou/issues

**报告内容应包括：**
- 漏洞详细描述
- 复现步骤
- 影响范围
- 建议修复方案

---

**文档版本**: 1.0.0
**最后更新**: 2024-12-25

**注意**: 本文档包含敏感安全信息，请妥善保管，不要公开分享。
