<template>
  <BaseModal @close="$emit('close')">
    <div class="register-header">
      <h3>注册</h3>
    </div>
    <form class="form" @submit.prevent="onSubmit">
      <input v-model="phone" placeholder="手机号" class="form-input" />
      <input v-model="nickname" placeholder="昵称" class="form-input" />
      <input v-model="password" type="password" placeholder="密码" class="form-input" />
      <div class="verification-section">
        <button type="button" class="get-code-btn" @click="getVerificationCode">获取验证码</button>
        <input v-model="verificationCode" placeholder="验证码" class="verification-input" />
        <button type="submit" class="submit-btn">提交</button>
      </div>
      <button type="button" class="close-btn" @click="$emit('close')">关闭</button>
    </form>
  </BaseModal>
</template>

<script>
import BaseModal from './Modal.vue'

export default {
  name: 'AuthRegisterModal',
  components: { BaseModal },
  data() {
    return { 
      phone: '', 
      nickname: '',
      password: '',
      verificationCode: ''
    }
  },
  methods: {
    async onSubmit() {
      await this.$store.dispatch('registerWithPhone', { 
        phone: this.phone, 
        password: this.password,
        nickname: this.nickname,
        verificationCode: this.verificationCode
      })
      this.$emit('close')
      this.$emit('after-register')
    },
    getVerificationCode() {
      if (!this.phone) {
        alert('请先输入手机号')
        return
      }
      alert('验证码已发送到您的手机')
    }
  }
}
</script>

<style scoped>
.register-header {
  text-align: center;
  margin-bottom: 20px;
}
.register-header h3 {
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

.verification-section {
  display: flex;
  gap: 10px;
  align-items: center;
}

.get-code-btn {
  padding: 8px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.get-code-btn:hover {
  background-color: #e9e9e9;
}

.verification-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.submit-btn {
  padding: 12px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.submit-btn:hover {
  background-color: #369f72;
}

.close-btn {
  padding: 10px 20px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.close-btn:hover {
  background-color: #e9e9e9;
}
</style>



