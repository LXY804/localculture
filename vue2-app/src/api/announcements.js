import http from './http'

export function getAnnouncements(role = 'user') {
  return http.get('/announcements', { params: { role } })
}


