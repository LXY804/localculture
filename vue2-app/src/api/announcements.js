import axios from 'axios'

export function getAnnouncements(role = 'user') {
  return axios.get(`/mock/announcements.json?role=${role}`)
}


