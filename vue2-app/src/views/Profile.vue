<template>
  <div class="page">
    <div class="profile-container">
      <!-- 用户基本信息 -->
      <div class="user-info-card">
        <div class="user-avatar">
          <img 
            :src="userInfo.avatar" 
            alt="用户头像" 
            @error="handleAvatarError"
            @load="handleAvatarLoad"
          />
        </div>
        <div class="user-details">
          <h2 class="username">{{ userInfo.username }}</h2>
          <p class="user-id">用户ID: {{ userInfo.id }}</p>
          <p class="join-date">注册时间: {{ userInfo.joinDate }}</p>
          <p class="user-role">角色: {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
        </div>
        <button class="edit-btn" @click="openEditModalHandler">编辑资料</button>
      </div>

      <!-- 功能按钮区域 -->
      <div class="function-buttons">
        <button class="func-btn" @click="showMyCollections">我的收藏 ({{ totalCollections }})</button>
        <button class="func-btn" @click="showMyPosts">我的帖子 ({{ myPosts.length }})</button>
        <button class="func-btn" @click="showMyComments">我的评论 ({{ totalComments }})</button>
        <button class="func-btn" @click="showMyLikes">我的点赞 ({{ totalLikes }})</button>
        <button class="func-btn" @click="showMyActivities">我的活动 ({{ myActivities.length }})</button>
        <button class="func-btn" @click="currentView = 'messages'">消息 ({{ notifications.length }})</button>
        <button class="func-btn" @click="currentView = 'settings'">消息设置</button>
      </div>

      <!-- 内容展示区域 -->
      <div class="content-area">
        <div v-if="loading" class="loading-state">
          <p>加载中...</p>
        </div>
        
        <div v-if="currentView === 'collections'" class="content-section">
          <h3>我的收藏</h3>
          <!-- 类型筛选 -->
          <div class="type-filter">
            <button @click="collectionType = 'all'" :class="{ active: collectionType === 'all' }">全部</button>
            <button @click="collectionType = 'article'" :class="{ active: collectionType === 'article' }">文章</button>
            <button @click="collectionType = 'forum'" :class="{ active: collectionType === 'forum' }">论坛</button>
          </div>
          <div v-if="allCollections.length === 0" class="empty-state">
            <p>暂无收藏内容</p>
          </div>
          <div v-else class="collection-list">
            <div v-for="item in allCollections" :key="item.uniqueId" class="collection-item" @click="goToItem(item)">
              <span class="type-badge" :class="item.type">{{ item.type === 'forum' ? '论坛' : '文章' }}</span>
              <div class="collection-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.summary }}</p>
                <div class="collection-meta">
                  <span class="collection-author">{{ item.type === 'forum' ? '论坛帖子' : '文章' }}</span>
                  <span class="collection-date">{{ formatDate(item.date) }}</span>
                </div>
              </div>
            </div>
            <div v-if="hasMoreCollections" class="load-more-section">
              <button class="load-more-btn" @click="loadMoreCollections">加载更多</button>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'posts'" class="content-section">
          <h3>我的帖子</h3>
          <div v-if="myPosts.length === 0" class="empty-state">
            <p>暂无发布的帖子</p>
          </div>
          <div v-else class="post-list">
            <div v-for="post in myPosts" :key="post.id" class="post-item" @click="goToArticle(post.id)">
              <h4>{{ post.title }}</h4>
              <p>{{ post.summary }}</p>
              <div class="post-meta">
                <span class="post-tag" v-for="tag in post.tags" :key="tag">{{ tag }}</span>
                <span class="post-date">{{ formatDate(post.date) }}</span>
              </div>
            </div>
            <div v-if="pagination.posts.hasMore" class="load-more-section">
              <button class="load-more-btn" @click="loadMorePosts">加载更多</button>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'comments'" class="content-section">
          <h3>我的评论</h3>
          <!-- 类型筛选 -->
          <div class="type-filter">
            <button @click="commentType = 'all'" :class="{ active: commentType === 'all' }">全部</button>
            <button @click="commentType = 'article'" :class="{ active: commentType === 'article' }">文章</button>
            <button @click="commentType = 'forum'" :class="{ active: commentType === 'forum' }">论坛</button>
          </div>
          <div v-if="allComments.length === 0" class="empty-state">
            <p>暂无评论记录</p>
          </div>
          <div v-else class="comment-list">
            <div v-for="comment in allComments" :key="comment.uniqueId" class="comment-item" @click="goToCommentItem(comment)">
              <span class="type-badge" :class="comment.type">{{ comment.type === 'forum' ? '论坛' : '文章' }}</span>
              <h4>{{ comment.articleTitle }}</h4>
              <p class="comment-content">{{ comment.content }}</p>
              <div class="comment-meta">
                <span class="comment-category" v-if="comment.category">{{ comment.category }}</span>
                <span class="comment-date">{{ formatDate(comment.date) }}</span>
              </div>
            </div>
            <div v-if="hasMoreComments" class="load-more-section">
              <button class="load-more-btn" @click="loadMoreComments">加载更多</button>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'likes'" class="content-section">
          <h3>我的点赞</h3>
          <!-- 类型筛选 -->
          <div class="type-filter">
            <button @click="likeType = 'all'" :class="{ active: likeType === 'all' }">全部</button>
            <button @click="likeType = 'article'" :class="{ active: likeType === 'article' }">文章</button>
            <button @click="likeType = 'forum'" :class="{ active: likeType === 'forum' }">论坛</button>
          </div>
          <div v-if="allLikes.length === 0" class="empty-state">
            <p>暂无点赞记录</p>
          </div>
          <div v-else class="like-list">
            <div v-for="like in allLikes" :key="like.uniqueId" class="like-item" @click="goToItem(like)">
              <span class="type-badge" :class="like.type">{{ like.type === 'forum' ? '论坛' : '文章' }}</span>
              <div class="like-info">
                <h4>{{ like.title }}</h4>
                <p>{{ like.summary }}</p>
                <div class="like-meta">
                  <span class="like-author">{{ like.type === 'forum' ? '论坛帖子' : '文章' }}</span>
                  <span class="like-date">{{ formatDate(like.date) }}</span>
                </div>
              </div>
            </div>
            <div v-if="hasMoreLikes" class="load-more-section">
              <button class="load-more-btn" @click="loadMoreLikes">加载更多</button>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'activities'" class="content-section">
          <h3>我的活动</h3>
          <div v-if="myActivities.length === 0" class="empty-state">
            <p>暂无报名活动</p>
          </div>
          <div v-else class="activity-list">
            <div v-for="activity in myActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <span v-if="activity.status === 'registered'">📅</span>
                <span v-else-if="activity.status === 'completed'">✅</span>
                <span v-else-if="activity.status === 'cancelled'">❌</span>
                <span v-else>📋</span>
              </div>
              <div class="activity-content">
                <h4>{{ activity.title }}</h4>
                <p class="activity-description">{{ activity.location }}</p>
                <div class="activity-meta">
                  <span class="activity-status" :class="getStatusClass(activity.status)">{{ getStatusText(activity.status) }}</span>
                  <span class="activity-date">{{ formatDate(activity.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'messages'" class="content-section">
          <h3>消息通知</h3>
          <div v-if="!notifications.length" class="empty-state">暂无消息</div>
          <div v-else class="message-list">
            <div v-for="n in notifications" :key="n.id" class="message-row" @click="openNotification(n)">
              <div class="message-main">
                <span class="message-actor">{{ n.actor }}</span>
                <span class="message-text">{{ n.type === 'like' ? '为你点赞' : '留下评论' }}</span>
                <span class="message-excerpt" v-if="n.excerpt">：{{ n.excerpt }}</span>
              </div>
              <div class="message-aside">{{ formatDate(n.date) }}</div>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'settings'" class="content-section">
          <h3>消息设置</h3>
          <div class="settings-list">
            <div class="setting-item">
              <span class="setting-label">接收系统通知</span>
              <label class="switch">
                <input type="checkbox" v-model="messageSettings.systemNotification" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <span class="setting-label">接收活动提醒</span>
              <label class="switch">
                <input type="checkbox" v-model="messageSettings.activityReminder" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <span class="setting-label">接收评论回复</span>
              <label class="switch">
                <input type="checkbox" v-model="messageSettings.commentReply" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <span class="setting-label">接收私信</span>
              <label class="switch">
                <input type="checkbox" v-model="messageSettings.privateMessage" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'account'" class="content-section">
          <h3>账号设置</h3>
          <div class="account-list">
            <div class="account-item">
              <div class="account-label">密码</div>
              <div class="account-desc">{{ account.security.passwordSet ? '已设置密码' : '存在风险，请设置密码' }}</div>
              <button class="account-action" @click="onSetPassword">{{ account.security.passwordSet ? '修改密码' : '设置密码' }}</button>
            </div>
            <div class="account-item">
              <div class="account-label">手机</div>
              <div class="account-desc">{{ maskPhone(account.mobile) }}</div>
              <button class="account-action" @click="onChangeMobile">修改手机</button>
            </div>
            <div class="account-item">
              <div class="account-label">邮箱</div>
              <div class="account-desc">{{ account.email ? account.email : '存在风险，请绑定邮箱' }}</div>
              <button class="account-action" @click="onBindEmail">{{ account.email ? '修改邮箱' : '绑定邮箱' }}</button>
            </div>
            <div class="account-item">
              <div class="account-label">三方账号</div>
              <div class="account-desc">微信</div>
              <button class="account-action" @click="onToggleWeixin">{{ account.weixinBound ? '解绑' : '绑定' }}</button>
            </div>
            <div class="account-item">
              <div class="account-label">登录记录</div>
              <div class="account-desc"></div>
              <button class="account-action" @click="onViewLoginRecords">查看记录</button>
            </div>
            <div class="account-item">
              <div class="account-label">账号注销</div>
              <div class="account-desc"></div>
              <button class="account-action danger" @click="onCloseAccount">立即注销</button>
            </div>
          </div>
        </div>
      </div>

      
    </div>

    <!-- 编辑资料弹窗 -->
    <div v-if="openEditModal" class="modal-overlay" @click="openEditModal = false">
      <div class="modal-content" @click.stop>
        <h3>编辑资料</h3>
        <form @submit.prevent="saveProfile">
          <div class="form-group">
            <label>头像</label>
            <div class="avatar-upload">
              <img 
                :src="editForm.avatar" 
                alt="当前头像" 
                class="current-avatar"
                @error="handleEditAvatarError"
                @load="handleEditAvatarLoad"
              />
              <input ref="avatarInput" type="file" class="avatar-input" accept="image/*" @change="handleAvatarChange" />
              <button type="button" class="upload-btn" @click="triggerAvatarUpload" :disabled="uploading">
                {{ uploading ? '上传中...' : '选择头像' }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>昵称</label>
            <input v-model="editForm.nickname" type="text" />
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="editForm.email" type="email" />
          </div>
          <div class="form-group">
            <label>个人简介</label>
            <textarea v-model="editForm.bio" rows="3"></textarea>
          </div>
          
          <!-- 修改密码模块 -->
          <div class="form-group">
            <label>修改密码</label>
            <div class="password-section">
              <div class="password-input-group">
                <input 
                  v-model="passwordForm.oldPassword" 
                  type="password" 
                  placeholder="请输入原密码"
                  class="password-input"
                />
              </div>
              <div class="password-input-group">
                <input 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  placeholder="请输入新密码"
                  class="password-input"
                />
              </div>
              <div class="password-input-group">
                <input 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  placeholder="请确认新密码"
                  class="password-input"
                />
              </div>
              <button 
                type="button" 
                class="change-password-btn" 
                @click="changePassword"
                :disabled="changingPassword"
              >
                {{ changingPassword ? '修改中...' : '修改密码' }}
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="openEditModal = false">取消</button>
            <button type="submit">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { uploadAvatar } from '@/api/upload'
import { updateProfile, changePassword } from '@/api/users'
import { getUserProfile, getUserFavorites, getUserLikes, getUserComments, getUserPosts } from '@/api/userCenter'
import { getUserActivities } from '@/api/activities'
import { getUserForumLikes, getUserForumFavorites, getUserForumComments } from '@/api/forum'
// 统一数据源后，不再直接引入静态文章数据

export default {
  name: 'ProfilePage',
  data() {
    return {
      currentView: 'collections',
      openEditModal: false,
      uploading: false,
      loading: false,
      editForm: {
        avatar: '',
        nickname: '',
        email: '',
        bio: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      changingPassword: false,
      messageSettings: {
        systemNotification: true,
        activityReminder: true,
        commentReply: false,
        privateMessage: true
      },
      // 从API获取的真实数据
      userProfile: null,
      myCollections: [],
      myPosts: [],
      myComments: [],
      myLikes: [],
      myActivities: [],
      // 🆕 论坛数据
      myForumLikes: [],
      myForumFavorites: [],
      myForumComments: [],
      // 筛选类型
      collectionType: 'all',  // all, article, forum
      likeType: 'all',
      commentType: 'all',
      // 分页数据
      pagination: {
        collections: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false },
        posts: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false },
        comments: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false },
        likes: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false },
        forumLikes: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false },
        forumFavorites: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false },
        forumComments: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false }
      },
      account: {
        security: { passwordSet: false },
        mobile: '182****9635',
        email: '',
        weixinBound: false,
      }
    }
  },
  computed: {
    ...mapGetters(['userActivities', 'username', 'notifications']),
    // 🆕 合并文章和论坛的收藏列表
    allCollections() {
      let items = []
      if (this.collectionType === 'all' || this.collectionType === 'article') {
        items = items.concat(this.myCollections)
      }
      if (this.collectionType === 'all' || this.collectionType === 'forum') {
        items = items.concat(this.myForumFavorites)
      }
      return items.sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    // 🆕 合并文章和论坛的点赞列表
    allLikes() {
      let items = []
      if (this.likeType === 'all' || this.likeType === 'article') {
        items = items.concat(this.myLikes)
      }
      if (this.likeType === 'all' || this.likeType === 'forum') {
        items = items.concat(this.myForumLikes)
      }
      return items.sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    // 🆕 合并文章和论坛的评论列表
    allComments() {
      let items = []
      if (this.commentType === 'all' || this.commentType === 'article') {
        items = items.concat(this.myComments)
      }
      if (this.commentType === 'all' || this.commentType === 'forum') {
        items = items.concat(this.myForumComments)
      }
      return items.sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    // 🆕 总数统计
    totalCollections() {
      return this.myCollections.length + this.myForumFavorites.length
    },
    totalLikes() {
      return this.myLikes.length + this.myForumLikes.length
    },
    totalComments() {
      return this.myComments.length + this.myForumComments.length
    },
    hasMoreCollections() {
      return (this.collectionType === 'all' || this.collectionType === 'article') && this.pagination.collections.hasMore ||
             (this.collectionType === 'all' || this.collectionType === 'forum') && this.pagination.forumFavorites.hasMore
    },
    hasMoreLikes() {
      return (this.likeType === 'all' || this.likeType === 'article') && this.pagination.likes.hasMore ||
             (this.likeType === 'all' || this.likeType === 'forum') && this.pagination.forumLikes.hasMore
    },
    hasMoreComments() {
      return (this.commentType === 'all' || this.commentType === 'article') && this.pagination.comments.hasMore ||
             (this.commentType === 'all' || this.commentType === 'forum') && this.pagination.forumComments.hasMore
    },
    userInfo() {
      const profile = this.userProfile
      if (!profile) {
        return {
          id: '',
          username: '未登录',
          avatar: 'https://via.placeholder.com/80x80?text=Avatar',
          joinDate: '',
          role: 'guest'
        }
      }
      
      return {
        id: profile.id || 'u-' + Date.now(),
        username: profile.nickname || profile.username || '用户',
        avatar: this.getAvatarUrl(profile.avatar),
        joinDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '未知',
        role: profile.role || 'user'
      }
    },
  },
  async mounted() {
    await this.loadUserData()
    this.initEditForm()
    
    // 监听用户数据变化事件
    this.$root.$on('userDataChanged', this.handleUserDataChanged)
  },
  beforeDestroy() {
    // 移除事件监听器
    this.$root.$off('userDataChanged', this.handleUserDataChanged)
  },
  methods: {
    // 加载用户数据
    async loadUserData() {
      try {
        this.loading = true
        
        // 检查是否已登录
        const token = localStorage.getItem('authToken')
        if (!token) {
          console.log('用户未登录')
          return
        }
        
          // 并行加载所有用户数据（文章+论坛）
          const [profileRes, favoritesRes, likesRes, commentsRes, postsRes, activitiesRes, forumLikesRes, forumFavoritesRes, forumCommentsRes] = await Promise.all([
            getUserProfile().catch(err => ({ data: { success: false, error: err.message } })),
            getUserFavorites().catch(err => ({ data: { success: false, error: err.message } })),
            getUserLikes().catch(err => ({ data: { success: false, error: err.message } })),
            getUserComments().catch(err => ({ data: { success: false, error: err.message } })),
            getUserPosts().catch(err => ({ data: { success: false, error: err.message } })),
            getUserActivities().catch(err => ({ data: { success: false, error: err.message } })),
            getUserForumLikes().catch(err => ({ data: { success: false, error: err.message } })),
            getUserForumFavorites().catch(err => ({ data: { success: false, error: err.message } })),
            getUserForumComments().catch(err => ({ data: { success: false, error: err.message } }))
          ])
        
        // 处理用户信息
        if (profileRes.data.success) {
          this.userProfile = profileRes.data.data
        }
        
        // 处理收藏数据
        if (favoritesRes.data.success) {
          this.myCollections = favoritesRes.data.data.favorites.map(item => ({
            id: item.id,
            uniqueId: 'article-' + item.id,
            title: item.title,
            summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
            author: '系统',
            date: item.favorited_at || item.created_at,
            type: 'article'
          }))
          if (favoritesRes.data.data.pagination) {
            this.pagination.collections = {
              ...favoritesRes.data.data.pagination,
              hasMore: favoritesRes.data.data.pagination.page < favoritesRes.data.data.pagination.pages
            }
          }
        }
        
        // 处理点赞数据
        if (likesRes.data.success) {
          this.myLikes = likesRes.data.data.likes.map(item => ({
            id: item.id,
            uniqueId: 'article-' + item.id,
            title: item.title,
            summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
            author: '系统',
            date: item.liked_at || item.created_at,
            type: 'article'
          }))
          if (likesRes.data.data.pagination) {
            this.pagination.likes = {
              ...likesRes.data.data.pagination,
              hasMore: likesRes.data.data.pagination.page < likesRes.data.data.pagination.pages
            }
          }
        }
        
        // 处理评论数据
        if (commentsRes.data.success) {
          this.myComments = commentsRes.data.data.comments.map(item => ({
            id: item.id,
            uniqueId: 'article-comment-' + item.id,
            articleId: item.article_id,
            articleTitle: item.article_title || '未知文章',
            content: item.content,
            date: item.created_at,
            category: item.category,
            cover: item.cover,
            type: 'article'
          }))
          if (commentsRes.data.data.pagination) {
            this.pagination.comments = {
              ...commentsRes.data.data.pagination,
              hasMore: commentsRes.data.data.pagination.page < commentsRes.data.data.pagination.pages
            }
          }
        }
        
        // 🆕 处理论坛点赞数据
        if (forumLikesRes.data.success) {
          this.myForumLikes = forumLikesRes.data.data.likes.map(item => ({
            id: item.id,
            uniqueId: 'forum-' + item.id,
            title: item.title,
            summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
            author: '论坛',
            date: item.liked_at || item.created_at,
            type: 'forum'
          }))
          if (forumLikesRes.data.data.pagination) {
            this.pagination.forumLikes = {
              ...forumLikesRes.data.data.pagination,
              hasMore: forumLikesRes.data.data.pagination.page < forumLikesRes.data.data.pagination.pages
            }
          }
        }
        
        // 🆕 处理论坛收藏数据
        if (forumFavoritesRes.data.success) {
          this.myForumFavorites = forumFavoritesRes.data.data.favorites.map(item => ({
            id: item.id,
            uniqueId: 'forum-' + item.id,
            title: item.title,
            summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
            author: '论坛',
            date: item.favorited_at || item.created_at,
            type: 'forum'
          }))
          if (forumFavoritesRes.data.data.pagination) {
            this.pagination.forumFavorites = {
              ...forumFavoritesRes.data.data.pagination,
              hasMore: forumFavoritesRes.data.data.pagination.page < forumFavoritesRes.data.data.pagination.pages
            }
          }
        }
        
        // 🆕 处理论坛评论数据
        if (forumCommentsRes.data.success) {
          this.myForumComments = forumCommentsRes.data.data.comments.map(item => ({
            id: item.id,
            uniqueId: 'forum-comment-' + item.id,
            articleId: item.post_id,
            articleTitle: item.post_title || '未知帖子',
            content: item.content,
            date: item.created_at,
            category: item.category,
            type: 'forum'
          }))
          if (forumCommentsRes.data.data.pagination) {
            this.pagination.forumComments = {
              ...forumCommentsRes.data.data.pagination,
              hasMore: forumCommentsRes.data.data.pagination.page < forumCommentsRes.data.data.pagination.pages
            }
          }
        }
        
        // 处理帖子数据
        if (postsRes.data.success) {
          this.myPosts = postsRes.data.data.posts.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
            tags: [item.category || '未分类'],
            date: item.created_at
          }))
          if (postsRes.data.data.pagination) {
            this.pagination.posts = {
              ...postsRes.data.data.pagination,
              hasMore: postsRes.data.data.pagination.page < postsRes.data.data.pagination.pages
            }
          }
        }
        
        // 处理活动数据
        if (activitiesRes.data.success) {
          this.myActivities = activitiesRes.data.data.activities.map(item => ({
            id: item.activity_id,
            title: item.title,
            location: item.location,
            date: item.start_time,
            status: item.registration_status,
            registration_time: item.registration_time,
            description: item.description,
            end_time: item.end_time,
            cover: item.cover
          }))
        }
        
      } catch (error) {
        console.error('加载用户数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    showMyCollections() {
      this.currentView = 'collections'
    },
    showMyPosts() {
      this.currentView = 'posts'
    },
    showMyComments() {
      this.currentView = 'comments'
    },
    showMyLikes() {
      this.currentView = 'likes'
    },
    showMyActivities() {
      this.currentView = 'activities'
      // 刷新活动数据
      this.refreshActivities()
    },
    getStatusText(status) {
      const statusMap = {
        'registered': '已报名',
        'completed': '已完成',
        'cancelled': '已取消',
        'pending': '待确认'
      }
      return statusMap[status] || '未知状态'
    },
    getStatusClass(status) {
      const classMap = {
        'registered': 'status-registered',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled',
        'pending': 'status-pending'
      }
      return classMap[status] || 'status-unknown'
    },
      async refreshActivities() {
        // 从数据库重新加载活动数据
        try {
          const response = await getUserActivities()
          if (response.data.success) {
            this.myActivities = response.data.data.activities.map(item => ({
              id: item.activity_id,
              title: item.title,
              location: item.location,
              date: item.start_time,
              status: item.registration_status,
              registration_time: item.registration_time,
              description: item.description,
              end_time: item.end_time,
              cover: item.cover
            }))
          }
        } catch (error) {
          console.error('刷新活动数据失败:', error)
        }
      },
    formatDate(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}年${p(d.getMonth()+1)}月${p(d.getDate())}日 ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    getArticleTitle(articleId) {
      // 从评论数据中查找文章标题
      const comment = this.myComments.find(c => c.articleId === articleId)
      return comment && comment.articleTitle ? comment.articleTitle : '未知文章'
    },
    goToArticle(articleId) {
      this.$router.push({ name: 'article-detail', params: { id: articleId } })
    },
    goToComment(articleId, commentId) {
      this.$router.push({ 
        name: 'article-detail', 
        params: { id: articleId },
        query: { highlight: commentId }
      })
    },
    // 🆕 根据类型跳转到文章或论坛
    goToItem(item) {
      if (item.type === 'forum') {
        this.$router.push({ name: 'forum-post-detail', params: { id: item.id } })
      } else {
        this.$router.push({ name: 'article-detail', params: { id: item.id } })
      }
    },
    // 🆕 根据类型跳转到评论
    goToCommentItem(comment) {
      if (comment.type === 'forum') {
        this.$router.push({ 
          name: 'forum-post-detail', 
          params: { id: comment.articleId },
          query: { highlight: comment.id }
        })
      } else {
        this.$router.push({ 
          name: 'article-detail', 
          params: { id: comment.articleId },
          query: { highlight: comment.id }
        })
      }
    },
    openNotification(n) {
      if (n.targetType === 'article') {
        this.$router.push({ name: 'article-detail', params: { id: n.articleId } })
      } else if (n.targetType === 'comment') {
        this.$router.push({ name: 'article-detail', params: { id: n.articleId }, query: { highlight: n.commentId } })
      }
    },
    getAvatarUrl(avatar) {
      if (!avatar) {
        return 'https://via.placeholder.com/80x80?text=Avatar'
      }
      
      // 如果已经是完整URL，直接返回
      if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
        return avatar
      }
      
      // 如果是相对路径，添加服务器地址
      if (avatar.startsWith('/uploads/')) {
        return `http://localhost:3001${avatar}`
      }
      
      // 默认情况
      return avatar
    },
    initEditForm() {
      const profile = this.userProfile
      if (profile) {
        this.editForm = {
          avatar: this.getAvatarUrl(profile.avatar),
          nickname: profile.nickname || profile.username || '',
          email: profile.email || '',
          bio: profile.bio || ''
        }
      }
    },
    openEditModalHandler() {
      this.initEditForm()
      this.openEditModal = true
    },
    // 账号设置相关交互（示意）
    onSetPassword() { alert('进入设置/修改密码流程（示意）') },
    onChangeMobile() { alert('进入修改手机流程（示意）') },
    onBindEmail() { alert('进入绑定/修改邮箱流程（示意）') },
    onToggleWeixin() { this.account.weixinBound = !this.account.weixinBound },
    onViewLoginRecords() { alert('展示登录记录（示意）') },
    onCloseAccount() { if (confirm('确定要注销账号吗？')) alert('已提交注销申请（示意）') },
    maskPhone(v){ return v || '未绑定' },
    triggerAvatarUpload() { this.$refs.avatarInput && this.$refs.avatarInput.click() },
    handleAvatarError(event) {
      console.error('头像加载失败:', event.target.src)
      // 设置默认头像
      event.target.src = 'https://via.placeholder.com/80x80?text=Avatar'
    },
    handleAvatarLoad(event) {
      console.log('头像加载成功:', event.target.src)
    },
    handleEditAvatarError(event) {
      console.error('编辑表单头像加载失败:', event.target.src)
      // 设置默认头像
      event.target.src = 'https://via.placeholder.com/80x80?text=Avatar'
    },
    handleEditAvatarLoad(event) {
      console.log('编辑表单头像加载成功:', event.target.src)
    },
    async handleAvatarChange(e) {
      const file = e && e.target && e.target.files && e.target.files[0]
      if (!file) return
      
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }
      
      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB')
        return
      }
      
      try {
        // 显示上传中状态
        this.uploading = true
        
        // 上传头像到服务器
        const response = await uploadAvatar(file)
        
        if (response.data.success) {
          // 更新编辑表单中的头像URL，确保是完整URL
          const avatarUrl = this.getAvatarUrl(response.data.avatarUrl)
          this.editForm.avatar = avatarUrl
          console.log('头像上传成功，URL:', avatarUrl)
          alert('头像上传成功！')
        } else {
          alert('头像上传失败：' + response.data.message)
        }
      } catch (error) {
        console.error('头像上传失败:', error)
        alert('头像上传失败，请重试')
      } finally {
        this.uploading = false
      }
    },
    async saveProfile() {
      try {
        // 调用API更新用户信息
        const response = await updateProfile({
          nickname: this.editForm.nickname,
          email: this.editForm.email,
          avatar: this.editForm.avatar
        })
        
        if (response.data.success) {
          // 更新Vuex中的用户信息
          this.$store.commit('SET_USER_PROFILE', response.data.user)
          console.log('用户资料更新成功:', response.data.user)
          alert('资料保存成功！')
          this.openEditModal = false
        } else {
          alert('保存失败：' + response.data.message)
        }
      } catch (error) {
        console.error('保存用户信息失败:', error)
        alert('保存失败，请重试')
      }
    },
    async changePassword() {
      // 验证输入
      if (!this.passwordForm.oldPassword) {
        alert('请输入原密码')
        return
      }
      if (!this.passwordForm.newPassword) {
        alert('请输入新密码')
        return
      }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert('两次输入的新密码不一致')
        return
      }
      if (this.passwordForm.newPassword.length < 6) {
        alert('新密码长度不能少于6位')
        return
      }
      
      try {
        this.changingPassword = true
        
        const response = await changePassword({
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        })
        
        if (response.data.success) {
          alert('密码修改成功！')
          // 清空密码表单
          this.passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        } else {
          alert('密码修改失败：' + response.data.message)
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        alert('密码修改失败：' + (error.response?.data?.message || error.message || '未知错误'))
      } finally {
        this.changingPassword = false
      }
    },
    
    // 加载更多收藏
    async loadMoreCollections() {
      try {
        this.pagination.collections.page++
        const response = await getUserFavorites(this.pagination.collections.page, this.pagination.collections.limit)
        
        if (response.data.success) {
          const newItems = response.data.data.favorites.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
            author: '系统',
            date: item.favorited_at || item.created_at
          }))
          this.myCollections = [...this.myCollections, ...newItems]
          
          if (response.data.data.pagination) {
            this.pagination.collections = {
              ...response.data.data.pagination,
              hasMore: response.data.data.pagination.page < response.data.data.pagination.pages
            }
          }
        }
      } catch (error) {
        console.error('加载更多收藏失败:', error)
      }
    },
    
    // 加载更多点赞
    async loadMoreLikes() {
      try {
        this.pagination.likes.page++
        const response = await getUserLikes(this.pagination.likes.page, this.pagination.likes.limit)
        
        if (response.data.success) {
          const newItems = response.data.data.likes.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
            author: '系统',
            date: item.liked_at || item.created_at
          }))
          this.myLikes = [...this.myLikes, ...newItems]
          
          if (response.data.data.pagination) {
            this.pagination.likes = {
              ...response.data.data.pagination,
              hasMore: response.data.data.pagination.page < response.data.data.pagination.pages
            }
          }
        }
      } catch (error) {
        console.error('加载更多点赞失败:', error)
      }
    },
    
    // 加载更多评论
    async loadMoreComments() {
      try {
        this.pagination.comments.page++
        const response = await getUserComments(this.pagination.comments.page, this.pagination.comments.limit)
        
        if (response.data.success) {
          const newItems = response.data.data.comments.map(item => ({
            id: item.id,
            articleId: item.article_id,
            articleTitle: item.article_title || '未知文章',
            content: item.content,
            date: item.created_at,
            category: item.category,
            cover: item.cover
          }))
          this.myComments = [...this.myComments, ...newItems]
          
          if (response.data.data.pagination) {
            this.pagination.comments = {
              ...response.data.data.pagination,
              hasMore: response.data.data.pagination.page < response.data.data.pagination.pages
            }
          }
        }
      } catch (error) {
        console.error('加载更多评论失败:', error)
      }
    },
    
    // 加载更多帖子
    async loadMorePosts() {
      try {
        this.pagination.posts.page++
        const response = await getUserPosts(this.pagination.posts.page, this.pagination.posts.limit)
        
        if (response.data.success) {
          const newItems = response.data.data.posts.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
            tags: [item.category || '未分类'],
            date: item.created_at
          }))
          this.myPosts = [...this.myPosts, ...newItems]
          
          if (response.data.data.pagination) {
            this.pagination.posts = {
              ...response.data.data.pagination,
              hasMore: response.data.data.pagination.page < response.data.data.pagination.pages
            }
          }
        }
      } catch (error) {
        console.error('加载更多帖子失败:', error)
      }
    },
    
    // 处理用户数据变化事件
    handleUserDataChanged(data) {
      console.log('用户数据已更新:', data)
      // 根据数据类型刷新对应的数据
      if (data.type === 'like') {
        this.refreshData('likes')
      } else if (data.type === 'favorite') {
        this.refreshData('collections')
      } else if (data.type === 'comment') {
        this.refreshData('comments')
      } else if (data.type === 'forum-like') {
        this.refreshData('forum-likes')
      } else if (data.type === 'forum-favorite') {
        this.refreshData('forum-favorites')
      } else if (data.type === 'forum-comment') {
        this.refreshData('forum-comments')
      }
    },
    
    // 刷新单个数据类型
    async refreshData(type) {
      try {
        this.loading = true
        
        if (type === 'forum-likes') {
          const response = await getUserForumLikes(1, this.pagination.forumLikes.limit)
          if (response.data.success) {
            this.myForumLikes = response.data.data.likes.map(item => ({
              id: item.id,
              uniqueId: 'forum-' + item.id,
              title: item.title,
              summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
              author: '论坛',
              date: item.liked_at || item.created_at,
              type: 'forum'
            }))
            if (response.data.data.pagination) {
              this.pagination.forumLikes = {
                ...response.data.data.pagination,
                hasMore: response.data.data.pagination.page < response.data.data.pagination.pages
              }
            }
          }
        } else if (type === 'forum-favorites') {
          const response = await getUserForumFavorites(1, this.pagination.forumFavorites.limit)
          if (response.data.success) {
            this.myForumFavorites = response.data.data.favorites.map(item => ({
              id: item.id,
              uniqueId: 'forum-' + item.id,
              title: item.title,
              summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
              author: '论坛',
              date: item.favorited_at || item.created_at,
              type: 'forum'
            }))
            if (response.data.data.pagination) {
              this.pagination.forumFavorites = {
                ...response.data.data.pagination,
                hasMore: response.data.data.pagination.page < response.data.data.pagination.pages
              }
            }
          }
        } else if (type === 'forum-comments') {
          const response = await getUserForumComments(1, this.pagination.forumComments.limit)
          if (response.data.success) {
            this.myForumComments = response.data.data.comments.map(item => ({
              id: item.id,
              uniqueId: 'forum-comment-' + item.id,
              articleId: item.post_id,
              articleTitle: item.post_title || '未知帖子',
              content: item.content,
              date: item.created_at,
              category: item.category,
              type: 'forum'
            }))
            if (response.data.data.pagination) {
              this.pagination.forumComments = {
                ...response.data.data.pagination,
                hasMore: response.data.data.pagination.page < response.data.data.pagination.pages
              }
            }
          }
        } else if (type === 'collections') {
          const response = await getUserFavorites(1, this.pagination.collections.limit)
          if (response.data.success) {
            this.myCollections = response.data.data.favorites.map(item => ({
              id: item.id,
              title: item.title,
              summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
              author: '系统',
              date: item.favorited_at || item.created_at
            }))
            if (response.data.data.pagination) {
              this.pagination.collections = {
                ...response.data.data.pagination,
                hasMore: response.data.data.pagination.page < response.data.data.pagination.pages
              }
            }
          }
        } else if (type === 'likes') {
          const response = await getUserLikes(1, this.pagination.likes.limit)
          if (response.data.success) {
            this.myLikes = response.data.data.likes.map(item => ({
              id: item.id,
              title: item.title,
              summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
              author: '系统',
              date: item.liked_at || item.created_at
            }))
            if (response.data.data.pagination) {
              this.pagination.likes = {
                ...response.data.data.pagination,
                hasMore: response.data.data.pagination.page < response.data.data.pagination.pages
              }
            }
          }
        } else if (type === 'comments') {
          const response = await getUserComments(1, this.pagination.comments.limit)
          if (response.data.success) {
            this.myComments = response.data.data.comments.map(item => ({
              id: item.id,
              articleId: item.article_id,
              articleTitle: item.article_title || '未知文章',
              content: item.content,
              date: item.created_at,
              category: item.category,
              cover: item.cover
            }))
            if (response.data.data.pagination) {
              this.pagination.comments = {
                ...response.data.data.pagination,
                hasMore: response.data.data.pagination.page < response.data.data.pagination.pages
              }
            }
          }
        } else if (type === 'posts') {
          const response = await getUserPosts(1, this.pagination.posts.limit)
          if (response.data.success) {
            this.myPosts = response.data.data.posts.map(item => ({
              id: item.id,
              title: item.title,
              summary: item.content ? item.content.substring(0, 100) + '...' : '暂无摘要',
              tags: [item.category || '未分类'],
              date: item.created_at
            }))
            if (response.data.data.pagination) {
              this.pagination.posts = {
                ...response.data.data.pagination,
                hasMore: response.data.data.pagination.page < response.data.data.pagination.pages
              }
            }
          }
        }
      } catch (error) {
        console.error('刷新数据失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.page { padding: 16px; width: 75%; margin: 0 auto; }

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* 用户信息卡片 */
.user-info-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.user-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 24px;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.user-id, .join-date, .user-role {
  color: #606266;
  margin: 4px 0;
  font-size: 14px;
}

.edit-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.edit-btn:hover {
  background: #369f72;
}

/* 功能按钮区域 */
.function-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.func-btn {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  color: #606266;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.func-btn:hover {
  background: #e6e9ef;
  border-color: #42b983;
  color: #42b983;
}

/* 消息悬停卡片 */
/* 移除悬停卡片相关样式（保留类以避免报错，但不显示） */
.message-hover, .message-popover, .message-item { display: none; }

/* 消息列表 */
.message-list { display: flex; flex-direction: column; }
.message-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 12px; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
.message-row:hover { background: #f9fafb; }
.message-main { color: #2c3e50; }
.message-excerpt { color: #606266; }
.message-aside { color: #909399; font-size: 12px; }

/* 内容展示区域 */
.content-area {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;
}

.content-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 20px;
}

.empty-state {
  text-align: center;
  color: #909399;
  padding: 40px;
}

.loading-state {
  text-align: center;
  color: #42b983;
  padding: 40px;
  font-size: 16px;
}

/* 收藏列表 */
.collection-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.collection-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.collection-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #42b983;
}

.collection-info {
  flex: 1;
}

.collection-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.collection-info p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.collection-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collection-author {
  color: #42b983;
  font-size: 12px;
  font-weight: 500;
}

.collection-date {
  color: #909399;
  font-size: 12px;
}

/* 帖子列表 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.post-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #42b983;
}

.post-item h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.post-item p {
  margin: 0 0 12px 0;
  color: #606266;
}

.post-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.post-tag {
  background: #eef5f2;
  color: #42b983;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.post-date {
  color: #909399;
  font-size: 12px;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.comment-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #42b983;
}

.comment-item h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
}

.comment-content {
  margin: 0 0 8px 0;
  color: #606266;
  line-height: 1.5;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-date {
  color: #909399;
  font-size: 12px;
}

.comment-category {
  background: #f0f2f5;
  color: #606266;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
}

/* 点赞列表 */
.like-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.like-item {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.like-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #ff6b6b;
}

.like-info {
  flex: 1;
}

.like-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.like-info p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.like-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.like-author {
  color: #ff6b6b;
  font-size: 12px;
  font-weight: 500;
}

.like-date {
  color: #909399;
  font-size: 12px;
}

/* 活动列表 */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.activity-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #409eff;
}

.activity-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.activity-description {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.activity-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-registered {
  background: #e1f3d8;
  color: #67c23a;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-unknown {
  background: #e2e3e5;
  color: #6c757d;
}

.activity-date {
  color: #909399;
  font-size: 12px;
}

.activity-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.activity-status.registered {
  background: #e1f5fe;
  color: #0277bd;
}

.activity-status.completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.activity-status.cancelled {
  background: #ffebee;
  color: #c62828;
}

/* 消息设置 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-label {
  font-size: 16px;
  color: #2c3e50;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #42b983;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* 设置按钮 */
.settings-section {
  text-align: center;
}

.settings-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s ease;
}

.settings-btn:hover {
  background: #369f72;
}

/* 编辑资料弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #42b983;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.form-actions button {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.form-actions button[type="button"] {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.form-actions button[type="submit"] {
  background: #42b983;
  border: none;
  color: white;
}

.form-actions button:hover {
  opacity: 0.8;
}

/* 头像上传样式 */
.avatar-upload { display: flex; align-items: center; gap: 16px; }
.current-avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #dcdfe6; }
.avatar-input { display: none; }
.upload-btn { background: #f5f7fa; border: 1px solid #dcdfe6; color: #606266; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.2s ease; }
.upload-btn:hover { background: #e6e9ef; border-color: #42b983; color: #42b983; }

/* 修改密码样式 */
.password-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.password-input-group {
  display: flex;
  flex-direction: column;
}

.password-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.password-input:focus {
  border-color: #42b983;
}

.change-password-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
  align-self: flex-start;
}

.change-password-btn:hover:not(:disabled) {
  background: #369f72;
}

.change-password-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 账号设置样式 */
.account-list { display: flex; flex-direction: column; }
.account-item { display: grid; grid-template-columns: 120px 1fr auto; align-items: center; padding: 14px 0; border-bottom: 1px solid #f0f0f0; }
.account-label { color: #2c3e50; font-weight: 600; }
.account-desc { color: #606266; }
.account-action { padding: 6px 12px; border: 1px solid #dcdfe6; background: #fff; border-radius: 4px; cursor: pointer; }
.account-action.danger { border-color: #dc3545; color: #dc3545; }
.account-action:hover { background: #f2f3f5; }

/* 加载更多按钮 */
.load-more-section {
  text-align: center;
  padding: 20px 0;
}

.load-more-btn {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  color: #606266;
  padding: 10px 30px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  background: #e6e9ef;
  border-color: #42b983;
  color: #42b983;
}

.load-more-btn:active {
  transform: scale(0.98);
}

/* 类型筛选按钮 */
.type-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.type-filter button {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
  color: #606266;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.type-filter button:hover {
  background: #e6e9ef;
  border-color: #42b983;
  color: #42b983;
}

.type-filter button.active {
  background: #42b983;
  border-color: #42b983;
  color: white;
}

/* 类型徽章 */
.type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 12px;
}

.type-badge.article {
  background: #e1f3f8;
  color: #0288d1;
}

.type-badge.forum {
  background: #fff3e0;
  color: #f57c00;
}

</style>



