import http from './http'

// 用户注册
export function register(userData) {
  return http.post('/auth/register', userData)
}

// 用户登录
export function login(credentials) {
  return http.post('/auth/login', credentials)
}

// 获取当前用户信息
export function getProfile() {
  return http.get('/auth/profile')
}

// 更新用户信息
export function updateProfile(userData) {
  return http.put('/auth/profile', userData)
}

// 修改密码
export function changePassword(passwordData) {
  return http.put('/auth/password', passwordData)
}

// 验证 token
export function verifyToken() {
  return http.get('/auth/verify')
}



