// 数据库连接和管理模块
const pool = require('./db');

const database = {
  // 测试数据库连接
  async testConnection() {
    try {
      const connection = await pool.getConnection();
      console.log('✅ 成功连接数据库');
      connection.release();
      return true;
    } catch (err) {
      console.error('❌ 数据库连接失败:', err.message);
      return false;
    }
  },
  
  // 关闭数据库连接池
  async close() {
    try {
      await pool.end();
      console.log('✅ 数据库连接已关闭');
    } catch (err) {
      console.error('❌ 关闭数据库连接时出错:', err.message);
    }
  },
  
  // 获取连接池
  getPool() {
    return pool;
  }
};

module.exports = database;