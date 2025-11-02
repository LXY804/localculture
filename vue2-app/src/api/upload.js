import http from './http'

// 头像上传
export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('avatar', file)
  
  return http.post('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

