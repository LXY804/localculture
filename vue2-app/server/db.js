const mysql = require('mysql2/promise')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // ⚠️ 请在 .env 文件中设置密码
  database: process.env.DB_NAME || 'localculture',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('✅ 数据库连接成功')
    connection.release()
    return true
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message)
    console.log('将使用 mock 数据作为回退方案')
    return false
  }
}

// 启动时测试连接
testConnection()

module.exports = { pool, testConnection }


