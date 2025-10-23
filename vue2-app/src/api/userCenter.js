import axios from 'axios'

// 获取用户信息
export const getUserProfile = () => {
  const token = localStorage.getItem('authToken')
  return axios.get('http://localhost:3001/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 获取用户收藏的文章
export const getUserFavorites = (page = 1, limit = 10) => {
  const token = localStorage.getItem('authToken')
  return axios.get(`http://localhost:3001/api/user/favorites?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 获取用户点赞的文章
export const getUserLikes = (page = 1, limit = 10) => {
  const token = localStorage.getItem('authToken')
  return axios.get(`http://localhost:3001/api/user/likes?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 获取用户评论
export const getUserComments = (page = 1, limit = 10) => {
  const token = localStorage.getItem('authToken')
  return axios.get(`http://localhost:3001/api/user/comments?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 获取用户发布的帖子
export const getUserPosts = (page = 1, limit = 10) => {
  const token = localStorage.getItem('authToken')
  return axios.get(`http://localhost:3001/api/user/posts?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 发布新帖子
export const createPost = (postData) => {
  const token = localStorage.getItem('authToken')
  return axios.post('http://localhost:3001/api/user/posts', postData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
}



