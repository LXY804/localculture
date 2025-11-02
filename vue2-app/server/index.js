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

// 访问日志记录中间件（记录访问量）- 放在静态文件服务之后，路由之前
app.use((req, res, next) => {
  // 只记录GET请求，避免记录API调用和静态资源
  if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/uploads/') && !req.path.startsWith('/assets/')) {
    // 异步记录，不阻塞请求
    setImmediate(async () => {
      try {
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown'
        const userAgent = req.headers['user-agent'] || 'unknown'
        // 尝试从token中获取用户ID（如果已登录）
        let userId = null
        try {
          if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            const jwt = require('jsonwebtoken')
            const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
            const decoded = jwt.verify(token, JWT_SECRET)
            userId = decoded.userId
          }
        } catch (e) {
          // 忽略token错误
        }
        const sessionId = req.sessionID || req.headers['x-session-id'] || null
        
        await pool.query(`
          INSERT INTO visit_logs (user_id, ip_address, user_agent, page_path, referer, session_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          userId,
          ipAddress,
          userAgent,
          req.path,
          req.headers.referer || null,
          sessionId
        ])
      } catch (error) {
        // 忽略访问日志记录错误，不影响正常请求
        if (error.code !== 'ER_NO_SUCH_TABLE') {
          console.warn('记录访问日志失败（表可能不存在）:', error.message)
        }
      }
    })
  }
  next()
})

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
      // 为每篇文章获取标签
      const articlesWithTags = await Promise.all(rows.map(async (article) => {
        const [tags] = await pool.query(`
          SELECT t.id, t.name, t.color
          FROM article_tags at
          JOIN tags t ON at.tag_id = t.id
          WHERE at.article_id = ?
        `, [article.id])
        
        return {
          ...article,
          tags: tags.map(t => t.name) // 保持兼容性，返回标签名数组
        }
      }))
      
      const role = req.query.role || 'user'
      let list = articlesWithTags
      if (role === 'user') {
        list = list.filter(item => item.status === 'published' && item.visible === 1)
      }
      return res.json(list)
    }
    
    res.json([])
  } catch (error) {
    console.error('获取文章列表失败:', error)
    res.status(500).json({ message: 'Failed to load articles', error: String(error) })
  }
})

// 获取文章详情（包含浏览量+1）
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // 先增加浏览量
    await pool.query('UPDATE articles SET views = views + 1 WHERE id = ?', [id])
    
    // 获取文章详情
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
        a.updated_at,
        a.author_id,
        u.username as author_name,
        u.nickname as author_nickname
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `, [id])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '文章不存在' })
    }
    
    const article = rows[0]
    
    // 获取文章的标签
    const [tags] = await pool.query(`
      SELECT t.id, t.name, t.color
      FROM article_tags at
      JOIN tags t ON at.tag_id = t.id
      WHERE at.article_id = ?
    `, [id])
    
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
        author: article.author_name || article.author_nickname || '未知',
        tags: tags.map(t => t.name), // 保持兼容性
        comments_count: commentCount[0].count || 0,
        user_liked: userLiked,
        user_favorited: userFavorited,
        publishTime: article.created_at,
        createTime: article.created_at,
        updateTime: article.updated_at
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
    const { title, content, category, status = 'published', visible = 1, cover, tags = [] } = req.body
    const userId = req.user.id
    
    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' })
    }
    
    // 开始事务
    const connection = await pool.getConnection()
    await connection.beginTransaction()
    
    try {
      // 1. 创建文章
      const [result] = await connection.query(
        'INSERT INTO articles (title, content, category, status, visible, cover, views, likes, author_id) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)',
        [title, content, category, status, visible, cover, userId]
      )
      
      const articleId = result.insertId
      
      // 2. 处理标签关联（如果提供了标签）
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          if (tagName && typeof tagName === 'string') {
            // 查找或创建标签
            let [tagRows] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName])
            let tagId
            
            if (tagRows.length === 0) {
              // 标签不存在，创建它
              const [tagResult] = await connection.query(
                'INSERT INTO tags (name, slug, description, color) VALUES (?, ?, ?, ?)',
                [tagName, tagName.toLowerCase().replace(/\s+/g, '-'), `${tagName}相关`, '#409EFF']
              )
              tagId = tagResult.insertId
            } else {
              tagId = tagRows[0].id
            }
            
            // 创建文章-标签关联
            await connection.query(
              'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE article_id=article_id',
              [articleId, tagId]
            )
            
            // 更新标签统计
            await connection.query('UPDATE tags SET article_count = article_count + 1 WHERE id = ?', [tagId])
          }
        }
      }
      
      // 3. 更新分类统计（如果category指向categories表）
      if (category) {
        await connection.query(
          'UPDATE categories SET article_count = article_count + 1 WHERE name = ?',
          [category]
        )
      }
      
      await connection.commit()
      
      // 获取创建的文章（包含标签）
      const [articleRows] = await pool.query(`
        SELECT a.*, u.username as author_name
        FROM articles a
        LEFT JOIN users u ON a.author_id = u.id
        WHERE a.id = ?
      `, [articleId])
      
      const [articleTags] = await pool.query(`
        SELECT t.name
        FROM article_tags at
        JOIN tags t ON at.tag_id = t.id
        WHERE at.article_id = ?
      `, [articleId])
      
      res.json({
        success: true,
        message: '文章创建成功',
        id: articleId,
        data: {
          ...articleRows[0],
          tags: articleTags.map(t => t.name)
        }
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('创建文章失败:', error)
    res.status(500).json({ message: '创建文章失败', error: error.message })
  }
})

