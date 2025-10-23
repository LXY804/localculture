import axios from 'axios'

const http = axios.create({
  baseURL: process.env.VUE_APP_API_BASE || '/api',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  // 从 localStorage 获取 token
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 如果 token 过期或无效，清除本地存储并跳转到登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userProfile')
      // 如果当前不在登录页，则跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default http


