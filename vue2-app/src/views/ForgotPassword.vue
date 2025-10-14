<template>
  <div class="page">
    <h1>找回密码</h1>
    <form class="form" @submit.prevent="onSubmit">
      <label>
        手机号
        <input v-model="phone" placeholder="11位手机号" />
      </label>
      <label>
        验证码
        <input v-model="code" placeholder="短信验证码" />
      </label>
      <label>
        新密码
        <input v-model="newPassword" type="password" placeholder="新密码" />
      </label>
      <button type="submit">重置密码</button>
      <router-link class="link" :to="{ name: 'login' }">返回登录</router-link>
    </form>
  </div>
  
</template>

<script>
export default {
  name: 'ForgotPasswordPage',
  data() {
    return { phone: '', code: '', newPassword: '' }
  },
  methods: {
    async onSubmit() {
      await this.$store.dispatch('resetPasswordBySms', { phone: this.phone, code: this.code, newPassword: this.newPassword })
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


