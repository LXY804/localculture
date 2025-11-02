// =============================================
// 如果使用了独立的分类表和标签表，需要修改的API代码
// 将这些代码替换到 server/index.js 中的对应位置
// =============================================

// ============================================
// 1. 修改获取分类列表API
// ============================================
// 替换原来的 app.get('/api/categories', ...)

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
      WHERE c.status = 'active'
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

// ============================================
// 2. 修改获取标签列表API
// ============================================
// 替换原来的 app.get('/api/tags', ...)

app.get('/api/tags', async (req, res) => {
  try {
    // 从tags表查询，统计数量已由article_count字段提供
    const [rows] = await pool.query(`
      SELECT 
        id,
        name,
        slug,
        description,
        color,
        article_count as count
      FROM tags
      ORDER BY article_count DESC, name ASC
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
// 3. 修改获取文章列表API（包含标签）
// ============================================
// 替换原来的 app.get('/api/articles', ...)

app.get('/api/articles', async (req, res) => {
  try {
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

// ============================================
// 4. 修改获取文章详情API（包含标签）
// ============================================
// 替换原来的 app.get('/api/articles/:id', ...)

app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // 先增加浏览量
    await pool.query('UPDATE articles SET views = views + 1 WHERE id = ?', [id])
    
    // 获取文章详情
    const [rows] = await pool.query(`
      SELECT 
        a.*,
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
    
    // 获取评论数（如果需要）
    const [commentsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM article_comments WHERE article_id = ? AND status = ?',
      [id, 'active']
    )
    
    res.json({
      id: article.id,
      title: article.title,
      content: article.content,
      summary: article.summary,
      category: article.category,
      status: article.status,
      visible: article.visible === 1,
      cover: article.cover,
      views: article.views,
      likes: article.likes,
      author: article.author_name || article.author_nickname || '未知',
      author_id: article.author_id,
      tags: tags.map(t => t.name), // 保持兼容性
      publishTime: article.created_at,
      createTime: article.created_at,
      updateTime: article.updated_at,
      comments_count: commentsCount[0].count || 0
    })
  } catch (error) {
    console.error('获取文章详情失败:', error)
    res.status(500).json({ message: '获取文章详情失败', error: error.message })
  }
})

// ============================================
// 5. 修改创建文章API（支持标签关联）
// ============================================
// 替换原来的 app.post('/api/articles', ...)

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
              
              // 更新标签统计
              await connection.query('UPDATE tags SET article_count = article_count + 1 WHERE id = ?', [tagId])
            } else {
              tagId = tagRows[0].id
            }
            
            // 创建文章-标签关联
            await connection.query(
              'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE article_id=article_id',
              [articleId, tagId]
            )
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

// ============================================
// 6. 修改更新文章API（支持标签关联）
// ============================================
// 替换原来的 app.put('/api/articles/:id', ...)

app.put('/api/articles/:id', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, category, status, visible, cover, tags } = req.body
    
    // 检查文章是否存在
    const [existing] = await pool.query('SELECT id, category as old_category FROM articles WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: '文章不存在' })
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
        // 删除旧的标签关联
        await connection.query('DELETE FROM article_tags WHERE article_id = ?', [id])
        
        // 更新旧标签的统计（减少计数）
        const [oldTags] = await connection.query(`
          SELECT tag_id FROM article_tags WHERE article_id = ?
        `, [id])
        for (const oldTag of oldTags) {
          await connection.query('UPDATE tags SET article_count = GREATEST(article_count - 1, 0) WHERE id = ?', [oldTag.tag_id])
        }
        
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

// ============================================
// 7. 分类管理API（可选，如果需要）
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
    const [articles] = await pool.query('SELECT COUNT(*) as count FROM articles WHERE category = (SELECT name FROM categories WHERE id = ?)', [id])
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
// 8. 标签管理API（可选，如果需要）
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

