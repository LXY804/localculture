import axios from 'axios'

export function getArticles(role = 'user') {
  return axios.get(`/mock/articles.json?role=${role}`)
}


