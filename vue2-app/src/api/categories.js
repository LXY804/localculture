import http from './http'

// 获取分类列表
export function getCategories() {
  return http.get('/categories')
}

