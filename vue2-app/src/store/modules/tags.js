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
  ADD_TAG(state, tag) {
    state.list.push(tag)
  },
  UPDATE_TAG(state, tag) {
    const index = state.list.findIndex(item => item.id === tag.id)
    if (index > -1) {
      state.list.splice(index, 1, tag)
    }
  },
  DELETE_TAG(state, id) {
    const index = state.list.findIndex(item => item.id === id)
    if (index > -1) {
      state.list.splice(index, 1)
    }
  }
}

const actions = {
  async fetchTags({ commit }) {
    commit('SET_LOADING', true)
    try {
      // 模拟API调用
      const mockData = [
        { id: 1, name: '保护', description: '文化保护相关', color: '#409EFF', count: 25 },
        { id: 2, name: '传承', description: '文化传承相关', color: '#67C23A', count: 18 },
        { id: 3, name: '创新', description: '创新发展相关', color: '#E6A23C', count: 12 },
        { id: 4, name: '历史', description: '历史文化相关', color: '#F56C6C', count: 20 },
        { id: 5, name: '艺术', description: '艺术创作相关', color: '#909399', count: 15 },
        { id: 6, name: '教育', description: '文化教育相关', color: '#C0C4CC', count: 8 },
        { id: 7, name: '节庆', description: '节庆活动相关', color: '#FF6B6B', count: 10 },
        { id: 8, name: '技艺', description: '传统技艺相关', color: '#4ECDC4', count: 14 }
      ]
      setTimeout(() => {
        commit('SET_LIST', mockData)
        commit('SET_LOADING', false)
      }, 300)
    } catch (error) {
      commit('SET_LOADING', false)
    }
  },
  
  async createTag({ commit }, tagData) {
    const newTag = {
      id: Date.now(),
      ...tagData,
      count: 0,
      createTime: new Date().toLocaleString()
    }
    commit('ADD_TAG', newTag)
    return newTag
  },
  
  async updateTag({ commit }, tagData) {
    commit('UPDATE_TAG', tagData)
    return tagData
  },
  
  async deleteTag({ commit }, id) {
    commit('DELETE_TAG', id)
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
