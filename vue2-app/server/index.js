const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { pool } = require('./db')

// 导入路由
const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳 + 随机数 + 原扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB限制
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只允许上传图片文件'), false)
    }
  }
})

// 静态文件服务 - 提供上传的头像访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 静态文件服务 - 提供前端assets静态文件访问
app.use('/assets', express.static(path.join(__dirname, '../src/assets')))

// 使用认证路由
app.use('/api/auth', authRoutes)

// 头像上传接口
app.post('/api/upload/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的头像文件' })
    }
    
    // 生成头像URL
    const avatarUrl = `/uploads/${req.file.filename}`
    
    res.json({
      success: true,
      message: '头像上传成功',
      avatarUrl: avatarUrl,
      filename: req.file.filename
    })
  } catch (error) {
    console.error('头像上传失败:', error)
    res.status(500).json({ message: '头像上传失败', error: error.message })
  }
})

function readJson(fileRelativePath) {
  const filePath = path.join(__dirname, '..', 'public', fileRelativePath)
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now() })
})

app.get('/api/db-status', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as test')
    res.json({ 
      status: 'connected', 
      message: '数据库连接正常',
      ts: Date.now() 
    })
  } catch (error) {
    res.json({ 
      status: 'disconnected', 
      message: '数据库连接失败: ' + error.message,
      ts: Date.now() 
    })
  }
})

// 调试接口：检查文章content字段
app.get('/api/debug/articles', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, title, content, LENGTH(content) as content_length FROM articles ORDER BY id DESC LIMIT 5')
    res.json({ 
      success: true,
      data: rows,
      message: '文章调试信息'
    })
  } catch (error) {
    res.json({ 
      success: false,
      message: '查询失败: ' + error.message
    })
  }
})

// 热门文章接口
app.get('/api/hot-articles', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 9
    const [rows] = await pool.query(`
      SELECT 
        ha.id,
        ha.article_id,
        ha.title,
        ha.summary,
        ha.cover,
        ha.category,
        ha.author,
        ha.views,
        ha.likes,
        ha.comments_count,
        ha.hot_score,
        ha.featured,
        ha.created_at
      FROM hotarticles ha
      WHERE ha.status = 'active'
      ORDER BY ha.hot_score DESC, ha.sort_order DESC, ha.created_at DESC
      LIMIT ?
    `, [limit])
    
    res.json({
      success: true,
      data: rows,
      message: '获取热门文章成功'
    })
  } catch (error) {
    console.error('获取热门文章失败:', error)
    // fallback to mock data
    try {
      const mockData = [
        {
          id: 1,
          article_id: 1,
          title: '地方传统美食背后的故事',
          summary: '探索地方传统美食的历史渊源和文化内涵，了解每一道菜背后的故事。',
          cover: '/assets/food1.jpg',
          category: '传统文化',
          author: '美食专家',
          views: 1200,
          likes: 85,
          comments_count: 23,
          hot_score: 95.5,
          featured: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          article_id: 2,
          title: '木版年画的传承与创新',
          summary: '传统木版年画技艺的传承现状与现代创新应用，保护非遗文化。',
          cover: '/assets/painting.jpg',
          category: '手工艺',
          author: '非遗传承人',
          views: 980,
          likes: 72,
          comments_count: 18,
          hot_score: 88.2,
          featured: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          article_id: 3,
          title: '民俗节庆与社区凝聚力',
          summary: '传统节庆活动如何增强社区凝聚力，促进邻里关系和谐发展。',
          cover: '/assets/festival.jpg',
          category: '民俗节庆',
          author: '社区研究员',
          views: 750,
          likes: 58,
          comments_count: 15,
          hot_score: 82.1,
          featured: 1,
          created_at: new Date().toISOString()
        }
      ]
      
      res.json({
        success: true,
        data: mockData.slice(0, limit),
        message: '获取热门文章成功（使用模拟数据）'
      })
    } catch (mockError) {
      res.status(500).json({ 
        success: false,
        message: '获取热门文章失败: ' + error.message
      })
    }
  }
})

