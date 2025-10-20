<template>
  <div class="system-config-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
    </div>

    <!-- 主体内容 - 左右布局 -->
    <div class="main-content">
      <!-- 左侧导航栏 -->
      <div class="left-nav">
        <el-menu
          :default-active="activeMenu"
          class="nav-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="basic">
            <i class="el-icon-setting"></i>
            <span>基础设置</span>
          </el-menu-item>
          <el-menu-item index="appearance">
            <i class="el-icon-view"></i>
            <span>外观设置</span>
          </el-menu-item>
          <el-menu-item index="notification">
            <i class="el-icon-bell"></i>
            <span>通知设置</span>
          </el-menu-item>
          <el-menu-item index="security">
            <i class="el-icon-lock"></i>
            <span>数据安全</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧内容卡片 -->
      <div class="right-content">
        <el-card class="content-card" shadow="hover">
          <!-- 基础设置 -->
          <div v-if="activeMenu === 'basic'" class="config-section">
            <div class="section-header">
              <h3 class="section-title">基础设置</h3>
              <p class="section-desc">配置系统的基本信息和显示设置</p>
            </div>
            
            <el-form :model="systemConfig" label-width="120px" class="config-form">
              <el-form-item label="系统名称">
                <el-input 
                  v-model="systemConfig.systemName" 
                  placeholder="请输入系统名称"
                  class="form-input"
                />
              </el-form-item>
              
              <el-form-item label="公告显示数量">
                <el-input-number
                  v-model="systemConfig.announcementCount"
                  :min="1"
                  :max="50"
                  placeholder="首页显示公告条数"
                  class="form-input"
                />
              </el-form-item>
              
              <el-form-item label="默认语言">
                <el-select v-model="systemConfig.defaultLanguage" placeholder="请选择默认语言" class="form-input">
                  <el-option label="中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <!-- 外观设置 -->
          <div v-if="activeMenu === 'appearance'" class="config-section">
            <div class="section-header">
              <h3 class="section-title">外观设置</h3>
              <p class="section-desc">自定义系统主题和外观样式</p>
            </div>
            
            <el-form :model="systemConfig" label-width="120px" class="config-form">
              <el-form-item label="主题颜色">
                <div class="color-picker-section">
                  <el-color-picker
                    v-model="systemConfig.themeColor"
                    @change="handleThemeColorChange"
                    class="color-picker"
                  />
                  <span class="color-preview" :style="{ backgroundColor: systemConfig.themeColor }"></span>
                  <span class="color-text">{{ systemConfig.themeColor }}</span>
                </div>
              </el-form-item>
              
              <el-form-item label="暗黑模式">
                <el-switch
                  v-model="systemConfig.darkMode"
                  active-text="开启"
                  inactive-text="关闭"
                  @change="handleDarkModeChange"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 通知设置 -->
          <div v-if="activeMenu === 'notification'" class="config-section">
            <div class="section-header">
              <h3 class="section-title">通知设置</h3>
              <p class="section-desc">配置系统通知和提醒功能</p>
            </div>
            
            <el-form :model="systemConfig" label-width="120px" class="config-form">
              <el-form-item label="公告推送">
                <el-switch
                  v-model="systemConfig.announcementPush"
                  active-text="开启"
                  inactive-text="关闭"
                />
                <span class="help-text">开启后新公告将自动推送通知</span>
              </el-form-item>
              
              <el-form-item label="邮件提醒">
                <el-switch
                  v-model="systemConfig.emailReminder"
                  active-text="开启"
                  inactive-text="关闭"
                />
                <span class="help-text">开启后重要操作将发送邮件提醒</span>
              </el-form-item>
            </el-form>
          </div>

          <!-- 数据安全 -->
          <div v-if="activeMenu === 'security'" class="config-section">
            <div class="section-header">
              <h3 class="section-title">数据安全</h3>
              <p class="section-desc">管理系统数据和缓存</p>
            </div>
            
            <div class="security-actions">
              <div class="action-item">
                <div class="action-info">
                  <h4 class="action-title">数据备份</h4>
                  <p class="action-desc">导出系统数据为JSON文件</p>
                </div>
                <el-button type="primary" @click="handleDataBackup">
                  <i class="el-icon-download"></i>
                  导出数据
                </el-button>
              </div>
              
              <div class="action-item">
                <div class="action-info">
                  <h4 class="action-title">清除缓存</h4>
                  <p class="action-desc">清空本地缓存和临时文件</p>
                </div>
                <el-button type="warning" @click="handleClearCache">
                  <i class="el-icon-delete"></i>
                  清除缓存
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 底部固定操作栏 -->
    <div class="bottom-actions">
      <el-button 
        type="primary" 
        icon="el-icon-check" 
        :loading="saving"
        @click="handleSaveConfig"
        class="save-btn"
      >
        保存设置
      </el-button>
      <el-button 
        icon="el-icon-refresh" 
        @click="confirmReset"
        class="reset-btn"
      >
        恢复默认
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'SystemConfig',
  data() {
    return {
      activeMenu: 'basic',
      saving: false,
      systemConfig: {
        systemName: '本地文化管理系统',
        announcementCount: 10,
        defaultLanguage: 'zh-CN',
        themeColor: '#409EFF',
        darkMode: false,
        announcementPush: true,
        emailReminder: true
      }
    };
  },
  computed: {
    ...mapGetters('settings', ['systemConfiguration'])
  },
  watch: {
    systemConfiguration: {
      handler(newVal) {
        if (newVal) {
          this.systemConfig = { ...this.systemConfig, ...newVal };
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('settings', ['fetchSystemConfig', 'updateSystemConfig']),
    
    handleMenuSelect(index) {
      this.activeMenu = index;
    },
    
    handleThemeColorChange(color) {
      // 主题颜色变更时立即生效
      this.$message.success(`主题颜色已更改为 ${color}`);
      // 这里可以添加实际的主题切换逻辑
      this.applyThemeColor(color);
    },
    
    handleDarkModeChange(value) {
      // 暗黑模式切换时立即生效
      const mode = value ? '暗黑' : '明亮';
      this.$message.success(`已切换到${mode}模式`);
      // 这里可以添加实际的暗黑模式切换逻辑
      this.applyDarkMode(value);
    },
    
    applyThemeColor(color) {
      // 应用主题颜色到CSS变量
      document.documentElement.style.setProperty('--primary-color', color);
      // 保存到localStorage
      localStorage.setItem('theme-color', color);
    },
    
    applyDarkMode(isDark) {
      // 应用暗黑模式
      if (isDark) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
      // 保存到localStorage
      localStorage.setItem('dark-mode', isDark);
    },
    
    handleDataBackup() {
      // 模拟数据备份
      const data = {
        systemConfig: this.systemConfig,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-backup-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.$message.success('数据备份已导出');
    },
    
    handleClearCache() {
      this.$confirm('确定要清除所有缓存吗？此操作不可恢复。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 清除localStorage中的缓存
        const keysToKeep = ['theme-color', 'dark-mode', 'user-token'];
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
          }
        });
        
        // 清除sessionStorage
        sessionStorage.clear();
        
        this.$message.success('缓存已清除');
      }).catch(() => {
        this.$message.info('已取消清除缓存');
      });
    },
    
    async handleSaveConfig() {
      this.saving = true;
      
      try {
        await this.updateSystemConfig(this.systemConfig);
        this.$message.success('配置已保存！');
      } catch (error) {
        this.$message.error('保存失败，请重试');
      } finally {
        this.saving = false;
      }
    },
    
    confirmReset() {
      this.$confirm('确定要恢复默认设置吗？所有自定义配置将被重置。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 重置为默认配置
        this.systemConfig = {
          systemName: '本地文化管理系统',
          announcementCount: 10,
          defaultLanguage: 'zh-CN',
          themeColor: '#409EFF',
          darkMode: false,
          announcementPush: true,
          emailReminder: true
        };
        
        // 应用默认主题
        this.applyThemeColor('#409EFF');
        this.applyDarkMode(false);
        
        this.$message.success('已恢复默认设置');
      }).catch(() => {
        this.$message.info('已取消重置');
      });
    }
  },
  created() {
    this.fetchSystemConfig();
    
    // 从localStorage恢复主题设置
    const savedThemeColor = localStorage.getItem('theme-color');
    const savedDarkMode = localStorage.getItem('dark-mode');
    
    if (savedThemeColor) {
      this.systemConfig.themeColor = savedThemeColor;
      this.applyThemeColor(savedThemeColor);
    }
    
    if (savedDarkMode !== null) {
      this.systemConfig.darkMode = savedDarkMode === 'true';
      this.applyDarkMode(this.systemConfig.darkMode);
    }
  }
};
</script>

