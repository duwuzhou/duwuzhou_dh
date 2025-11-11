// 服务器配置模块
const config = {
  // 端口配置
  port: process.env.PORT || 3000,
  
  // CORS 配置
  cors: {
    origin: ['https://duwuzhou.github.io'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  
  // 日志配置
  logging: {
    format: 'YYYY-MM-DD HH:mm:ss'
  },
  
  // 静态文件配置
  static: {
    public: 'public'
  }
};

module.exports = config;