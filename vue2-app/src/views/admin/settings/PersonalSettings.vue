<template>
  <div class="personal-settings-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">个人设置 / 个人资料</h2>
      <p class="page-subtitle">管理您的个人信息和安全设置</p>
    </div>

    <!-- 基本信息 -->
    <el-card class="settings-card" shadow="hover">
      <div slot="header" class="card-header">
        <h3 class="section-title">基本信息</h3>
      </div>
      
      <el-form :model="profile" :rules="rules" ref="profileForm" label-width="120px" class="profile-form">
        <el-form-item label="头像" prop="avatar">
          <div class="avatar-upload-section">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="handleAvatarUpload"
            >
              <div class="avatar-preview">
                <img v-if="profile.avatar" :src="profile.avatar" class="avatar-image" alt="头像">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </div>
            </el-upload>
            <div class="avatar-actions">
              <el-button type="text" @click="handleUploadAvatar" class="upload-btn">更换头像</el-button>
              <el-button v-if="profile.avatar" type="text" @click="removeAvatar" class="remove-btn">移除</el-button>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="profile.username" 
            placeholder="请输入用户名"
            class="form-input"
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="profile.email" 
            placeholder="请输入邮箱"
            class="form-input"
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="profile.phone" 
            placeholder="请输入手机号"
            class="form-input"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 安全设置 -->
    <el-card class="settings-card" shadow="hover">
      <div slot="header" class="card-header">
        <h3 class="section-title">安全设置</h3>
      </div>
      
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="120px" class="password-form">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            placeholder="请输入当前密码"
            class="form-input"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码"
            class="form-input"
            show-password
          />
          <div class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrengthClass"
                :style="{ width: passwordStrength + '%' }"
              ></div>
            </div>
            <span class="strength-text">{{ passwordStrengthText }}</span>
          </div>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            class="form-input"
            show-password
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 登录安全 -->
    <el-card class="settings-card" shadow="hover">
      <div slot="header" class="card-header">
        <h3 class="section-title">登录安全</h3>
      </div>
      
      <div class="security-settings">
        <div class="security-item">
          <div class="security-info">
            <h4 class="security-title">双重验证</h4>
            <p class="security-desc">开启后登录需要验证码验证</p>
          </div>
          <el-switch 
            v-model="profile.twoFactorAuth" 
            active-text="开启" 
            inactive-text="关闭"
            @change="handleTwoFactorChange"
          />
        </div>
        
        <div class="login-records">
          <h4 class="records-title">最近登录记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in loginRecords"
              :key="index"
              :timestamp="formatDate(record.timestamp)"
              :type="record.type"
            >
              <div class="login-record">
                <div class="record-info">
                  <span class="record-ip">{{ record.ip }}</span>
                  <span class="record-location">{{ record.location }}</span>
                </div>
                <div class="record-device">{{ record.device }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-card>

    <!-- 操作按钮区 -->
    <div class="action-buttons">
      <el-button 
        type="primary" 
        icon="el-icon-check" 
        :loading="saving"
        @click="handleSaveChanges"
        class="save-btn"
      >
        保存修改
      </el-button>
      <el-button 
        icon="el-icon-refresh-left" 
        @click="handleCancel"
        class="cancel-btn"
      >
        取消返回
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'PersonalSettings',
  data() {
    return {
      saving: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      loginRecords: [
        {
          timestamp: '2024-01-15 14:30:25',
          ip: '192.168.1.100',
          location: '北京市',
          device: 'Chrome 浏览器',
          type: 'success'
        },
        {
          timestamp: '2024-01-14 09:15:42',
          ip: '192.168.1.101',
          location: '上海市',
          device: 'Safari 浏览器',
          type: 'success'
        },
        {
          timestamp: '2024-01-13 16:45:18',
          ip: '192.168.1.102',
          location: '广州市',
          device: 'Firefox 浏览器',
          type: 'warning'
        }
      ],
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入当前密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    ...mapGetters('settings', ['personalProfile']),
    profile() {
      return this.personalProfile || {
        username: '',
        email: '',
        phone: '',
        avatar: '',
        twoFactorAuth: false
      };
    },
    passwordStrength() {
      const password = this.passwordForm.newPassword;
      if (!password) return 0;
      
      let strength = 0;
      if (password.length >= 6) strength += 20;
      if (password.length >= 8) strength += 20;
      if (/[a-z]/.test(password)) strength += 20;
      if (/[A-Z]/.test(password)) strength += 20;
      if (/[0-9]/.test(password)) strength += 10;
      if (/[^A-Za-z0-9]/.test(password)) strength += 10;
      
      return Math.min(strength, 100);
    },
    passwordStrengthClass() {
      const strength = this.passwordStrength;
      if (strength < 40) return 'weak';
      if (strength < 70) return 'medium';
      return 'strong';
    },
    passwordStrengthText() {
      const strength = this.passwordStrength;
      if (strength < 40) return '弱';
      if (strength < 70) return '中等';
      return '强';
    }
  },
  methods: {
    ...mapActions('settings', ['fetchProfile', 'updateProfile']),
    
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    },
    
    handleAvatarUpload(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profile.avatar = e.target.result;
        this.$message.success('头像上传成功！');
      };
      reader.readAsDataURL(file);
      return false;
    },
    
    handleUploadAvatar() {
      this.$message.info('请点击上方头像区域上传新头像');
    },
    
    removeAvatar() {
      this.profile.avatar = '';
      this.$message.info('头像已移除');
    },
    
    handleTwoFactorChange(value) {
      const action = value ? '开启' : '关闭';
      this.$message.success(`双重验证已${action}`);
    },
    
    async handleSaveChanges() {
      this.saving = true;
      
      try {
        // 验证基本信息表单
        await this.$refs.profileForm.validate();
        
        // 如果密码表单有内容，验证密码表单
        if (this.passwordForm.newPassword) {
          await this.$refs.passwordForm.validate();
        }
        
        // 更新个人资料
        await this.updateProfile(this.profile);
        
        // 如果修改了密码，处理密码更新
        if (this.passwordForm.newPassword) {
          // 这里应该调用密码更新API
          this.$message.success('密码修改成功！');
          this.passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
        }
        
        this.$message.success('个人设置保存成功！');
      } catch (error) {
        this.$message.error('保存失败，请检查输入信息');
      } finally {
        this.saving = false;
      }
    },
    
    handleCancel() {
      this.$confirm('确定要取消修改吗？未保存的更改将丢失。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '继续编辑',
        type: 'warning'
      }).then(() => {
        this.fetchProfile();
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.$message.info('已取消修改');
      });
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    }
  },
  created() {
    this.fetchProfile();
  }
};
</script>

