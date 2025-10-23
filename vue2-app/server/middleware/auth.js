const jwt = require('jsonwebtoken')
const { pool } = require('../db')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// 验证 JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: '访问令牌缺失' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 从数据库获取用户信息
    const [rows] = await pool.query(
      'SELECT id, username, nickname, email, phone, role, status FROM users WHERE id = ?',
      [decoded.userId]
    )
    
    if (rows.length === 0) {
      return res.status(401).json({ message: '用户不存在' })
    }
    
    const user = rows[0]
    if (user.status !== 'active') {
      return res.status(401).json({ message: '用户账户已被禁用' })
    }
    
    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ message: '无效的访问令牌' })
  }
}

// 检查用户角色
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '权限不足' })
    }
    
    next()
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET
}



