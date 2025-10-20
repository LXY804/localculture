const state = {
  systemConfig: {
    siteName: '地方传统文化平台',
    siteLogo: '/assets/logo.png',
    siteDescription: '致力于保护和传承地方传统文化的综合性平台',
    siteKeywords: '传统文化,地方文化,民俗,手工艺,古建筑',
    icpNumber: '京ICP备12345678号',
    copyright: '© 2024 地方传统文化平台 版权所有',
    contactEmail: 'contact@example.com',
    contactPhone: '400-123-4567',
    address: '北京市朝阳区文化创意产业园',
    socialLinks: {
      wechat: 'https://weixin.qq.com/example',
      weibo: 'https://weibo.com/example',
      qq: 'https://qm.qq.com/example'
    },
    features: {
      enableRegistration: true,
      enableComments: true,
      enableLikes: true,
      enableFavorites: true,
      enableSearch: true,
      enableNotification: true
    },
    theme: {
      primaryColor: '#409EFF',
      secondaryColor: '#67C23A',
      fontFamily: 'Microsoft YaHei, Arial, sans-serif',
      fontSize: 14
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8
    }
  },
  profile: {
    username: 'admin',
    email: 'admin@example.com',
    phone: '13800000000',
    avatar: '/assets/logo.png',
    realName: '系统管理员',
    gender: 'male',
    birthday: '1990-01-01',
    address: '北京市朝阳区',
    bio: '系统管理员，负责平台日常维护和管理工作',
    preferences: {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      theme: 'light',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    }
  },
  operationLogs: [],
  loading: false
}

const mutations = {
  SET_SYSTEM_CONFIG(state, config) {
    state.systemConfig = { ...state.systemConfig, ...config }
  },
  SET_PROFILE(state, profile) {
    state.profile = { ...state.profile, ...profile }
  },
  SET_OPERATION_LOGS(state, logs) {
    state.operationLogs = logs
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  ADD_OPERATION_LOG(state, log) {
    state.operationLogs.unshift(log)
  }
}

const actions = {
  async fetchSystemConfig({ commit }) {
    commit('SET_LOADING', true)
    
    // 模拟API调用
    setTimeout(() => {
      commit('SET_LOADING', false)
    }, 300)
  },
  
  async updateSystemConfig({ commit }, config) {
    commit('SET_SYSTEM_CONFIG', config)
    
    // 记录操作日志
    const log = {
      id: Date.now(),
      action: '更新系统配置',
      operator: 'admin',
      time: new Date().toLocaleString(),
      details: '修改了系统基本配置信息'
    }
    commit('ADD_OPERATION_LOG', log)
  },
  
  async fetchProfile({ commit }) {
    commit('SET_LOADING', true)
    
    // 模拟API调用
    setTimeout(() => {
      commit('SET_LOADING', false)
    }, 300)
  },
  
  async updateProfile({ commit }, profile) {
    commit('SET_PROFILE', profile)
    
    // 记录操作日志
    const log = {
      id: Date.now(),
      action: '更新个人资料',
      operator: 'admin',
      time: new Date().toLocaleString(),
      details: '修改了个人资料信息'
    }
    commit('ADD_OPERATION_LOG', log)
  },
  
  async fetchOperationLogs({ commit }) {
    commit('SET_LOADING', true)
    
    // 模拟API调用
    const mockLogs = [
      {
        id: 1,
        action: '登录系统',
        operator: 'admin',
        time: '2024-01-07 14:30:00',
        ip: '192.168.1.100',
        details: '管理员登录系统'
      },
      {
        id: 2,
        action: '发布公告',
        operator: 'admin',
        time: '2024-01-07 14:25:00',
        ip: '192.168.1.100',
        details: '发布了系统维护通知'
      },
      {
        id: 3,
        action: '审核文章',
        operator: 'admin',
        time: '2024-01-07 14:20:00',
        ip: '192.168.1.100',
        details: '审核通过了文章《传统文化保护的重要性》'
      },
      {
        id: 4,
        action: '用户管理',
        operator: 'admin',
        time: '2024-01-07 14:15:00',
        ip: '192.168.1.100',
        details: '禁用了用户 user002'
      },
      {
        id: 5,
        action: '系统配置',
        operator: 'admin',
        time: '2024-01-07 14:10:00',
        ip: '192.168.1.100',
        details: '更新了系统主题配置'
      }
    ]
    
    setTimeout(() => {
      commit('SET_OPERATION_LOGS', mockLogs)
      commit('SET_LOADING', false)
    }, 500)
  },
  
  async changePassword({ commit }, { oldPassword, newPassword }) {
    // 简单参数校验以满足 ESLint 使用检查
    if (!oldPassword || !newPassword) {
      return { success: false, message: '请输入旧密码和新密码' }
    }

    // 模拟密码修改
    const log = {
      id: Date.now(),
      action: '修改密码',
      operator: 'admin',
      time: new Date().toLocaleString(),
      details: '用户修改了登录密码'
    }
    commit('ADD_OPERATION_LOG', log)
    
    return { success: true, message: '密码修改成功' }
  },
  
  async uploadAvatar({ commit }, avatarUrl) {
    const updatedProfile = { avatar: avatarUrl }
    commit('SET_PROFILE', updatedProfile)
    
    const log = {
      id: Date.now(),
      action: '上传头像',
      operator: 'admin',
      time: new Date().toLocaleString(),
      details: '用户上传了新的头像'
    }
    commit('ADD_OPERATION_LOG', log)
  }
}

const getters = {
  // 原有命名
  systemConfig: state => state.systemConfig,
  profile: state => state.profile,
  operationLogs: state => state.operationLogs,
  loading: state => state.loading,
  // 组件中使用的别名，保持兼容
  systemConfiguration: state => state.systemConfig,
  personalProfile: state => state.profile,
  systemOperationLogs: state => state.operationLogs
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
