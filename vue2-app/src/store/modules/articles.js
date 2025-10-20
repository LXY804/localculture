const state = {
  list: [],
  detail: null,
  categories: ['传统文化', '民俗节庆', '手工艺', '古建筑', '音乐舞蹈', '其他'],
  tags: ['保护', '传承', '创新', '历史', '艺术', '教育'],
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
  ADD_ARTICLE(state, article) {
    state.list.unshift(article)
  },
  UPDATE_ARTICLE(state, article) {
    const index = state.list.findIndex(item => item.id === article.id)
    if (index > -1) {
      state.list.splice(index, 1, article)
    }
  },
  DELETE_ARTICLE(state, id) {
    const index = state.list.findIndex(item => item.id === id)
    if (index > -1) {
      state.list.splice(index, 1)
    }
  }
}

const actions = {
  async fetchArticles({ commit }) {
    commit('SET_LOADING', true)
    
    // 模拟API调用
    const mockData = [
      {
        id: 1,
        title: '传统文化保护的重要性',
        content: '传统文化是一个民族的精神财富，保护传统文化对于维护民族特色、传承历史文明具有重要意义...',
        category: '传统文化',
        tags: ['保护', '传承', '历史'],
        status: 'published',
        author: '张三',
        publishTime: '2024-01-07 10:30:00',
        createTime: '2024-01-07 10:30:00',
        updateTime: '2024-01-07 10:30:00',
        views: 1250,
        likes: 45,
        comments: 12,
        cover: '/assets/craft.jpg'
      },
      {
        id: 2,
        title: '地方民俗节庆活动',
        content: '地方民俗节庆活动是传统文化的重要组成部分，通过节庆活动可以更好地传承和弘扬传统文化...',
        category: '民俗节庆',
        tags: ['节庆', '民俗', '活动'],
        status: 'published',
        author: '李四',
        publishTime: '2024-01-06 15:20:00',
        createTime: '2024-01-06 15:20:00',
        updateTime: '2024-01-06 15:20:00',
        views: 980,
        likes: 32,
        comments: 8,
        cover: '/assets/festival.jpg'
      },
      {
        id: 3,
        title: '传统手工艺传承',
        content: '传统手工艺是劳动人民智慧的结晶，在现代社会中如何传承和发展传统手工艺是一个重要课题...',
        category: '手工艺',
        tags: ['手工艺', '传承', '创新'],
        status: 'published',
        author: '王五',
        publishTime: '2024-01-05 09:15:00',
        createTime: '2024-01-05 09:15:00',
        updateTime: '2024-01-05 09:15:00',
        views: 856,
        likes: 28,
        comments: 15,
        cover: '/assets/craft.jpg'
      },
      {
        id: 4,
        title: '古建筑保护与修复',
        content: '古建筑是历史文化的载体，保护古建筑对于传承历史文化具有重要意义...',
        category: '古建筑',
        tags: ['古建筑', '保护', '修复'],
        status: 'draft',
        author: '赵六',
        publishTime: null,
        createTime: '2024-01-04 14:45:00',
        updateTime: '2024-01-04 14:45:00',
        views: 0,
        likes: 0,
        comments: 0,
        cover: '/assets/temple.jpg'
      }
    ]
    
    setTimeout(() => {
      commit('SET_LIST', mockData)
      commit('SET_PAGINATION', { total: mockData.length })
      commit('SET_LOADING', false)
    }, 500)
  },
  
  async fetchArticleDetail({ commit }, id) {
    commit('SET_LOADING', true)
    
    // 模拟API调用
    const mockDetail = {
      id: parseInt(id),
      title: '传统文化保护的重要性',
      content: '传统文化是一个民族的精神财富，保护传统文化对于维护民族特色、传承历史文明具有重要意义。\n\n## 传统文化的重要性\n\n传统文化承载着一个民族的历史记忆、价值观念和生活方式，是民族认同感的重要来源。通过保护传统文化，我们可以：\n\n1. 维护民族特色\n2. 传承历史文明\n3. 增强文化自信\n4. 促进社会和谐\n\n## 保护措施\n\n为了更好地保护传统文化，我们需要：\n\n- 加强教育宣传\n- 建立保护机制\n- 创新发展方式\n- 国际合作交流\n\n让我们共同努力，为传统文化的传承和发展贡献力量。',
      category: '传统文化',
      tags: ['保护', '传承', '历史'],
      status: 'published',
      author: '张三',
      publishTime: '2024-01-07 10:30:00',
      createTime: '2024-01-07 10:30:00',
      updateTime: '2024-01-07 10:30:00',
      views: 1250,
      likes: 45,
      comments: 12,
      cover: '/assets/craft.jpg',
      seoTitle: '传统文化保护的重要性 - 地方文化平台',
      seoDescription: '探讨传统文化保护的重要意义，分析保护措施和发展方向',
      seoKeywords: '传统文化,保护,传承,历史文明'
    }
    
    setTimeout(() => {
      commit('SET_DETAIL', mockDetail)
      commit('SET_LOADING', false)
    }, 300)
  },
  
  async createArticle({ commit }, articleData) {
    const newArticle = {
      id: Date.now(),
      ...articleData,
      author: '当前用户',
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
      views: 0,
      likes: 0,
      comments: 0
    }
    
    commit('ADD_ARTICLE', newArticle)
    return newArticle
  },
  
  async updateArticle({ commit }, articleData) {
    const updatedArticle = {
      ...articleData,
      updateTime: new Date().toLocaleString()
    }
    
    commit('UPDATE_ARTICLE', updatedArticle)
    return updatedArticle
  },
  
  async deleteArticle({ commit }, id) {
    commit('DELETE_ARTICLE', id)
  }
}

const getters = {
  list: state => state.list,
  detail: state => state.detail,
  loading: state => state.loading,
  pagination: state => state.pagination,
  categories: state => state.categories,
  tags: state => state.tags
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