app.put('/api/articles/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, category, status, visible, cover, tags } = req.body
    
    // 检查文章是否存在
    const [existing] = await pool.query('SELECT id, category as old_category FROM articles WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: '文章不存在' })
    }
    
    // 检查权限：只有文章作者或管理员可以修改
    const article = existing[0]
    if (req.user.role !== 'admin') {
      const [authorCheck] = await pool.query('SELECT author_id FROM articles WHERE id = ?', [id])
      if (authorCheck.length > 0 && authorCheck[0].author_id !== req.user.id) {
        return res.status(403).json({ message: '没有权限修改此文章' })
      }
    }
    
    const oldCategory = existing[0].old_category
    const connection = await pool.getConnection()
    await connection.beginTransaction()
    
    try {
      // 1. 更新文章基本信息
      const updates = []
      const values = []
      
      if (title !== undefined) { updates.push('title = ?'); values.push(title) }
      if (content !== undefined) { updates.push('content = ?'); values.push(content) }
      if (category !== undefined) { updates.push('category = ?'); values.push(category) }
      if (status !== undefined) { updates.push('status = ?'); values.push(status) }
      if (visible !== undefined) { updates.push('visible = ?'); values.push(visible) }
      if (cover !== undefined) { updates.push('cover = ?'); values.push(cover) }
      
      if (updates.length > 0) {
        updates.push('updated_at = NOW()')
        values.push(id)
        await connection.query(`UPDATE articles SET ${updates.join(', ')} WHERE id = ?`, values)
      }
      
      // 2. 处理标签更新（如果提供了tags）
      if (tags !== undefined && Array.isArray(tags)) {
        // 获取旧的标签关联
        const [oldTags] = await connection.query(`
          SELECT tag_id FROM article_tags WHERE article_id = ?
        `, [id])
        
        // 更新旧标签的统计（减少计数）
        for (const oldTag of oldTags) {
          await connection.query('UPDATE tags SET article_count = GREATEST(article_count - 1, 0) WHERE id = ?', [oldTag.tag_id])
        }
        
        // 删除旧的标签关联
        await connection.query('DELETE FROM article_tags WHERE article_id = ?', [id])
        
        // 创建新的标签关联
        for (const tagName of tags) {
          if (tagName && typeof tagName === 'string') {
            // 查找或创建标签
            let [tagRows] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName])
            let tagId
            
            if (tagRows.length === 0) {
              const [tagResult] = await connection.query(
                'INSERT INTO tags (name, slug, description, color) VALUES (?, ?, ?, ?)',
                [tagName, tagName.toLowerCase().replace(/\s+/g, '-'), `${tagName}相关`, '#409EFF']
              )
              tagId = tagResult.insertId
            } else {
              tagId = tagRows[0].id
            }
            
            // 创建关联
            await connection.query(
              'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)',
              [id, tagId]
            )
            
            // 更新标签统计
            await connection.query('UPDATE tags SET article_count = article_count + 1 WHERE id = ?', [tagId])
          }
        }
      }
      
      // 3. 更新分类统计（如果分类改变了）
      if (category !== undefined && category !== oldCategory) {
        if (oldCategory) {
          await connection.query(
            'UPDATE categories SET article_count = GREATEST(article_count - 1, 0) WHERE name = ?',
            [oldCategory]
          )
        }
        if (category) {
          await connection.query(
            'UPDATE categories SET article_count = article_count + 1 WHERE name = ?',
            [category]
          )
        }
      }
      
      await connection.commit()
      
      res.json({ success: true, message: '文章更新成功' })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
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
    
    // 先检查文章是否存在并获取作者信息和分类信息
    const [articles] = await pool.query('SELECT author_id, category FROM articles WHERE id = ?', [id])
    
    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: '文章不存在' })
    }
    
    const article = articles[0]
    
    // 检查权限：只有文章作者或管理员可以删除
    if (article.author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: '您没有权限删除此文章' })
    }
    
    // 开始事务
    const connection = await pool.getConnection()
    await connection.beginTransaction()
    
    try {
      // 1. 获取文章的标签关联
      const [oldTags] = await connection.query(`
        SELECT tag_id FROM article_tags WHERE article_id = ?
      `, [id])
      
      // 2. 更新标签统计（减少计数）
      for (const oldTag of oldTags) {
        await connection.query('UPDATE tags SET article_count = GREATEST(article_count - 1, 0) WHERE id = ?', [oldTag.tag_id])
      }
      
      // 3. 删除标签关联（级联删除会自动处理，但为了清晰，我们显式删除）
      await connection.query('DELETE FROM article_tags WHERE article_id = ?', [id])
      
      // 4. 更新分类统计（如果文章有分类）
      if (article.category) {
        await connection.query(
          'UPDATE categories SET article_count = GREATEST(article_count - 1, 0) WHERE name = ?',
          [article.category]
        )
      }
      
      // 5. 删除文章
      const [result] = await connection.query('DELETE FROM articles WHERE id = ?', [id])
      
      if (result.affectedRows === 0) {
        await connection.rollback()
        return res.status(404).json({ success: false, message: '文章删除失败' })
      }
      
      await connection.commit()
      res.json({ success: true, message: '文章删除成功' })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
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
        a.title as article_title,
        a.category,
        a.cover
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
      'INSERT INTO forum_posts (author_id, title, content, category, status, visible) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, content, category || '未分类', 'published', 1]
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

// ==================== 论坛帖子API ====================

// 获取论坛帖子列表
app.get('/api/forum/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 100
    const offset = (page - 1) * limit
    
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.category,
        p.author_id,
        p.views,
        p.likes,
        p.favorites_count,
        p.comments_count,
        p.created_at,
        p.updated_at,
        u.username as author_username,
        u.nickname as author_nickname
      FROM forum_posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.status = 'published' AND p.visible = 1
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset])
    
    // 添加作者名称
    const posts = rows.map(post => ({
      ...post,
      author: post.author_nickname || post.author_username || '匿名'
    }))
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM forum_posts WHERE status = "published" AND visible = 1'
    )
    
    res.json({
      success: true,
      data: {
        posts: posts,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取论坛帖子列表失败:', error)
    res.status(500).json({ success: false, message: '获取帖子列表失败', error: error.message })
  }
})

