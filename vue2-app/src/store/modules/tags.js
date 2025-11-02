import { getTags } from '@/api/tags'

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
      const res = await getTags()
      const data = Array.isArray(res.data) ? res.data : []
      commit('SET_LIST', data)
    } catch (error) {
      console.error('获取标签列表失败:', error)
      commit('SET_LIST', [])
    } finally {
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
