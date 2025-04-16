const pool = require('../config/db');

class Article {
  static async findAll({ page = 1, pageSize = 10 } = {}) {
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT a.*, GROUP_CONCAT(t.name) AS tag_names 
       FROM articles a 
       LEFT JOIN article_tags at ON a.id = at.article_id 
       LEFT JOIN tags t ON at.tag_id = t.id 
       GROUP BY a.id 
       ORDER BY a.date DESC 
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
  
    return rows.map(row => ({
      ...row,
      tags: row.tag_names ? row.tag_names.split(',') : []
    }));
  }

  static async create({ title, summary, date, tags }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // 插入文章
      const [articleResult] = await connection.query(
        'INSERT INTO articles (title, summary, date) VALUES (?, ?, ?)',
        [title, summary, date]
      );
      
      // 处理标签
      const articleId = articleResult.insertId;
      for (const tagName of tags) {
        // 检查标签是否存在
        let [tagResult] = await connection.query(
          'SELECT id FROM tags WHERE name = ?',
          [tagName]
        );
        
        let tagId;
        if (tagResult.length === 0) {
          // 创建新标签
          [tagResult] = await connection.query(
            'INSERT INTO tags (name) VALUES (?)',
            [tagName]
          );
          tagId = tagResult.insertId;
        } else {
          tagId = tagResult[0].id;
        }
        
        // 创建关联
        await connection.query(
          'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)',
          [articleId, tagId]
        );
      }
      
      await connection.commit();
      return { id: articleId, title, summary, date, tags };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // 删除文章标签关联
      await connection.query(
        'DELETE FROM article_tags WHERE article_id = ?',
        [id]
      );
      
      // 删除文章
      const [result] = await connection.query(
        'DELETE FROM articles WHERE id = ?',
        [id]
      );
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = Article;