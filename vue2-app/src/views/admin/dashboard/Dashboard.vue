<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 数据概览卡片 -->
      <el-col :span="6" v-for="(stat, index) in statsCards" :key="index">
        <el-card class="stat-card" :class="stat.type">
          <div class="stat-content">
            <div class="stat-icon">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 图表分析区 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>公告发布趋势</span>
          </div>
          <div ref="announcementChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>用户增长趋势</span>
          </div>
          <div ref="userChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 阅读排行榜 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>文章阅读排行榜</span>
          </div>
          <div ref="readingChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <!-- 系统状态 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>系统状态监控</span>
          </div>
          <div ref="systemChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 通知公告区 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>最新通知</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="viewAllNotifications">查看全部</el-button>
          </div>
          <div class="notification-list">
            <div v-for="notification in notifications" :key="notification.id" class="notification-item">
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-desc">{{ notification.content }}</div>
                <div class="notification-time">{{ notification.time }}</div>
              </div>
              <el-button type="text" @click="removeNotification(notification.id)">删除</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <!-- 待办事项 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>待办事项</span>
          </div>
          <div class="todo-list">
            <div v-for="todo in todos" :key="todo.id" class="todo-item" @click="handleTodoClick(todo)">
              <div class="todo-content">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-count">{{ todo.count }} 项待处理</div>
              </div>
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Dashboard',
  data() {
    return {
      announcementChart: null,
      userChart: null,
      readingChart: null,
      systemChart: null
    }
  },
  computed: {
    stats() {
      return this.$store.getters['dashboard/stats']
    },
    charts() {
      return this.$store.getters['dashboard/charts']
    },
    notifications() {
      return this.$store.getters['dashboard/notifications']
    },
    todos() {
      return this.$store.getters['dashboard/todos']
    },
    statsCards() {
      return [
        {
          type: 'announcements',
          icon: 'el-icon-bell',
          label: '总公告数',
          value: this.stats.totalAnnouncements
        },
        {
          type: 'articles',
          icon: 'el-icon-document',
          label: '总文章数',
          value: this.stats.totalArticles
        },
        {
          type: 'users',
          icon: 'el-icon-user',
          label: '总用户数',
          value: this.stats.totalUsers
        },
        {
          type: 'visits',
          icon: 'el-icon-view',
          label: '今日访问',
          value: this.stats.dailyVisits
        }
      ]
    }
  },
  mounted() {
    this.fetchData().then(() => {
      this.$nextTick(() => {
        this.initCharts()
      })
    })
  },
  watch: {
    // 监听数据变化，更新图表
    'charts.userGrowth'(newVal) {
      if (this.userChart && newVal && newVal.length > 0) {
        this.updateUserChart()
      }
    },
    'charts.announcementTrends'(newVal) {
      if (this.announcementChart && newVal && newVal.length > 0) {
        this.updateAnnouncementChart()
      }
    },
    'stats.totalUsers'() {
      // 当用户数更新时，可能需要重新获取增长趋势
      if (this.$store.state.user?.currentUser?.role === 'admin') {
        this.$store.dispatch('dashboard/fetchDashboardData')
      }
    }
  },
  methods: {
    async fetchData() {
      await this.$store.dispatch('dashboard/fetchDashboardData')
    },
    initCharts() {
      this.initAnnouncementChart()
      this.initUserChart()
      this.initReadingChart()
      this.initSystemChart()
    },
    initAnnouncementChart() {
      if (!this.$refs.announcementChart) return
      this.announcementChart = echarts.init(this.$refs.announcementChart)
      this.updateAnnouncementChart()
    },
    updateAnnouncementChart() {
      if (!this.announcementChart) return
      
      const trends = this.charts.announcementTrends || []
      const dates = trends.map(item => item.date || '')
      const counts = trends.map(item => parseInt(item.count) || 0)
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: dates
        },
        yAxis: {
          type: 'value',
          minInterval: 1
        },
        series: [{
          data: counts,
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#409EFF'
          }
        }]
      }
      this.announcementChart.setOption(option, true)
    },
    initUserChart() {
      if (!this.$refs.userChart) return
      this.userChart = echarts.init(this.$refs.userChart)
      this.updateUserChart()
    },
    updateUserChart() {
      if (!this.userChart) return
      
      const userGrowthData = this.charts.userGrowth || []
      const dates = userGrowthData.map(item => item.date || '')
      const counts = userGrowthData.map(item => parseInt(item.count) || 0)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const param = params[0]
            return `${param.name}<br/>用户数: ${param.value}`
          }
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            rotate: 45,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          minInterval: 1
        },
        series: [{
          name: '用户数',
          data: counts,
          type: 'bar',
          itemStyle: {
            color: '#67C23A'
          },
          label: {
            show: true,
            position: 'top'
          }
        }]
      }
      this.userChart.setOption(option, true)
    },
    initReadingChart() {
      this.readingChart = echarts.init(this.$refs.readingChart)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: this.charts.readingRankings.map(item => item.title)
        },
        series: [{
          data: this.charts.readingRankings.map(item => item.views),
          type: 'bar',
          itemStyle: {
            color: '#E6A23C'
          }
        }]
      }
      this.readingChart.setOption(option)
    },
    initSystemChart() {
      this.systemChart = echarts.init(this.$refs.systemChart)
      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'pie',
          radius: '50%',
          data: this.charts.systemStatus.map(item => ({
            value: item.value,
            name: item.name
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
      this.systemChart.setOption(option)
    },
    viewAllNotifications() {
      this.$message.info('跳转到通知管理页面')
    },
    removeNotification(id) {
      this.$store.dispatch('dashboard/removeNotification', id)
    },
    handleTodoClick(todo) {
      switch (todo.type) {
        case 'articles':
          this.$router.push('/admin/articles')
          break
        case 'users':
          this.$router.push('/admin/users')
          break
        case 'announcements':
          this.$router.push('/admin/announcements')
          break
        default:
          this.$message.info(`跳转到${todo.title}页面`)
      }
    }
  },
  beforeDestroy() {
    if (this.announcementChart) {
      this.announcementChart.dispose()
    }
    if (this.userChart) {
      this.userChart.dispose()
    }
    if (this.readingChart) {
      this.readingChart.dispose()
    }
    if (this.systemChart) {
      this.systemChart.dispose()
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 40px;
  margin-right: 15px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.stat-card.announcements .stat-icon {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
  color: white;
}

.stat-card.articles .stat-icon {
  background: linear-gradient(135deg, #67C23A, #85CE61);
  color: white;
}

.stat-card.users .stat-icon {
  background: linear-gradient(135deg, #E6A23C, #EEBE77);
  color: white;
}

.stat-card.visits .stat-icon {
  background: linear-gradient(135deg, #F56C6C, #F78989);
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #EBEEF5;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.notification-desc {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #C0C4CC;
}

.todo-list {
  max-height: 300px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.todo-item:hover {
  background-color: #F5F7FA;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.todo-count {
  font-size: 12px;
  color: #909399;
}
</style>
