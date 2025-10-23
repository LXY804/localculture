const express = require('express')
const jwt = require('jsonwebtoken')
const { pool } = require('../db')
const { authenticateToken, requireRole, JWT_SECRET } = require('../middleware/auth')

const router = express.Router()

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, nickname, email, phone, password } = req.body
    
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ message: '昵称和密码不能为空' })
    }
    
    // 检查用户名（昵称）是否已存在
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR phone = ?',
      [username, phone]
    )
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: '昵称或手机号已存在' })
    }
    
    // 直接存储明文密码
    const [result] = await pool.query(
      'INSERT INTO users (username, nickname, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, username, email || null, phone || null, password, 'user']
    )
    
    // 生成 JWT token
    const token = jwt.sign(
      { userId: result.insertId, username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // 获取用户信息（不包含密码）
    const [newUser] = await pool.query(
      'SELECT id, username, nickname, email, phone, role, status, avatar, created_at FROM users WHERE id = ?',
      [result.insertId]
    )
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      token,
      user: newUser[0]
    })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({ message: '注册失败', error: error.message })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' })
    }
    
    // 查找用户（支持用户名或手机号登录）
    const [users] = await pool.query(
      'SELECT id, username, nickname, email, phone, password, role, status, avatar FROM users WHERE username = ? OR phone = ?',
      [username, username]
    )
    
    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }
    
    const user = users[0]
    
    // 检查账户状态
    if (user.status !== 'active') {
      return res.status(401).json({ message: '账户已被禁用' })
    }
    
    // 直接比较明文密码
    if (password !== user.password) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }
    
    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // 移除密码字段
    delete user.password
    
    res.json({
      success: true,
      message: '登录成功',
      token,
      user
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ message: '登录失败', error: error.message })
  }
})

// 获取当前用户信息
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, nickname, email, phone, role, status, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    res.json({
      success: true,
      user: users[0]
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({ message: '获取用户信息失败', error: error.message })
  }
})

// 更新用户信息
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nickname, email, avatar } = req.body
    const userId = req.user.id
    
    await pool.query(
      'UPDATE users SET nickname = ?, email = ?, avatar = ?, updated_at = NOW() WHERE id = ?',
      [nickname, email, avatar, userId]
    )
    
    // 获取更新后的用户信息
    const [users] = await pool.query(
      'SELECT id, username, nickname, email, phone, role, status, avatar, created_at FROM users WHERE id = ?',
      [userId]
    )
    
    res.json({
      success: true,
      message: '用户信息更新成功',
      user: users[0]
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    res.status(500).json({ message: '更新用户信息失败', error: error.message })
  }
})

// 修改密码
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const userId = req.user.id
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '原密码和新密码不能为空' })
    }
    
    // 获取当前密码
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    )
    
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    // 验证原密码
    if (oldPassword !== users[0].password) {
      return res.status(401).json({ message: '原密码错误' })
    }
    
    // 直接存储明文密码
    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [newPassword, userId]
    )
    
    res.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('修改密码失败:', error)
    res.status(500).json({ message: '修改密码失败', error: error.message })
  }
})

// 验证 token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token 有效',
    user: req.user
  })
})

module.exports = router
