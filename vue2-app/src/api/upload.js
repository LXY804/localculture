import http from './http'

// 头像上传 - 使用 'file' 作为字段名，与 Element UI 保持一致
export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return http.post('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

