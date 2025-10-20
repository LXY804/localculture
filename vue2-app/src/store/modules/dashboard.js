import { getMetrics } from '@/api/metrics'
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
    // 确保基础数据已加载
    if (!rootState.articles || (rootState.articles.list || []).length === 0) {
      await dispatch('articles/fetchArticles', null, { root: true })
    }
    if (!rootState.announcements || (rootState.announcements.list || []).length === 0) {
      await dispatch('announcements/fetchAnnouncements', null, { root: true })
    }

    const articles = (rootState.articles && rootState.articles.list) || []
    const announcements = (rootState.announcements && rootState.announcements.list) || []
    const totalUsers = (rootState.users && rootState.users.list && rootState.users.list.length) || 0
    // 从稳定的指标接口获取今日访问量
    let dailyVisits = state.stats.dailyVisits
    try {
      const m = await getMetrics()
      if (m && m.data && typeof m.data.dailyVisits === 'number') dailyVisits = m.data.dailyVisits
    } catch(e) { /* 网络失败时使用上次值 */ }

    // 统计
    commit('SET_STATS', {
      totalAnnouncements: announcements.length,
      totalArticles: articles.length,
      totalUsers,
      dailyVisits
    })

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

    // 图表：用户增长（示意：最近7天随机）
    const today = new Date()
    const userGrowth = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - idx))
      const p = (n) => String(n).padStart(2, '0')
      return { date: `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`, count: Math.round(5 + Math.random() * 20) }
    })

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