<style scoped>
.personal-settings-container {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 卡片样式 */
.settings-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* 表单样式 */
.profile-form,
.password-form {
  padding: 20px 0;
}

.form-input {
  width: 60%;
  border-radius: 8px;
}

/* 头像上传区域 */
.avatar-upload-section {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.avatar-uploader {
  width: 100px;
  height: 100px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border: 2px dashed #d9d9d9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.avatar-preview:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 24px;
  color: #c0c4cc;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.upload-btn {
  color: #409eff;
  font-size: 14px;
}

.remove-btn {
  color: #f56c6c;
  font-size: 14px;
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 8px;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background-color: #f56c6c;
}

.strength-fill.medium {
  background-color: #e6a23c;
}

.strength-fill.strong {
  background-color: #67c23a;
}

.strength-text {
  font-size: 12px;
  color: #909399;
}

/* 安全设置区域 */
.security-settings {
  padding: 20px 0;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.security-item:last-child {
  border-bottom: none;
}

.security-info {
  flex: 1;
}

.security-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 4px 0;
}

.security-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 登录记录 */
.login-records {
  margin-top: 24px;
}

.records-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 16px 0;
}

.login-record {
  padding: 8px 0;
}

.record-info {
  display: flex;
  gap: 16px;
  margin-bottom: 4px;
}

.record-ip {
  font-weight: 500;
  color: #303133;
}

.record-location {
  color: #909399;
  font-size: 14px;
}

.record-device {
  color: #606266;
  font-size: 14px;
}

/* 操作按钮区 */
.action-buttons {
  text-align: right;
  margin-top: 24px;
  padding: 20px 0;
}

.save-btn {
  margin-right: 12px;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);
}

.cancel-btn {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .personal-settings-container {
    padding: 16px;
  }
  
  .form-input {
    width: 100%;
  }
  
  .avatar-upload-section {
    flex-direction: column;
    align-items: center;
  }
  
  .avatar-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .action-buttons {
    text-align: center;
  }
  
  .save-btn,
  .cancel-btn {
    width: 100%;
    margin: 4px 0;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .personal-settings-container {
    background-color: #1a1a1a;
  }
  
  .page-title {
    color: #e4e7ed;
  }
  
  .page-subtitle {
    color: #a8abb2;
  }
  
  .settings-card {
    background-color: #2d2d2d;
    border-color: #4c4d4f;
  }
  
  .section-title {
    color: #e4e7ed;
  }
  
  .security-title {
    color: #e4e7ed;
  }
  
  .records-title {
    color: #e4e7ed;
  }
  
  .record-ip {
    color: #e4e7ed;
  }
  
  .form-input >>> .el-input__inner {
    background-color: #3a3a3a;
    border-color: #4c4d4f;
    color: #e4e7ed;
  }
  
  .form-input >>> .el-input__inner:focus {
    border-color: #409eff;
  }
  
  .avatar-preview {
    background-color: #3a3a3a;
    border-color: #4c4d4f;
  }
  
  .avatar-preview:hover {
    background-color: #4c4d4f;
  }
}
</style>
