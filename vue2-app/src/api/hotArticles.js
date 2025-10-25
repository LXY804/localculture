import http from './http'

// 获取热门文章列表
export function getHotArticles(limit = 9) {
  return http.get('/hot-articles', { params: { limit } })
}

// 获取单个热门文章详情
export function getHotArticleDetail(id) {
  return http.get(`/hot-articles/${id}`)
}