// 初始化热门文章测试数据
app.post('/api/hot-articles/init', async (req, res) => {
  try {
    // 先清空现有数据
    await pool.query('DELETE FROM hotarticles')
    
    // 插入测试数据
    const testData = [
      {
        article_id: 6,
        title: '地方传统美食背后的故事',
        summary: '探索地方传统美食的历史渊源和文化内涵，了解每一道菜背后的故事。',
        cover: '/assets/food1.jpg',
        category: '传统文化',
        author: '美食专家',
        views: 1200,
        likes: 85,
        comments_count: 23,
        hot_score: 95.5,
        featured: 1
      },
      {
        article_id: 5,
        title: '木版年画的传承与创新',
        summary: '传统木版年画技艺的传承现状与现代创新应用，保护非遗文化。',
        cover: '/assets/painting.jpg',
        category: '手工艺',
        author: '非遗传承人',
        views: 980,
        likes: 72,
        comments_count: 18,
        hot_score: 88.2,
        featured: 0
      },
      {
        article_id: 3,
        title: '民俗节庆与社区凝聚力',
        summary: '传统节庆活动如何增强社区凝聚力，促进邻里关系和谐发展。',
        cover: '/assets/festival.jpg',
        category: '民俗节庆',
        author: '社区研究员',
        views: 750,
        likes: 58,
        comments_count: 15,
        hot_score: 82.1,
        featured: 1
      },
      {
        article_id: 2,
        title: '戏曲进校园的传承实践',
        summary: '戏曲艺术在校园中的传承实践，培养年轻一代对传统文化的兴趣。',
        cover: '/assets/campus.jpg',
        category: '音乐舞蹈',
        author: '教育专家',
        views: 650,
        likes: 45,
        comments_count: 12,
        hot_score: 75.8,
        featured: 0
      },
      {
        article_id: 1,
        title: '地方方言里的文化密码',
        summary: '探索地方方言中蕴含的文化密码，了解语言与文化的深层联系。',
        cover: '/assets/language.jpg',
        category: '传统文化',
        author: '语言学家',
        views: 580,
        likes: 38,
        comments_count: 9,
        hot_score: 70.3,
        featured: 0
      }
    ]
    
    for (const data of testData) {
      await pool.query(`
        INSERT INTO hotarticles 
        (article_id, title, summary, cover, category, author, views, likes, comments_count, hot_score, featured, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `, [
        data.article_id, data.title, data.summary, data.cover, data.category,
        data.author, data.views, data.likes, data.comments_count, data.hot_score, data.featured
      ])
    }
    
    res.json({
      success: true,
      message: '热门文章测试数据初始化成功',
      count: testData.length
    })
  } catch (error) {
    console.error('初始化热门文章数据失败:', error)
    res.status(500).json({ 
      success: false,
      message: '初始化失败: ' + error.message
    })
  }
})

// 获取文章列表
app.get('/api/articles', async (req, res) => {
  try {
    // 现在 articles 表已包含完整数据，直接查询即可
    // 使用 LEFT JOIN 标记是否为热门文章，热门文章排在前面
    const [rows] = await pool.query(`
      SELECT 
        a.id,
        a.title,
        a.content,
        a.summary,
        a.category,
        a.status,
        a.visible,
        a.cover,
        a.views,
        a.likes,
        a.created_at,
        CASE WHEN h.id IS NOT NULL THEN 1 ELSE 0 END as is_hot
      FROM articles a
      LEFT JOIN hotarticles h ON a.id = h.article_id AND h.status = 'active'
      ORDER BY is_hot DESC, a.id DESC
      LIMIT 200
    `)
    
    if (rows && rows.length) {
      const role = req.query.role || 'user'
      let list = rows
      if (role === 'user') list = list.filter(item => item.status === 'published' || item.visible === 1)
      return res.json(list)
    }
  } catch (e) {
    console.error('获取文章列表失败:', e)
    // fallback to mock
  }
  try {
    const data = readJson(path.join('mock', 'articles.json'))
    const role = req.query.role || 'user'
    let list = Array.isArray(data) ? data : []
    if (role === 'user') list = list.filter(item => item.status === 'published' || item.visible === true)
    res.json(list)
  } catch (e) {
    res.status(500).json({ message: 'Failed to load articles', error: String(e) })
  }
})

