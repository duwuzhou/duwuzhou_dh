// 安全设置模块
const security = {
  // Express 安全设置
  setup(app) {
    // 隐藏 X-Powered-By 头部
    app.disable('x-powered-by');
    
    // 设置信任代理
    app.set('trust proxy', 1);
    
    console.log('✅ 安全设置已配置');
  },
  
  // 请求限制设置
  limits: {
    json: '10mb',
    urlencoded: '10mb'
  },
  
  // 请求头安全设置
  headers: {
    // 可以在生产环境中添加更多安全头部
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff'
  },
  
  // 密码保护中间件
  authenticatePassword: (req, res, next) => {
    const providedPassword = req.headers['x-password'] || req.body.password;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123'; // 默认密码，可通过环境变量覆盖
    
    if (!providedPassword) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: '需要提供密码' 
      });
    }
    
    if (providedPassword !== expectedPassword) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: '密码错误' 
      });
    }
    
    next();
  }
};

module.exports = security;