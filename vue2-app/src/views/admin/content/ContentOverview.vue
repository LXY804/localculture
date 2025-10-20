<template>
  <div class="content-overview">
    <!-- 顶部统计概览 -->
    <div class="overview-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card articles">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="el-icon-document"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.articles.total }}</div>
                <div class="stat-label">总文章</div>
                <div class="stat-trend">
                  <span class="trend-up">+{{ stats.articles.published }}</span>
                  <span>已发布</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card announcements">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="el-icon-bell"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.announcements.total }}</div>
                <div class="stat-label">总公告</div>
                <div class="stat-trend">
                  <span class="trend-up">+{{ stats.announcements.published }}</span>
                  <span>已发布</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card categories">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="el-icon-folder"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.categories.total }}</div>
                <div class="stat-label">分类数</div>
                <div class="stat-trend">
                  <span class="trend-up">+{{ stats.categories.active }}</span>
                  <span>活跃</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card tags">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="el-icon-price-tag"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.tags.total }}</div>
                <div class="stat-label">标签数</div>
                <div class="stat-trend">
                  <span class="trend-up">+{{ stats.tags.popular }}</span>
                  <span>热门</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 内容分布图表 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header" class="card-header">
            <span>内容状态分布</span>
          </div>
          <div ref="statusChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header" class="card-header">
            <span>分类内容统计</span>
          </div>
          <div ref="categoryChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近内容 -->
    <el-row :gutter="20" class="recent-section">
      <el-col :span="12">
        <el-card class="recent-card">
          <div slot="header" class="card-header">
            <span>最近文章</span>
            <el-button type="text" @click="$router.push('/admin/articles')">查看全部</el-button>
          </div>
          <div class="recent-list">
            <div
              v-for="article in recentArticles"
              :key="article.id"
              class="recent-item"
              @click="viewArticle(article)"
            >
              <div class="item-cover">
                <img :src="article.cover || '/assets/default-cover.jpg'" :alt="article.title" />
              </div>
              <div class="item-content">
                <h4 class="item-title">{{ article.title }}</h4>
                <div class="item-meta">
                  <span class="author">{{ article.author }}</span>
                  <span class="date">{{ formatDate(article.publishTime || article.date) }}</span>
                  <el-tag :type="article.status === 'published' ? 'success' : 'info'" size="mini">
                    {{ article.status === 'published' ? '已发布' : '草稿' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="recent-card">
          <div slot="header" class="card-header">
            <span>最近公告</span>
            <el-button type="text" @click="$router.push('/admin/announcements')">查看全部</el-button>
          </div>
          <div class="recent-list">
            <div
              v-for="announcement in recentAnnouncements"
              :key="announcement.id"
              class="recent-item"
              @click="viewAnnouncement(announcement)"
            >
              <div class="item-icon">
                <i class="el-icon-bell"></i>
              </div>
              <div class="item-content">
                <h4 class="item-title">{{ announcement.title }}</h4>
                <div class="item-meta">
                  <span class="author">{{ announcement.author }}</span>
                  <span class="date">{{ formatDate(announcement.publishTime || announcement.date) }}</span>
                  <el-tag :type="announcement.status === 'published' ? 'success' : 'info'" size="mini">
                    {{ announcement.status === 'published' ? '已发布' : '草稿' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-card class="quick-actions">
      <div slot="header" class="card-header">
        <span>快速操作</span>
      </div>
      <div class="action-grid">
        <div class="action-item" @click="$router.push('/admin/articles')">
          <i class="el-icon-edit-outline"></i>
          <span>管理文章</span>
        </div>
        <div class="action-item" @click="$router.push('/admin/announcements')">
          <i class="el-icon-bell"></i>
          <span>管理公告</span>
        </div>
        <div class="action-item" @click="$router.push('/admin/categories')">
          <i class="el-icon-folder"></i>
          <span>管理分类</span>
        </div>
        <div class="action-item" @click="$router.push('/admin/tags')">
          <i class="el-icon-price-tag"></i>
          <span>管理标签</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ContentOverview',
  data() {
    return {
      statusChart: null,
      categoryChart: null
    }
  },
  computed: {
    articles() {
      return this.$store.state.articles.list || []
    },
    announcements() {
      return this.$store.state.announcements.list || []
    },
    categories() {
      return this.$store.state.categories.list || []
    },
    tags() {
      return this.$store.state.tags.list || []
    },
    stats() {
      const articles = this.articles
      const announcements = this.announcements
      const categories = this.categories
      const tags = this.tags

      return {
        articles: {
          total: articles.length,
          published: articles.filter(a => a.status === 'published').length,
          draft: articles.filter(a => a.status === 'draft').length
        },
        announcements: {
          total: announcements.length,
          published: announcements.filter(a => a.status === 'published').length,
          draft: announcements.filter(a => a.status === 'draft').length
        },
        categories: {
          total: categories.length,
          active: categories.filter(c => c.count > 0).length
        },
        tags: {
          total: tags.length,
          popular: tags.filter(t => t.count > 5).length
        }
      }
    },
    recentArticles() {
      return this.articles
        .sort((a, b) => new Date(b.publishTime || b.date) - new Date(a.publishTime || a.date))
        .slice(0, 5)
    },
    recentAnnouncements() {
      return this.announcements
        .sort((a, b) => new Date(b.publishTime || b.date) - new Date(a.publishTime || a.date))
        .slice(0, 5)
    }
  },
  async mounted() {
    await this.fetchData()
    this.$nextTick(() => {
      this.initCharts()
    })
  },
  methods: {
    async fetchData() {
      await Promise.all([
        this.$store.dispatch('articles/fetchArticles'),
        this.$store.dispatch('announcements/fetchAnnouncements'),
        this.$store.dispatch('categories/fetchCategories'),
        this.$store.dispatch('tags/fetchTags')
      ])
    },
    initCharts() {
      this.initStatusChart()
      this.initCategoryChart()
    },
    initStatusChart() {
      const chartDom = this.$refs.statusChart
      this.statusChart = echarts.init(chartDom)
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '内容状态',
            type: 'pie',
            radius: '50%',
            data: [
              { value: this.stats.articles.published, name: '已发布文章' },
              { value: this.stats.articles.draft, name: '草稿文章' },
              { value: this.stats.announcements.published, name: '已发布公告' },
              { value: this.stats.announcements.draft, name: '草稿公告' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      
      this.statusChart.setOption(option)
    },
    initCategoryChart() {
      const chartDom = this.$refs.categoryChart
      this.categoryChart = echarts.init(chartDom)
      
      const categoryData = this.categories.map(cat => ({
        name: cat.name,
        value: cat.count
      }))
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: categoryData.map(item => item.name),
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '内容数量',
            type: 'bar',
            data: categoryData.map(item => item.value),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
            }
          }
        ]
      }
      
      this.categoryChart.setOption(option)
    },
    viewArticle(article) {
      this.$router.push(`/admin/articles/${article.id}`)
    },
    viewAnnouncement(announcement) {
      this.$router.push(`/admin/announcements/${announcement.id}`)
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) return '今天'
      if (days === 1) return '昨天'
      if (days < 7) return `${days}天前`
      
      const p = (n) => String(n).padStart(2, '0')
      return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
    }
  },
  beforeDestroy() {
    if (this.statusChart) {
      this.statusChart.dispose()
    }
    if (this.categoryChart) {
      this.categoryChart.dispose()
    }
  }
}
</script>

<style scoped>
.content-overview {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.overview-stats {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 28px;
  color: white;
}

.stat-card.articles .stat-icon {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
}

.stat-card.announcements .stat-icon {
  background: linear-gradient(135deg, #67C23A, #85CE61);
}

.stat-card.categories .stat-icon {
  background: linear-gradient(135deg, #E6A23C, #EEBE77);
}

.stat-card.tags .stat-icon {
  background: linear-gradient(135deg, #F56C6C, #F78989);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  color: #606266;
}

.trend-up {
  color: #67C23A;
  font-weight: 600;
  margin-right: 5px;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 300px;
}

.recent-section {
  margin-bottom: 20px;
}

.recent-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.recent-list {
  max-height: 400px;
  overflow-y: auto;
}

.recent-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recent-item:hover {
  background: #f8f9fa;
}

.recent-item:last-child {
  border-bottom: none;
}

.item-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 15px;
  flex-shrink: 0;
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: linear-gradient(135deg, #67C23A, #85CE61);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
  color: white;
  font-size: 24px;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #909399;
}

.quick-actions {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #EBEEF5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.action-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409EFF;
}

.action-item i {
  font-size: 32px;
  color: #409EFF;
  margin-bottom: 10px;
}

.action-item span {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
</style>