// 论坛帖子点赞/取消点赞
app.post('/api/forum/posts/:id/like', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // 检查帖子是否存在
    const [postRows] = await pool.query('SELECT id FROM forum_posts WHERE id = ?', [id])
    if (postRows.length === 0) {
      return res.status(404).json({ success: false, message: '帖子不存在' })
    }
    
    // 检查是否已点赞
    const [existingLike] = await pool.query(
      'SELECT id FROM forum_post_likes WHERE post_id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (existingLike.length > 0) {
      // 取消点赞
      await pool.query('DELETE FROM forum_post_likes WHERE post_id = ? AND user_id = ?', [id, userId])
      await pool.query('UPDATE forum_posts SET likes = likes - 1 WHERE id = ?', [id])
      
      res.json({ 
        success: true, 
        message: '取消点赞成功',
        liked: false
      })
    } else {
      // 添加点赞
      await pool.query('INSERT INTO forum_post_likes (post_id, user_id) VALUES (?, ?)', [id, userId])
      await pool.query('UPDATE forum_posts SET likes = likes + 1 WHERE id = ?', [id])
      
      res.json({ 
        success: true, 
        message: '点赞成功',
        liked: true
      })
    }
  } catch (error) {
    console.error('论坛帖子点赞操作失败:', error)
    res.status(500).json({ success: false, message: '点赞操作失败', error: error.message })
  }
})

// 论坛帖子收藏/取消收藏
app.post('/api/forum/posts/:id/favorite', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // 检查帖子是否存在
    const [postRows] = await pool.query('SELECT id FROM forum_posts WHERE id = ?', [id])
    if (postRows.length === 0) {
      return res.status(404).json({ success: false, message: '帖子不存在' })
    }
    
    // 检查是否已收藏
    const [existingFavorite] = await pool.query(
      'SELECT id FROM forum_post_favorites WHERE post_id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (existingFavorite.length > 0) {
      // 取消收藏
      await pool.query('DELETE FROM forum_post_favorites WHERE post_id = ? AND user_id = ?', [id, userId])
      await pool.query('UPDATE forum_posts SET favorites_count = favorites_count - 1 WHERE id = ?', [id])
      
      res.json({ 
        success: true, 
        message: '取消收藏成功',
        favorited: false
      })
    } else {
      // 添加收藏
      await pool.query('INSERT INTO forum_post_favorites (post_id, user_id) VALUES (?, ?)', [id, userId])
      await pool.query('UPDATE forum_posts SET favorites_count = favorites_count + 1 WHERE id = ?', [id])
      
      res.json({ 
        success: true, 
        message: '收藏成功',
        favorited: true
      })
    }
  } catch (error) {
    console.error('论坛帖子收藏操作失败:', error)
    res.status(500).json({ success: false, message: '收藏操作失败', error: error.message })
  }
})

// 获取论坛帖子详情
app.get('/api/forum/posts/:id', async (req, res) => {
  try {
    const { id } = req.params
    const token = req.headers.authorization
    let userId = null
    
    // 如果用户已登录，获取用户ID
    if (token) {
      try {
        const jwt = require('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET)
        userId = decoded.userId
      } catch (error) {
        // Token无效，继续作为未登录用户
      }
    }
    
    // 获取帖子信息
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.category,
        p.author_id,
        p.views,
        p.likes,
        p.favorites_count,
        p.comments_count,
        p.created_at,
        p.updated_at,
        u.username as author_username,
        u.nickname as author_nickname
      FROM forum_posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ? AND p.status = 'published'
    `, [id])
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '帖子不存在' })
    }
    
    const post = rows[0]
    
    // 增加浏览量
    await pool.query('UPDATE forum_posts SET views = views + 1 WHERE id = ?', [id])
    post.views += 1
    
    // 如果用户已登录，检查是否已点赞和收藏
    let userLiked = false
    let userFavorited = false
    
    if (userId) {
      const [likeRows] = await pool.query(
        'SELECT id FROM forum_post_likes WHERE post_id = ? AND user_id = ?',
        [id, userId]
      )
      userLiked = likeRows.length > 0
      
      const [favoriteRows] = await pool.query(
        'SELECT id FROM forum_post_favorites WHERE post_id = ? AND user_id = ?',
        [id, userId]
      )
      userFavorited = favoriteRows.length > 0
    }
    
    res.json({
      success: true,
      data: {
        ...post,
        author: post.author_nickname || post.author_username || '匿名',
        user_liked: userLiked,
        user_favorited: userFavorited
      }
    })
  } catch (error) {
    console.error('获取论坛帖子详情失败:', error)
    res.status(500).json({ success: false, message: '获取帖子详情失败', error: error.message })
  }
})

// 获取论坛帖子评论列表
app.get('/api/forum/posts/:id/comments', async (req, res) => {
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
        c.likes,
        c.created_at,
        u.id as user_id,
        u.username,
        u.nickname,
        u.avatar
      FROM forum_post_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? AND c.status = 'active'
      ORDER BY c.created_at ASC
      LIMIT ? OFFSET ?
    `, [id, limit, offset])
    
    // 获取总评论数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM forum_post_comments WHERE post_id = ? AND status = "active"',
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
    console.error('获取论坛评论失败:', error)
    res.status(500).json({ success: false, message: '获取评论失败', error: error.message })
  }
})

