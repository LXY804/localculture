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
      // 模拟API调用
      const mockData = [
        { id: 1, name: '传统文化', description: '传统文化相关内容', color: '#409EFF', icon: 'el-icon-star-on', sort: 1, count: 15 },
        { id: 2, name: '民俗节庆', description: '民俗节庆活动', color: '#67C23A', icon: 'el-icon-present', sort: 2, count: 8 },
        { id: 3, name: '手工艺', description: '传统手工艺技艺', color: '#E6A23C', icon: 'el-icon-tools', sort: 3, count: 12 },
        { id: 4, name: '古建筑', description: '古建筑保护与修复', color: '#F56C6C', icon: 'el-icon-house', sort: 4, count: 6 },
        { id: 5, name: '音乐舞蹈', description: '传统音乐与舞蹈', color: '#909399', icon: 'el-icon-video-play', sort: 5, count: 4 },
        { id: 6, name: '其他', description: '其他相关内容', color: '#C0C4CC', icon: 'el-icon-more', sort: 6, count: 3 }
      ]
      setTimeout(() => {
        commit('SET_LIST', mockData)
        commit('SET_LOADING', false)
      }, 300)
    } catch (error) {
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
