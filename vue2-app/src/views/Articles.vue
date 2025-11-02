<template>
  <div class="page">
    <div class="search-section">
      <input v-model="localQ" class="search-input" placeholder="搜索标题/摘要" @keyup.enter="applyFilter" />
    </div>
    
    <div class="header">
      <h1>文章列表</h1>
      <div class="actions">
        <button class="btn primary" @click="openPublish">发布文章</button>
        <select v-model="sortBy">
          <option value="latest">最新</option>
          <option value="oldest">最早</option>
        </select>
      </div>
    </div>

    <div class="grid">
      <div v-for="a in presented" :key="a.id" class="card">
        <div class="cover"></div>
        <div class="body">
          <router-link class="title" :to="{ name: 'article-detail', params: { id: a.id } }">{{ a.title }}</router-link>
          <p class="summary">{{ a.summary }}</p>
          <div class="tags">
            <span v-for="t in a.tags" :key="t" class="tag"># {{ t }}</span>
          </div>
          <div class="meta">
            <span>{{ formatDate(a.date) }}</span>
            <div class="stats">
              <span class="stat-item">👁️ {{ a.views || 0 }}</span>
              <span class="stat-item">👍 {{ a.likes || 0 }}</span>
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
    
    <BaseModal v-if="showPublish" @close="closePublish">
      <ArticlePublishForm @cancel="closePublish" @submit="handlePublish" />
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
    return { localQ: this.$route.query.q || '', sortBy: 'latest', showPublish: false }
  },
  components: { BaseModal, ArticlePublishForm },
  computed: {
    ...mapGetters(['isLiked', 'isFavorited']),
    isLoggedIn() {
      return !!localStorage.getItem('authToken')
    },
    list() { return this.$store.state.articles.list },
    filtered() {
      const q = (this.localQ || '').toLowerCase()
      if (!q) return this.list
      return this.list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        (a.tags || []).some(t => t.toLowerCase().includes(q))
      )
    },
    sorted() {
      const arr = [...this.filtered]
      arr.sort((a, b) => this.sortBy === 'latest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date))
      return arr
    },
    presented() {
      return this.sorted
    }
  },
  watch: {
    '$route.query.q'(v) { this.localQ = v || '' }
  },
  created() {
    this.$store.dispatch('articles/fetchArticles')
  },
  activated() {
    // 当页面被激活时（比如从文章详情页返回），刷新文章列表
    this.$store.dispatch('articles/fetchArticles')
  },
  methods: {
    ...mapActions(['toggleLike', 'toggleFavorite']),
    openPublish() { this.showPublish = true },
    closePublish() { this.showPublish = false },
    applyFilter() {
      this.$router.replace({ query: { q: this.localQ || undefined } })
    },
    formatDate(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
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
    toggleLike(articleId) {
      this.$store.dispatch('toggleLike', articleId)
    },
    toggleFavorite(articleId) {
      this.$store.dispatch('toggleFavorite', articleId)
    }
  }
}
</script>

<style scoped>
.page { padding: 16px; width: 75%; margin: 0 auto; }

/* 搜索区域 */
.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
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

.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.actions { display: inline-flex; gap: 8px; align-items: center; }

.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.card { display: grid; grid-template-columns: 1fr 1fr; background: #fff; border: 1px solid #eceff3; border-radius: 10px; overflow: hidden; }
.cover { background: #f3f5f7; }
.body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.title { font-weight: 700; color: #1f2d3d; text-decoration: none; }
.title:hover { text-decoration: underline; }
.summary { color: #6b7280; margin: 0; }
.tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag { background: #f3f4f6; border-radius: 12px; padding: 2px 8px; font-size: 12px; color: #374151; }
.meta { display: flex; flex-direction: column; gap: 8px; color: #6b7280; font-size: 12px; }
.stats { display: flex; gap: 12px; }
.stat-item { display: flex; align-items: center; gap: 4px; }
.ops { display: flex; gap: 8px; }
.btn { 
  border: 1px solid #dcdfe6; 
  background: #fff; 
  border-radius: 4px; 
  padding: 4px 10px; 
  cursor: pointer; 
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  transition: all 0.2s ease;
}
.btn:hover { background: #f2f3f5; }
.btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; }

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
</style>


