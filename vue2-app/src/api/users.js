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

// ============================================
// 用户管理API（需要管理员权限）
// ============================================

// 获取用户列表
export function getUserList(params) {
  return http.get('/users', { params })
}

// 获取用户详情
export function getUserDetail(id) {
  return http.get(`/users/${id}`)
}

// 创建用户
export function createUser(data) {
  return http.post('/users', data)
}

// 更新用户
export function updateUser(id, data) {
  return http.put(`/users/${id}`, data)
}

// 删除用户
export function deleteUser(id) {
  return http.delete(`/users/${id}`)
}

// 更新用户状态
export function updateUserStatus(id, status) {
  return http.patch(`/users/${id}/status`, { status })
}
