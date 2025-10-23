<template>
  <div class="page">
    <section class="block" aria-label="热门文章">
      <h2>热门文章</h2>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载热门文章...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">加载失败: {{ error }}</p>
        <button @click="fetchHotArticles" class="retry-btn">重试</button>
      </div>
      
      <!-- 热门文章网格 -->
      <div v-else class="hot-grid">
        <div v-for="card in hotGrid" :key="card.id" class="card" @click="openArticle(card)">
          <img :src="card.img" alt="封面" loading="lazy" decoding="async" width="600" height="175" />
          <div class="title" :title="card.title">{{ card.title }}</div>
          <!-- 显示文章统计信息 -->
          <div v-if="card.views !== undefined || card.likes !== undefined" class="card-stats">
            <span v-if="card.views !== undefined" class="stat-item">👁️ {{ card.views }}</span>
            <span v-if="card.likes !== undefined" class="stat-item">👍 {{ card.likes }}</span>
            <span v-if="card.featured" class="featured-badge">精选</span>
          </div>
          
          <!-- 登录后可进行交互的提示 -->
          <div class="card-interaction-hint" v-if="!isLoggedIn">
            <span class="hint-text">登录后可点赞收藏</span>
          </div>
        </div>
      </div>
    </section>
    
    <section class="block">
      <h2>活动预告</h2>
      <ul class="activities">
        <li v-for="(a, i) in activities" :key="i" class="activity-row">
          <div class="activity-info">
            <div class="activity-title">
              <a href="#" @click.prevent="goSearch(a.title)">{{ a.title }}</a>
            </div>
            <div class="activity-meta">{{ a.time }} · {{ a.place }}</div>
          </div>
          <button class="activity-cta" @click.prevent="onSignup(a)">报名</button>
        </li>
      </ul>
    </section>
  </div>
  
</template>

<script>
import { getHotArticles } from '@/api/hotArticles'
import { getActivities, registerActivity } from '@/api/activities'

// 默认封面图片
import cover1 from '@/assets/food1.jpg'
import cover2 from '@/assets/painting.jpg'
import cover3 from '@/assets/festival.jpg'
import cover4 from '@/assets/campus.jpg'
import cover5 from '@/assets/language.jpg'
import cover6 from '@/assets/craft.jpg'
import cover7 from '@/assets/temple.jpg'
import cover8 from '@/assets/museum.jpg'
import cover9 from '@/assets/music.jpg'

const defaultCovers = [cover1, cover2, cover3, cover4, cover5, cover6, cover7, cover8, cover9]