// 添加论坛帖子评论
app.post('/api/forum/posts/:id/comments', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { content, parent_id } = req.body
    const userId = req.user.id
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: '评论内容不能为空' })
    }
    
    // 检查帖子是否存在
    const [postRows] = await pool.query('SELECT id FROM forum_posts WHERE id = ?', [id])
    if (postRows.length === 0) {
      return res.status(404).json({ success: false, message: '帖子不存在' })
    }
    
    // 如果有parent_id，检查父评论是否存在
    if (parent_id) {
      const [parentRows] = await pool.query(
        'SELECT id FROM forum_post_comments WHERE id = ? AND post_id = ? AND status = "active"',
        [parent_id, id]
      )
      if (parentRows.length === 0) {
        return res.status(400).json({ success: false, message: '父评论不存在' })
      }
    }
    
    // 插入评论
    const [result] = await pool.query(
      'INSERT INTO forum_post_comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [id, userId, content.trim(), parent_id || null]
    )
    
    // 更新帖子评论数
    await pool.query('UPDATE forum_posts SET comments_count = comments_count + 1 WHERE id = ?', [id])
    
    // 获取新插入的评论信息
    const [newComment] = await pool.query(`
      SELECT 
        c.id,
        c.content,
        c.parent_id,
        c.likes,
        c.created_at,
        u.id as user_id,
        u.username,
        u.nickname,
        u.avatar
      FROM forum_post_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId])
    
    res.status(201).json({
      success: true,
      message: '评论发表成功',
      data: newComment[0]
    })
  } catch (error) {
    console.error('发表论坛评论失败:', error)
    res.status(500).json({ success: false, message: '发表评论失败', error: error.message })
  }
})

// 获取用户论坛点赞列表
app.get('/api/user/forum/likes', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.category,
        p.cover,
        p.views,
        p.likes,
        p.created_at,
        fl.created_at as liked_at
      FROM forum_post_likes fl
      LEFT JOIN forum_posts p ON fl.post_id = p.id
      WHERE fl.user_id = ?
      ORDER BY fl.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset])
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM forum_post_likes WHERE user_id = ?',
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
    console.error('获取用户论坛点赞失败:', error)
    res.status(500).json({ success: false, message: '获取点赞列表失败', error: error.message })
  }
})

// 获取用户论坛收藏列表
app.get('/api/user/forum/favorites', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.category,
        p.cover,
        p.views,
        p.likes,
        p.created_at,
        ff.created_at as favorited_at
      FROM forum_post_favorites ff
      LEFT JOIN forum_posts p ON ff.post_id = p.id
      WHERE ff.user_id = ?
      ORDER BY ff.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset])
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM forum_post_favorites WHERE user_id = ?',
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
    console.error('获取用户论坛收藏失败:', error)
    res.status(500).json({ success: false, message: '获取收藏列表失败', error: error.message })
  }
})

// 获取用户论坛评论列表
app.get('/api/user/forum/comments', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    
    const [rows] = await pool.query(`
      SELECT 
        fc.id,
        fc.content,
        fc.created_at,
        p.id as post_id,
        p.title as post_title,
        p.category
      FROM forum_post_comments fc
      LEFT JOIN forum_posts p ON fc.post_id = p.id
      WHERE fc.user_id = ? AND fc.status = ?
      ORDER BY fc.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, 'active', limit, offset])
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM forum_post_comments WHERE user_id = ? AND status = ?',
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
    console.error('获取用户论坛评论失败:', error)
    res.status(500).json({ success: false, message: '获取评论列表失败', error: error.message })
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

