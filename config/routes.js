// 路由设置模块
const express = require('express');
const fs = require('fs');
const path = require('path');

// 导入路由
const articlesRouter = require('../routes/articles');

const routes = {
  // 配置所有路由
  setup(app) {
    // 根路径
    app.get('/', (req, res) => {
      res.send('欢迎来到后端');
    });
    
    // 健康检查端点
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
    
    // API 路由
    app.use('/articles', articlesRouter);
    
    // 404 处理页面
    app.use('*', (req, res) => {
      try {
        // 读取404页面文件
        const notFoundPagePath = path.join(__dirname, '../public/404.html');
        const notFoundPage = fs.readFileSync(notFoundPagePath, 'utf8');
        res.status(404).send(notFoundPage);
      } catch (error) {
        // 如果404页面文件不存在，回退到简单错误信息
        console.error('404页面文件读取失败:', error.message);
        res.status(404).json({
          error: 'Not Found',
          message: '请求的资源不存在',
          path: req.originalUrl
        });
      }
    });
    
    console.log('✅ 路由设置已配置');
  }
};

module.exports = routes;