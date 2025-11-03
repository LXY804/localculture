import { getCategories } from '@/api/categories'

const state = {
  list: [],
  loading: false
}

const mutations = {
  SET_LIST(state, list) {
    state.list = list
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  ADD_CATEGORY(state, category) {
    state.list.push(category)
  },
  UPDATE_CATEGORY(state, category) {
    const index = state.list.findIndex(item => item.id === category.id)
    if (index > -1) {
      state.list.splice(index, 1, category)
    }
  },
  DELETE_CATEGORY(state, id) {
    const index = state.list.findIndex(item => item.id === id)
    if (index > -1) {
      state.list.splice(index, 1)
    }
  }
}

const actions = {
  async fetchCategories({ commit }) {
    commit('SET_LOADING', true)
    try {
      const res = await getCategories()
      const data = Array.isArray(res.data) ? res.data : []
      commit('SET_LIST', data)
    } catch (error) {
      console.error('获取分类列表失败:', error)
      commit('SET_LIST', [])
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async createCategory({ commit }, categoryData) {
    const newCategory = {
      id: Date.now(),
      ...categoryData,
      count: 0,
      createTime: new Date().toLocaleString()
    }
    commit('ADD_CATEGORY', newCategory)
    return newCategory
  },
  
  async updateCategory({ commit }, categoryData) {
    commit('UPDATE_CATEGORY', categoryData)
    return categoryData
  },
  
  async deleteCategory({ commit }, id) {
    commit('DELETE_CATEGORY', id)
  }
}

const getters = {
  list: state => state.list,
  loading: state => state.loading
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
