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

// 后台管理页面
import AdminDashboard from '@/views/admin/dashboard/Dashboard.vue'
import AnnouncementList from '@/views/admin/announcements/AnnouncementList.vue'
import ArticleList from '@/views/admin/articles/ArticleList.vue'
import CategoryManagement from '@/views/admin/categories/CategoryManagement.vue'
import TagManagement from '@/views/admin/tags/TagManagement.vue'
import ContentOverview from '@/views/admin/content/ContentOverview.vue'
import UserList from '@/views/admin/users/UserList.vue'
import SystemConfig from '@/views/admin/settings/SystemConfig.vue'
import PersonalSettings from '@/views/admin/settings/PersonalSettings.vue'

Vue.use(Router)

const router = new Router({
  mode: 'hash',
  routes: [
    // 根路径重定向到首页
    { path: '/', redirect: '/home' },
    
    // 前台用户路由
    { path: '/home', name: 'home', component: Home },
    { path: '/articles', name: 'articles', component: Articles },
    { path: '/articles/:id', name: 'article-detail', component: ArticleDetail, props: true },
    { path: '/forum', name: 'forum', component: Forum },
    { path: '/forum/:id', name: 'forum-post-detail', component: ForumPostDetail, props: true },
    { path: '/announcements', name: 'announcements', component: Announcements },
    { path: '/profile', name: 'profile', component: Profile, meta: { requiresAuth: true, roles: ['user','admin'] } },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPassword },
    
    // 后台管理路由
    {
      path: '/admin',
      component: Admin,
      meta: { requiresAuth: true, roles: ['admin'] },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboard },
        { path: 'content', name: 'admin-content', component: ContentOverview },
        { path: 'articles', name: 'admin-articles', component: ArticleList },
        { path: 'announcements', name: 'admin-announcements', component: AnnouncementList },
        { path: 'categories', name: 'admin-categories', component: CategoryManagement },
        { path: 'tags', name: 'admin-tags', component: TagManagement },
        { path: 'users', name: 'admin-users', component: UserList },
        { path: 'settings/system', name: 'admin-settings-system', component: SystemConfig },
        { path: 'settings/profile', name: 'admin-settings-profile', component: PersonalSettings },
        // 其他管理页面路由将在后续添加
      ]
    },
  ],
})

// 路由守卫：基于登录与角色访问控制
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(r => r.meta && r.meta.requiresAuth)
  const allowedRoles = to.matched.reduce((acc, r) => (r.meta && r.meta.roles) ? acc.concat(r.meta.roles) : acc, [])
  const isAuthed = store.getters.isAuthenticated
  const role = store.getters.currentRole

  // 如果访问根路径，根据角色重定向
  if (to.path === '/') {
    if (isAuthed) {
      if (role === 'admin') {
        return next('/admin/dashboard')
      } else {
        return next('/home')
      }
    } else {
      return next('/home')
    }
  }

  // 如果不需要认证，直接通过
  if (!requiresAuth) {
    return next()
  }

  // 如果需要认证但未登录，跳转到登录页
  if (!isAuthed) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // 如果角色不匹配，根据角色重定向到对应首页
  if (allowedRoles.length && !allowedRoles.includes(role)) {
    if (role === 'admin') {
      return next('/admin/dashboard')
    } else {
      return next('/home')
    }
  }

  next()
})

export default router