// 获取公告列表
app.get('/api/announcements', async (req, res) => {
  try {
    const role = req.query.role || 'user'
    let query = `
      SELECT 
        a.id, 
        a.title, 
        a.content, 
        a.status, 
        a.visible, 
        a.priority,
        a.summary,
        a.author_id,
        a.created_at,
        a.updated_at,
        u.username as author,
        u.nickname as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      ORDER BY a.priority DESC, a.id DESC
      LIMIT 200
    `
    
    const [rows] = await pool.query(query)
    
    if (rows && rows.length) {
      let list = rows.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        status: row.status,
        visible: row.visible === 1,
        priority: row.priority || 0,
        summary: row.summary,
        author: row.author || row.author_name || '管理员',
        author_id: row.author_id,
        category: row.summary ? '系统公告' : '其他', // 可以根据需要扩展分类字段
        publishTime: row.created_at,
        createTime: row.created_at,
        updateTime: row.updated_at,
        views: 0, // 如果需要浏览量，可以添加views字段到表
        tags: []
      }))
      
      // 如果是普通用户，只返回已发布且可见的公告
      if (role === 'user') {
        list = list.filter(item => item.status === 'published' && item.visible === true)
      }
      
      return res.json(list)
    }
    
    // 如果没有数据，返回空数组而不是fallback到mock
    res.json([])
  } catch (e) {
    console.error('获取公告列表失败:', e)
    res.status(500).json({ message: 'Failed to load announcements', error: String(e) })
  }
})

// 获取公告详情
app.get('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query(`
      SELECT 
        a.id, 
        a.title, 
        a.content, 
        a.status, 
        a.visible, 
        a.priority,
        a.summary,
        a.author_id,
        a.created_at,
        a.updated_at,
        u.username as author,
        u.nickname as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `, [id])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '公告不存在' })
    }
    
    const row = rows[0]
    const announcement = {
      id: row.id,
      title: row.title,
      content: row.content,
      status: row.status,
      visible: row.visible === 1,
      priority: row.priority || 0,
      summary: row.summary,
      author: row.author || row.author_name || '管理员',
      author_id: row.author_id,
      category: row.summary ? '系统公告' : '其他',
      publishTime: row.created_at,
      createTime: row.created_at,
      updateTime: row.updated_at,
      views: 0,
      tags: []
    }
    
    res.json(announcement)
  } catch (error) {
    console.error('获取公告详情失败:', error)
    res.status(500).json({ message: '获取公告详情失败', error: error.message })
  }
})

// 创建公告（需要认证）
app.post('/api/announcements', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { title, content, status = 'draft', visible = true, priority = 0, summary, category } = req.body
    const author_id = req.user.id
    
    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' })
    }
    
    const [result] = await pool.query(`
      INSERT INTO announcements (title, content, status, visible, priority, summary, author_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, content, status, visible ? 1 : 0, priority, summary || null, author_id])
    
    // 获取创建的公告
    const [rows] = await pool.query(`
      SELECT 
        a.id, 
        a.title, 
        a.content, 
        a.status, 
        a.visible, 
        a.priority,
        a.summary,
        a.author_id,
        a.created_at,
        a.updated_at,
        u.username as author,
        u.nickname as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `, [result.insertId])
    
    const row = rows[0]
    const announcement = {
      id: row.id,
      title: row.title,
      content: row.content,
      status: row.status,
      visible: row.visible === 1,
      priority: row.priority || 0,
      summary: row.summary,
      author: row.author || row.author_name || '管理员',
      author_id: row.author_id,
      category: category || (row.summary ? '系统公告' : '其他'),
      publishTime: row.created_at,
      createTime: row.created_at,
      updateTime: row.updated_at,
      views: 0,
      tags: []
    }
    
    res.status(201).json(announcement)
  } catch (error) {
    console.error('创建公告失败:', error)
    res.status(500).json({ message: '创建公告失败', error: error.message })
  }
})

// 更新公告（需要认证）
app.put('/api/announcements/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, status, visible, priority, summary, category } = req.body
    
    // 检查公告是否存在
    const [existing] = await pool.query('SELECT id, author_id FROM announcements WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: '公告不存在' })
    }
    
    // 检查权限：只有作者或管理员可以修改
    if (existing[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限修改此公告' })
    }
    
    // 构建更新字段
    const updates = []
    const values = []
    
    if (title !== undefined) {
      updates.push('title = ?')
      values.push(title)
    }
    if (content !== undefined) {
      updates.push('content = ?')
      values.push(content)
    }
    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
    }
    if (visible !== undefined) {
      updates.push('visible = ?')
      values.push(visible ? 1 : 0)
    }
    if (priority !== undefined) {
      updates.push('priority = ?')
      values.push(priority)
    }
    if (summary !== undefined) {
      updates.push('summary = ?')
      values.push(summary)
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: '没有要更新的字段' })
    }
    
    values.push(id)
    const query = `UPDATE announcements SET ${updates.join(', ')} WHERE id = ?`
    await pool.query(query, values)
    
    // 获取更新后的公告
    const [rows] = await pool.query(`
      SELECT 
        a.id, 
        a.title, 
        a.content, 
        a.status, 
        a.visible, 
        a.priority,
        a.summary,
        a.author_id,
        a.created_at,
        a.updated_at,
        u.username as author,
        u.nickname as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `, [id])
    
    const row = rows[0]
    const announcement = {
      id: row.id,
      title: row.title,
      content: row.content,
      status: row.status,
      visible: row.visible === 1,
      priority: row.priority || 0,
      summary: row.summary,
      author: row.author || row.author_name || '管理员',
      author_id: row.author_id,
      category: category || (row.summary ? '系统公告' : '其他'),
      publishTime: row.created_at,
      createTime: row.created_at,
      updateTime: row.updated_at,
      views: 0,
      tags: []
    }
    
    res.json(announcement)
  } catch (error) {
    console.error('更新公告失败:', error)
    res.status(500).json({ message: '更新公告失败', error: error.message })
  }
})

