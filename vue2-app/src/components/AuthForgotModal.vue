<template>
  <BaseModal @close="$emit('close')">
    <h3>找回密码</h3>
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
      <div class="actions">
        <button type="submit">重置密码</button>
        <button type="button" class="linklike" @click="$emit('go-login')">返回登录</button>
      </div>
    </form>
  </BaseModal>
</template>

<script>
import BaseModal from './Modal.vue'

export default {
  name: 'AuthForgotModal',
  components: { BaseModal },
  data() {
    return { phone: '', code: '', newPassword: '' }
  },
  methods: {
    async onSubmit() {
      await this.$store.dispatch('resetPasswordBySms', { phone: this.phone, code: this.code, newPassword: this.newPassword })
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.form { display: flex; flex-direction: column; gap: 12px; }
.actions { display: flex; gap: 12px; align-items: center; }
.linklike { background: none; border: none; color: #42b983; cursor: pointer; padding: 0; }
</style>





