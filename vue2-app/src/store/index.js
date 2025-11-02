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
      commentLikes: [], // 被点赞的评论ID（仅本地记录，不计入"我的点赞"）
      forumLikes: [], // 🆕 论坛帖子点赞ID列表
      forumFavorites: [], // 🆕 论坛帖子收藏ID列表
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
    isForumLiked: (state) => (postId) => state.userActivities.forumLikes.includes(postId),
    isForumFavorited: (state) => (postId) => state.userActivities.forumFavorites.includes(postId),
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
    toggleForumLike(state, postId) {
      if (!state.userActivities.forumLikes) {
        state.userActivities.forumLikes = []
      }
      const index = state.userActivities.forumLikes.indexOf(postId)
      if (index > -1) {
        state.userActivities.forumLikes.splice(index, 1)
      } else {
        state.userActivities.forumLikes.push(postId)
      }
      this.commit('saveUserActivities')
    },
    toggleForumFavorite(state, postId) {
      if (!state.userActivities.forumFavorites) {
        state.userActivities.forumFavorites = []
      }
      const index = state.userActivities.forumFavorites.indexOf(postId)
      if (index > -1) {
        state.userActivities.forumFavorites.splice(index, 1)
      } else {
        state.userActivities.forumFavorites.push(postId)
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
    async loginWithPassword({ commit, dispatch }, { username, password }) {
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
          
          // 🆕 同步用户互动数据（从数据库加载点赞/收藏状态）
          await dispatch('syncUserInteractions')
          
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
    
    async registerWithPhone({ commit, dispatch }, { username, nickname, phone, password }) {
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
          
          // 🆕 同步用户互动数据
          await dispatch('syncUserInteractions')
          
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
    
    // 🆕 从后端同步用户互动状态
    async syncUserInteractions({ commit, state }) {
      if (!state.authToken) {
        console.log('未登录，跳过状态同步')
        return
      }
      
      try {
        console.log('开始同步用户互动状态...')
        const axios = await import('axios')
        const headers = { 'Authorization': `Bearer ${state.authToken}` }
        
        // 并行获取文章和论坛的点赞收藏列表
        const [likesRes, favoritesRes, forumLikesRes, forumFavoritesRes] = await Promise.all([
          axios.default.get('http://localhost:3001/api/user/likes?limit=1000', { headers })
            .catch(err => ({ data: { success: false, error: err.message } })),
          axios.default.get('http://localhost:3001/api/user/favorites?limit=1000', { headers })
            .catch(err => ({ data: { success: false, error: err.message } })),
          axios.default.get('http://localhost:3001/api/user/forum/likes?limit=1000', { headers })
            .catch(err => ({ data: { success: false, error: err.message } })),
          axios.default.get('http://localhost:3001/api/user/forum/favorites?limit=1000', { headers })
            .catch(err => ({ data: { success: false, error: err.message } }))
        ])
        
        if (likesRes.data.success) {
          // 提取文章ID数组
          const likedIds = likesRes.data.data.likes.map(item => item.id)
          state.userActivities.likes = likedIds
          console.log('✅ 文章点赞状态同步成功，共', likedIds.length, '条')
        }
        
        if (favoritesRes.data.success) {
          // 提取文章ID数组
          const favoritedIds = favoritesRes.data.data.favorites.map(item => item.id)
          state.userActivities.favorites = favoritedIds
          console.log('✅ 文章收藏状态同步成功，共', favoritedIds.length, '条')
        }
        
        // 保存论坛数据到独立字段
        if (!state.userActivities.forumLikes) {
          state.userActivities.forumLikes = []
        }
        if (!state.userActivities.forumFavorites) {
          state.userActivities.forumFavorites = []
        }
        
        if (forumLikesRes.data.success) {
          const forumLikedIds = forumLikesRes.data.data.likes.map(item => item.id)
          state.userActivities.forumLikes = forumLikedIds
          console.log('✅ 论坛点赞状态同步成功，共', forumLikedIds.length, '条')
        }
        
        if (forumFavoritesRes.data.success) {
          const forumFavoritedIds = forumFavoritesRes.data.data.favorites.map(item => item.id)
          state.userActivities.forumFavorites = forumFavoritedIds
          console.log('✅ 论坛收藏状态同步成功，共', forumFavoritedIds.length, '条')
        }
        
        // 保存到localStorage
        commit('saveUserActivities')
        console.log('✅ 用户状态已保存到本地')
      } catch (error) {
        console.error('同步用户状态失败:', error)
      }
    },
    async toggleLike({ commit, state }, articleId) {
      // 检查是否登录
      if (!state.authToken) {
        alert('请先登录')
        return
      }
      
      try {
        // 调用后端API
        const axios = await import('axios')
        const response = await axios.default.post(
          `http://localhost:3001/api/articles/${articleId}/like`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${state.authToken}`
            }
          }
        )
        
        if (response.data.success) {
          // 更新本地状态
      commit('toggleLike', articleId)
          return response.data
        }
      } catch (error) {
        console.error('点赞操作失败:', error)
        alert('操作失败：' + (error.response?.data?.message || error.message || '未知错误'))
        throw error
      }
    },
    async toggleFavorite({ commit, state }, articleId) {
      // 检查是否登录
      if (!state.authToken) {
        alert('请先登录')
        return
      }
      
      try {
        // 调用后端API
        const axios = await import('axios')
        const response = await axios.default.post(
          `http://localhost:3001/api/articles/${articleId}/favorite`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${state.authToken}`
            }
          }
        )
        
        if (response.data.success) {
          // 更新本地状态
      commit('toggleFavorite', articleId)
          return response.data
        }
      } catch (error) {
        console.error('收藏操作失败:', error)
        alert('操作失败：' + (error.response?.data?.message || error.message || '未知错误'))
        throw error
      }
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
    
    // 🆕 论坛帖子点赞
    async toggleForumLike({ commit, state }, postId) {
      if (!state.authToken) {
        alert('请先登录')
        return
      }
      
      try {
        const axios = await import('axios')
        const response = await axios.default.post(
          `http://localhost:3001/api/forum/posts/${postId}/like`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${state.authToken}`
            }
          }
        )
        
        if (response.data.success) {
          commit('toggleForumLike', postId)
          return response.data
        }
      } catch (error) {
        console.error('论坛点赞操作失败:', error)
        alert('操作失败：' + (error.response?.data?.message || error.message || '未知错误'))
        throw error
      }
    },
    
    // 🆕 论坛帖子收藏
    async toggleForumFavorite({ commit, state }, postId) {
      if (!state.authToken) {
        alert('请先登录')
        return
      }
      
      try {
        const axios = await import('axios')
        const response = await axios.default.post(
          `http://localhost:3001/api/forum/posts/${postId}/favorite`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${state.authToken}`
            }
          }
        )
        
        if (response.data.success) {
          commit('toggleForumFavorite', postId)
          return response.data
        }
      } catch (error) {
        console.error('论坛收藏操作失败:', error)
        alert('操作失败：' + (error.response?.data?.message || error.message || '未知错误'))
        throw error
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



