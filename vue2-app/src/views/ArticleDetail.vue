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
import articles from '@/data/articles'
export default {
  name: 'ArticleDetailPage',
  props: { id: String },
  computed: {
    article() {
      const targetId = this.$route.params.id || this.id
      return articles.find(a => a.id === String(targetId)) || null
    }
  },
  methods: {
    formatDate(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}年${p(d.getMonth()+1)}月${p(d.getDate())}日 ${p(d.getHours())}:${p(d.getMinutes())}`
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

/* 响应式设计 */
@media (max-width: 768px) {
  .article-container {
    padding: 20px 16px;
  }
  
  .article-header,
  .article-content {
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
}
</style>


