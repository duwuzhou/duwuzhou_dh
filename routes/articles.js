const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const cors = require('cors');
const security = require('../config/security');

router.use(cors({
  origin: ['https://duwuzhou.github.io'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 获取所有文章
router.get('/', async (req, res) => {
  try {
    const articles = await Article.findAll();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新文章（需要密码保护）
router.post('/', security.authenticatePassword, async (req, res) => {
  try {
    const { title, summary, date, tags, content } = req.body;
    const newArticle = await Article.create({ title, summary, date, tags, content });
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 删除文章（需要密码保护）
router.delete('/:id', security.authenticatePassword, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Article.delete(id);
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: '文章未找到' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;