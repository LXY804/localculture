const state = {
  list: [],
  detail: null,
  roles: ['admin', 'editor', 'user'],
  permissions: {
    admin: ['all'],
    editor: ['articles:read', 'articles:write', 'announcements:read', 'announcements:write'],
    user: ['articles:read', 'profile:read', 'profile:write']
  },
  loading: false,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  }
}

const mutations = {
  SET_LIST(state, list) {
    state.list = list
  },
  SET_DETAIL(state, detail) {
    state.detail = detail
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  },
  ADD_USER(state, user) {
    state.list.unshift(user)
  },
  UPDATE_USER(state, user) {
    const index = state.list.findIndex(item => item.id === user.id)
    if (index > -1) {
      state.list.splice(index, 1, user)
    }
  },
  DELETE_USER(state, id) {
    const index = state.list.findIndex(item => item.id === id)
    if (index > -1) {
      state.list.splice(index, 1)
    }
  }
}

const actions = {
  async fetchUsers({ commit }) {
    commit('SET_LOADING', true)
    
    // 模拟API调用
    const mockData = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        phone: '13800000000',
        role: 'admin',
        status: 'active',
        avatar: '/assets/logo.png',
        createTime: '2024-01-01 00:00:00',
        lastLoginTime: '2024-01-07 14:30:00',
        loginCount: 156,
        profile: {
          realName: '系统管理员',
          gender: 'male',
          birthday: '1990-01-01',
          address: '北京市朝阳区',
          bio: '系统管理员，负责平台日常维护和管理工作'
        }
      },
      {
        id: 2,
        username: 'editor01',
        email: 'editor01@example.com',
        phone: '13800000001',
        role: 'editor',
        status: 'active',
        avatar: '/assets/logo.png',
        createTime: '2024-01-02 10:00:00',
        lastLoginTime: '2024-01-07 09:15:00',
        loginCount: 89,
        profile: {
          realName: '编辑员01',
          gender: 'female',
          birthday: '1992-05-15',
          address: '上海市浦东新区',
          bio: '内容编辑，负责文章审核和发布'
        }
      },
      {
        id: 3,
        username: 'user001',
        email: 'user001@example.com',
        phone: '13800000002',
        role: 'user',
        status: 'active',
        avatar: '/assets/logo.png',
        createTime: '2024-01-03 14:20:00',
        lastLoginTime: '2024-01-06 16:45:00',
        loginCount: 45,
        profile: {
          realName: '普通用户001',
          gender: 'male',
          birthday: '1988-12-10',
          address: '广州市天河区',
          bio: '传统文化爱好者，喜欢阅读和分享相关文章'
        }
      },
      {
        id: 4,
        username: 'user002',
        email: 'user002@example.com',
        phone: '13800000003',
        role: 'user',
        status: 'inactive',
        avatar: '/assets/logo.png',
        createTime: '2024-01-04 11:30:00',
        lastLoginTime: '2024-01-05 08:20:00',
        loginCount: 12,
        profile: {
          realName: '普通用户002',
          gender: 'female',
          birthday: '1995-03-22',
          address: '深圳市南山区',
          bio: '新注册用户，正在探索平台功能'
        }
      }
    ]
    
    setTimeout(() => {
      commit('SET_LIST', mockData)
      commit('SET_PAGINATION', { total: mockData.length })
      commit('SET_LOADING', false)
    }, 500)
  },
  
  async fetchUserDetail({ commit }, id) {
    commit('SET_LOADING', true)
    
    // 模拟API调用
    const mockDetail = {
      id: parseInt(id),
      username: 'admin',
      email: 'admin@example.com',
      phone: '13800000000',
      role: 'admin',
      status: 'active',
      avatar: '/assets/logo.png',
      createTime: '2024-01-01 00:00:00',
      lastLoginTime: '2024-01-07 14:30:00',
      loginCount: 156,
      profile: {
        realName: '系统管理员',
        gender: 'male',
        birthday: '1990-01-01',
        address: '北京市朝阳区',
        bio: '系统管理员，负责平台日常维护和管理工作',
        website: 'https://example.com',
        social: {
          wechat: 'admin_wechat',
          qq: '123456789',
          weibo: '@admin_weibo'
        }
      },
      permissions: ['all'],
      activityLog: [
        {
          id: 1,
          action: '登录系统',
          time: '2024-01-07 14:30:00',
          ip: '192.168.1.100'
        },
        {
          id: 2,
          action: '发布公告',
          time: '2024-01-07 14:25:00',
          ip: '192.168.1.100'
        },
        {
          id: 3,
          action: '审核文章',
          time: '2024-01-07 14:20:00',
          ip: '192.168.1.100'
        }
      ]
    }
    
    setTimeout(() => {
      commit('SET_DETAIL', mockDetail)
      commit('SET_LOADING', false)
    }, 300)
  },
  
  async createUser({ commit }, userData) {
    const newUser = {
      id: Date.now(),
      ...userData,
      createTime: new Date().toLocaleString(),
      lastLoginTime: null,
      loginCount: 0,
      status: 'active'
    }
    
    commit('ADD_USER', newUser)
    return newUser
  },
  
  async updateUser({ commit }, userData) {
    commit('UPDATE_USER', userData)
    return userData
  },
  
  async deleteUser({ commit }, id) {
    commit('DELETE_USER', id)
  },
  
  async updateUserStatus({ commit }, { id, status }) {
    const user = state.list.find(u => u.id === id)
    if (user) {
      const updatedUser = { ...user, status }
      commit('UPDATE_USER', updatedUser)
    }
  }
}

const getters = {
  list: state => state.list,
  detail: state => state.detail,
  loading: state => state.loading,
  pagination: state => state.pagination,
  roles: state => state.roles,
  permissions: state => state.permissions
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
