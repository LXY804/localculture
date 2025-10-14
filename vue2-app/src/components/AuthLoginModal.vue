<template>
  <BaseModal @close="$emit('close')">
    <div class="login-header">
      <h3>登录</h3>
    </div>
    <form class="form" @submit.prevent="onSubmit">
      <input v-model="phone" placeholder="手机号" class="form-input" />
      <input v-model="password" type="password" placeholder="密码" class="form-input" />
      <div class="actions">
        <button type="submit" class="submit-btn">登录</button>
        <button type="button" class="linklike" @click="$emit('go-register')">去注册</button>
        <button type="button" class="linklike" @click="$emit('go-forgot')">忘记密码</button>
      </div>
    </form>
  </BaseModal>
</template>

<script>
import BaseModal from './Modal.vue'

export default {
  name: 'AuthLoginModal',
  components: { BaseModal },
  data() {
    return { phone: '', password: '' }
  },
  methods: {
    async onSubmit() {
      await this.$store.dispatch('loginWithPassword', { phone: this.phone, password: this.password })
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.login-header {
  text-align: center;
  margin-bottom: 20px;
}
.login-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.form-input:focus {
  border-color: #42b983;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.submit-btn {
  padding: 12px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
}

.submit-btn:hover {
  background-color: #369f72;
}

.linklike {
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  padding: 5px 0;
  font-size: 14px;
}

.linklike:hover {
  text-decoration: underline;
}
</style>



