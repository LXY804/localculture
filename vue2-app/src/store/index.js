import Vue from 'vue'
import Vuex from 'vuex'

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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', token || '')
        localStorage.setItem('userProfile', profile ? JSON.stringify(profile) : '')
      }
    },
    clearAuth(state) {
      state.authToken = null
      state.userProfile = null
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
    toggleLike({ commit }, articleId) {
      commit('toggleLike', articleId)
    },
    toggleFavorite({ commit }, articleId) {
      commit('toggleFavorite', articleId)
    },
    addComment({ commit }, { articleId, content }) {
      const comment = {
        id: 'comment-' + Date.now(),
        articleId,
        content,
        date: new Date().toISOString(),
        author: this.getters.username || '匿名用户'
      }
      commit('addComment', comment)
      // 发送评论通知给文章作者（若非自己）
      try {
        const articlesModule = require('@/data/articles').default
        const article = (articlesModule || []).find(a => a.id === articleId)
        const targetAuthor = article && article.author
        const actor = this.getters.username || '匿名用户'
        if (targetAuthor && targetAuthor !== actor) {
          commit('addNotification', {
            id: 'ntf-' + Date.now(),
            type: 'comment',
            targetType: 'article',
            actor,
            articleId,
            date: new Date().toISOString(),
            excerpt: content.slice(0, 60)
          })
        }
      } catch(e) { /* 忽略本地数据读取失败 */ }
      return comment
    },
    toggleCommentLike({ commit, getters }, { commentId, articleId, commentAuthor }) {
      commit('toggleCommentLike', commentId)
      const actor = getters.username || '匿名用户'
      if (commentAuthor && commentAuthor !== actor) {
        commit('addNotification', {
          id: 'ntf-' + Date.now(),
          type: 'like',
          targetType: 'comment',
          actor,
          articleId,
          commentId,
          date: new Date().toISOString(),
          excerpt: ''
        })
      }
    },
  },
  modules: {},
})



