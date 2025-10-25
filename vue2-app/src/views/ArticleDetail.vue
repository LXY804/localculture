<template>
  <div class="page">
    <!-- 返回按钮 -->
    <div class="back-section">
      <router-link class="back-btn" :to="{ name: 'articles' }">
        <span class="back-icon">←</span>
        返回文章列表
      </router-link>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载文章...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button @click="fetchArticleDetail" class="btn">重试</button>
    </div>
    
    <!-- 文章内容 -->
    <template v-else-if="article">
      <div class="article-container">
        <!-- 文章头部 -->
        <header class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          
          <!-- 文章元信息 -->
          <div class="article-meta">
            <div class="meta-item">
              <span class="meta-label">分类：</span>
              <span class="meta-value">{{ article.category || '未分类' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">发布时间：</span>
              <span class="meta-value">{{ formatDate(article.created_at) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">浏览量：</span>
              <span class="meta-value">{{ article.views }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">点赞数：</span>
              <span class="meta-value">{{ article.likes }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">评论数：</span>
              <span class="meta-value">{{ article.comments_count }}</span>
            </div>
          </div>
        </header>

        <!-- 文章正文 -->
        <div class="article-content">
          <div class="content-text">{{ article.content }}</div>
        </div>

        <!-- 互动区域 -->
        <div class="interaction-section" v-if="isLoggedIn">
          <div class="interaction-buttons">
            <button 
              class="interaction-btn like-btn" 
              :class="{ active: isLiked }"
              @click="toggleLike"
            >
              <span class="btn-icon">👍</span>
              <span class="btn-text">{{ isLiked ? '已赞' : '点赞' }}</span>
            </button>
            <button 
              class="interaction-btn favorite-btn" 
              :class="{ active: isFavorited }"
              @click="toggleFavorite"
            >
              <span class="btn-icon">⭐</span>
              <span class="btn-text">{{ isFavorited ? '已收藏' : '收藏' }}</span>
            </button>
          </div>
        </div>
        
        <!-- 未登录提示 -->
        <div class="login-prompt" v-else>
          <div class="prompt-content">
            <p>登录后可进行点赞和收藏操作</p>
            <div class="prompt-actions">
              <router-link to="/login" class="btn login-btn">立即登录</router-link>
              <router-link to="/register" class="btn register-btn">注册账号</router-link>
            </div>
          </div>
        </div>

        <!-- 分享功能 -->
        <div class="share-section">
          <h3 class="share-title">分享文章</h3>
          <div class="share-buttons">
            <button class="share-btn copy-btn" @click="copyLink">
              <span class="share-icon">🔗</span>
              复制链接
            </button>
            <button class="share-btn wechat-btn" @click="shareToWechat">
              <span class="share-icon">💬</span>
              微信分享
            </button>
            <button class="share-btn qq-btn" @click="shareToQQ">
              <span class="share-icon">🐧</span>
              QQ分享
            </button>
          </div>
        </div>

        <!-- 相关推荐 -->
        <div class="related-section" v-if="relatedArticles.length > 0">
          <h3 class="related-title">相关推荐</h3>
          <div class="related-grid">
            <div 
              v-for="related in relatedArticles" 
              :key="related.id"
              class="related-card"
              @click="goToArticle(related.id)"
            >
              <div class="related-cover" :style="{ backgroundImage: related.cover ? `url(${related.cover})` : 'none' }">
                <div v-if="!related.cover" class="related-cover-placeholder">
                  <span class="related-cover-icon">📄</span>
                </div>
              </div>
              <div class="related-content">
                <h4 class="related-card-title">{{ related.title }}</h4>
                <p class="related-card-summary">{{ getRelatedSummary(related) }}</p>
                <div class="related-card-meta">
                  <span class="related-category">{{ related.category }}</span>
                  <span class="related-stats">
                    👁️ {{ related.views || 0 }} 👍 {{ related.likes || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论区域 -->
        <div class="comments-section">
          <h3 class="comments-title">评论 ({{ comments.length }})</h3>
          
          <!-- 发表评论 -->
          <div class="comment-form" v-if="isLoggedIn">
            <textarea 
              v-model="newComment" 
              placeholder="写下你的想法..."
              rows="3"
              class="comment-input"
            ></textarea>
            <button 
              class="comment-submit-btn" 
              @click="submitComment"
              :disabled="!newComment.trim()"
            >
              发表评论
            </button>
          </div>
          
          <!-- 未登录用户评论提示 -->
          <div class="comment-login-prompt" v-else>
            <p>登录后可发表评论</p>
            <div class="prompt-actions">
              <router-link to="/login" class="btn login-btn">立即登录</router-link>
              <router-link to="/register" class="btn register-btn">注册账号</router-link>
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div 
              v-for="comment in rootComments" 
              :key="comment.id"
              class="comment-item"
              :id="'comment-' + comment.id"
            >
              <div class="comment-header">
                <span class="comment-author">{{ comment.nickname || comment.username }}</span>
                <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-actions" v-if="isLoggedIn">
                <button class="comment-reply-btn" @click="openReplyFor(comment.id)">回复</button>
              </div>
              <div v-if="replyOpenId===comment.id" class="reply-form">
                <textarea v-model="replyText" rows="2" class="comment-input" placeholder="回复…"></textarea>
                <button class="comment-submit-btn" :disabled="!replyText.trim()" @click="submitReply(comment)">提交回复</button>
              </div>
              <div class="replies" v-if="childrenMap[comment.id] && childrenMap[comment.id].length">
                <div v-for="rc in childrenMap[comment.id]" :key="rc.id" class="reply-item" :id="'comment-' + rc.id">
                  <div class="reply-header">
                    <span class="reply-author">{{ rc.nickname || rc.username }}</span>
                    <span class="reply-date">{{ formatDate(rc.created_at) }}</span>
                  </div>
                  <div class="reply-content">{{ rc.content }}</div>
                </div>
              </div>
            </div>
            <div v-if="comments.length === 0" class="no-comments">
              暂无评论，快来抢沙发吧！
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <div v-else class="not-found">
      <h2>未找到该文章</h2>
      <p>请检查文章链接是否正确</p>
      <router-link class="btn" :to="{ name: 'articles' }">返回文章列表</router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ArticleDetailPage',
  props: { id: String },
  data() {
    return {
      article: null,
      comments: [],
      newComment: '',
      replyOpenId: null,
      replyText: '',
      loading: true,
      error: null,
      relatedArticles: []
    }
  },
  computed: {
    articleId() {
      return this.$route.params.id || this.id
    },
    isLoggedIn() {
      return !!localStorage.getItem('authToken')
    },
    isLiked() {
      return this.article ? this.article.user_liked : false
    },
    isFavorited() {
      return this.article ? this.article.user_favorited : false
    },
    rootComments() { 
      return this.comments.filter(c => !c.parent_id) 
    },
    childrenMap() {
      const map = {}
      this.comments.forEach(c => {
        if (!c.parent_id) return
        if (!map[c.parent_id]) map[c.parent_id] = []
        map[c.parent_id].push(c)
      })
      return map
    }
  },
  async created() {
    await this.fetchArticleDetail()
    await this.fetchComments()
    await this.fetchRelatedArticles()
  },
  methods: {
    async fetchArticleDetail() {
      try {
        this.loading = true
        const token = localStorage.getItem('authToken')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        
        const response = await axios.get(`http://localhost:3001/api/articles/${this.articleId}`, { headers })
        this.article = response.data.data
        this.loading = false
      } catch (error) {
        console.error('获取文章详情失败:', error)
        this.error = '获取文章详情失败'
        this.loading = false
      }
    },
    
    async fetchComments() {
      try {
        const response = await axios.get(`http://localhost:3001/api/articles/${this.articleId}/comments`)
        this.comments = response.data.data.comments
      } catch (error) {
        console.error('获取评论失败:', error)
      }
    },
    
    formatDate(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}年${p(d.getMonth()+1)}月${p(d.getDate())}日 ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    
    async toggleLike() {
      if (!this.articleId) return
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        alert('请先登录')
        return
      }
      
      try {
        const response = await axios.post(
          `http://localhost:3001/api/articles/${this.articleId}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        if (response.data.success) {
          // 重新获取文章详情以获取最新数据
          await this.fetchArticleDetail()
          alert(response.data.message)
        }
      } catch (error) {
        console.error('点赞操作失败:', error)
        alert('操作失败，请重试')
      }
    },
    
    async toggleFavorite() {
      if (!this.articleId) return
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        alert('请先登录')
        return
      }
      
      try {
        const response = await axios.post(
          `http://localhost:3001/api/articles/${this.articleId}/favorite`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        if (response.data.success) {
          // 重新获取文章详情以获取最新数据
          await this.fetchArticleDetail()
          alert(response.data.message)
        }
      } catch (error) {
        console.error('收藏操作失败:', error)
        alert('操作失败，请重试')
      }
    },
    
    async submitComment() {
      if (!this.newComment.trim() || !this.articleId) return
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        alert('请先登录')
        return
      }
      
      try {
        const response = await axios.post(
          `http://localhost:3001/api/articles/${this.articleId}/comments`,
          { content: this.newComment.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        if (response.data.success) {
          // 重新获取文章详情和评论列表
          await this.fetchArticleDetail()
          await this.fetchComments()
          this.newComment = ''
          alert('评论发表成功！')
        }
      } catch (error) {
        console.error('发表评论失败:', error)
        alert('评论发表失败，请重试')
      }
    },
    
    async submitReply(parent) {
      if (!this.replyText.trim() || !this.articleId) return
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        alert('请先登录')
        return
      }
      
      try {
        const response = await axios.post(
          `http://localhost:3001/api/articles/${this.articleId}/comments`,
          { 
            content: this.replyText.trim(),
            parent_id: parent.id
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        if (response.data.success) {
          // 重新获取文章详情和评论列表
          await this.fetchArticleDetail()
          await this.fetchComments()
          this.replyText = ''
          this.replyOpenId = null
          alert('回复发表成功！')
        }
      } catch (error) {
        console.error('发表回复失败:', error)
        alert('回复发表失败，请重试')
      }
    },
    
    openReplyFor(commentId) { 
      this.replyOpenId = commentId
      this.replyText = '' 
    },
    
    async fetchRelatedArticles() {
      try {
        if (!this.article) return
        
        // 获取同分类的其他文章
        const response = await axios.get(`http://localhost:3001/api/articles`, {
          params: {
            category: this.article.category,
            exclude: this.articleId,
            limit: 3
          }
        })
        
        this.relatedArticles = response.data.slice(0, 3)
      } catch (error) {
        console.error('获取相关文章失败:', error)
        // 如果API失败，使用模拟数据
        this.relatedArticles = [
          {
            id: 1,
            title: '传统文化保护的重要性',
            category: '传统文化',
            cover: '/assets/craft.jpg',
            views: 1200,
            likes: 85
          },
          {
            id: 2,
            title: '民俗节庆的多样性',
            category: '民俗节庆',
            cover: '/assets/festival.jpg',
            views: 980,
            likes: 72
          }
        ]
      }
    },
    
    getRelatedSummary(article) {
      if (article.summary) {
        return article.summary.length > 80 ? article.summary.substring(0, 80) + '...' : article.summary
      }
      if (article.content) {
        const text = article.content.replace(/<[^>]*>/g, '').trim()
        return text.length > 80 ? text.substring(0, 80) + '...' : text
      }
      return '暂无摘要'
    },
    
    goToArticle(articleId) {
      this.$router.push({ name: 'article-detail', params: { id: articleId } })
    },
    
    async copyLink() {
      try {
        const url = window.location.href
        await navigator.clipboard.writeText(url)
        alert('链接已复制到剪贴板！')
      } catch (error) {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = window.location.href
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('链接已复制到剪贴板！')
      }
    },
    
    shareToWechat() {
      // 微信分享功能（需要微信JS-SDK）
      alert('请使用微信扫描二维码分享')
    },
    
    shareToQQ() {
      // QQ分享功能
      const url = encodeURIComponent(window.location.href)
      const title = encodeURIComponent(this.article?.title || '')
      const desc = encodeURIComponent(this.article?.summary || '')
      window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&desc=${desc}`)
    }
  },
  mounted() {
    // 检查URL中是否有评论高亮参数
    const commentId = this.$route.query.highlight
    if (commentId) {
      this.$nextTick(() => {
        const commentEl = document.getElementById('comment-' + commentId)
        if (commentEl) {
          commentEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
          commentEl.classList.add('highlight')
          setTimeout(() => {
            commentEl.classList.remove('highlight')
          }, 3000)
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
}

/* 返回按钮区域 */
.back-section {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  z-index: 100;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-btn:hover {
  color: #2d3748;
  transform: translateX(-2px);
}

.back-icon {
  font-size: 16px;
  font-weight: bold;
}

/* 文章容器 */
.article-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
}

/* 文章头部 */
.article-header {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
  margin: 0 0 20px 0;
  text-align: center;
}

.article-summary {
  font-size: 1.2rem;
  color: #4a5568;
  line-height: 1.6;
  text-align: center;
  margin: 0 0 32px 0;
  font-style: italic;
  border-left: 4px solid #4299e1;
  padding-left: 20px;
  background: #f7fafc;
  padding: 16px 20px;
  border-radius: 8px;
}

/* 文章元信息 */
.article-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  min-width: 80px;
}

.meta-value {
  color: #4a5568;
  font-size: 14px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* 文章正文 */
.article-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.content-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #2d3748;
  white-space: pre-wrap;
  text-align: justify;
}

/* 未找到文章 */
.not-found {
  max-width: 600px;
  margin: 80px auto;
  text-align: center;
  background: #ffffff;
  border-radius: 16px;
  padding: 60px 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.not-found h2 {
  color: #2d3748;
  margin-bottom: 16px;
  font-size: 1.8rem;
}

.not-found p {
  color: #4a5568;
  margin-bottom: 24px;
  font-size: 1.1rem;
}

.btn {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* 互动区域 */
.interaction-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.interaction-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.interaction-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid #e2e8f0;
  background: #ffffff;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #4a5568;
}

.interaction-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.interaction-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.like-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-color: #ff6b6b;
}

.favorite-btn.active {
  background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%);
  border-color: #feca57;
}

.btn-icon {
  font-size: 16px;
}

/* 评论区域 */
.comments-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.comments-title {
  color: #2d3748;
  margin: 0 0 24px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

/* 评论表单 */
.comment-form {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.comment-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.comment-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.comment-submit-btn {
  margin-top: 12px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.comment-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.comment-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: all 0.2s ease;
}

.comment-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.comment-item.highlight {
  background: #fef3c7;
  border-left-color: #f59e0b;
  animation: highlightPulse 2s ease-in-out;
}

@keyframes highlightPulse {
  0%, 100% { background: #fef3c7; }
  50% { background: #fde68a; }
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-author {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.comment-date {
  color: #718096;
  font-size: 12px;
}

.comment-content {
  color: #4a5568;
  line-height: 1.6;
  font-size: 14px;
}

.comment-actions { margin-top: 8px; }
.comment-like-btn { 
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; 
  border: 1px solid #d1d5db; background: #fff; border-radius: 16px; cursor: pointer; font-size: 12px; color: #6b7280;
}
.comment-like-btn.active { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-color: #ff6b6b; color: #fff; }

.no-comments {
  text-align: center;
  color: #a0aec0;
  font-style: italic;
  padding: 40px 20px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #4a5568;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  max-width: 600px;
  margin: 80px auto;
  text-align: center;
  background: #ffffff;
  border-radius: 16px;
  padding: 60px 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error-container h2 {
  color: #e53e3e;
  margin-bottom: 16px;
  font-size: 1.8rem;
}

.error-container p {
  color: #4a5568;
  margin-bottom: 24px;
  font-size: 1.1rem;
}

/* 未登录提示样式 */
.login-prompt {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.prompt-content p {
  color: #4a5568;
  margin: 0 0 16px 0;
  font-size: 16px;
}

.prompt-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.register-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.login-btn:hover,
.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.comment-login-prompt {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.comment-login-prompt p {
  color: #4a5568;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.comment-login-prompt .prompt-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.comment-login-prompt .btn {
  padding: 8px 16px;
  font-size: 12px;
}

/* 回复样式 */
.reply-form {
  margin-top: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.reply-item {
  margin-top: 12px;
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 8px;
  border-left: 3px solid #cbd5e0;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reply-author {
  font-weight: 600;
  color: #2d3748;
  font-size: 13px;
}

.reply-date {
  color: #718096;
  font-size: 11px;
}

.reply-content {
  color: #4a5568;
  line-height: 1.5;
  font-size: 13px;
}

.comment-reply-btn {
  padding: 4px 12px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  color: #4a5568;
  transition: all 0.2s ease;
}

.comment-reply-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

/* 分享功能样式 */
.share-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.share-title {
  color: #2d3748;
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.share-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  color: #4a5568;
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.copy-btn:hover {
  background: #f0f9ff;
  border-color: #0ea5e9;
  color: #0ea5e9;
}

.wechat-btn:hover {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #22c55e;
}

.qq-btn:hover {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #f59e0b;
}

.share-icon {
  font-size: 16px;
}

/* 相关推荐样式 */
.related-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.related-title {
  color: #2d3748;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.related-card {
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #2563eb;
}

.related-cover {
  height: 120px;
  background: #f3f4f6;
  background-size: cover;
  background-position: center;
  position: relative;
}

.related-cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.related-cover-icon {
  font-size: 1.5rem;
  color: #9ca3af;
}

.related-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.related-card-title {
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-card-summary {
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.related-category {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.related-stats {
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-container {
    padding: 20px 16px;
  }
  
  .article-header,
  .article-content,
  .interaction-section,
  .comments-section,
  .share-section,
  .related-section {
    padding: 20px;
  }
  
  .article-title {
    font-size: 1.8rem;
  }
  
  .article-summary {
    font-size: 1rem;
  }
  
  .back-section {
    padding: 12px 16px;
  }
  
  .interaction-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .interaction-btn {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }
  
  .share-buttons {
    flex-direction: column;
  }
  
  .share-btn {
    justify-content: center;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>