<style scoped>
.system-config-container {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 页面标题 */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* 主体内容 - 左右布局 */
.main-content {
  display: flex;
  flex: 1;
  gap: 24px;
  margin-bottom: 24px;
}

/* 左侧导航栏 */
.left-nav {
  width: 240px;
  flex-shrink: 0;
}

.nav-menu {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  background-color: #fff;
}

.nav-menu >>> .el-menu-item {
  height: 56px;
  line-height: 56px;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  transition: all 0.3s ease;
}

.nav-menu >>> .el-menu-item:hover {
  background-color: #f0f9ff;
  color: #409eff;
}

.nav-menu >>> .el-menu-item.is-active {
  background-color: #e6f7ff;
  color: #409eff;
  border-right: 3px solid #409eff;
}

.nav-menu >>> .el-menu-item i {
  margin-right: 12px;
  font-size: 18px;
}

/* 右侧内容卡片 */
.right-content {
  flex: 1;
}

.content-card {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  background-color: #fff;
  min-height: 600px;
}

/* 配置区域 */
.config-section {
  padding: 32px;
}

.section-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.section-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 表单样式 */
.config-form {
  max-width: 600px;
}

.form-input {
  width: 100%;
  border-radius: 8px;
}

/* 颜色选择器区域 */
.color-picker-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.color-picker {
  width: 40px;
  height: 40px;
}

.color-preview {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #e4e7ed;
  display: inline-block;
}

.color-text {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #606266;
  background-color: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
}

/* 帮助文本 */
.help-text {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}

/* 安全操作区域 */
.security-actions {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.action-item:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.action-info {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.action-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 底部固定操作栏 */
.bottom-actions {
  position: sticky;
  bottom: 0;
  background-color: #fff;
  padding: 20px 0;
  border-top: 1px solid #e4e7ed;
  text-align: right;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
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

.reset-btn {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }
  
  .left-nav {
    width: 100%;
  }
  
  .nav-menu {
    display: flex;
    flex-wrap: wrap;
  }
  
  .nav-menu >>> .el-menu-item {
    flex: 1;
    min-width: 120px;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .system-config-container {
    padding: 16px;
  }
  
  .config-section {
    padding: 20px;
  }
  
  .nav-menu >>> .el-menu-item {
    height: 48px;
    line-height: 48px;
    font-size: 14px;
  }
  
  .action-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .bottom-actions {
    text-align: center;
  }
  
  .save-btn,
  .reset-btn {
    width: 100%;
    margin: 4px 0;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .system-config-container {
    background-color: #1a1a1a;
  }
  
  .page-title {
    color: #e4e7ed;
  }
  
  .nav-menu {
    background-color: #2d2d2d;
    border-color: #4c4d4f;
  }
  
  .nav-menu >>> .el-menu-item {
    color: #a8abb2;
  }
  
  .nav-menu >>> .el-menu-item:hover {
    background-color: #3a3a3a;
    color: #409eff;
  }
  
  .nav-menu >>> .el-menu-item.is-active {
    background-color: #3a3a3a;
    color: #409eff;
  }
  
  .content-card {
    background-color: #2d2d2d;
    border-color: #4c4d4f;
  }
  
  .section-title {
    color: #e4e7ed;
  }
  
  .section-desc {
    color: #a8abb2;
  }
  
  .action-item {
    background-color: #3a3a3a;
    border-color: #4c4d4f;
  }
  
  .action-item:hover {
    background-color: #4c4d4f;
  }
  
  .action-title {
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
  
  .bottom-actions {
    background-color: #2d2d2d;
    border-color: #4c4d4f;
  }
}
</style>
