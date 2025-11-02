const { pool } = require('./db')

async function initDatabase() {
  try {
    console.log('开始初始化数据库...')
    
    // 创建用户表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(64) NOT NULL UNIQUE,
        nickname VARCHAR(64) DEFAULT NULL,
        email VARCHAR(128) DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user','admin') DEFAULT 'user',
        status ENUM('active','inactive','banned') DEFAULT 'active',
        avatar VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY username (username),
        UNIQUE KEY phone (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    console.log('✅ 用户表创建成功')
    
    // 创建文章评论表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS article_comments (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        article_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        content TEXT NOT NULL,
        parent_id BIGINT UNSIGNED DEFAULT NULL COMMENT '回复的评论ID',
        status ENUM('active','hidden','deleted') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_article_id (article_id),
        KEY idx_user_id (user_id),
        KEY idx_parent_id (parent_id),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES article_comments(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    console.log('✅ 文章评论表创建成功')
    
    // 创建文章点赞表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS article_likes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        article_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_article_user_like (article_id, user_id),
        KEY idx_article_id (article_id),
        KEY idx_user_id (user_id),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    console.log('✅ 文章点赞表创建成功')
    
    // 创建文章收藏表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS article_favorites (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        article_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_article_user_favorite (article_id, user_id),
        KEY idx_article_id (article_id),
        KEY idx_user_id (user_id),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    console.log('✅ 文章收藏表创建成功')
    
    // 插入示例用户数据
    try {
      await pool.query(`
        INSERT IGNORE INTO users (username, nickname, email, password, role) VALUES
        ('admin', '管理员', 'admin@example.com', 'admin123', 'admin'),
        ('user1', '普通用户', 'user1@example.com', 'user123', 'user')
      `)
      console.log('✅ 示例用户数据插入成功')
    } catch (error) {
      console.log('ℹ️ 示例用户数据已存在，跳过插入')
    }
    
    console.log('🎉 数据库初始化完成！')
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
  } finally {
    process.exit(0)
  }
}

initDatabase()