// 获取文章详情（包含浏览量+1）
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // 先增加浏览量
    await pool.query('UPDATE articles SET views = views + 1 WHERE id = ?', [id])
    
    // 获取文章详情（现在 articles 表已包含完整数据）
    const [rows] = await pool.query(
      'SELECT id, title, content, summary, category, status, visible, cover, views, likes, created_at, updated_at FROM articles WHERE id = ?',
      [id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '文章不存在' })
    }
    
    const article = rows[0]
    
    // 获取评论数量
    const [commentCount] = await pool.query(
      'SELECT COUNT(*) as count FROM article_comments WHERE article_id = ? AND status = ?',
      [id, 'active']
    )
    
    // 获取用户是否已点赞和收藏（如果用户已登录）
    let userLiked = false
    let userFavorited = false
    
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1]
        const jwt = require('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        const decoded = jwt.verify(token, JWT_SECRET)
        
        // 检查用户是否已点赞
        const [likeRows] = await pool.query(
          'SELECT id FROM article_likes WHERE article_id = ? AND user_id = ?',
          [id, decoded.userId]
        )
        userLiked = likeRows.length > 0
        
        // 检查用户是否已收藏
        const [favoriteRows] = await pool.query(
          'SELECT id FROM article_favorites WHERE article_id = ? AND user_id = ?',
          [id, decoded.userId]
        )
        userFavorited = favoriteRows.length > 0
      } catch (error) {
        // 忽略token验证错误，继续返回文章信息
      }
    }
    
    res.json({
      success: true,
      data: {
        ...article,
        comments_count: commentCount[0].count,
        user_liked: userLiked,
        user_favorited: userFavorited
      }
    })
  } catch (error) {
    console.error('获取文章详情失败:', error)
    res.status(500).json({ message: '获取文章详情失败', error: error.message })
  }
})

// 文章管理接口
app.post('/api/articles', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { title, content, category, status = 'published', visible = 1, cover } = req.body
    const userId = req.user.id
    
    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' })
    }
    
    const [result] = await pool.query(
      'INSERT INTO articles (title, content, category, status, visible, cover, views, likes, author_id) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)',
      [title, content, category, status, visible, cover, userId]
    )
    
    res.json({ 
      success: true, 
      message: '文章创建成功',
      id: result.insertId 
    })
  } catch (error) {
    console.error('创建文章失败:', error)
    res.status(500).json({ message: '创建文章失败', error: error.message })
  }
})

app.put('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, category, status, visible, cover } = req.body
    
    const [result] = await pool.query(
      'UPDATE articles SET title=?, content=?, category=?, status=?, visible=?, cover=?, updated_at=NOW() WHERE id=?',
      [title, content, category, status, visible, cover, id]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '文章不存在' })
    }
    
    res.json({ success: true, message: '文章更新成功' })
  } catch (error) {
    console.error('更新文章失败:', error)
    res.status(500).json({ message: '更新文章失败', error: error.message })
  }
})

app.delete('/api/articles/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const userRole = req.user.role || 'user'
    
    // 先检查文章是否存在并获取作者信息
    const [articles] = await pool.query('SELECT author_id FROM articles WHERE id = ?', [id])
    
    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: '文章不存在' })
    }
    
    const article = articles[0]
    
    // 检查权限：只有文章作者或管理员可以删除
    if (article.author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: '您没有权限删除此文章' })
    }
    
    // 删除文章
    const [result] = await pool.query('DELETE FROM articles WHERE id = ?', [id])
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '文章删除失败' })
    }
    
    res.json({ success: true, message: '文章删除成功' })
  } catch (error) {
    console.error('删除文章失败:', error)
    res.status(500).json({ success: false, message: '删除文章失败', error: error.message })
  }
})

