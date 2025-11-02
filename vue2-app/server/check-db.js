const { pool } = require('./db')

async function checkDatabase() {
  try {
    console.log('检查数据库中的文章数据...')
    
    // 检查文章表
    const [articles] = await pool.query('SELECT id, title, views, likes FROM articles WHERE id = 1')
    console.log('文章数据:', articles[0])
    
    // 检查点赞表
    const [likes] = await pool.query('SELECT * FROM article_likes WHERE article_id = 1')
    console.log('点赞记录数量:', likes.length)
    console.log('点赞记录:', likes)
    
    // 检查用户表
    const [users] = await pool.query('SELECT id, username FROM users WHERE id = 9')
    console.log('用户数据:', users[0])
    
  } catch (error) {
    console.error('检查数据库失败:', error)
  } finally {
    process.exit(0)
  }
}

checkDatabase()



