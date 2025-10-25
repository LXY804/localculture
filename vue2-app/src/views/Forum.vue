<template>
  <div class="page">
    <!-- 搜索区域 -->
    <div class="search-section">
      <input v-model="q" class="search-input" placeholder="搜索论坛帖子..." @keyup.enter="applyFilter" />
    </div>

    

    <!-- 论坛主区域 -->
    <div class="forum-main">
      <div class="forum-header">
      <h1>交流论坛</h1>
        <button class="publish-btn" @click="openPostModal">发布帖子</button>
    </div>

    <div class="tabs">
      <button v-for="c in categories" :key="c.key" class="tab" :class="{ active: c.key===current }" @click="switchCat(c.key)">{{ c.name }}</button>
    </div>

    <!-- 排序选项 -->
    <div class="sort-section">
      <div class="sort-controls">
        <span class="sort-label">排序方式：</span>
        <select v-model="sortBy" @change="applySorting" class="sort-select">
          <option value="latest">最新</option>
          <option value="hottest">最热</option>
          <option value="most_replied">回复最多</option>
        </select>
      </div>
    </div>

      <div class="posts-list">
        <div v-for="p in presented" :key="p.id" class="post-card">
          <div class="post-header">
            <div class="post-info">
              <h3 class="post-title" @click="goToPostDetail(p.id)">{{ p.title }}</h3>
              <p class="post-brief">{{ p.brief }}</p>
              <div class="post-meta">
                <span class="post-author">作者：{{ p.author }}</span>
                <span class="post-date">{{ formatDate(p.date) }}</span>
                <span class="post-category">{{ getCategoryName(p.cat) }}</span>
              </div>
            </div>
          </div>
          
          <div class="post-tags" v-if="p.tags && p.tags.length">
            <span class="tag" v-for="t in p.tags" :key="t"># {{ t }}</span>
          </div>

          <div class="post-actions">
            <button 
              class="action-btn like-btn" 
              :class="{ active: isLiked(p.id) }"
              @click.stop="toggleLike(p.id)"
            >
              <span class="btn-icon">👍</span>
              <span class="btn-text">{{ isLiked(p.id) ? '已赞' : '点赞' }}</span>
            </button>
            <button 
              class="action-btn favorite-btn" 
              :class="{ active: isFavorited(p.id) }"
              @click.stop="toggleFavorite(p.id)"
            >
              <span class="btn-icon">⭐</span>
              <span class="btn-text">{{ isFavorited(p.id) ? '已收藏' : '收藏' }}</span>
            </button>
            <button class="action-btn comment-btn" @click.stop="goToPostDetail(p.id)">
              <span class="btn-icon">💬</span>
              <span class="btn-text">评论 ({{ getCommentCount(p.id) }})</span>
            </button>
        </div>
        </div>
      </div>
    </div>

    <!-- 发布帖子弹窗 -->
    <BaseModal v-if="showPostModal" @close="closePostModal">
      <h3>发布帖子</h3>
      <div class="form-col">
        <label>主题分类
          <select v-model="newPost.cat" @change="saveDraft">
            <option v-for="c in categories" :key="c.key" :value="c.key">{{ c.name }}</option>
          </select>
        </label>
        <label>标题
          <input v-model="newPost.title" placeholder="请输入标题" @input="saveDraft" />
        </label>
        <label>内容摘要
          <textarea v-model="newPost.brief" rows="3" placeholder="简要描述你的观点" @input="saveDraft"></textarea>
        </label>
        <div class="draft-info" v-if="hasDraft">
          <span class="draft-text">💾 已自动保存草稿</span>
        </div>
        <div class="dialog-actions">
          <button @click="submitPost" :disabled="!newPost.title.trim()">提交</button>
          <button class="ghost" @click="closePostModal">取消</button>
        </div>
      </div>
    </BaseModal>

    <!-- 回复弹窗 -->
    <BaseModal v-if="showReplyModal" @close="showReplyModal=false">
      <h3>回复帖子</h3>
      <p class="hint">{{ replyTarget ? replyTarget.title : '' }}</p>
      <div class="form-col">
        <textarea v-model="replyText" rows="4" placeholder="写下你的观点…"></textarea>
        <div class="dialog-actions">
          <button @click="submitReply">提交</button>
          <button class="ghost" @click="showReplyModal=false">取消</button>
        </div>
      </div>
    </BaseModal>
  </div>
  
</template>

<script>
import BaseModal from '@/components/Modal.vue'
import { mapGetters, mapActions } from 'vuex'
import forumPosts from '@/data/forumPosts'

