const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const pool = require('./config/db');
const cors = require('cors');

app.use(express.static('public'));

// 添加JSON解析中间件
app.use(express.json());
app.use(cors({
  origin: ['https://duwuzhou.github.io'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('最基本的Node.js后端服务');
});

const usersRouter = require('./routes/users');
const articlesRouter = require('./routes/articles');

app.use('/users', usersRouter);
app.use('/articles', articlesRouter);

app.listen(port, () => {
  
  console.log(`服务器运行在:${port}`);
});