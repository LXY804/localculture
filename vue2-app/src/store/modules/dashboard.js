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
  async fetchDashboardData({ commit }) {
    // 模拟API调用
    const mockData = {
      stats: {
        totalAnnouncements: 15,
        totalArticles: 128,
        totalUsers: 256,
        dailyVisits: 1240
      },
      charts: {
        announcementTrends: [
          { date: '2024-01-01', count: 2 },
          { date: '2024-01-02', count: 3 },
          { date: '2024-01-03', count: 1 },
          { date: '2024-01-04', count: 4 },
          { date: '2024-01-05', count: 2 },
          { date: '2024-01-06', count: 3 },
          { date: '2024-01-07', count: 1 }
        ],
        userGrowth: [
          { date: '2024-01-01', count: 10 },
          { date: '2024-01-02', count: 15 },
          { date: '2024-01-03', count: 12 },
          { date: '2024-01-04', count: 18 },
          { date: '2024-01-05', count: 22 },
          { date: '2024-01-06', count: 25 },
          { date: '2024-01-07', count: 28 }
        ],
        readingRankings: [
          { title: '传统文化保护的重要性', views: 1250 },
          { title: '地方民俗节庆活动', views: 980 },
          { title: '传统手工艺传承', views: 856 },
          { title: '古建筑保护与修复', views: 743 },
          { title: '传统音乐与舞蹈', views: 692 }
        ],
        systemStatus: [
          { name: 'CPU使用率', value: 45 },
          { name: '内存使用率', value: 62 },
          { name: '磁盘使用率', value: 38 },
          { name: '网络带宽', value: 23 }
        ]
      },
      notifications: [
        {
          id: 1,
          type: 'info',
          title: '系统维护通知',
          content: '系统将于今晚22:00-24:00进行维护升级',
          time: '2024-01-07 14:30'
        },
        {
          id: 2,
          type: 'warning',
          title: '存储空间不足',
          content: '系统存储空间使用率已达到80%，请及时清理',
          time: '2024-01-07 10:15'
        },
        {
          id: 3,
          type: 'success',
          title: '新用户注册',
          content: '今日新增用户15人，较昨日增长25%',
          time: '2024-01-07 09:45'
        }
      ],
      todos: [
        {
          id: 1,
          title: '审核待发布文章',
          count: 5,
          type: 'articles'
        },
        {
          id: 2,
          title: '处理用户反馈',
          count: 3,
          type: 'users'
        },
        {
          id: 3,
          title: '更新系统公告',
          count: 2,
          type: 'announcements'
        }
      ]
    }
    
    commit('SET_STATS', mockData.stats)
    commit('SET_CHARTS', mockData.charts)
    commit('SET_NOTIFICATIONS', mockData.notifications)
    commit('SET_TODOS', mockData.todos)
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