// 文章点赞/取消点赞
app.post('/api/articles/:id/like', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // 检查是否是热门文章
    const [hotRows] = await pool.query('SELECT * FROM hotarticles WHERE article_id = ? AND status = ?', [id, 'active'])
    const isHotArticle = hotRows.length > 0
    
    // 检查文章是否存在
    const [articleRows] = await pool.query('SELECT id FROM articles WHERE id = ?', [id])
    if (articleRows.length === 0) {
      return res.status(404).json({ message: '文章不存在' })
    }
    
    // 检查是否已点赞
    const [existingLike] = await pool.query(
      'SELECT id FROM article_likes WHERE article_id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (existingLike.length > 0) {
      // 取消点赞
      await pool.query('DELETE FROM article_likes WHERE article_id = ? AND user_id = ?', [id, userId])
      await pool.query('UPDATE articles SET likes = likes - 1 WHERE id = ?', [id])
      
      // 如果是热门文章，同时更新hotarticles表
      if (isHotArticle) {
        await pool.query('UPDATE hotarticles SET likes = likes - 1 WHERE article_id = ?', [id])
      }
      
      res.json({ 
        success: true, 
        message: '取消点赞成功',
        liked: false
      })
    } else {
      // 添加点赞
      await pool.query('INSERT INTO article_likes (article_id, user_id) VALUES (?, ?)', [id, userId])
      await pool.query('UPDATE articles SET likes = likes + 1 WHERE id = ?', [id])
      
      // 如果是热门文章，同时更新hotarticles表
      if (isHotArticle) {
        await pool.query('UPDATE hotarticles SET likes = likes + 1 WHERE article_id = ?', [id])
      }
      
      res.json({ 
        success: true, 
        message: '点赞成功',
        liked: true
      })
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    res.status(500).json({ message: '点赞操作失败', error: error.message })
  }
})

// 文章收藏/取消收藏
app.post('/api/articles/:id/favorite', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // 检查文章是否存在
    const [articleRows] = await pool.query('SELECT id FROM articles WHERE id = ?', [id])
    if (articleRows.length === 0) {
      return res.status(404).json({ message: '文章不存在' })
    }
    
    // 检查是否已收藏
    const [existingFavorite] = await pool.query(
      'SELECT id FROM article_favorites WHERE article_id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (existingFavorite.length > 0) {
      // 取消收藏
      await pool.query('DELETE FROM article_favorites WHERE article_id = ? AND user_id = ?', [id, userId])
      
      res.json({ 
        success: true, 
        message: '取消收藏成功',
        favorited: false
      })
    } else {
      // 添加收藏
      await pool.query('INSERT INTO article_favorites (article_id, user_id) VALUES (?, ?)', [id, userId])
      
      res.json({ 
        success: true, 
        message: '收藏成功',
        favorited: true
      })
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    res.status(500).json({ message: '收藏操作失败', error: error.message })
  }
})

// 获取文章评论列表
app.get('/api/articles/:id/comments', async (req, res) => {
  try {
    const { id } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.content,
        c.parent_id,
        c.created_at,
        u.id as user_id,
        u.username,
        u.nickname,
        u.avatar
      FROM article_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ? AND c.status = 'active'
      ORDER BY c.created_at ASC
      LIMIT ? OFFSET ?
    `, [id, limit, offset])
    
    // 获取总评论数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM article_comments WHERE article_id = ? AND status = "active"',
      [id]
    )
    
    res.json({
      success: true,
      data: {
        comments: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取评论失败:', error)
    res.status(500).json({ message: '获取评论失败', error: error.message })
  }
})

// 用户中心 - 获取用户信息
app.get('/api/user/profile', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    
    // 获取用户基本信息
    const [userRows] = await pool.query(
      'SELECT id, username, nickname, email, phone, role, status, avatar, created_at FROM users WHERE id = ?',
      [userId]
    )
    
    if (userRows.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    const user = userRows[0]
    
    // 获取用户统计数据
    const [likesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM article_likes WHERE user_id = ?',
      [userId]
    )
    
    const [favoritesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM article_favorites WHERE user_id = ?',
      [userId]
    )
    
    const [commentsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM article_comments WHERE user_id = ? AND status = ?',
      [userId, 'active']
    )
    
    const [postsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM articles WHERE author_id = ? AND status = ?',
      [userId, 'published']
    )
    
    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          likes: likesCount[0].count,
          favorites: favoritesCount[0].count,
          comments: commentsCount[0].count,
          posts: postsCount[0].count
        }
      }
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({ message: '获取用户信息失败', error: error.message })
  }
})

// 用户中心 - 获取用户收藏的文章
app.get('/api/user/favorites', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    
    const [rows] = await pool.query(`
      SELECT 
        a.id,
        a.title,
        a.content,
        a.category,
        a.cover,
        a.views,
        a.likes,
        a.created_at,
        af.created_at as favorited_at
      FROM article_favorites af
      LEFT JOIN articles a ON af.article_id = a.id
      WHERE af.user_id = ?
      ORDER BY af.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset])
    
    // 获取总收藏数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM article_favorites WHERE user_id = ?',
      [userId]
    )
    
    res.json({
      success: true,
      data: {
        favorites: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取用户收藏失败:', error)
    res.status(500).json({ message: '获取用户收藏失败', error: error.message })
  }
})

