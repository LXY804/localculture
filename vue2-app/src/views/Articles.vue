<template>
  <div class="page">
    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <input v-model="localQ" class="search-input" placeholder="搜索标题/摘要" @keyup.enter="applyFilter" />
      <button class="search-btn" @click="applyFilter">搜索</button>
    </div>
    
    <!-- 分类筛选 -->
    <div class="filter-section">
      <div class="filter-tabs">
        <button 
          v-for="category in categories" 
          :key="category" 
          class="filter-tab"
          :class="{ active: selectedCategory === category }"
          @click="selectCategory(category)"
        >
          {{ category }}
        </button>
      </div>
    </div>
    
    <div class="header">
      <h1>文章列表</h1>
      <div class="actions">
        <button class="btn primary" @click="openPublish">发布文章</button>
        <select v-model="sortBy" @change="applySorting">
          <option value="latest">最新</option>
          <option value="oldest">最早</option>
          <option value="hottest">最热</option>
          <option value="most_liked">点赞最多</option>
        </select>
      </div>
    </div>

    <!-- 骨架屏加载 -->
    <div v-if="loading" class="skeleton-container">
      <div v-for="n in 6" :key="n" class="skeleton-card">
        <div class="skeleton-cover"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-summary"></div>
          <div class="skeleton-meta"></div>
        </div>
      </div>
    </div>

    <!-- 文章列表 -->
    <div v-else class="grid">
      <div v-for="a in paginatedArticles" :key="a.id" class="card" :class="{ 'fade-in': true }">
        <div class="cover" :style="{ backgroundImage: a.cover ? `url(${a.cover})` : 'none' }">
          <div v-if="!a.cover" class="cover-placeholder">
            <span class="cover-icon">📄</span>
          </div>
        </div>
        <div class="body">
          <router-link class="title" :to="{ name: 'article-detail', params: { id: a.id } }">{{ a.title }}</router-link>
          <p class="summary">{{ getSummary(a) }}</p>
          <div class="tags" v-if="a.category">
            <span class="tag category-tag">{{ a.category }}</span>
            <span v-for="t in (a.tags || [])" :key="t" class="tag"># {{ t }}</span>
          </div>
          <div class="meta">
            <span class="date">{{ formatDate(a.created_at || a.date) }}</span>
            <div class="stats">
              <span class="stat-item">👁️ {{ a.views || 0 }}</span>
              <span class="stat-item">👍 {{ a.likes || 0 }}</span>
              <span class="stat-item">💬 {{ a.comments_count || 0 }}</span>
            </div>
            <div class="ops" v-if="isLoggedIn">
              <button 
                class="btn like-btn" 
                :class="{ active: isLiked(a.id) }"
                @click.stop="toggleLike(a.id)"
              >
                <span class="btn-icon">👍</span>
                {{ isLiked(a.id) ? '已赞' : '点赞' }}
              </button>
              <button 
                class="btn favorite-btn" 
                :class="{ active: isFavorited(a.id) }"
                @click.stop="toggleFavorite(a.id)"
              >
                <span class="btn-icon">⭐</span>
                {{ isFavorited(a.id) ? '已收藏' : '收藏' }}
              </button>
            </div>
            <div class="login-hint" v-else>
              <span class="hint-text">登录后可点赞收藏</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="!loading && totalPages > 1" class="pagination">
      <button 
        class="pagination-btn" 
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        上一页
      </button>
      <span class="pagination-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      <button 
        class="pagination-btn" 
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
    
    <BaseModal v-if="showPublish" @close="closePublish">
      <ArticlePublishForm 
        @cancel="closePublish" 
        @submit="handlePublish"
      />
    </BaseModal>
  </div>
  
</template>