export default {
  name: 'HomePage',
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('authToken')
    },
    hotGridOptimized() {
      // 简单分片渲染：首屏优先（前6条）+ 剩余条目
      // 可结合 v-intersection 进一步懒加载
      return this.hotGrid
    }
  },
  data() {
    return {
      activities: [],
      activitiesLoading: false,
      activitiesError: null,
      // 热门文章数据
      hotGrid: [],
      loading: false,
      error: null
    }
  },
  async created() {
    await Promise.all([
      this.fetchHotArticles(),
      this.fetchActivities()
    ])
  },
  methods: {
    // 获取热门文章
    async fetchHotArticles() {
      this.loading = true
      this.error = null
      
      try {
        const response = await getHotArticles(9)
        if (response.data.success) {
          this.hotGrid = response.data.data.map((article, index) => ({
            id: article.article_id || article.id,
            title: article.title,
            img: this.getArticleCover(article.cover, index),
            summary: article.summary,
            category: article.category,
            author: article.author,
            views: article.views,
            likes: article.likes,
            comments_count: article.comments_count,
            hot_score: article.hot_score,
            featured: article.featured
          }))
        } else {
          throw new Error(response.data.message || '获取热门文章失败')
        }
      } catch (error) {
        console.error('获取热门文章失败:', error)
        this.error = error.message
        // 如果API失败，使用默认数据
        this.hotGrid = this.getDefaultHotArticles()
      } finally {
        this.loading = false
      }
    },
    
    // 获取文章封面图片
    getArticleCover(cover, index) {
      if (cover && cover !== 'null' && cover !== '') {
        // 如果是相对路径，添加服务器地址
        if (cover.startsWith('/')) {
          return `http://localhost:3001${cover}`
        }
        return cover
      }
      // 使用默认封面图片
      return defaultCovers[index % defaultCovers.length]
    },
    
    // 默认热门文章数据（API失败时的备用数据）
    getDefaultHotArticles() {
      return [
        { id: '1', title: '地方传统美食背后的故事', img: cover1 },
        { id: '2', title: '木版年画的传承与创新', img: cover2 },
        { id: '3', title: '民俗节庆与社区凝聚力', img: cover3 },
        { id: 'x4', title: '戏曲进校园的传承实践', img: cover4 },
        { id: 'x5', title: '地方方言里的文化密码', img: cover5 },
        { id: 'x6', title: '传统手工艺的现代设计', img: cover6 },
        { id: 'x7', title: '庙会中的非遗技艺巡礼', img: cover7 },
        { id: 'x8', title: '古建筑修缮与活化利用', img: cover8 },
        { id: 'x9', title: '地方音乐的田野采风', img: cover9 },
      ]
    },
    
    // 获取活动列表
    async fetchActivities() {
      this.activitiesLoading = true
      this.activitiesError = null
      try {
        const response = await getActivities({ limit: 10 })
        if (response.data.success) {
          this.activities = response.data.data.activities.map(activity => ({
            id: activity.id,
            title: activity.title,
            time: this.formatActivityTime(activity.start_time, activity.end_time),
            place: activity.location,
            start_time: activity.start_time,
            end_time: activity.end_time,
            max_participants: activity.max_participants,
            current_participants: activity.current_participants
          }))
        }
      } catch (error) {
        console.error('获取活动列表失败:', error)
        this.activitiesError = error.message
        // 如果API失败，使用默认数据
        this.activities = [
          { id: 1, title: '非遗市集', time: '本周六 10:00-18:00', place: '市文化广场' },
          { id: 2, title: '古琴赏析会', time: '周日 14:00-16:00', place: '市文化馆A厅' },
          { id: 3, title: '书法体验营', time: '周三 09:30-11:30', place: '博物馆二层' },
        ]
      } finally {
        this.activitiesLoading = false
      }
    },
    // 格式化活动时间
    formatActivityTime(startTime, endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const now = new Date()
      
      // 计算相对时间
      const diffDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return `今天 ${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
      } else if (diffDays === 1) {
        return `明天 ${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
      } else if (diffDays <= 7) {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        return `${weekdays[start.getDay()]} ${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
      } else {
        return `${start.getMonth() + 1}月${start.getDate()}日 ${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
      }
    },
    goSearch(keyword) {
      this.$router.push({ name: 'articles', query: { q: keyword } })
    },
    openArticle(card) {
      // 现在所有文章都可以点击查看详情
      this.$router.push({ name: 'article-detail', params: { id: card.id } })
    },
    async onSignup(activity) {
      // 检查是否已登录
      const token = localStorage.getItem('authToken')
      if (!token) {
        alert('请先登录后再报名活动')
        return
      }
      
      try {
        const response = await registerActivity(activity.id)
        if (response.data.success) {
          alert(`报名成功：${activity.title}`)
          // 刷新活动列表以更新参与人数
          await this.fetchActivities()
        } else {
          alert(response.data.message || '报名失败')
        }
      } catch (error) {
        console.error('报名活动失败:', error)
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message)
        } else {
          alert('报名失败，请稍后重试')
        }
      }
    },
  }
}
</script>

<style scoped>
.page { padding: 16px; width: 75%; margin: 0 auto; font-size: 20px; }
.block { margin-bottom: 24px; }
.activities { padding: 0; list-style: none; margin: 0; }
.activity-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f2f5; }
.activity-info { min-width: 0; }
.activity-title a { color: #1f2d3d; text-decoration: none; font-weight: 600; }
.activity-title a:hover { text-decoration: underline; }
.activity-meta { color: #596c7a; font-size: 20px; margin-top: 2px; }
.activity-cta { border: 1px solid #dcdfe6; background: #fff; border-radius: 4px; padding: 4px 10px; cursor: pointer; transition: background-color 120ms ease, border-color 120ms ease; }
.activity-cta:hover { background: #f2f3f5; border-color: #cfd4dc; }

.hot-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 12px;
  row-gap: 23px; /* 原 12px 的 1.9 倍 ≈ 23px，仅增纵向间距 */
}
.card {
  cursor: pointer;
  border: 1px solid #e6e9ef;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  transition: box-shadow 120ms ease, transform 120ms ease;
}
/* Home.vue - style scoped */
.card .thumb {
  width: 100%;
  height: 175px;          /* 原 92px 的 1.9 倍 ≈ 175px */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: block;
}
.card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.06); transform: translateY(-1px); }
.card img { width: 100%; height: 175px; object-fit: cover; display: block; }
.card .title { padding: 15px; font-size: 20px; color: #2c3e50; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 16px;
  font-size: 16px;
}

.retry-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background: #2980b9;
}

/* 文章卡片统计信息样式 */
.card-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-size: 12px;
  color: #6c757d;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.featured-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
}

/* 卡片交互提示样式 */
.card-interaction-hint {
  padding: 6px 15px;
  background: #f8fafc;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.card-interaction-hint .hint-text {
  color: #718096;
  font-size: 11px;
  font-style: italic;
}
</style>


