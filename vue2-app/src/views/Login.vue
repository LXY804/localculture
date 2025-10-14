<template>
  <div class="page">
    <h1>登录</h1>
    <form class="form" @submit.prevent="onSubmit">
      <label>
        手机号
        <input v-model="phone" placeholder="11位手机号" />
      </label>
      <label>
        密码
        <input v-model="password" type="password" placeholder="密码" />
      </label>
      <button type="submit">登录</button>
      <router-link class="link" :to="{ name: 'forgot-password' }">忘记密码？</router-link>
    </form>
  </div>
  
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return { phone: '', password: '' }
  },
  methods: {
    async onSubmit() {
      try {
        await this.$store.dispatch('loginWithPassword', { phone: this.phone, password: this.password })
        const redirect = this.$route.query.redirect || '/'
        this.$router.replace(redirect)
      } catch (e) {
        alert('登录失败')
      }
    }
  }
}
</script>

<style scoped>
.page { padding: 24px; }
.form { display: flex; flex-direction: column; gap: 12px; max-width: 320px; }
.link { margin-left: 8px; }
</style>