<script>
import BaseModal from '@/components/Modal.vue'
import ArticlePublishForm from '@/components/ArticlePublishForm.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ArticlesPage',
  data() {
    return { 
      localQ: this.$route.query.q || '', 
      sortBy: 'latest', 
      showPublish: false,
      selectedCategory: '全部',
      currentPage: 1,
      pageSize: 6,
      loading: false
    }
  },
  components: { BaseModal, ArticlePublishForm },
  computed: {
    ...mapGetters(['isLiked', 'isFavorited']),
    isLoggedIn() {
      return !!localStorage.getItem('authToken')
    },
    list() { return this.$store.state.articles.list },
    categories() {
      const cats = ['全部']
      this.list.forEach(article => {
        if (article.category && !cats.includes(article.category)) {
          cats.push(article.category)
        }
      })
      return cats
    },
    filtered() {
      let filtered = this.list
      
      // 搜索过滤
      const q = (this.localQ || '').toLowerCase()
      if (q) {
        filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
          (a.content && a.content.toLowerCase().includes(q)) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        (a.tags || []).some(t => t.toLowerCase().includes(q))
      )
      }
      
      // 分类过滤
      if (this.selectedCategory !== '全部') {
        filtered = filtered.filter(a => a.category === this.selectedCategory)
      }
      
      return filtered
    },
    sorted() {
      const arr = [...this.filtered]
      arr.sort((a, b) => {
        switch (this.sortBy) {
          case 'latest':
            return new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
          case 'oldest':
            return new Date(a.created_at || a.date) - new Date(b.created_at || b.date)
          case 'hottest':
            return (b.views || 0) - (a.views || 0)
          case 'most_liked':
            return (b.likes || 0) - (a.likes || 0)
          default:
            return 0
        }
      })
      return arr
    },
    paginatedArticles() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.sorted.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.sorted.length / this.pageSize)
    }
  },
  watch: {
    '$route.query.q'(v) { this.localQ = v || '' },
    selectedCategory() {
      this.currentPage = 1
    },
    sortBy() {
      this.currentPage = 1
    }
  },
  async created() {
    await this.fetchArticles()
  },
  activated() {
    // 当页面被激活时（比如从文章详情页返回），刷新文章列表
    this.fetchArticles()
  },
  methods: {
    ...mapActions(['toggleLike', 'toggleFavorite']),
    async fetchArticles() {
      this.loading = true
      try {
        await this.$store.dispatch('articles/fetchArticles')
      } finally {
        this.loading = false
      }
    },
    openPublish() { this.showPublish = true },
    closePublish() { this.showPublish = false },
    applyFilter() {
      this.$router.replace({ query: { q: this.localQ || undefined } })
      this.currentPage = 1
    },
    selectCategory(category) {
      this.selectedCategory = category
    },
    applySorting() {
      this.currentPage = 1
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.$nextTick(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        })
      }
    },
    getSummary(article) {
      if (article.summary) {
        return article.summary
      }
      if (article.content) {
        // 从内容中提取前100个字符作为摘要
        const text = article.content.replace(/<[^>]*>/g, '').trim()
        return text.length > 100 ? text.substring(0, 100) + '...' : text
      }
      return '暂无摘要'
    },
    formatDate(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    async handlePublish(payload) {
      try {
        // 调用 Vuex action 创建文章（会调用后端API）
        const newArticle = await this.$store.dispatch('articles/createArticle', payload)
        
        this.closePublish()
        this.$nextTick(() => {
          alert('发布成功！')
          this.$router.push({ name: 'article-detail', params: { id: newArticle.id }, query: { from: 'list' } })
        })
      } catch (error) {
        console.error('发布失败:', error)
        alert('发布失败：' + (error.message || '未知错误'))
      }
    },
    async toggleLike(articleId) {
      try {
        await this.$store.dispatch('toggleLike', articleId)
        // 触发数据更新事件
        this.$root.$emit('userDataChanged', { type: 'like' })
        // 刷新文章列表以更新UI
        await this.fetchArticles()
      } catch (error) {
        // 错误已在action中处理
      }
    },
    async toggleFavorite(articleId) {
      try {
        await this.$store.dispatch('toggleFavorite', articleId)
        // 触发数据更新事件
        this.$root.$emit('userDataChanged', { type: 'favorite' })
        // 刷新文章列表以更新UI
        await this.fetchArticles()
      } catch (error) {
        // 错误已在action中处理
      }
    }
  }
}
</script>

