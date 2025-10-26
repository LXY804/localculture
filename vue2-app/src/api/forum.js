import axios from 'axios'

// 获取用户论坛点赞列表
export const getUserForumLikes = (page = 1, limit = 10) => {
  const token = localStorage.getItem('authToken')
  return axios.get(`http://localhost:3001/api/user/forum/likes?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 获取用户论坛收藏列表
export const getUserForumFavorites = (page = 1, limit = 10) => {
  const token = localStorage.getItem('authToken')
  return axios.get(`http://localhost:3001/api/user/forum/favorites?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 获取用户论坛评论列表
export const getUserForumComments = (page = 1, limit = 10) => {
  const token = localStorage.getItem('authToken')
  return axios.get(`http://localhost:3001/api/user/forum/comments?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

