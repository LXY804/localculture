import http from './http'

// 获取活动列表
export function getActivities(params = {}) {
  return http.get('/activities', { params })
}

// 获取活动详情
export function getActivityDetail(id) {
  return http.get(`/activities/${id}`)
}

// 报名活动
export function registerActivity(id) {
  return http.post(`/activities/${id}/register`)
}

// 取消报名
export function cancelActivity(id) {
  return http.post(`/activities/${id}/cancel`)
}

// 获取用户报名的活动列表
export function getUserActivities(params = {}) {
  return http.get('/user/activities', { params })
}