// 删除公告（需要认证）
app.delete('/api/announcements/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    
    // 检查公告是否存在
    const [existing] = await pool.query('SELECT id, author_id FROM announcements WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: '公告不存在' })
    }
    
    // 检查权限：只有作者或管理员可以删除
    if (existing[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限删除此公告' })
    }
    
    await pool.query('DELETE FROM announcements WHERE id = ?', [id])
    
    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除公告失败:', error)
    res.status(500).json({ message: '删除公告失败', error: error.message })
  }
})

// ============================================
// 用户管理API（需要管理员权限）
// ============================================

// 获取用户列表（需要管理员权限）
app.get('/api/users', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { page = 1, pageSize = 20, role, status, search } = req.query
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    
    // 构建查询条件
    let query = 'SELECT id, username, nickname, email, phone, role, status, avatar, created_at, updated_at FROM users WHERE 1=1'
    const params = []
    
    if (role) {
      query += ' AND role = ?'
      params.push(role)
    }
    
    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }
    
    if (search) {
      query += ' AND (username LIKE ? OR nickname LIKE ? OR email LIKE ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), offset)
    
    const [rows] = await pool.query(query, params)
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1'
    const countParams = []
    
    if (role) {
      countQuery += ' AND role = ?'
      countParams.push(role)
    }
    
    if (status) {
      countQuery += ' AND status = ?'
      countParams.push(status)
    }
    
    if (search) {
      countQuery += ' AND (username LIKE ? OR nickname LIKE ? OR email LIKE ?)'
      const searchPattern = `%${search}%`
      countParams.push(searchPattern, searchPattern, searchPattern)
    }
    
    const [countResult] = await pool.query(countQuery, countParams)
    const total = countResult[0].total
    
    // 获取用户统计数据
    const usersWithStats = await Promise.all(rows.map(async (user) => {
      // 获取用户文章数
      const [articlesCount] = await pool.query(
        'SELECT COUNT(*) as count FROM articles WHERE author_id = ?',
        [user.id]
      )
      
      // 获取用户评论数
      const [commentsCount] = await pool.query(
        'SELECT COUNT(*) as count FROM article_comments WHERE user_id = ?',
        [user.id]
      )
      
      // 获取最后登录时间（如果需要，可以从登录日志表获取）
      
      return {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        createTime: user.created_at,
        lastLoginTime: user.updated_at, // 暂时使用updated_at，可以后续添加last_login_time字段
        loginCount: 0, // 可以后续添加login_count字段
        stats: {
          articles: articlesCount[0].count,
          comments: commentsCount[0].count
        }
      }
    }))
    
    res.json({
      data: usersWithStats,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({ message: '获取用户列表失败', error: error.message })
  }
})

// 获取用户详情（需要管理员权限）
app.get('/api/users/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { id } = req.params
    const [rows] = await pool.query(
      'SELECT id, username, nickname, email, phone, role, status, avatar, created_at, updated_at FROM users WHERE id = ?',
      [id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    const user = rows[0]
    
    // 获取用户统计数据
    const [articlesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM articles WHERE author_id = ?',
      [user.id]
    )
    
    const [commentsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM article_comments WHERE user_id = ?',
      [user.id]
    )
    
    const [likesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM article_likes WHERE user_id = ?',
      [user.id]
    )
    
    res.json({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      createTime: user.created_at,
      lastLoginTime: user.updated_at,
      loginCount: 0,
      stats: {
        articles: articlesCount[0].count,
        comments: commentsCount[0].count,
        likes: likesCount[0].count
      }
    })
  } catch (error) {
    console.error('获取用户详情失败:', error)
    res.status(500).json({ message: '获取用户详情失败', error: error.message })
  }
})

// 创建用户（需要管理员权限）
app.post('/api/users', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { username, nickname, email, phone, password, role = 'user', status = 'active' } = req.body
    
    if (!username) {
      return res.status(400).json({ message: '用户名不能为空' })
    }
    
    // 检查用户名是否已存在
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
    if (existing.length > 0) {
      return res.status(400).json({ message: '用户名已存在' })
    }
    
    // 检查邮箱是否已存在（如果提供了邮箱）
    if (email) {
      const [emailExisting] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
      if (emailExisting.length > 0) {
        return res.status(400).json({ message: '邮箱已被使用' })
      }
    }
    
    // 检查手机号是否已存在（如果提供了手机号）
    if (phone) {
      const [phoneExisting] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone])
      if (phoneExisting.length > 0) {
        return res.status(400).json({ message: '手机号已被使用' })
      }
    }
    
    // 插入用户（密码使用明文或需要加密，根据实际情况）
    const [result] = await pool.query(
      'INSERT INTO users (username, nickname, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, nickname || null, email || null, phone || null, password || null, role, status]
    )
    
    // 获取创建的用户
    const [rows] = await pool.query(
      'SELECT id, username, nickname, email, phone, role, status, avatar, created_at, updated_at FROM users WHERE id = ?',
      [result.insertId]
    )
    
    const user = rows[0]
    res.status(201).json({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      createTime: user.created_at,
      lastLoginTime: null,
      loginCount: 0
    })
  } catch (error) {
    console.error('创建用户失败:', error)
    res.status(500).json({ message: '创建用户失败', error: error.message })
  }
})