<style scoped>
.page { 
  padding: 16px; 
  width: 75%; 
  margin: 0 auto; 
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* 搜索区域 */
.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

/* 分类筛选 */
.filter-section {
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-tab {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  background: #e2e8f0;
  color: #374151;
}

.filter-tab.active {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-color: #2563eb;
  color: white;
}

.header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  margin-bottom: 24px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h1 {
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.actions { 
  display: inline-flex; 
  gap: 12px; 
  align-items: center; 
}

.actions select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  font-size: 14px;
  cursor: pointer;
}

/* 骨架屏样式 */
.skeleton-container {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.skeleton-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-cover {
  background: #f3f4f6;
  height: 120px;
}

.skeleton-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-title {
  height: 20px;
  background: #f3f4f6;
  border-radius: 4px;
  width: 80%;
}

.skeleton-summary {
  height: 16px;
  background: #f3f4f6;
  border-radius: 4px;
  width: 100%;
}

.skeleton-meta {
  height: 14px;
  background: #f3f4f6;
  border-radius: 4px;
  width: 60%;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 文章网格 */
.grid { 
  display: grid; 
  grid-template-columns: repeat(2, minmax(0, 1fr)); 
  gap: 20px; 
}

.card { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  background: #ffffff; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #2563eb;
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.cover { 
  background: #f3f5f7;
  background-size: cover;
  background-position: center;
  position: relative;
  min-height: 120px;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.cover-icon {
  font-size: 2rem;
  color: #9ca3af;
}

.body { 
  padding: 16px; 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}

.title { 
  font-weight: 700; 
  color: #1f2937; 
  text-decoration: none; 
  font-size: 1.1rem;
  line-height: 1.4;
  transition: color 0.2s ease;
}

.title:hover { 
  color: #2563eb;
  text-decoration: underline; 
}

.summary { 
  color: #6b7280; 
  margin: 0; 
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags { 
  display: flex; 
  gap: 8px; 
  flex-wrap: wrap; 
}

.tag { 
  background: #f3f4f6; 
  border-radius: 12px; 
  padding: 4px 8px; 
  font-size: 12px; 
  color: #374151;
  font-weight: 500;
}

.category-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.meta { 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
  color: #6b7280; 
  font-size: 12px; 
}

.date {
  font-weight: 500;
  color: #9ca3af;
}

.stats { 
  display: flex; 
  gap: 12px; 
}

.stat-item { 
  display: flex; 
  align-items: center; 
  gap: 4px; 
  font-weight: 500;
}

.ops { 
  display: flex; 
  gap: 8px; 
}

.btn { 
  border: 1px solid #dcdfe6; 
  background: #fff; 
  border-radius: 6px; 
  padding: 6px 12px; 
  cursor: pointer; 
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover { 
  background: #f2f3f5; 
  transform: translateY(-1px);
}

.btn.primary { 
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
  border-color: #2563eb; 
  color: #fff; 
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* 点赞按钮样式 */
.like-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-color: #ff6b6b;
  color: white;
}

.like-btn:hover:not(.active) {
  background: #ffe0e0;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

/* 收藏按钮样式 */
.favorite-btn.active {
  background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%);
  border-color: #feca57;
  color: white;
}

.favorite-btn:hover:not(.active) {
  background: #fff3cd;
  border-color: #feca57;
  color: #feca57;
}

.btn-icon {
  font-size: 12px;
}

/* 登录提示样式 */
.login-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.hint-text {
  color: #718096;
  font-size: 12px;
  font-style: italic;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page {
    width: 95%;
    padding: 12px;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
  
  .card {
    grid-template-columns: 1fr;
  }
  
  .cover {
    height: 200px;
  }
  
  .filter-tabs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-tab {
    text-align: center;
  }
  
  .header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .actions {
    justify-content: space-between;
  }
}
</style>


