<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <img src="/assets/logo.png" alt="Logo" class="logo">
        <span v-if="!sidebarCollapsed" class="logo-text">后台管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="sidebarCollapsed"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/admin/dashboard">
          <i class="el-icon-s-home"></i>
          <span slot="title">仪表盘</span>
        </el-menu-item>
        
        <el-submenu index="content">
          <template slot="title">
            <i class="el-icon-document"></i>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/admin/content">
            <i class="el-icon-data-analysis"></i>
            <span slot="title">内容概览</span>
          </el-menu-item>
          <el-menu-item index="/admin/articles">
            <i class="el-icon-edit-outline"></i>
            <span slot="title">文章管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/announcements">
            <i class="el-icon-bell"></i>
            <span slot="title">公告管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/categories">
            <i class="el-icon-folder"></i>
            <span slot="title">分类管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/tags">
            <i class="el-icon-price-tag"></i>
            <span slot="title">标签管理</span>
          </el-menu-item>
        </el-submenu>
        
        <el-menu-item index="/admin/users">
          <i class="el-icon-user"></i>
          <span slot="title">用户管理</span>
        </el-menu-item>
        
        <el-submenu index="settings">
          <template slot="title">
            <i class="el-icon-setting"></i>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/admin/settings/system">
            <i class="el-icon-s-tools"></i>
            <span slot="title">系统配置</span>
          </el-menu-item>
          <el-menu-item index="/admin/settings/profile">
            <i class="el-icon-user-solid"></i>
            <span slot="title">个人设置</span>
          </el-menu-item>
        </el-submenu>
        
        <el-menu-item index="/home">
          <i class="el-icon-s-home"></i>
          <span slot="title">返回前台</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="header">
        <div class="header-left">
          <el-button
            type="text"
            @click="toggleSidebar"
            class="sidebar-toggle"
          >
            <i :class="sidebarCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
          </el-button>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <img :src="getAvatarUrl(userAvatar)" alt="Avatar" class="user-avatar">
              <span class="username">{{ username }}</span>
              <i class="el-icon-arrow-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
  data() {
    return {
      sidebarCollapsed: false
    }
  },
  computed: {
    activeMenu() {
      return this.$route.path
    },
    username() {
      return this.$store.getters.username || '管理员'
    },
    userAvatar() {
      return this.$store.getters['settings/profile']?.avatar || '/assets/logo.png'
    },
    breadcrumbs() {
      const path = this.$route.path
      const breadcrumbMap = {
        '/admin/dashboard': [{ name: '仪表盘', path: '/admin/dashboard' }],
        '/admin/announcements': [
          { name: '内容管理', path: '/admin/announcements' },
          { name: '公告管理', path: '/admin/announcements' }
        ],
        '/admin/articles': [
          { name: '内容管理', path: '/admin/articles' },
          { name: '文章管理', path: '/admin/articles' }
        ],
        '/admin/users': [{ name: '用户管理', path: '/admin/users' }],
        '/admin/settings/system': [
          { name: '系统设置', path: '/admin/settings' },
          { name: '系统配置', path: '/admin/settings/system' }
        ],
        '/admin/settings/profile': [
          { name: '系统设置', path: '/admin/settings' },
          { name: '个人设置', path: '/admin/settings/profile' }
        ]
      }
      return breadcrumbMap[path] || [{ name: '仪表盘', path: '/admin/dashboard' }]
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    handleCommand(command) {
      switch (command) {
        case 'profile':
          this.$router.push('/admin/settings/profile')
          break
        case 'settings':
          this.$router.push('/admin/settings/system')
          break
        case 'logout':
          this.logout()
          break
      }
    },
    async logout() {
      try {
        await this.$confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$store.dispatch('logout')
        this.$router.push('/')
        this.$message.success('退出成功')
      } catch (error) {
        // 用户取消退出
      }
    },
    getAvatarUrl(avatar) {
      if (!avatar || avatar === '/assets/logo.png') {
        return '/assets/logo.png'
      }
      
      // 如果是完整的URL（http/https），直接返回
      if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
        return avatar
      }
      
      // 如果是data URL（base64），直接返回
      if (avatar.startsWith('data:image')) {
        return avatar
      }
      
      // 如果是相对路径（/uploads/...），需要拼接后端服务器地址
      if (avatar.startsWith('/uploads/')) {
        return `http://localhost:3001${avatar}`
      }
      
      // 其他情况直接返回
      return avatar
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 200px;
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #2b3a4b;
  border-bottom: 1px solid #3a4a5c;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.sidebar-menu {
  border: none;
  background-color: #304156;
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-submenu__title {
  color: #ffffff !important;
  height: 50px;
  line-height: 50px;
}

.sidebar-menu .el-submenu .el-submenu__title {
  color: #ffffff !important;
}

.sidebar-menu .el-submenu .el-submenu__title span {
  color: #ffffff !important;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-submenu__title:hover {
  background-color: #263445;
  color: #fff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #409EFF;
  color: #fff;
}

.sidebar-menu .el-submenu .el-menu-item {
  background-color: #1f2d3d;
  padding-left: 50px;
  color: #ffffff !important;
}

.sidebar-menu .el-submenu .el-menu-item span {
  color: #ffffff !important;
}

.sidebar-menu .el-submenu .el-menu-item:hover {
  background-color: #263445;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.sidebar-toggle {
  font-size: 18px;
  margin-right: 20px;
  color: #606266;
}

.breadcrumb {
  font-size: 14px;
}

.content {
  flex: 1;
  overflow: auto;
  background-color: #f5f5f5;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
  background-color: #f0f0f0;
}

.username {
  margin-right: 8px;
  color: #606266;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
  }
}
</style>
