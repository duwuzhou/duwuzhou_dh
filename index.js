const express = require('express');

// 导入配置模块
const config = require('./config/server');
const security = require('./config/security');
const routes = require('./config/routes');
const database = require('./config/database');

// 初始化 Express 应用
const app = express();

// 启动服务器
async function startServer() {
  try {
    // 1. 配置安全设置
    security.setup(app);
    
    // 2. 配置静态文件服务
    app.use(express.static(config.static.public));
    
    // 3. 配置 CORS
    const cors = require('cors');
    app.use(cors(config.cors));
    
    // 4. 配置请求解析
    app.use(express.json(security.limits));
    app.use(express.urlencoded({ extended: true, ...security.limits }));
    
    // 5. 应用请求限制中间件
    app.use(security.rateLimiter);
    
    // 6. 配置请求日志
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
    
    // 7. 测试数据库连接
    const dbConnected = await database.testConnection();
    if (!dbConnected) {
      console.warn('⚠️ 数据库连接失败，但服务器仍将继续启动');
    }
    
    // 8. 配置路由
    routes.setup(app);
    
    // 9. 错误处理
    app.use((err, req, res, next) => {
      console.error('Error:', err.message);
      res.status(500).json({ 
        error: '服务器内部错误', 
        message: err.message 
      });
    });
    
    // 10. 启动 HTTP 服务器
    const server = app.listen(config.port, () => {
      console.log(`🚀 服务器运行在: http://localhost:${config.port}`);

      console.log(`🏥 健康检查: http://localhost:${config.port}/health`);
    });
    
    // 10. 优雅关闭处理
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 收到 ${signal} 信号，开始优雅关闭...`);
      
      server.close(async (err) => {
        if (err) {
          console.error('❌ 关闭服务器时出错:', err);
          process.exit(1);
        }
        
        await database.close();
        console.log('👋 服务器已安全关闭');
        process.exit(0);
      });
    };
    
    // 监听关闭信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (err) {
    console.error('❌ 启动服务器失败:', err.message);
    process.exit(1);
  }
}

// 启动服务器
startServer();