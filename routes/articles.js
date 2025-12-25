const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const cors = require('cors');
const security = require('../config/security');

router.use(cors({
  origin: ['https://duwuzhou.github.io'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-password'],
  credentials: true
}));

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, sortBy = 'date', order = 'DESC' } = req.query;

    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '页码必须是大于0的整数'
      });
    }

    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '每页数量必须在1-100之间'
      });
    }

    const result = await Article.findAll({
      page: pageNum,
      pageSize: pageSizeNum,
      sortBy,
      order
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('获取文章列表失败:', err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '获取文章列表失败',
      details: err.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '无效的文章ID'
      });
    }

    const article = await Article.findById(id);

    if (article) {
      res.json({
        success: true,
        data: article,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '文章未找到',
        articleId: id
      });
    }
  } catch (err) {
    console.error(`获取文章 ${req.params.id} 失败:`, err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '获取文章失败',
      details: err.message
    });
  }
});

router.post('/', security.secureOperation, async (req, res) => {
  try {
    const { title, summary, date, tags, content } = req.body;

    if (!title || !summary || !date) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '缺少必填字段',
        required: ['title', 'summary', 'date']
      });
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '标签必须是数组格式'
      });
    }

    const newArticle = await Article.create({
      title,
      summary,
      date,
      tags: tags || [],
      content: content || ''
    });

    res.status(201).json({
      success: true,
      data: newArticle,
      message: '文章创建成功',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('创建文章失败:', err);
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: '创建文章失败',
      details: err.message
    });
  }
});

router.put('/:id', security.secureOperation, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, date, tags, content } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '无效的文章ID'
      });
    }

    if (!title || !summary || !date) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '缺少必填字段',
        required: ['title', 'summary', 'date']
      });
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '标签必须是数组格式'
      });
    }

    const updatedArticle = await Article.update(id, {
      title,
      summary,
      date,
      tags: tags || [],
      content: content || ''
    });

    if (updatedArticle) {
      res.json({
        success: true,
        data: updatedArticle,
        message: '文章更新成功',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '文章未找到',
        articleId: id
      });
    }
  } catch (err) {
    console.error(`更新文章 ${req.params.id} 失败:`, err);
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: '更新文章失败',
      details: err.message
    });
  }
});

router.delete('/:id', security.secureOperation, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '无效的文章ID'
      });
    }

    const deleted = await Article.delete(id);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: '文章删除成功',
        articleId: id,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '文章未找到',
        articleId: id
      });
    }
  } catch (err) {
    console.error(`删除文章 ${req.params.id} 失败:`, err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '删除文章失败',
      details: err.message
    });
  }
});

module.exports = router;
