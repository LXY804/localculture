import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

import Home from '@/views/Home.vue'
import Articles from '@/views/Articles.vue'
import ArticleDetail from '@/views/ArticleDetail.vue'
import Forum from '@/views/Forum.vue'
import ForumPostDetail from '@/views/ForumPostDetail.vue'
import Announcements from '@/views/Announcements.vue'
import Profile from '@/views/Profile.vue'
import Admin from '@/views/Admin.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'

Vue.use(Router)

const router = new Router({
  mode: 'hash',
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/articles', name: 'articles', component: Articles },
    { path: '/articles/:id', name: 'article-detail', component: ArticleDetail, props: true },
    { path: '/forum', name: 'forum', component: Forum },
    { path: '/forum/:id', name: 'forum-post-detail', component: ForumPostDetail, props: true },
    { path: '/announcements', name: 'announcements', component: Announcements },
    { path: '/profile', name: 'profile', component: Profile, meta: { requiresAuth: true, roles: ['user','admin'] } },
    { path: '/admin', name: 'admin', component: Admin, meta: { requiresAuth: true, roles: ['admin'] } },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPassword },
  ],
})

// 路由守卫：基于登录与角色访问控制
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(r => r.meta && r.meta.requiresAuth)
  const allowedRoles = to.matched.reduce((acc, r) => (r.meta && r.meta.roles) ? acc.concat(r.meta.roles) : acc, [])
  const isAuthed = store.getters.isAuthenticated
  const role = store.getters.currentRole

  if (!requiresAuth) {
    return next()
  }

  if (!isAuthed) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return next({ name: 'home' })
  }

  next()
})

export default router


