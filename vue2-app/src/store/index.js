import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// 从本地存储恢复初始状态
let persistedToken = null
let persistedProfile = null
if (typeof localStorage !== 'undefined') {
  const t = localStorage.getItem('authToken')
  const p = localStorage.getItem('userProfile')
  persistedToken = t || null
  persistedProfile = p ? JSON.parse(p) : null
}

// 简化的本地认证与角色状态（演示用）
export default new Vuex.Store({
  state: {
    authToken: persistedToken,
    userProfile: persistedProfile, // { id, username, role: 'user' | 'admin' }
  },
  getters: {
    isAuthenticated: (state) => !!state.authToken,
    currentRole: (state) => (state.userProfile && state.userProfile.role) || 'guest',
    username: (state) => (state.userProfile && state.userProfile.username) || '',
  },
  mutations: {
    setAuth(state, { token, profile }) {
      state.authToken = token
      state.userProfile = profile
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', token || '')
        localStorage.setItem('userProfile', profile ? JSON.stringify(profile) : '')
      }
    },
    clearAuth(state) {
      state.authToken = null
      state.userProfile = null
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userProfile')
      }
    },
  },
  actions: {
    async loginWithPassword({ commit }, { phone, password }) {
      void password; // 标记参数已使用，避免未使用告警
      // 模拟登录：仅示例，真实应调用后端 API
      const isAdmin = phone === '13800000000'
      const token = 'mock-token-' + Date.now()
      const profile = { id: 'u-' + Date.now(), username: phone, role: isAdmin ? 'admin' : 'user' }
      commit('setAuth', { token, profile })
      return true
    },
    async registerWithPhone(context, { phone, password }) {
      void context; void phone; void password; // 标记参数已使用，避免未使用告警
      return true
    },
    async resetPasswordBySms(context, { phone, code, newPassword }) {
      void context; void phone; void code; void newPassword;
      return true
    },
    async logout({ commit }) {
      commit('clearAuth')
    },
  },
  modules: {},
})



