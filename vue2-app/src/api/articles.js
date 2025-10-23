import http from './http'

export function getArticles(role = 'user') {
  return http.get('/articles', { params: { role } })
}

export function getArticleDetail(id) {
  return http.get(`/articles/${id}`)
}

export function createArticle(data) {
  return http.post('/articles', data)
}

export function updateArticle(id, data) {
  return http.put(`/articles/${id}`, data)
}

export function deleteArticle(id) {
  return http.delete(`/articles/${id}`)
}


