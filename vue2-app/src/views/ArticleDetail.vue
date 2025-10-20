<template>
  <div class="page">
    <!-- 返回按钮 -->
    <div class="back-section">
      <router-link class="back-btn" :to="{ name: 'articles' }">
        <span class="back-icon">←</span>
        返回文章列表
      </router-link>
    </div>

    <template v-if="article">
      <!-- 文章内容区域 -->
      <div class="article-container">
        <!-- 文章头部 -->
        <header class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          <p class="article-summary">{{ article.summary }}</p>
          
          <!-- 文章元信息 -->
          <div class="article-meta">
            <div class="meta-item">
              <span class="meta-label">发布人：</span>
              <span class="meta-value">{{ article.author || '匿名用户' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">发布时间：</span>
              <span class="meta-value">{{ formatDate(article.date) }}</span>
            </div>
            <div class="meta-item" v-if="article.tags && article.tags.length">
              <span class="meta-label">标签：</span>
              <div class="tags">
                <span v-for="tag in article.tags" :key="tag" class="tag"># {{ tag }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- 文章正文 -->
        <div class="article-content">
          <div class="content-text">{{ article.content }}</div>
        </div>

        <!-- 互动区域 -->
        <div class="interaction-section">
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

        <!-- 评论区域 -->
        <div class="comments-section">
          <h3 class="comments-title">评论 ({{ comments.length }})</h3>
          
          <!-- 发表评论 -->
          <div class="comment-form">
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

          <!-- 评论列表 -->
          <div class="comments-list">
            <div 
              v-for="comment in rootComments" 
              :key="comment.id"
              class="comment-item"
              :id="'comment-' + comment.id"
            >
              <div class="comment-header">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-date">{{ formatDate(comment.date) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-actions">
                <button 
                  class="comment-like-btn"
                  :class="{ active: isCommentLiked(comment.id) }"
                  @click="onToggleCommentLike(comment)"
                >
                  <span class="btn-icon">👍</span>
                  <span class="btn-text">{{ isCommentLiked(comment.id) ? '已赞' : '点赞' }}</span>
                </button>
                <button class="comment-reply-btn" @click="openReplyFor(comment.id)">回复</button>
              </div>
              <div v-if="replyOpenId===comment.id" class="reply-form">
                <textarea v-model="replyText" rows="2" class="comment-input" placeholder="回复…"></textarea>
                <button class="comment-submit-btn" :disabled="!replyText.trim()" @click="submitReply(comment)">提交回复</button>
              </div>
              <div class="replies" v-if="childrenMap[comment.id] && childrenMap[comment.id].length">
                <div v-for="rc in childrenMap[comment.id]" :key="rc.id" class="reply-item" :id="'comment-' + rc.id">
                  <div class="reply-header">
                    <span class="reply-author">{{ rc.author }}</span>
                    <span class="reply-date">{{ formatDate(rc.date) }}</span>
                  </div>
                  <div class="reply-content">{{ rc.content }}</div>
                  <div class="reply-actions">
                    <button class="comment-like-btn" :class="{ active: isCommentLiked(rc.id) }" @click="onToggleCommentLike(rc)"><span class="btn-icon">👍</span><span class="btn-text">{{ isCommentLiked(rc.id) ? '已赞' : '点赞' }}</span></button>
                  </div>
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
// 统一从 Vuex 获取文章详情，移除静态数据依赖
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ArticleDetailPage',
  props: { id: String },
  data() {
    return {
      newComment: '',
      replyOpenId: null,
      replyText: ''
    }
  },
  computed: {
    ...mapGetters(['isLiked', 'isFavorited', 'getCommentsByArticle', 'isCommentLiked']),
    article() {
      const targetId = this.$route.params.id || this.id
      const list = this.$store.state.articles && this.$store.state.articles.list || []
      const found = list.find(a => String(a.id) === String(targetId))
      return found || null
    },
    articleId() {
      return this.article ? this.article.id : null
    },
    isLiked() {
      return this.articleId ? this.$store.getters.isLiked(this.articleId) : false
    },
    isFavorited() {
      return this.articleId ? this.$store.getters.isFavorited(this.articleId) : false
    },
    comments() {
      return this.articleId ? this.$store.getters.getCommentsByArticle(this.articleId) : []
    },
    rootComments() { return this.comments.filter(c => !c.parentCommentId) },
    childrenMap() {
      const map = {}
      this.comments.forEach(c => {
        if (!c.parentCommentId) return
        if (!map[c.parentCommentId]) map[c.parentCommentId] = []
        map[c.parentCommentId].push(c)
      })
      return map
    }
  },
  created() {
    // 确保文章列表已加载（用户端/管理端统一从Vuex获取）
    if (!this.$store.state.articles || (this.$store.state.articles.list || []).length === 0) {
      this.$store.dispatch('articles/fetchArticles')
    }
  },
  methods: {
    ...mapActions(['toggleLike', 'toggleFavorite', 'addComment', 'toggleCommentLike']),
    formatDate(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}年${p(d.getMonth()+1)}月${p(d.getDate())}日 ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    toggleLike() {
      if (!this.articleId) return
      this.$store.dispatch('toggleLike', this.articleId)
    },
    toggleFavorite() {
      if (!this.articleId) return
      this.$store.dispatch('toggleFavorite', this.articleId)
    },
    async submitComment() {
      if (!this.newComment.trim() || !this.articleId) return
      
      try {
        await this.$store.dispatch('addComment', {
          articleId: this.articleId,
          content: this.newComment.trim()
        })
        this.newComment = ''
        this.$message && this.$message.success('评论发表成功！')
      } catch (error) {
        console.error('发表评论失败:', error)
        alert('评论发表失败，请重试')
      }
    }
    ,
    onToggleCommentLike(comment) {
      this.$store.dispatch('toggleCommentLike', {
        commentId: comment.id,
        articleId: this.articleId,
        commentAuthor: comment.author
      })
    },
    openReplyFor(commentId) { this.replyOpenId = commentId; this.replyText = '' },
    submitReply(parent) {
      if (!this.replyText.trim() || !this.articleId) return
      this.$store.dispatch('addComment', { articleId: this.articleId, content: this.replyText.trim(), parentCommentId: parent.id, targetType: 'article', targetAuthor: parent.author })
      this.replyText = ''; this.replyOpenId = null
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

/* 响应式设计 */
@media (max-width: 768px) {
  .article-container {
    padding: 20px 16px;
  }
  
  .article-header,
  .article-content,
  .interaction-section,
  .comments-section {
    padding: 24px;
  }
  
  .article-title {
    font-size: 2rem;
  }
  
  .article-summary {
    font-size: 1.1rem;
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
}
</style>


