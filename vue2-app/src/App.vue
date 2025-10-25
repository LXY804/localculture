<template>
  <div id="app">
    <!-- 后台管理布局 -->
    <AdminLayout v-if="isAdminRoute" />
    <!-- 前台布局 -->
    <div v-else>
      <nav class="nav">
        <router-link class="brand" to="/">地方传统文化</router-link>
        <div class="nav-group">
          <router-link class="nav-btn" to="/home">首页</router-link>
          <router-link class="nav-btn" to="/articles">文章</router-link>
          <router-link class="nav-btn" to="/forum">论坛</router-link>
          <router-link class="nav-btn" to="/announcements">公告</router-link>
        </div>
        <form class="search" @submit.prevent="onSearch">
          <div class="search-field">
            <input v-model="searchKeyword" placeholder="搜索文章/帖子/公告" />
            <button type="submit" class="search-btn">搜索</button>
          </div>
        </form>
        
        <!-- 后端管理按钮放在搜索栏后面 -->
        <router-link v-if="role==='admin'" to="/admin" class="admin-link">后端管理</router-link>
        <router-link v-if="isAuthed" to="/profile" class="profile-link">个人中心</router-link>
        <span class="spacer" />
        <template v-if="!isAuthed">
          <span class="auth-group">
            <button class="linklike" @click="openLogin = true">登录</button>
            <button class="linklike" @click="openRegister = true">注册</button>
          </span>
        </template>
        <template v-else>
          <button class="linklike logout-btn" @click="logout">退出</button>
        </template>
      </nav>
      <PageTransition>
        <router-view />
      </PageTransition>
      <AuthLoginModal
        v-if="openLogin"
        @close="openLogin=false"
        @go-register="(openLogin=false, openRegister=true)"
        @go-forgot="(openLogin=false, openForgot=true)"
      />
      <AuthRegisterModal
        v-if="openRegister"
        @close="openRegister=false"
        @go-login="(openRegister=false, openLogin=true)"
        @after-register="openLogin=true"
      />
      <AuthForgotModal
        v-if="openForgot"
        @close="openForgot=false"
        @go-login="(openForgot=false, openLogin=true)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
    AdminLayout: () => import('./components/layout/AdminLayout.vue'),
    AuthLoginModal: () => import('./components/AuthLoginModal.vue'),
    AuthRegisterModal: () => import('./components/AuthRegisterModal.vue'),
    AuthForgotModal: () => import('./components/AuthForgotModal.vue'),
    PageTransition: () => import('./components/PageTransition.vue'),
  },
  computed: {
    isAuthed() { return this.$store.getters.isAuthenticated },
    role() { return this.$store.getters.currentRole },
    username() { return this.$store.getters.username },
    isAdminRoute() {
      return this.$route.path.startsWith('/admin')
    }
  },
  data() {
    return {
      searchKeyword: '',
      openLogin: false,
      openRegister: false,
      openForgot: false,
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch('logout')
      this.$router.replace('/home')
    },
    onSearch() {
      this.$router.push({ name: 'articles', query: { q: this.searchKeyword } })
    }
  }
}
</script>

<style>
html, body { margin: 0; padding: 0; }
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

/* 全局动画效果 */
* {
  transition: all 0.2s ease;
}

/* 按钮悬停效果 */
button, .btn {
  transition: all 0.2s ease;
}

button:hover, .btn:hover {
  transform: translateY(-1px);
}

button:active, .btn:active {
  transform: translateY(0);
}

/* 卡片悬停效果 */
.card, .post-card {
  transition: all 0.3s ease;
}

.card:hover, .post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 链接悬停效果 */
a {
  transition: color 0.2s ease;
}

a:hover {
  color: #2563eb;
}

/* 输入框焦点效果 */
input, textarea, select {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus, textarea:focus, select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* 加载动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

.pulse {
  animation: pulse 2s infinite;
}
.nav {
  display: flex;
  gap: 6px;
  padding: 13px 10px;
  background: linear-gradient(0deg, #f7f9fc 0%, #ffffff 100%);
  border-bottom: 1px solid #e6e9ef;
  font-size: 18px;
/*  transform: scale(0.5);*/
  transform-origin: left center;
  align-items: center; /* 垂直居中，使品牌与首页同高 */
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  position: relative;
}
.brand { font-weight: 100; margin-right: 60px; display: inline-flex; align-items: center; height: 20px; letter-spacing: 0.5px; color: #2b3640; }
.nav a {
  text-decoration: none;
  font-size: 18px;
  display: inline-flex; align-items: center; height: 20px; /* 与品牌同高 */
  color: #2c3e50;
}
.nav-btn {
  min-width: 20px;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
}
.nav-btn:hover { background: #eef5f2; }
.nav-btn:active { background: #e3efe9; }
.nav a.router-link-exact-active.nav-btn { background: #42b983; color: #fff; box-shadow: 0 0 0 1px rgba(66,185,131,0.15) inset; }
.nav-group { display: inline-flex; gap: 100px; }
.search { position: absolute; left: calc(50% + 200px); top: 50%; transform: translate(-50%, -50%); display: inline-flex; gap: 4px; align-items: center; margin-left: 0; }
.admin-link { position: absolute; left: calc(50% + 200px + 200px + 40px); top: 50%; transform: translateY(-50%); margin-left: 0; }
.profile-link { position: absolute; left: calc(50% + 200px + 200px + 130px); top: 50%; transform: translateY(-50%); margin-left: 0; }
.auth-group { display: inline-flex; gap: 6px; transform: translateX(-60px); }
.search-field { position: relative; display: inline-flex; align-items: center; height: 25px; }
.search input { width: 392px; height: 25px; padding: 2px 28px 2px 6px; font-size: 17px; line-height: 21px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; transition: box-shadow 120ms ease, border-color 120ms ease; }
.search-btn { position: absolute; right: 2px; top: 0; bottom: 0; transform: none; height: 25px; line-height: 25px; padding: 0 8px; font-size: 17px; border: none; border-radius: 3px; background: transparent; color: #666; cursor: pointer; transition: background-color 120ms ease, box-shadow 120ms ease, color 120ms ease; }
.search input:focus { outline: none; border-color: #42b983; box-shadow: 0 0 0 2px rgba(66,185,131,0.15); }
.search-btn:hover { background: #eaeaea; }
.search-btn:active { background: #dcdcdc; }
.search-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(66,185,131,0.25); }
.linklike {
  background: none; border: none; color: #42b983; cursor: pointer; padding: 0;
  transition: color 120ms ease; font-size: 18px;
}
.linklike:hover { color: #2ba06d; }
.logout-btn { transform: translateX(-50px); font-size: 18px; }
.spacer { flex: 1; }
</style>
