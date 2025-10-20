<template>
  <div class="personal-settings-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>个人设置</span>
      </div>
      
      <el-form :model="profile" label-width="120px" class="profile-form">
        <el-form-item label="头像">
          <div class="avatar-section">
            <el-avatar :size="80" :src="profile.avatar" icon="el-icon-user-solid"></el-avatar>
            <el-button type="primary" size="mini" @click="handleUploadAvatar" style="margin-left: 15px;">更换头像</el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="昵称">
          <el-input v-model="profile.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱">
          <el-input v-model="profile.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        
        <el-form-item label="两步验证">
          <el-switch v-model="profile.twoFactorAuth" active-text="开启" inactive-text="关闭"></el-switch>
          <span class="help-text">开启后登录需要验证码</span>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSaveProfile">保存设置</el-button>
          <el-button @click="handleResetProfile">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 操作日志 -->
    <el-card class="box-card" style="margin-top: 20px;">
      <div slot="header" class="clearfix">
        <span>操作日志</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="refreshLogs">刷新</el-button>
      </div>
      
      <el-table :data="operationLogs" style="width: 100%">
        <el-table-column prop="date" label="时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="user" label="用户" width="120"></el-table-column>
        <el-table-column prop="action" label="操作"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'PersonalSettings',
  computed: {
    ...mapGetters('settings', ['personalProfile', 'systemOperationLogs']),
    profile() {
      return this.personalProfile;
    },
    operationLogs() {
      return this.systemOperationLogs;
    }
  },
  methods: {
    ...mapActions('settings', ['fetchProfile', 'updateProfile']),
    
    handleUploadAvatar() {
      this.$message.info('头像上传功能待实现');
    },
    
    async handleSaveProfile() {
      try {
        await this.updateProfile(this.profile);
        this.$message.success('个人设置保存成功！');
      } catch (error) {
        this.$message.error('保存失败，请重试');
      }
    },
    
    handleResetProfile() {
      this.$confirm('确定要重置个人设置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fetchProfile();
        this.$message.success('设置已重置');
      });
    },
    
    refreshLogs() {
      this.$message.info('日志已刷新');
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
  padding: 20px;
}

.profile-form {
  max-width: 600px;
}

.avatar-section {
  display: flex;
  align-items: center;
}

.help-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
</style>
