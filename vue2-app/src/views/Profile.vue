<template>
  <div class="page">
    <div class="profile-container">
      <!-- 用户基本信息 -->
      <div class="user-info-card">
        <div class="user-avatar">
          <img :src="userInfo.avatar" alt="用户头像" />
        </div>
        <div class="user-details">
          <h2 class="username">{{ userInfo.username }}</h2>
          <p class="user-id">用户ID: {{ userInfo.id }}</p>
          <p class="join-date">注册时间: {{ userInfo.joinDate }}</p>
          <p class="user-role">角色: {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
        </div>
        <button class="edit-btn" @click="openEditModal = true">编辑资料</button>
      </div>

      <!-- 功能按钮区域 -->
      <div class="function-buttons">
        <button class="func-btn" @click="showMyCollections">我的收藏 ({{ userCollections.length }})</button>
        <button class="func-btn" @click="showMyPosts">我的帖子 ({{ userPosts.length }})</button>
        <button class="func-btn" @click="showMyComments">我的评论 ({{ userComments.length }})</button>
        <button class="func-btn" @click="showMyLikes">我的点赞 ({{ userLikes.length }})</button>
        <button class="func-btn" @click="currentView = 'settings'">消息设置</button>
        <button class="func-btn" @click="currentView = 'account'">账号设置</button>
      </div>

      <!-- 内容展示区域 -->
      <div class="content-area">
        <div v-if="currentView === 'collections'" class="content-section">
          <h3>我的收藏</h3>
          <div v-if="userCollections.length === 0" class="empty-state">
            <p>暂无收藏内容</p>
          </div>
          <div v-else class="collection-list">
            <div v-for="item in userCollections" :key="item.id" class="collection-item" @click="goToArticle(item.id)">
              <div class="collection-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.summary }}</p>
                <div class="collection-meta">
                  <span class="collection-author">作者：{{ item.author }}</span>
                  <span class="collection-date">{{ formatDate(item.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'posts'" class="content-section">
          <h3>我的帖子</h3>
          <div v-if="userPosts.length === 0" class="empty-state">
            <p>暂无发布的帖子</p>
          </div>
          <div v-else class="post-list">
            <div v-for="post in userPosts" :key="post.id" class="post-item" @click="goToArticle(post.id)">
              <h4>{{ post.title }}</h4>
              <p>{{ post.summary }}</p>
              <div class="post-meta">
                <span class="post-tag" v-for="tag in post.tags" :key="tag">{{ tag }}</span>
                <span class="post-date">{{ formatDate(post.date) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'comments'" class="content-section">
          <h3>我的评论</h3>
          <div v-if="userComments.length === 0" class="empty-state">
            <p>暂无评论记录</p>
          </div>
          <div v-else class="comment-list">
            <div v-for="comment in userComments" :key="comment.id" class="comment-item" @click="goToComment(comment.articleId, comment.id)">
              <h4>{{ getArticleTitle(comment.articleId) }}</h4>
              <p class="comment-content">{{ comment.content }}</p>
              <div class="comment-meta">
                <span class="comment-date">{{ formatDate(comment.date) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'likes'" class="content-section">
          <h3>我的点赞</h3>
          <div v-if="userLikes.length === 0" class="empty-state">
            <p>暂无点赞记录</p>
          </div>
          <div v-else class="like-list">
            <div v-for="like in userLikes" :key="like.id" class="like-item" @click="goToArticle(like.id)">
              <div class="like-info">
                <h4>{{ like.title }}</h4>
                <p>{{ like.summary }}</p>
                <div class="like-meta">
                  <span class="like-author">作者：{{ like.author }}</span>
                  <span class="like-date">{{ formatDate(like.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'activities'" class="content-section">
          <h3>我的活动</h3>
          <div v-if="myActivities.length === 0" class="empty-state">
            <p>暂无参与的活动</p>
          </div>
          <div v-else class="activity-list">
            <div v-for="activity in myActivities" :key="activity.id" class="activity-item">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.location }}</p>
              <span class="activity-date">{{ activity.date }}</span>
              <span class="activity-status" :class="activity.status">{{ getStatusText(activity.status) }}</span>
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
              <img :src="editForm.avatar" alt="当前头像" class="current-avatar" />
              <input ref="avatarInput" type="file" class="avatar-input" accept="image/*" @change="handleAvatarChange" />
              <button type="button" class="upload-btn" @click="triggerAvatarUpload">选择头像</button>
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
import articles from '@/data/articles'

export default {
  name: 'ProfilePage',
  data() {
    return {
      currentView: 'collections',
      openEditModal: false,
      userInfo: {
        id: 'u-123456',
        username: '文化爱好者',
        avatar: 'https://via.placeholder.com/80x80?text=Avatar',
        joinDate: '2023-01-15',
        role: 'user'
      },
      editForm: {
        avatar: 'https://via.placeholder.com/80x80?text=Avatar',
        nickname: '文化爱好者',
        email: 'user@example.com',
        bio: '热爱传统文化，喜欢分享和交流'
      },
      messageSettings: {
        systemNotification: true,
        activityReminder: true,
        commentReply: false,
        privateMessage: true
      },
      myCollections: [
        {
          id: 'c1',
          title: '探秘古老茶艺：潮汕工夫茶的独特魅力',
          summary: '潮汕工夫茶是中国茶道中的一朵奇葩...',
          image: 'https://via.placeholder.com/60x40?text=Tea',
          collectDate: '2023-10-20'
        },
        {
          id: 'c2',
          title: '传统手工艺的魅力',
          summary: '你了解哪些濒临失传的手工艺？',
          image: 'https://via.placeholder.com/60x40?text=Craft',
          collectDate: '2023-10-18'
        }
      ],
      myPosts: [
        {
          id: 'p1',
          title: '地方美食文化探讨',
          summary: '分享你家乡的特色美食！',
          tags: ['美食'],
          date: '2023-10-25'
        },
        {
          id: 'p2',
          title: '传统手工艺的魅力',
          summary: '你了解哪些濒临失传的手工艺？',
          tags: ['手工'],
          date: '2023-10-24'
        }
      ],
      myComments: [
        {
          id: 'cmt1',
          targetTitle: '探秘古老茶艺：潮汕工夫茶的独特魅力',
          content: '这篇文章写得很好，学到了很多茶艺知识！',
          date: '2023-10-22'
        },
        {
          id: 'cmt2',
          targetTitle: '地方美食文化探讨',
          content: '我们家乡的火锅很有特色，推荐大家试试。',
          date: '2023-10-21'
        }
      ],
      myActivities: [
        {
          id: 'act1',
          title: '传统文化节开幕',
          location: '文化广场',
          date: '2023-11-01',
          status: 'registered'
        },
        {
          id: 'act2',
          title: '非遗手作体验',
          location: '手作工坊',
          date: '2023-11-05',
          status: 'completed'
        }
      ],
      account: {
        security: { passwordSet: false },
        mobile: '182****9635',
        email: '',
        weixinBound: false,
      }
    }
  },
  computed: {
    ...mapGetters(['userActivities', 'username']),
    userCollections() {
      return this.userActivities.favorites.map(articleId => {
        const article = articles.find(a => a.id === articleId)
        return article ? { ...article, collectDate: new Date().toISOString() } : null
      }).filter(Boolean)
    },
    userPosts() {
      return articles.filter(article => article.author === this.username)
    },
    userComments() {
      return this.userActivities.comments
    },
    userLikes() {
      return this.userActivities.likes.map(articleId => {
        return articles.find(a => a.id === articleId)
      }).filter(Boolean)
    }
  },
  methods: {
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
    },
    formatDate(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}年${p(d.getMonth()+1)}月${p(d.getDate())}日 ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    getArticleTitle(articleId) {
      const article = articles.find(a => a.id === articleId)
      return article ? article.title : '未知文章'
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
    getStatusText(status) {
      const statusMap = {
        'registered': '已报名',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    },
    saveProfile() {
      // 保存用户资料
      this.userInfo.username = this.editForm.nickname
      this.userInfo.avatar = this.editForm.avatar
      alert('资料保存成功！')
      this.openEditModal = false
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
    handleAvatarChange(e) {
      const file = e && e.target && e.target.files && e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        this.editForm.avatar = ev.target && ev.target.result || this.editForm.avatar
      }
      reader.readAsDataURL(file)
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
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.activity-item h4 {
  margin: 0;
  color: #2c3e50;
}

.activity-item p {
  margin: 4px 0;
  color: #606266;
  font-size: 14px;
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

/* 账号设置样式 */
.account-list { display: flex; flex-direction: column; }
.account-item { display: grid; grid-template-columns: 120px 1fr auto; align-items: center; padding: 14px 0; border-bottom: 1px solid #f0f0f0; }
.account-label { color: #2c3e50; font-weight: 600; }
.account-desc { color: #606266; }
.account-action { padding: 6px 12px; border: 1px solid #dcdfe6; background: #fff; border-radius: 4px; cursor: pointer; }
.account-action.danger { border-color: #dc3545; color: #dc3545; }
.account-action:hover { background: #f2f3f5; }
</style>



