const pool = require('../config/db');

class Article {
  static async findAll({ page = 1, pageSize = 10, sortBy = 'date', order = 'DESC' } = {}) {
    try {
      const offset = (page - 1) * pageSize;
      const validSortFields = ['id', 'title', 'date', 'created_at'];
      const validOrders = ['ASC', 'DESC'];

      const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
      const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

      const [rows] = await pool.query(
        `SELECT a.id, a.title, a.summary, a.date, a.content,
                GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ',') AS tag_names,
                a.created_at
         FROM articles a
         LEFT JOIN article_tags at ON a.id = at.article_id
         LEFT JOIN tags t ON at.tag_id = t.id
         GROUP BY a.id
         ORDER BY a.${sortField} ${sortOrder}
         LIMIT ? OFFSET ?`,
        [pageSize, offset]
      );

      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM articles');
      const total = countResult[0].total;

      return {
        data: rows.map(row => ({
          ...row,
          tags: row.tag_names ? row.tag_names.split(',') : []
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      console.error('❌ 查询文章列表失败:', error.message);
      throw new Error('查询文章列表失败: ' + error.message);
    }
  }

  static async findById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('无效的文章ID');
      }

      const [rows] = await pool.query(
        `SELECT a.id, a.title, a.summary, a.date, a.content,
                GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ',') AS tag_names,
                a.created_at
         FROM articles a
         LEFT JOIN article_tags at ON a.id = at.article_id
         LEFT JOIN tags t ON at.tag_id = t.id
         WHERE a.id = ?
         GROUP BY a.id`,
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        ...row,
        tags: row.tag_names ? row.tag_names.split(',') : []
      };
    } catch (error) {
      console.error(`❌ 查询文章 ${id} 失败:`, error.message);
      throw new Error('查询文章失败: ' + error.message);
    }
  }

  static async create({ title, summary, date, tags = [], content }) {
    const connection = await pool.getConnection();
    try {
      if (!title || !summary || !date) {
        throw new Error('标题、摘要和日期为必填项');
      }

      if (!Array.isArray(tags)) {
        throw new Error('标签必须是数组');
      }

      await connection.beginTransaction();

      const [articleResult] = await connection.query(
        'INSERT INTO articles (title, summary, date, content) VALUES (?, ?, ?, ?)',
        [title, summary, date, content || '']
      );

      const articleId = articleResult.insertId;

      for (const tagName of tags) {
        if (!tagName || typeof tagName !== 'string') {
          continue;
        }

        let [tagResult] = await connection.query(
          'SELECT id FROM tags WHERE name = ?',
          [tagName.trim()]
        );

        let tagId;
        if (tagResult.length === 0) {
          [tagResult] = await connection.query(
            'INSERT INTO tags (name) VALUES (?)',
            [tagName.trim()]
          );
          tagId = tagResult.insertId;
        } else {
          tagId = tagResult[0].id;
        }

        await connection.query(
          'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)',
          [articleId, tagId]
        );
      }

      await connection.commit();
      console.log(`✅ 文章创建成功 - ID: ${articleId}`);
      return { id: articleId, title, summary, date, content, tags };
    } catch (error) {
      await connection.rollback();
      console.error('❌ 创建文章失败:', error.message);
      throw new Error('创建文章失败: ' + error.message);
    } finally {
      connection.release();
    }
  }

  static async update(id, { title, summary, date, tags = [], content }) {
    const connection = await pool.getConnection();
    try {
      if (!id || isNaN(id)) {
        throw new Error('无效的文章ID');
      }

      if (!title || !summary || !date) {
        throw new Error('标题、摘要和日期为必填项');
      }

      if (!Array.isArray(tags)) {
        throw new Error('标签必须是数组');
      }

      await connection.beginTransaction();

      const [updateResult] = await connection.query(
        'UPDATE articles SET title = ?, summary = ?, date = ?, content = ? WHERE id = ?',
        [title, summary, date, content || '', id]
      );

      if (updateResult.affectedRows === 0) {
        await connection.rollback();
        return null;
      }

      await connection.query(
        'DELETE FROM article_tags WHERE article_id = ?',
        [id]
      );

      for (const tagName of tags) {
        if (!tagName || typeof tagName !== 'string') {
          continue;
        }

        let [tagResult] = await connection.query(
          'SELECT id FROM tags WHERE name = ?',
          [tagName.trim()]
        );

        let tagId;
        if (tagResult.length === 0) {
          [tagResult] = await connection.query(
            'INSERT INTO tags (name) VALUES (?)',
            [tagName.trim()]
          );
          tagId = tagResult.insertId;
        } else {
          tagId = tagResult[0].id;
        }

        await connection.query(
          'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)',
          [id, tagId]
        );
      }

      await connection.commit();
      console.log(`✅ 文章更新成功 - ID: ${id}`);
      return { id: parseInt(id), title, summary, date, content, tags };
    } catch (error) {
      await connection.rollback();
      console.error(`❌ 更新文章 ${id} 失败:`, error.message);
      throw new Error('更新文章失败: ' + error.message);
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      if (!id || isNaN(id)) {
        throw new Error('无效的文章ID');
      }

      await connection.beginTransaction();

      await connection.query(
        'DELETE FROM article_tags WHERE article_id = ?',
        [id]
      );

      const [result] = await connection.query(
        'DELETE FROM articles WHERE id = ?',
        [id]
      );

      await connection.commit();

      if (result.affectedRows > 0) {
        console.log(`✅ 文章删除成功 - ID: ${id}`);
        return true;
      }

      return false;
    } catch (error) {
      await connection.rollback();
      console.error(`❌ 删除文章 ${id} 失败:`, error.message);
      throw new Error('删除文章失败: ' + error.message);
    } finally {
      connection.release();
    }
  }
}

module.exports = Article;