// 更新用户（需要管理员权限）
app.put('/api/users/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { id } = req.params
    const { username, nickname, email, phone, role, status, password } = req.body
    
    // 检查用户是否存在
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    // 构建更新字段
    const updates = []
    const values = []
    
    if (username !== undefined) {
      // 检查用户名是否已被其他用户使用
      const [usernameCheck] = await pool.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id])
      if (usernameCheck.length > 0) {
        return res.status(400).json({ message: '用户名已被使用' })
      }
      updates.push('username = ?')
      values.push(username)
    }
    
    if (nickname !== undefined) {
      updates.push('nickname = ?')
      values.push(nickname)
    }
    
    if (email !== undefined) {
      // 检查邮箱是否已被其他用户使用
      if (email) {
        const [emailCheck] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id])
        if (emailCheck.length > 0) {
          return res.status(400).json({ message: '邮箱已被使用' })
        }
      }
      updates.push('email = ?')
      values.push(email)
    }
    
    if (phone !== undefined) {
      // 检查手机号是否已被其他用户使用
      if (phone) {
        const [phoneCheck] = await pool.query('SELECT id FROM users WHERE phone = ? AND id != ?', [phone, id])
        if (phoneCheck.length > 0) {
          return res.status(400).json({ message: '手机号已被使用' })
        }
      }
      updates.push('phone = ?')
      values.push(phone)
    }
    
    if (role !== undefined) {
      updates.push('role = ?')
      values.push(role)
    }
    
    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
    }
    
    if (password !== undefined && password) {
      updates.push('password = ?')
      values.push(password) // 实际应该加密密码
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: '没有要更新的字段' })
    }
    
    values.push(id)
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    await pool.query(query, values)
    
    // 获取更新后的用户
    const [rows] = await pool.query(
      'SELECT id, username, nickname, email, phone, role, status, avatar, created_at, updated_at FROM users WHERE id = ?',
      [id]
    )
    
    const user = rows[0]
    res.json({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      createTime: user.created_at,
      lastLoginTime: user.updated_at,
      loginCount: 0
    })
  } catch (error) {
    console.error('更新用户失败:', error)
    res.status(500).json({ message: '更新用户失败', error: error.message })
  }
})

// 删除用户（需要管理员权限）
app.delete('/api/users/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { id } = req.params
    
    // 不能删除自己
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: '不能删除自己的账户' })
    }
    
    // 检查用户是否存在
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    // 删除用户（由于外键约束，相关的关联数据也会被删除）
    await pool.query('DELETE FROM users WHERE id = ?', [id])
    
    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除用户失败:', error)
    res.status(500).json({ message: '删除用户失败', error: error.message })
  }
})

// 获取统计数据（需要管理员权限）
app.get('/api/dashboard/stats', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    // 获取总用户数
    const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users')
    const totalUsers = userCount[0].total
    
    // 获取总文章数（已发布的）
    const [articleCount] = await pool.query('SELECT COUNT(*) as total FROM articles WHERE status = ?', ['published'])
    const totalArticles = articleCount[0].total
    
    // 获取总公告数（已发布的）
    const [announcementCount] = await pool.query('SELECT COUNT(*) as total FROM announcements WHERE status = ?', ['published'])
    const totalAnnouncements = announcementCount[0].total
    
    // 获取今日访问量
    let dailyVisits = 0
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const [visitCount] = await pool.query(`
        SELECT COUNT(DISTINCT session_id, ip_address) as total 
        FROM visit_logs 
        WHERE created_at >= ? AND created_at < ?
      `, [today, tomorrow])
      dailyVisits = visitCount[0].total || 0
    } catch (error) {
      // 如果visit_logs表不存在，使用fallback
      console.warn('访问日志表不存在，使用默认值:', error.message)
    }
    
    res.json({
      totalUsers,
      totalArticles,
      totalAnnouncements,
      dailyVisits
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({ message: '获取统计数据失败', error: error.message })
  }
})

// 获取用户增长趋势（需要管理员权限）
app.get('/api/dashboard/user-growth', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const days = parseInt(req.query.days) || 7
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 获取最近N天的用户增长数据
    const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(?, INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [today, days])
    
    // 填充所有日期（即使没有用户注册）
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayData = rows.find(r => r.date.toISOString().split('T')[0] === dateStr)
      result.push({
        date: dateStr,
        count: dayData ? dayData.count : 0
      })
    }
    
    res.json(result)
  } catch (error) {
    console.error('获取用户增长趋势失败:', error)
    res.status(500).json({ message: '获取用户增长趋势失败', error: error.message })
  }
})

// ============================================
// 分类和标签管理API
// ============================================

// 获取分类列表（从categories表查询）
app.get('/api/categories', async (req, res) => {
  try {
    // 从categories表查询，并通过articles表统计文章数量
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.color,
        c.icon,
        c.sort_order,
        COALESCE(c.article_count, 0) as count
      FROM categories c
      WHERE c.status = 'active' OR c.status IS NULL
      ORDER BY c.sort_order ASC, c.name ASC
    `)
    
    res.json(rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || `${row.name}相关内容`,
      color: row.color || '#409EFF',
      icon: row.icon || 'el-icon-document',
      sort: row.sort_order || 0,
      count: row.count
    })))
  } catch (error) {
    console.error('获取分类列表失败:', error)
    res.status(500).json({ message: '获取分类列表失败', error: error.message })
  }
})

// 获取标签列表（从tags表查询）
app.get('/api/tags', async (req, res) => {
  try {
    // 从tags表查询，实时计算文章数量以确保准确性
    const [rows] = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.description,
        t.color,
        COALESCE(COUNT(at.article_id), 0) as count
      FROM tags t
      LEFT JOIN article_tags at ON t.id = at.tag_id
      GROUP BY t.id, t.name, t.slug, t.description, t.color
      ORDER BY count DESC, t.name ASC
    `)
    
    res.json(rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || `${row.name}相关`,
      color: row.color || '#409EFF',
      count: row.count || 0
    })))
  } catch (error) {
    console.error('获取标签列表失败:', error)
    res.status(500).json({ message: '获取标签列表失败', error: error.message })
  }
})

