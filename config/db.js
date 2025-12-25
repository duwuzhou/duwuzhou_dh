const mysql = require("mysql2/promise");
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
  timezone: '+08:00',
  charset: 'utf8mb4'
});

pool.on('connection', (connection) => {
  console.log('📊 新数据库连接已建立');
});

pool.on('acquire', (connection) => {
  console.log('🔗 连接 %d 已从池中获取', connection.threadId);
});

pool.on('release', (connection) => {
  console.log('🔓 连接 %d 已释放回池', connection.threadId);
});

module.exports = pool;