<template>
  <div class="page">
    <h1>注册</h1>
    <form class="form" @submit.prevent="onSubmit">
      <label>
        手机号
        <input v-model="phone" placeholder="11位手机号" />
      </label>
      <label>
        设置密码
        <input v-model="password" type="password" placeholder="密码" />
      </label>
      <button type="submit">注册</button>
      <router-link class="link" :to="{ name: 'login' }">已有账号？去登录</router-link>
    </form>
  </div>
  
</template>

<script>
export default {
  name: 'RegisterPage',
  data() {
    return { phone: '', password: '' }
  },
  methods: {
    async onSubmit() {
      await this.$store.dispatch('registerWithPhone', { phone: this.phone, password: this.password })
      this.$router.replace({ name: 'login' })
    }
  }
}
</script>

<style scoped>
.page { padding: 24px; }
.form { display: flex; flex-direction: column; gap: 12px; max-width: 320px; }
.link { margin-left: 8px; }
</style>


