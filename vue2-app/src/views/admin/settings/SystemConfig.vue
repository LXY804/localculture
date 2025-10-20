<template>
  <div class="system-config-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>系统配置</span>
      </div>
      
      <el-form :model="systemConfig" label-width="120px" class="config-form">
        <el-form-item label="网站名称">
          <el-input v-model="systemConfig.websiteName" placeholder="请输入网站名称"></el-input>
        </el-form-item>
        
        <el-form-item label="网站Logo">
          <el-input v-model="systemConfig.logo" placeholder="请输入Logo URL">
            <template slot="append">
              <el-button @click="handleUploadLogo">上传</el-button>
            </template>
          </el-input>
          <div v-if="systemConfig.logo" class="logo-preview">
            <img :src="systemConfig.logo" alt="Logo预览" style="max-width: 100px; max-height: 60px;">
          </div>
        </el-form-item>
        
        <el-form-item label="ICP备案号">
          <el-input v-model="systemConfig.icp" placeholder="请输入ICP备案号"></el-input>
        </el-form-item>
        
        <el-form-item label="外部链接">
          <div v-for="(link, index) in systemConfig.externalLinks" :key="index" class="link-item">
            <el-input v-model="link.name" placeholder="链接名称" style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="link.url" placeholder="链接地址" style="width: 300px; margin-right: 10px;"></el-input>
            <el-button type="danger" size="mini" @click="removeLink(index)">删除</el-button>
          </div>
          <el-button type="primary" size="mini" @click="addLink">添加链接</el-button>
        </el-form-item>
        
        <el-form-item label="功能模块">
          <el-checkbox-group v-model="enabledFeatures">
            <el-checkbox label="announcement">公告管理</el-checkbox>
            <el-checkbox label="article">文章管理</el-checkbox>
            <el-checkbox label="user">用户管理</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSaveConfig">保存配置</el-button>
          <el-button @click="handleResetConfig">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'SystemConfig',
  data() {
    return {
      enabledFeatures: []
    };
  },
  computed: {
    ...mapGetters('settings', ['systemConfiguration']),
    systemConfig() {
      return this.systemConfiguration;
    }
  },
  watch: {
    systemConfig: {
      handler(newVal) {
        if (newVal && newVal.features) {
          this.enabledFeatures = Object.keys(newVal.features).filter(key => newVal.features[key]);
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('settings', ['fetchSystemConfig', 'updateSystemConfig']),
    
    handleUploadLogo() {
      this.$message.info('Logo上传功能待实现');
    },
    
    addLink() {
      this.systemConfig.externalLinks.push({ name: '', url: '' });
    },
    
    removeLink(index) {
      this.systemConfig.externalLinks.splice(index, 1);
    },
    
    async handleSaveConfig() {
      const config = {
        ...this.systemConfig,
        features: {
          announcement: this.enabledFeatures.includes('announcement'),
          article: this.enabledFeatures.includes('article'),
          user: this.enabledFeatures.includes('user')
        }
      };
      
      try {
        await this.updateSystemConfig(config);
        this.$message.success('系统配置保存成功！');
      } catch (error) {
        this.$message.error('保存失败，请重试');
      }
    },
    
    handleResetConfig() {
      this.$confirm('确定要重置所有配置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fetchSystemConfig();
        this.$message.success('配置已重置');
      });
    }
  },
  created() {
    this.fetchSystemConfig();
  }
};
</script>

<style scoped>
.system-config-container {
  padding: 20px;
}

.config-form {
  max-width: 800px;
}

.logo-preview {
  margin-top: 10px;
}

.link-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
</style>
