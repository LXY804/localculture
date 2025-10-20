const state = {
  list: [],
  detail: null,
  categories: ['系统公告', '活动通知', '维护通知', '其他'],
  loading: false,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  }
}

const mutations = {
  SET_LIST(state, list) {
    state.list = list
  },
  SET_DETAIL(state, detail) {
    state.detail = detail
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  },
  ADD_ANNOUNCEMENT(state, announcement) {
    state.list.unshift(announcement)
  },
  UPDATE_ANNOUNCEMENT(state, announcement) {
    const index = state.list.findIndex(item => item.id === announcement.id)
    if (index > -1) {
      state.list.splice(index, 1, announcement)
    }
  },
  DELETE_ANNOUNCEMENT(state, id) {
    const index = state.list.findIndex(item => item.id === id)
    if (index > -1) {
      state.list.splice(index, 1)
    }
  }
}

const actions = {
  async fetchAnnouncements({ commit }) {
    commit('SET_LOADING', true)
    
    // 模拟API调用
    const mockData = [
      {
        id: 1,
        title: '系统维护通知',
        content: '系统将于今晚22:00-24:00进行维护升级，期间可能影响正常使用，请提前做好准备。',
        category: '维护通知',
        status: 'published',
        author: '管理员',
        publishTime: '2024-01-07 14:30:00',
        createTime: '2024-01-07 14:30:00',
        updateTime: '2024-01-07 14:30:00',
        views: 156,
        priority: 'high'
      },
      {
        id: 2,
        title: '春节活动通知',
        content: '为庆祝春节，平台将举办传统文化知识竞赛活动，欢迎大家积极参与。',
        category: '活动通知',
        status: 'published',
        author: '管理员',
        publishTime: '2024-01-05 10:00:00',
        createTime: '2024-01-05 10:00:00',
        updateTime: '2024-01-05 10:00:00',
        views: 234,
        priority: 'normal'
      },
      {
        id: 3,
        title: '用户协议更新',
        content: '平台用户协议已更新，请用户仔细阅读新的条款内容。',
        category: '系统公告',
        status: 'published',
        author: '管理员',
        publishTime: '2024-01-03 16:20:00',
        createTime: '2024-01-03 16:20:00',
        updateTime: '2024-01-03 16:20:00',
        views: 89,
        priority: 'normal'
      },
      {
        id: 4,
        title: '新功能上线',
        content: '平台新增了文章收藏功能，用户可以将喜欢的文章添加到收藏夹。',
        category: '系统公告',
        status: 'draft',
        author: '管理员',
        publishTime: null,
        createTime: '2024-01-06 09:15:00',
        updateTime: '2024-01-06 09:15:00',
        views: 0,
        priority: 'normal'
      }
    ]
    
    setTimeout(() => {
      commit('SET_LIST', mockData)
      commit('SET_PAGINATION', { total: mockData.length })
      commit('SET_LOADING', false)
    }, 500)
  },
  
  async fetchAnnouncementDetail({ commit }, id) {
    commit('SET_LOADING', true)
    
    // 模拟API调用
    const mockDetail = {
      id: parseInt(id),
      title: '系统维护通知',
      content: '系统将于今晚22:00-24:00进行维护升级，期间可能影响正常使用，请提前做好准备。维护内容包括：\n\n1. 数据库优化\n2. 服务器性能提升\n3. 安全补丁更新\n4. 功能模块升级\n\n维护期间如有紧急情况，请联系客服。',
      category: '维护通知',
      status: 'published',
      author: '管理员',
      publishTime: '2024-01-07 14:30:00',
      createTime: '2024-01-07 14:30:00',
      updateTime: '2024-01-07 14:30:00',
      views: 156,
      priority: 'high',
      tags: ['维护', '升级', '通知'],
      attachments: []
    }
    
    setTimeout(() => {
      commit('SET_DETAIL', mockDetail)
      commit('SET_LOADING', false)
    }, 300)
  },
  
  async createAnnouncement({ commit }, announcementData) {
    const newAnnouncement = {
      id: Date.now(),
      ...announcementData,
      author: '管理员',
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
      views: 0
    }
    
    commit('ADD_ANNOUNCEMENT', newAnnouncement)
    return newAnnouncement
  },
  
  async updateAnnouncement({ commit }, announcementData) {
    const updatedAnnouncement = {
      ...announcementData,
      updateTime: new Date().toLocaleString()
    }
    
    commit('UPDATE_ANNOUNCEMENT', updatedAnnouncement)
    return updatedAnnouncement
  },
  
  async deleteAnnouncement({ commit }, id) {
    commit('DELETE_ANNOUNCEMENT', id)
  }
}

const getters = {
  list: state => state.list,
  detail: state => state.detail,
  loading: state => state.loading,
  pagination: state => state.pagination,
  categories: state => state.categories
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
