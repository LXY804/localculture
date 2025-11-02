import { getAnnouncements, getAnnouncementDetail, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/api/announcements'

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
    try {
      const res = await getAnnouncementDetail(id)
      commit('SET_DETAIL', res.data)
    } catch (error) {
      console.error('获取公告详情失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async createAnnouncement({ commit, dispatch }, announcementData) {
    commit('SET_LOADING', true)
    try {
      // 处理优先级字段（如果是字符串需要转换为数字）
      const data = {
        ...announcementData,
        priority: announcementData.priority === 'high' ? 1 : (announcementData.priority === 'normal' ? 0 : (announcementData.priority || 0))
      }
      const res = await createAnnouncement(data)
      // 重新获取列表以保持数据同步
      await dispatch('fetchAnnouncements')
      return res.data
    } catch (error) {
      console.error('创建公告失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async updateAnnouncement({ commit, dispatch }, announcementData) {
    commit('SET_LOADING', true)
    try {
      const { id, ...data } = announcementData
      // 处理优先级字段
      if (data.priority !== undefined) {
        data.priority = data.priority === 'high' ? 1 : (data.priority === 'normal' ? 0 : data.priority)
      }
      const res = await updateAnnouncement(id, data)
      // 重新获取列表以保持数据同步
      await dispatch('fetchAnnouncements')
      return res.data
    } catch (error) {
      console.error('更新公告失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async deleteAnnouncement({ commit, dispatch }, id) {
    commit('SET_LOADING', true)
    try {
      await deleteAnnouncement(id)
      commit('DELETE_ANNOUNCEMENT', id)
      // 重新获取列表以保持数据同步
      await dispatch('fetchAnnouncements')
    } catch (error) {
      console.error('删除公告失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
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
