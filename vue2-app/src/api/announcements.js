import http from './http'

// 获取公告列表
export function getAnnouncements(role = 'user') {
  return http.get('/announcements', { params: { role } })
}

// 获取公告详情
export function getAnnouncementDetail(id) {
  return http.get(`/announcements/${id}`)
}

// 创建公告
export function createAnnouncement(data) {
  return http.post('/announcements', data)
}

// 更新公告
export function updateAnnouncement(id, data) {
  return http.put(`/announcements/${id}`, data)
}

// 删除公告
export function deleteAnnouncement(id) {
  return http.delete(`/announcements/${id}`)
}

