const mysql = require('mysql2/promise');
const fs = require('fs');

// 修正配置文件路径为相对项目根目录的路径
const config = JSON.parse(fs.readFileSync('./config/config.json')).db;

const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: config.waitForConnections,
  connectionLimit: config.connectionLimit,
  queueLimit: config.queueLimit
});

module.exports = pool;