// 用户中心 - 获取用户点赞的文章
app.get('/api/user/likes', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    
    const [rows] = await pool.query(`
      SELECT 
        a.id,
        a.title,
        a.content,
        a.category,
        a.cover,
        a.views,
        a.likes,
        a.created_at,
        al.created_at as liked_at
      FROM article_likes al
      LEFT JOIN articles a ON al.article_id = a.id
      WHERE al.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset])
    
    // 获取总点赞数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM article_likes WHERE user_id = ?',
      [userId]
    )
    
    res.json({
      success: true,
      data: {
        likes: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取用户点赞失败:', error)
    res.status(500).json({ message: '获取用户点赞失败', error: error.message })
  }
})

// 用户中心 - 获取用户评论
app.get('/api/user/comments', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    
    const [rows] = await pool.query(`
      SELECT 
        ac.id,
        ac.content,
        ac.created_at,
        a.id as article_id,
        a.title as article_title
      FROM article_comments ac
      LEFT JOIN articles a ON ac.article_id = a.id
      WHERE ac.user_id = ? AND ac.status = ?
      ORDER BY ac.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, 'active', limit, offset])
    
    // 获取总评论数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM article_comments WHERE user_id = ? AND status = ?',
      [userId, 'active']
    )
    
    res.json({
      success: true,
      data: {
        comments: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取用户评论失败:', error)
    res.status(500).json({ message: '获取用户评论失败', error: error.message })
  }
})

// 用户中心 - 获取用户发布的帖子
app.get('/api/user/posts', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    
    const [rows] = await pool.query(`
      SELECT 
        id,
        title,
        content,
        category,
        status,
        views,
        likes,
        comments_count,
        created_at,
        updated_at
      FROM articles
      WHERE author_id = ? AND status = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, 'published', limit, offset])
    
    // 获取总帖子数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM articles WHERE author_id = ? AND status = ?',
      [userId, 'published']
    )
    
    res.json({
      success: true,
      data: {
        posts: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取用户帖子失败:', error)
    res.status(500).json({ message: '获取用户帖子失败', error: error.message })
  }
})

// 用户中心 - 发布新帖子
app.post('/api/user/posts', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { title, content, category } = req.body
    
    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' })
    }
    
    const [result] = await pool.query(
      'INSERT INTO forum_posts (author_id, title, content, category, status) VALUES (?, ?, ?, ?, ?)',
      [userId, title, content, category || '未分类', 'published']
    )
    
    res.status(201).json({
      success: true,
      message: '帖子发布成功',
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error('发布帖子失败:', error)
    res.status(500).json({ message: '发布帖子失败', error: error.message })
  }
})

// 删除论坛帖子
app.delete('/api/forum/posts/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const userRole = req.user.role || 'user'
    
    // 先检查帖子是否存在并获取作者信息
    const [posts] = await pool.query('SELECT author_id FROM forum_posts WHERE id = ?', [id])
    
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: '帖子不存在' })
    }
    
    const post = posts[0]
    
    // 检查权限：只有帖子作者或管理员可以删除
    if (post.author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: '您没有权限删除此帖子' })
    }
    
    // 删除帖子
    const [result] = await pool.query('DELETE FROM forum_posts WHERE id = ?', [id])
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '帖子删除失败' })
    }
    
    res.json({ success: true, message: '帖子删除成功' })
  } catch (error) {
    console.error('删除帖子失败:', error)
    res.status(500).json({ success: false, message: '删除帖子失败', error: error.message })
  }
})

// 添加文章评论
app.post('/api/articles/:id/comments', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { content, parent_id } = req.body
    const userId = req.user.id
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: '评论内容不能为空' })
    }
    
    // 检查文章是否存在
    const [articleRows] = await pool.query('SELECT id FROM articles WHERE id = ?', [id])
    if (articleRows.length === 0) {
      return res.status(404).json({ message: '文章不存在' })
    }
    
    // 如果有parent_id，检查父评论是否存在
    if (parent_id) {
      const [parentRows] = await pool.query(
        'SELECT id FROM article_comments WHERE id = ? AND article_id = ? AND status = "active"',
        [parent_id, id]
      )
      if (parentRows.length === 0) {
        return res.status(400).json({ message: '父评论不存在' })
      }
    }
    
    // 插入评论
    const [result] = await pool.query(
      'INSERT INTO article_comments (article_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [id, userId, content.trim(), parent_id || null]
    )
    
    // 获取新插入的评论信息
    const [newComment] = await pool.query(`
      SELECT 
        c.id,
        c.content,
        c.parent_id,
        c.created_at,
        u.id as user_id,
        u.username,
        u.nickname,
        u.avatar
      FROM article_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId])
    
    res.status(201).json({
      success: true,
      message: '评论发表成功',
      data: newComment[0]
    })
  } catch (error) {
    console.error('发表评论失败:', error)
    res.status(500).json({ message: '发表评论失败', error: error.message })
  }
})

