import http from './http'

// 获取统计数据
export function getDashboardStats() {
  return http.get('/dashboard/stats')
}

// 获取用户增长趋势
export function getUserGrowth(days = 7) {
  return http.get('/dashboard/user-growth', { params: { days } })
}

