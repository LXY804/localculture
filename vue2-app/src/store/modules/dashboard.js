import { getDashboardStats, getUserGrowth } from '@/api/dashboard'

const state = {
  stats: {
    totalAnnouncements: 0,
    totalArticles: 0,
    totalUsers: 0,
    dailyVisits: 0
  },
  charts: {
    announcementTrends: [],
    userGrowth: [],
    readingRankings: [],
    systemStatus: []
  },
  notifications: [],
  todos: []
}

const mutations = {
  SET_STATS(state, stats) {
    state.stats = { ...state.stats, ...stats }
  },
  SET_CHARTS(state, charts) {
    state.charts = { ...state.charts, ...charts }
  },
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications
  },
  SET_TODOS(state, todos) {
    state.todos = todos
  },
  ADD_NOTIFICATION(state, notification) {
    state.notifications.unshift(notification)
  },
  REMOVE_NOTIFICATION(state, id) {
    const index = state.notifications.findIndex(n => n.id === id)
    if (index > -1) {
      state.notifications.splice(index, 1)
    }
  }
}

const actions = {
  async fetchDashboardData({ commit, dispatch, rootState }) {
    // 获取用户信息（从根store获取userProfile）
    const user = rootState.userProfile
    
    try {
      // 从API获取统计数据（如果已登录且是管理员）
      if (user && user.role === 'admin') {
        try {
          const statsRes = await getDashboardStats()
          console.log('Dashboard API原始响应:', statsRes)
          if (statsRes && statsRes.data) {
            console.log('Dashboard API数据:', statsRes.data)
            const updatedStats = {
              totalUsers: parseInt(statsRes.data.totalUsers) || 0,
              totalArticles: parseInt(statsRes.data.totalArticles) || 0,
              totalAnnouncements: parseInt(statsRes.data.totalAnnouncements) || 0,
              dailyVisits: parseInt(statsRes.data.dailyVisits) || 0
            }
            commit('SET_STATS', updatedStats)
            console.log('Dashboard统计已更新:', updatedStats)
          } else {
            console.warn('Dashboard API返回数据格式不正确:', statsRes)
            await dispatch('fetchDashboardDataFallback')
          }
        } catch (error) {
          console.warn('获取统计数据API失败，使用fallback方式:', error)
          // 如果API失败，使用fallback方式
          await dispatch('fetchDashboardDataFallback')
        }
      } else {
        // 非管理员用户，使用fallback方式
        await dispatch('fetchDashboardDataFallback')
      }
    } catch (error) {
      console.error('获取dashboard数据失败:', error)
      // 出错时使用fallback方式
      await dispatch('fetchDashboardDataFallback')
    }

    // 确保基础数据已加载（用于图表和通知）
    if (!rootState.articles || (rootState.articles.list || []).length === 0) {
      await dispatch('articles/fetchArticles', null, { root: true })
    }
    if (!rootState.announcements || (rootState.announcements.list || []).length === 0) {
      await dispatch('announcements/fetchAnnouncements', null, { root: true })
    }

    const articles = (rootState.articles && rootState.articles.list) || []
    const announcements = (rootState.announcements && rootState.announcements.list) || []

    // 图表：公告发布趋势（按日期聚合）
    const fmtDate = (dt) => {
      const d = new Date(dt)
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`
    }
    const trendMap = {}
    announcements.forEach(a => {
      const fallback = a.publishTime || a.date || a.createTime || a.updateTime || new Date().toISOString()
      const key = fmtDate(fallback)
      trendMap[key] = (trendMap[key] || 0) + 1
    })
    const announcementTrends = Object.keys(trendMap).sort().map(date => ({ date, count: trendMap[date] }))

    // 图表：用户增长（从API获取真实数据）
    let userGrowth = []
    if (user && user.role === 'admin') {
      try {
        const growthRes = await getUserGrowth(7)
        if (growthRes && growthRes.data && Array.isArray(growthRes.data) && growthRes.data.length > 0) {
          userGrowth = growthRes.data.map(item => ({
            date: item.date || item.dateStr,
            count: parseInt(item.count) || 0
          }))
        }
      } catch (error) {
        console.warn('获取用户增长趋势失败，使用空数据:', error)
      }
    }
    
    // 如果API失败或数据为空，填充空数据
    if (userGrowth.length === 0) {
      const today = new Date()
      userGrowth = Array.from({ length: 7 }).map((_, idx) => {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - idx))
        const p = (n) => String(n).padStart(2, '0')
        return { 
          date: `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`, 
          count: 0 
        }
      })
    }

    // 图表：阅读排行榜（按 views 降序取前5）
    const readingRankings = [...articles]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(a => ({ title: a.title, views: a.views || 0 }))

    // 系统状态（示意）
    const systemStatus = [
      { name: 'CPU使用率', value: 40 + Math.round(Math.random() * 20) },
      { name: '内存使用率', value: 55 + Math.round(Math.random() * 20) },
      { name: '磁盘使用率', value: 30 + Math.round(Math.random() * 20) },
      { name: '网络带宽', value: 20 + Math.round(Math.random() * 20) }
    ]

    commit('SET_CHARTS', { announcementTrends, userGrowth, readingRankings, systemStatus })

    // 通知与待办（示意，按数据生成）
    const notifications = announcements.slice(0, 3).map((a, i) => ({
      id: i + 1,
      type: 'info',
      title: a.title,
      content: a.content || '',
      time: a.publishTime || a.date || new Date().toLocaleString()
    }))
    const todos = [
      { id: 1, title: '审核待发布文章', count: articles.filter(a => a.status === 'draft').length, type: 'articles' },
      { id: 2, title: '更新系统公告', count: announcements.filter(a => a.status !== 'published').length, type: 'announcements' }
    ]
    commit('SET_NOTIFICATIONS', notifications)
    commit('SET_TODOS', todos)
  },
  
  // Fallback方式：从其他store获取数据计算统计
  async fetchDashboardDataFallback({ commit, dispatch, rootState }) {
    // 确保基础数据已加载
    if (!rootState.articles || (rootState.articles.list || []).length === 0) {
      await dispatch('articles/fetchArticles', null, { root: true })
    }
    if (!rootState.announcements || (rootState.announcements.list || []).length === 0) {
      await dispatch('announcements/fetchAnnouncements', null, { root: true })
    }
    
    // 尝试加载用户列表（如果是管理员）
    const user = rootState.userProfile
    let totalUsers = 0
    let dailyVisits = 0
    
    if (user && user.role === 'admin') {
      try {
        // 尝试从API获取用户总数
        const { getUserList } = require('@/api/users')
        const userRes = await getUserList({ page: 1, pageSize: 1 })
        if (userRes && userRes.data && typeof userRes.data.total === 'number') {
          totalUsers = userRes.data.total
        } else if (rootState.users && rootState.users.list) {
          // 如果API返回格式不对，使用store中的数据
          totalUsers = rootState.users.list.length
        }
      } catch (error) {
        console.warn('获取用户总数失败:', error)
        // 如果API失败，尝试从store获取
        if (rootState.users && rootState.users.list) {
          totalUsers = rootState.users.list.length
        }
      }
      
      // 访问量保持为0或从API获取（避免随机数）
      try {
        const { getDashboardStats } = require('@/api/dashboard')
        const statsRes = await getDashboardStats()
        if (statsRes && statsRes.data) {
          dailyVisits = statsRes.data.dailyVisits || 0
        }
      } catch (error) {
        // 如果获取失败，保持为0
        console.warn('获取访问量失败:', error)
      }
    }

    const articles = (rootState.articles && rootState.articles.list) || []
    const announcements = (rootState.announcements && rootState.announcements.list) || []

    // 统计
    commit('SET_STATS', {
      totalAnnouncements: announcements.length,
      totalArticles: articles.length,
      totalUsers,
      dailyVisits
    })
  },
  
  addNotification({ commit }, notification) {
    const newNotification = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      ...notification
    }
    commit('ADD_NOTIFICATION', newNotification)
  },
  
  removeNotification({ commit }, id) {
    commit('REMOVE_NOTIFICATION', id)
  }
}

const getters = {
  stats: state => state.stats,
  charts: state => state.charts,
  notifications: state => state.notifications,
  todos: state => state.todos
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