// ==================== 活动相关API ====================

// 获取活动列表
app.get('/api/activities', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'published' } = req.query
    const offset = (page - 1) * limit
    
    const [rows] = await pool.query(`
      SELECT 
        id, title, description, location, start_time, end_time, 
        max_participants, current_participants, cover, status, visible, created_at
      FROM activities 
      WHERE status = ? AND visible = 1
      ORDER BY start_time ASC
      LIMIT ? OFFSET ?
    `, [status, parseInt(limit), parseInt(offset)])
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM activities WHERE status = ? AND visible = 1',
      [status]
    )
    
    res.json({
      success: true,
      data: {
        activities: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取活动列表失败:', error)
    res.status(500).json({ message: '获取活动列表失败', error: error.message })
  }
})

// 获取活动详情
app.get('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const [rows] = await pool.query(`
      SELECT 
        id, title, description, location, start_time, end_time, 
        max_participants, current_participants, cover, status, visible, created_at
      FROM activities 
      WHERE id = ? AND status = 'published' AND visible = 1
    `, [id])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '活动不存在' })
    }
    
    res.json({
      success: true,
      data: rows[0]
    })
  } catch (error) {
    console.error('获取活动详情失败:', error)
    res.status(500).json({ message: '获取活动详情失败', error: error.message })
  }
})

// 用户报名活动
app.post('/api/activities/:id/register', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // 检查活动是否存在且可报名
    const [activityRows] = await pool.query(`
      SELECT id, title, max_participants, current_participants, start_time, status
      FROM activities 
      WHERE id = ? AND status = 'published' AND visible = 1
    `, [id])
    
    if (activityRows.length === 0) {
      return res.status(404).json({ message: '活动不存在或已结束' })
    }
    
    const activity = activityRows[0]
    
    // 检查活动是否已开始
    if (new Date(activity.start_time) <= new Date()) {
      return res.status(400).json({ message: '活动已开始，无法报名' })
    }
    
    // 检查是否已报名
    const [existingRegistration] = await pool.query(
      'SELECT id, status FROM user_activities WHERE user_id = ? AND activity_id = ?',
      [userId, id]
    )
    
    if (existingRegistration.length > 0) {
      if (existingRegistration[0].status === 'cancelled') {
        // 重新报名
        await pool.query(
          'UPDATE user_activities SET status = ?, registration_time = NOW() WHERE user_id = ? AND activity_id = ?',
          ['registered', userId, id]
        )
        await pool.query(
          'UPDATE activities SET current_participants = current_participants + 1 WHERE id = ?',
          [id]
        )
        return res.json({ success: true, message: '重新报名成功' })
      } else {
        return res.status(400).json({ message: '您已经报名过此活动' })
      }
    }
    
    // 检查人数限制
    if (activity.max_participants && activity.current_participants >= activity.max_participants) {
      return res.status(400).json({ message: '活动报名人数已满' })
    }
    
    // 开始事务
    const connection = await pool.getConnection()
    await connection.beginTransaction()
    
    try {
      // 插入报名记录
      await connection.query(
        'INSERT INTO user_activities (user_id, activity_id, status) VALUES (?, ?, ?)',
        [userId, id, 'registered']
      )
      
      // 更新活动参与人数
      await connection.query(
        'UPDATE activities SET current_participants = current_participants + 1 WHERE id = ?',
        [id]
      )
      
      await connection.commit()
      
      res.json({
        success: true,
        message: '报名成功'
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('报名活动失败:', error)
    res.status(500).json({ message: '报名活动失败', error: error.message })
  }
})

// 用户取消报名
app.post('/api/activities/:id/cancel', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // 检查报名记录
    const [registrationRows] = await pool.query(
      'SELECT id, status FROM user_activities WHERE user_id = ? AND activity_id = ?',
      [userId, id]
    )
    
    if (registrationRows.length === 0) {
      return res.status(404).json({ message: '未找到报名记录' })
    }
    
    if (registrationRows[0].status === 'cancelled') {
      return res.status(400).json({ message: '您已经取消过此活动' })
    }
    
    // 开始事务
    const connection = await pool.getConnection()
    await connection.beginTransaction()
    
    try {
      // 更新报名状态
      await connection.query(
        'UPDATE user_activities SET status = ? WHERE user_id = ? AND activity_id = ?',
        ['cancelled', userId, id]
      )
      
      // 更新活动参与人数
      await connection.query(
        'UPDATE activities SET current_participants = current_participants - 1 WHERE id = ?',
        [id]
      )
      
      await connection.commit()
      
      res.json({
        success: true,
        message: '取消报名成功'
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('取消报名失败:', error)
    res.status(500).json({ message: '取消报名失败', error: error.message })
  }
})

// 获取用户报名的活动列表
app.get('/api/user/activities', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'ua.user_id = ?'
    let params = [userId]
    
    if (status) {
      whereClause += ' AND ua.status = ?'
      params.push(status)
    }
    
    const [rows] = await pool.query(`
      SELECT 
        ua.id as registration_id,
        ua.status as registration_status,
        ua.registration_time,
        ua.notes,
        a.id as activity_id,
        a.title,
        a.description,
        a.location,
        a.start_time,
        a.end_time,
        a.cover
      FROM user_activities ua
      JOIN activities a ON ua.activity_id = a.id
      WHERE ${whereClause}
      ORDER BY ua.registration_time DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)])
    
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM user_activities ua
      JOIN activities a ON ua.activity_id = a.id
      WHERE ${whereClause}
    `, params)
    
    res.json({
      success: true,
      data: {
        activities: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取用户活动列表失败:', error)
    res.status(500).json({ message: '获取用户活动列表失败', error: error.message })
  }
})

// 管理接口：更新活动时间为未来时间
app.post('/api/admin/update-activity-times', async (req, res) => {
  try {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const dayAfterTomorrow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    
    // 更新活动1：明天
    await pool.query(
      'UPDATE activities SET start_time = ?, end_time = ? WHERE id = 1',
      [
        new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0, 0),
        new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0, 0)
      ]
    )
    
    // 更新活动2：后天
    await pool.query(
      'UPDATE activities SET start_time = ?, end_time = ? WHERE id = 2',
      [
        new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 19, 0, 0),
        new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 21, 0, 0)
      ]
    )
    
    // 更新活动3：3天后
    await pool.query(
      'UPDATE activities SET start_time = ?, end_time = ? WHERE id = 3',
      [
        new Date(threeDaysLater.getFullYear(), threeDaysLater.getMonth(), threeDaysLater.getDate(), 9, 0, 0),
        new Date(threeDaysLater.getFullYear(), threeDaysLater.getMonth(), threeDaysLater.getDate(), 17, 0, 0)
      ]
    )
    
    res.json({
      success: true,
      message: '活动时间已更新为未来时间'
    })
  } catch (error) {
    console.error('更新活动时间失败:', error)
    res.status(500).json({ message: '更新活动时间失败', error: error.message })
  }
})

app.get('/api/announcements', async (req, res) => {
  try {
    // 优先从数据库读取；若库表不存在则回退到 mock
    const [rows] = await pool.query('SELECT id, title, content, status, visible, created_at FROM announcements ORDER BY id DESC LIMIT 200')
    if (rows && rows.length) {
      const role = req.query.role || 'user'
      let list = rows
      if (role === 'user') list = list.filter(item => item.status === 'published' || item.visible === 1)
      return res.json(list)
    }
  } catch (e) {
    // fallback to mock
  }
  try {
    const data = readJson(path.join('mock', 'announcements.json'))
    const role = req.query.role || 'user'
    let list = Array.isArray(data) ? data : []
    if (role === 'user') list = list.filter(item => item.status === 'published' || item.visible === true)
    res.json(list)
  } catch (e) {
    res.status(500).json({ message: 'Failed to load announcements', error: String(e) })
  }
})

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})


