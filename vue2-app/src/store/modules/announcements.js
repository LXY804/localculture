import { getAnnouncements } from '@/api/announcements'

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
  async fetchAnnouncements({ commit, rootGetters }) {
    commit('SET_LOADING', true)
    try {
      const role = rootGetters.currentRole || 'user'
      const res = await getAnnouncements(role)
      let list = Array.isArray(res.data) ? res.data : []
      if (role === 'user') list = list.filter(item => item.status === 'published' || item.visible === true)
      commit('SET_LIST', list)
      commit('SET_PAGINATION', { total: list.length })
    } finally {
      commit('SET_LOADING', false)
    }
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
