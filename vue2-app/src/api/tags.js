import http from './http'

// 获取标签列表
export function getTags() {
  return http.get('/tags')
}