export default {
  name: 'ForumPage',
  components: { BaseModal },
  data() {
    return {
      q: '',
      current: 'all',
      sortBy: 'latest',
      categories: [
        { key: 'all', name: '全部' },
        { key: 'food', name: '美食' },
        { key: 'folk', name: '民俗' },
        { key: 'craft', name: '手工' },
        { key: 'art', name: '艺术' },
      ],
      
      posts: forumPosts,
      showPostModal: false,
      newPost: { cat: 'all', title: '', brief: '' },
      showReplyModal: false,
      replyTarget: null,
      replyText: '',
      loading: false,
    }
  },
  computed: {
    ...mapGetters(['isLiked', 'isFavorited', 'getCommentsByArticle']),
    filtered() {
      const q = (this.q || '').toLowerCase()
      return this.posts.filter(p =>
        (this.current==='all' || p.cat===this.current) &&
        (!q || p.title.toLowerCase().includes(q) || (p.brief||'').toLowerCase().includes(q) || (p.tags||[]).some(t => t.toLowerCase().includes(q)))
      )
    },
    presented() {
      const sorted = [...this.filtered]
      switch (this.sortBy) {
        case 'latest':
          return sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
        case 'hottest':
          return sorted.sort((a, b) => (b.views || 0) - (a.views || 0))
        case 'most_replied':
          return sorted.sort((a, b) => (b.replies || 0) - (a.replies || 0))
        default:
          return sorted
      }
    },
    hasDraft() {
      return this.newPost.title.trim() || this.newPost.brief.trim()
    }
  },
  methods: {
    ...mapActions(['toggleLike', 'toggleFavorite']),
    switchCat(key) { this.current = key },
    applyFilter() {},
    applySorting() {
      // 排序改变时重新计算
    },
    openPostModal() { 
      this.showPostModal = true
      this.loadDraft()
    },
    submitPost() {
      if (!this.newPost.title) return alert('请输入标题')
      const post = {
        id: 'f' + (Date.now()),
        title: this.newPost.title,
        brief: this.newPost.brief,
        content: this.newPost.brief,
        tags: [],
        cat: this.newPost.cat || 'all',
        author: this.$store.getters.username || '匿名用户',
        date: new Date().toISOString(),
        views: 0,
        likes: 0,
        replies: 0
      }
      this.posts.unshift(post)
      this.showPostModal = false
      this.clearDraft()
      this.newPost = { cat: this.current, title: '', brief: '' }
    },
    openReplyModal(p) { this.replyTarget = p; this.replyText=''; this.showReplyModal = true },
    submitReply() {
      if (!this.replyText) return alert('请输入回复内容')
      // 演示用：这里仅提示，真实应提交到后端
      alert('回复成功！')
      this.showReplyModal = false
      this.replyText = ''
    },
    formatDate(iso) {
      const d = new Date(iso); const p=n=>String(n).padStart(2,'0')
      return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
    },
    getCategoryName(catKey) {
      const category = this.categories.find(c => c.key === catKey)
      return category ? category.name : '未知'
    },
    getCommentCount(postId) {
      return this.$store.getters.getCommentsByArticle(postId).length
    },
    toggleLike(postId) {
      this.$store.dispatch('toggleLike', postId)
    },
    toggleFavorite(postId) {
      this.$store.dispatch('toggleFavorite', postId)
    },
    goToPostDetail(postId) {
      // 跳转到帖子详情页面
      this.$router.push({ name: 'forum-post-detail', params: { id: postId } })
    },
    
    // 草稿保存功能
    saveDraft() {
      const draft = {
        title: this.newPost.title,
        brief: this.newPost.brief,
        cat: this.newPost.cat,
        timestamp: Date.now()
      }
      localStorage.setItem('forum_draft', JSON.stringify(draft))
    },
    
    loadDraft() {
      const draft = localStorage.getItem('forum_draft')
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft)
          // 检查草稿是否在24小时内
          if (Date.now() - parsedDraft.timestamp < 24 * 60 * 60 * 1000) {
            this.newPost.title = parsedDraft.title || ''
            this.newPost.brief = parsedDraft.brief || ''
            this.newPost.cat = parsedDraft.cat || 'all'
          }
        } catch (error) {
          console.error('加载草稿失败:', error)
        }
      }
    },
    
    clearDraft() {
      localStorage.removeItem('forum_draft')
    },
    
    closePostModal() {
      this.showPostModal = false
      this.newPost = { cat: this.current, title: '', brief: '' }
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

/* 热门话题区域 */
.hot-topics-section {
  margin-bottom: 32px;
}

.section-title {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
}

.hot-topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.hot-topic-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}

.hot-topic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: #2563eb;
}

.topic-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.topic-info {
  flex: 1;
}

.topic-title {
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.topic-desc {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.topic-stats {
  display: flex;
  gap: 16px;
}

.stat {
  color: #9ca3af;
  font-size: 0.8rem;
  font-weight: 500;
}

/* 论坛主区域 */
.forum-main {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.forum-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.forum-header h1 {
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.publish-btn {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.3);
}

/* 分类标签 */
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #e2e8f0;
  padding: 8px 0;
  margin-bottom: 20px;
}

/* 排序区域 */
.sort-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.sort-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.tab {
  padding: 8px 16px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab:hover {
  background: #e5e7eb;
  color: #374151;
}

.tab.active {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
}

/* 帖子列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.post-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-header {
  margin-bottom: 12px;
}

.post-title {
  color: #1f2937;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.post-title:hover {
  color: #2563eb;
}

.post-brief {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.post-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 0.8rem;
  color: #9ca3af;
}

.post-author {
  color: #2563eb;
  font-weight: 500;
}

.post-category {
  background: #e0e7ff;
  color: #3730a3;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.post-tags {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* 帖子操作按钮 */
.post-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  color: #6b7280;
}

.action-btn:hover {
  background: #f9fafb;
  transform: translateY(-1px);
}

.action-btn.active {
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

.comment-btn:hover {
  background: #e0f2fe;
  border-color: #0ea5e9;
  color: #0ea5e9;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-size: 0.8rem;
}

/* 表单样式 */
.form-col { display: grid; gap: 10px; }
.form-col input, .form-col textarea, .form-col select { 
  width: 100%; 
  padding: 8px 10px; 
  border: 1px solid #e5e7eb; 
  border-radius: 6px; 
  transition: border-color 0.2s ease;
}
.form-col input:focus, .form-col textarea:focus, .form-col select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.dialog-actions { display: flex; gap: 8px; justify-content: flex-end; }
.dialog-actions .ghost { background: #f3f4f6; border: 1px solid #e5e7eb; }

/* 草稿提示样式 */
.draft-info {
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  margin: 8px 0;
}

.draft-text {
  color: #0369a1;
  font-size: 12px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page {
    width: 95%;
    padding: 12px;
  }
  
  
  
  .post-actions {
    flex-wrap: wrap;
  }
  
  .action-btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}
</style>




