import { 
  getUserList, 
  getUserDetail, 
  createUser as createUserAPI, 
  updateUser as updateUserAPI, 
  deleteUser as deleteUserAPI, 
  updateUserStatus as updateUserStatusAPI 
} from '@/api/users'

const state = {
  list: [],
  detail: null,
  roles: ['admin', 'editor', 'user'],
  permissions: {
    admin: ['all'],
    editor: ['articles:read', 'articles:write', 'announcements:read', 'announcements:write'],
    user: ['articles:read', 'profile:read', 'profile:write']
  },
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
  ADD_USER(state, user) {
    state.list.unshift(user)
  },
  UPDATE_USER(state, user) {
    const index = state.list.findIndex(item => item.id === user.id)
    if (index > -1) {
      state.list.splice(index, 1, user)
    }
  },
  DELETE_USER(state, id) {
    const index = state.list.findIndex(item => item.id === id)
    if (index > -1) {
      state.list.splice(index, 1)
    }
  }
}

const actions = {
  async fetchUsers({ commit }, params = {}) {
    commit('SET_LOADING', true)
    try {
      const res = await getUserList(params)
      const data = res.data.data || res.data || []
      commit('SET_LIST', data)
      commit('SET_PAGINATION', {
        total: res.data.total || data.length,
        current: res.data.page || params.page || 1,
        pageSize: res.data.pageSize || params.pageSize || 20
      })
    } catch (error) {
      console.error('获取用户列表失败:', error)
      commit('SET_LIST', [])
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async fetchUserDetail({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      const res = await getUserDetail(id)
      commit('SET_DETAIL', res.data)
      return res.data
    } catch (error) {
      console.error('获取用户详情失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async createUser({ commit, dispatch }, userData) {
    commit('SET_LOADING', true)
    try {
      const res = await createUserAPI(userData)
      // 重新获取列表以保持数据同步
      await dispatch('fetchUsers')
      return res.data
    } catch (error) {
      console.error('创建用户失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async updateUser({ commit, dispatch }, userData) {
    commit('SET_LOADING', true)
    try {
      const { id, ...data } = userData
      const res = await updateUserAPI(id, data)
      commit('UPDATE_USER', res.data)
      // 重新获取列表以保持数据同步
      await dispatch('fetchUsers')
      return res.data
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async deleteUser({ commit, dispatch }, id) {
    commit('SET_LOADING', true)
    try {
      await deleteUserAPI(id)
      commit('DELETE_USER', id)
      // 重新获取列表以保持数据同步
      await dispatch('fetchUsers')
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async updateUserStatus({ commit, dispatch }, { id, status }) {
    commit('SET_LOADING', true)
    try {
      await updateUserStatusAPI(id, status)
      commit('UPDATE_USER', { id, status })
      // 重新获取列表以保持数据同步
      await dispatch('fetchUsers')
    } catch (error) {
      console.error('更新用户状态失败:', error)
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
  roles: state => state.roles,
  permissions: state => state.permissions
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
