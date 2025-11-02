import Vue from 'vue'
import Vuex from 'vuex'
import dashboard from './modules/dashboard'
import announcements from './modules/announcements'
import articles from './modules/articles'
import users from './modules/users'
import settings from './modules/settings'
import user from './modules/user'
import categories from './modules/categories'
import tags from './modules/tags'

Vue.use(Vuex)

// 从本地存储恢复初始状态
let persistedToken = null
let persistedProfile = null
let persistedUserActivities = null
let persistedNotifications = null
if (typeof localStorage !== 'undefined') {
  const t = localStorage.getItem('authToken')
  const p = localStorage.getItem('userProfile')
  const a = localStorage.getItem('userActivities')
  const n = localStorage.getItem('notifications')
  persistedToken = t || null
  persistedProfile = p ? JSON.parse(p) : null
  persistedUserActivities = a ? JSON.parse(a) : null
  persistedNotifications = n ? JSON.parse(n) : null
}

// 简化的本地认证与角色状态（演示用）
export default new Vuex.Store({
  state: {
    authToken: persistedToken,
    userProfile: persistedProfile, // { id, username, role: 'user' | 'admin' }
    userActivities: persistedUserActivities || {
      likes: [], // 点赞的文章ID列表
      favorites: [], // 收藏的文章ID列表
      comments: [], // 评论列表 { id, articleId, content, date, author }
      commentLikes: [], // 被点赞的评论ID（仅本地记录，不计入“我的点赞”）
    },
    notifications: persistedNotifications || [], // { id, type:'like'|'comment', targetType:'article'|'comment', actor, articleId, commentId?, date, excerpt }
  },
  getters: {
    isAuthenticated: (state) => !!state.authToken,
    currentRole: (state) => (state.userProfile && state.userProfile.role) || 'guest',
    username: (state) => (state.userProfile && state.userProfile.username) || '',
    userProfile: (state) => state.userProfile,
    displayName: (state) => {
      if (!state.userProfile) return '匿名用户'
      return state.userProfile.nickname || state.userProfile.phone || state.userProfile.username || '匿名用户'
    },
    userActivities: (state) => state.userActivities,
    isLiked: (state) => (articleId) => state.userActivities.likes.includes(articleId),
    isFavorited: (state) => (articleId) => state.userActivities.favorites.includes(articleId),
    getCommentsByArticle: (state) => (articleId) => state.userActivities.comments.filter(c => c.articleId === articleId),
    isCommentLiked: (state) => (commentId) => state.userActivities.commentLikes.includes(commentId),
    notifications: (state) => state.notifications,
  },
  mutations: {
    setAuth(state, { token, profile }) {
      state.authToken = token
      state.userProfile = profile
      // 同步角色到 user 模块
      this.commit('user/setRole', (profile && profile.role) || 'user')
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', token || '')
        localStorage.setItem('userProfile', profile ? JSON.stringify(profile) : '')
      }
    },
    SET_USER_PROFILE(state, profile) {
      state.userProfile = profile
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('userProfile', profile ? JSON.stringify(profile) : '')
      }
    },
    clearAuth(state) {
      state.authToken = null
      state.userProfile = null
      this.commit('user/setRole', 'user')
      state.userActivities = { likes: [], favorites: [], comments: [], commentLikes: [] }
      state.notifications = []
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userProfile')
        localStorage.removeItem('userActivities')
        localStorage.removeItem('notifications')
      }
    },
    toggleLike(state, articleId) {
      const index = state.userActivities.likes.indexOf(articleId)
      if (index > -1) {
        state.userActivities.likes.splice(index, 1)
      } else {
        state.userActivities.likes.push(articleId)
      }
      this.commit('saveUserActivities')
    },
    toggleFavorite(state, articleId) {
      const index = state.userActivities.favorites.indexOf(articleId)
      if (index > -1) {
        state.userActivities.favorites.splice(index, 1)
      } else {
        state.userActivities.favorites.push(articleId)
      }
      this.commit('saveUserActivities')
    },
    addComment(state, comment) {
      state.userActivities.comments.push(comment)
      this.commit('saveUserActivities')
    },
    toggleCommentLike(state, commentId) {
      const idx = state.userActivities.commentLikes.indexOf(commentId)
      if (idx > -1) state.userActivities.commentLikes.splice(idx, 1)
      else state.userActivities.commentLikes.push(commentId)
      this.commit('saveUserActivities')
    },
    addNotification(state, notification) {
      state.notifications.unshift(notification)
      this.commit('saveNotifications')
    },
    saveUserActivities(state) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('userActivities', JSON.stringify(state.userActivities))
      }
    },
    saveNotifications(state) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('notifications', JSON.stringify(state.notifications))
      }
    },
  },
  actions: {
    async loginWithPassword({ commit }, { username, password }) {
      try {
        console.log('Vuex: 开始登录请求', { username })
        const { login } = await import('@/api/users')
        console.log('Vuex: 导入API成功')
        
        const response = await login({ username, password })
        console.log('Vuex: 收到响应', response)
        
        if (response.data.success) {
          const { token, user } = response.data
          console.log('Vuex: 登录成功，用户信息:', user)
          
          // 保存到 localStorage
          localStorage.setItem('authToken', token)
          localStorage.setItem('userProfile', JSON.stringify(user))
          
          // 更新 Vuex state
          commit('setAuth', { token, profile: user })
          
          return { success: true, role: user.role }
        } else {
          console.error('Vuex: 登录失败，服务器返回:', response.data)
          throw new Error(response.data.message || '登录失败')
        }
      } catch (error) {
        console.error('Vuex: 登录异常:', error)
        console.error('Vuex: 错误详情:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        })
        throw error
      }
    },
    
    async registerWithPhone({ commit }, { username, nickname, phone, password }) {
      try {
        const { register } = await import('@/api/users')
        const response = await register({ username, nickname, phone, password })
        
        if (response.data.success) {
          const { token, user } = response.data
          
          // 保存到 localStorage
          localStorage.setItem('authToken', token)
          localStorage.setItem('userProfile', JSON.stringify(user))
          
          // 更新 Vuex state
          commit('setAuth', { token, profile: user })
          
          return { success: true, role: user.role }
        } else {
          throw new Error(response.data.message || '注册失败')
        }
      } catch (error) {
        console.error('注册失败:', error)
        throw error
      }
    },
    async resetPasswordBySms(context, { phone, code, newPassword }) {
      void context; void phone; void code; void newPassword;
      return true
    },
    async logout({ commit }) {
      // 清除 localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('userProfile')
      
      // 清除 Vuex state
      commit('clearAuth')
      
      // 跳转到首页
      if (typeof window !== 'undefined') {
        window.location.href = '/home'
      }
    },
    toggleLike({ commit }, articleId) {
      commit('toggleLike', articleId)
    },
    toggleFavorite({ commit }, articleId) {
      commit('toggleFavorite', articleId)
    },
    addComment({ commit }, { articleId, content, parentCommentId = null, targetType, targetAuthor }) {
      const comment = {
        id: 'comment-' + Date.now(),
        articleId,
        content,
        date: new Date().toISOString(),
        author: this.getters.displayName,
        parentCommentId
      }
      commit('addComment', comment)
      // 发送评论通知给目标作者（若非自己）
      try {
        const actor = this.getters.displayName
        const resolvedTargetAuthor = targetAuthor
        const resolvedTargetType = targetType || 'article'
        if (resolvedTargetAuthor && resolvedTargetAuthor !== actor) {
          commit('addNotification', {
            id: 'ntf-' + Date.now(),
            type: 'comment',
            targetType: resolvedTargetType,
            actor,
            articleId,
            date: new Date().toISOString(),
            excerpt: content.slice(0, 60)
          })
        }
      } catch(e) { /* 忽略 */ }
      return comment
    },
    toggleCommentLike({ commit, getters }, { commentId, articleId, commentAuthor, targetType = 'article' }) {
      commit('toggleCommentLike', commentId)
      const actor = getters.username || '匿名用户'
      if (commentAuthor && commentAuthor !== actor) {
        commit('addNotification', {
          id: 'ntf-' + Date.now(),
          type: 'like',
          targetType: targetType === 'forum' ? 'forum-comment' : 'comment',
          actor,
          articleId,
          commentId,
          date: new Date().toISOString(),
          excerpt: ''
        })
      }
    },
  },
  modules: {
    dashboard,
    announcements,
    articles,
    users,
    settings,
    user,
    categories,
    tags
  },
})