// ============================================
// 分类管理API（创建、更新、删除）
// ============================================

// 创建分类
app.post('/api/categories', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { name, slug, description, color, icon, sort_order } = req.body
    
    if (!name) {
      return res.status(400).json({ message: '分类名称不能为空' })
    }
    
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, color, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [name, slug || name.toLowerCase().replace(/\s+/g, '-'), description, color || '#409EFF', icon || 'el-icon-document', sort_order || 0]
    )
    
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: '分类名称已存在' })
    }
    console.error('创建分类失败:', error)
    res.status(500).json({ message: '创建分类失败', error: error.message })
  }
})

// 更新分类
app.put('/api/categories/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { id } = req.params
    const { name, slug, description, color, icon, sort_order, status } = req.body
    
    const updates = []
    const values = []
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name) }
    if (slug !== undefined) { updates.push('slug = ?'); values.push(slug) }
    if (description !== undefined) { updates.push('description = ?'); values.push(description) }
    if (color !== undefined) { updates.push('color = ?'); values.push(color) }
    if (icon !== undefined) { updates.push('icon = ?'); values.push(icon) }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order) }
    if (status !== undefined) { updates.push('status = ?'); values.push(status) }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: '没有要更新的字段' })
    }
    
    values.push(id)
    await pool.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values)
    
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id])
    res.json(rows[0])
  } catch (error) {
    console.error('更新分类失败:', error)
    res.status(500).json({ message: '更新分类失败', error: error.message })
  }
})

// 删除分类
app.delete('/api/categories/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { id } = req.params
    
    // 检查是否有文章使用此分类
    const [category] = await pool.query('SELECT name FROM categories WHERE id = ?', [id])
    if (category.length === 0) {
      return res.status(404).json({ message: '分类不存在' })
    }
    
    const [articles] = await pool.query('SELECT COUNT(*) as count FROM articles WHERE category = ?', [category[0].name])
    if (articles[0].count > 0) {
      return res.status(400).json({ message: '该分类下还有文章，无法删除' })
    }
    
    await pool.query('DELETE FROM categories WHERE id = ?', [id])
    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除分类失败:', error)
    res.status(500).json({ message: '删除分类失败', error: error.message })
  }
})

// ============================================
// 标签管理API（创建、更新、删除）
// ============================================

// 创建标签
app.post('/api/tags', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { name, slug, description, color } = req.body
    
    if (!name) {
      return res.status(400).json({ message: '标签名称不能为空' })
    }
    
    const [result] = await pool.query(
      'INSERT INTO tags (name, slug, description, color) VALUES (?, ?, ?, ?)',
      [name, slug || name.toLowerCase().replace(/\s+/g, '-'), description, color || '#409EFF']
    )
    
    const [rows] = await pool.query('SELECT * FROM tags WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: '标签名称已存在' })
    }
    console.error('创建标签失败:', error)
    res.status(500).json({ message: '创建标签失败', error: error.message })
  }
})

// 更新标签
app.put('/api/tags/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { id } = req.params
    const { name, slug, description, color } = req.body
    
    const updates = []
    const values = []
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name) }
    if (slug !== undefined) { updates.push('slug = ?'); values.push(slug) }
    if (description !== undefined) { updates.push('description = ?'); values.push(description) }
    if (color !== undefined) { updates.push('color = ?'); values.push(color) }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: '没有要更新的字段' })
    }
    
    values.push(id)
    await pool.query(`UPDATE tags SET ${updates.join(', ')} WHERE id = ?`, values)
    
    const [rows] = await pool.query('SELECT * FROM tags WHERE id = ?', [id])
    res.json(rows[0])
  } catch (error) {
    console.error('更新标签失败:', error)
    res.status(500).json({ message: '更新标签失败', error: error.message })
  }
})

// 删除标签
app.delete('/api/tags/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { id } = req.params
    
    // 关联表会自动级联删除，但我们需要更新统计
    await pool.query('DELETE FROM tags WHERE id = ?', [id])
    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除标签失败:', error)
    res.status(500).json({ message: '删除标签失败', error: error.message })
  }
})

// 更新用户状态（需要管理员权限）
app.patch('/api/users/:id/status', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    
    const { id } = req.params
    const { status } = req.body
    
    if (!status || !['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({ message: '无效的状态值' })
    }
    
    // 不能修改自己的状态
    if (parseInt(id) === req.user.id && status !== 'active') {
      return res.status(400).json({ message: '不能禁用或封禁自己的账户' })
    }
    
    // 检查用户是否存在
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id])
    
    res.json({ message: '状态更新成功' })
  } catch (error) {
    console.error('更新用户状态失败:', error)
    res.status(500).json({ message: '更新用户状态失败', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})


