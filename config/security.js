const rateLimit = require('express-rate-limit');

const security = {
  setup(app) {
    app.disable('x-powered-by');
    app.set('trust proxy', 1);

    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    });

    console.log('✅ 安全设置已配置');
  },

  limits: {
    json: '10mb',
    urlencoded: '10mb'
  },

  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: 'Too Many Requests',
      message: '请求过于频繁，请稍后再试',
      retryAfter: '15分钟'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too Many Requests',
        message: '请求过于频繁，请稍后再试',
        retryAfter: '15分钟'
      });
    }
  }),

  strictRateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
      error: 'Too Many Requests',
      message: '操作过于频繁，请稍后再试',
      retryAfter: '15分钟'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too Many Requests',
        message: '操作过于频繁，请稍后再试',
        retryAfter: '15分钟'
      });
    }
  }),

  headers: {
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff'
  },

  authenticatePassword: (req, res, next) => {
    const providedPassword = req.headers['x-password'] || req.body.password;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!providedPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '需要提供密码',
        hint: '请在请求头中添加 x-password 或在请求体中添加 password 字段'
      });
    }

    if (providedPassword !== expectedPassword) {
      console.warn(`⚠️ 密码验证失败 - IP: ${req.ip}, 时间: ${new Date().toISOString()}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: '密码错误'
      });
    }

    console.log(`✅ 密码验证成功 - IP: ${req.ip}, 时间: ${new Date().toISOString()}`);
    next();
  },

  ipWhitelist: (req, res, next) => {
    const allowedIPs = [
      '127.0.0.1',
      '::1',
      'localhost'
    ];

    const clientIP = req.ip || req.connection.remoteAddress;

    if (allowedIPs.includes(clientIP) || allowedIPs.includes('127.0.0.1')) {
      return next();
    }

    next();
  },

  secureOperation: (req, res, next) => {
    security.strictRateLimiter(req, res, () => {
      security.authenticatePassword(req, res, next);
    });
  },

  validateInput: (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body, { abortEarly: false });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        return res.status(400).json({
          error: 'Validation Error',
          message: '输入数据验证失败',
          details: errors
        });
      }

      next();
    };
  }
};

module.exports = security;
