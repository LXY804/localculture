<template>
  <div class="admin-container">
    <!-- 顶部导航栏 -->
    <div class="admin-header">
      <div class="header-left">
        <h1>河南传统文化的展示与交流网站平台的设计与实现</h1>
      </div>
      <div class="header-right">
        <div class="user-info">
          <i class="user-icon">👤</i>
          <span>admin</span>
          <i class="dropdown-icon">▼</i>
        </div>
      </div>
    </div>

    <div class="admin-content">
      <!-- 左侧导航栏 -->
      <div class="admin-sidebar">
        <ul class="sidebar-menu">
          <li class="menu-item" :class="{ active: currentPage === 'home' }" @click="currentPage = 'home'">
            <span>系统首页</span>
          </li>
          <li class="menu-item" :class="{ active: currentPage === 'users' }" @click="currentPage = 'users'">
            <span>用户</span>
          </li>
          <li class="menu-item" :class="{ active: currentPage === 'article-types' }" @click="currentPage = 'article-types'">
            <span>文章类型</span>
          </li>
          <li class="menu-item" :class="{ active: currentPage === 'articles' }" @click="currentPage = 'articles'">
            <span>文章信息</span>
          </li>
          <li class="menu-item" :class="{ active: currentPage === 'carousel' }" @click="currentPage = 'carousel'">
            <span>轮播信息</span>
          </li>
          <li class="menu-item" :class="{ active: currentPage === 'reports' }" @click="currentPage = 'reports'">
            <span>举报记录</span>
          </li>
          <li class="menu-item" :class="{ active: currentPage === 'categories' }" @click="currentPage = 'categories'">
            <span>分类信息</span>
          </li>
          <li class="menu-item" :class="{ active: currentPage === 'forum' }" @click="currentPage = 'forum'">
            <span>交流论坛</span>
          </li>
          <li class="menu-item" :class="{ active: currentPage === 'announcements' }" @click="currentPage = 'announcements'">
            <span>公告管理</span>
          </li>
          <li class="menu-item" :class="{ active: currentPage === 'system' }" @click="currentPage = 'system'">
            <span>系统管理</span>
          </li>
          <li class="menu-item" :class="{ active: currentPage === 'profile' }" @click="currentPage = 'profile'">
            <span>个人中心</span>
          </li>
        </ul>
      </div>

      <!-- 主内容区域 -->
      <div class="admin-main">
        <!-- 面包屑导航 -->
        <div class="breadcrumb">
          <span>首页</span>
          <span v-if="currentPage !== 'home'"> > {{ getPageTitle(currentPage) }}</span>
        </div>

        <!-- 文章管理页面 -->
        <div v-if="currentPage === 'articles'" class="page-content">
          <div class="page-header">
            <div class="search-bar">
              <input v-model="articleSearchKeyword" placeholder="文章标题" class="search-input" />
              <button class="search-btn" @click="searchArticles">
                <i>🔍</i> 查询
              </button>
            </div>
            <div class="action-buttons">
              <button class="btn btn-primary" @click="showAddArticleModal = true">新增</button>
              <button class="btn btn-danger" @click="deleteSelectedArticles">删除</button>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
                  <th>序号</th>
                  <th>文章编号</th>
                  <th>文章标题</th>
                  <th>文章类型</th>
                  <th>文章封面</th>
                  <th>评论数</th>
                  <th>收藏数</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(article, index) in filteredArticles" :key="article.id">
                  <td><input type="checkbox" v-model="article.selected" /></td>
                  <td>{{ index + 1 }}</td>
                  <td>{{ article.id }}</td>
                  <td>{{ article.title }}</td>
                  <td>{{ article.type }}</td>
                  <td>
                    <img :src="article.cover" alt="封面" class="cover-image" />
                  </td>
                  <td>{{ article.comments }}</td>
                  <td>{{ article.collections }}</td>
                  <td>
                    <span class="status" :class="article.status">{{ getStatusText(article.status) }}</span>
                  </td>
                  <td class="actions">
                    <button class="btn btn-info btn-sm" @click="viewArticle(article)">查看</button>
                    <button class="btn btn-success btn-sm" @click="editArticle(article)">修改</button>
                    <button v-if="article.status === 'pending'" class="btn btn-warning btn-sm" @click="reviewArticle(article)">审核</button>
                    <button class="btn btn-primary btn-sm" @click="viewComments(article)">查看评论</button>
                    <button class="btn btn-danger btn-sm" @click="deleteArticle(article)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 论坛管理页面 -->
        <div v-if="currentPage === 'forum'" class="page-content">
          <div class="page-header">
            <div class="search-bar">
              <input v-model="forumSearchKeyword" placeholder="帖子标题" class="search-input" />
              <button class="search-btn" @click="searchForumPosts">
                <i>🔍</i> 查询
              </button>
            </div>
            <div class="action-buttons">
              <button class="btn btn-primary" @click="showAddPostModal = true">新增帖子</button>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>帖子标题</th>
                  <th>作者</th>
                  <th>分类</th>
                  <th>回复数</th>
                  <th>发布时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(post, index) in filteredForumPosts" :key="post.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ post.title }}</td>
                  <td>{{ post.author }}</td>
                  <td>{{ post.category }}</td>
                  <td>{{ post.replies }}</td>
                  <td>{{ post.date }}</td>
                  <td>
                    <span class="status" :class="post.status">{{ getPostStatusText(post.status) }}</span>
                  </td>
                  <td class="actions">
                    <button class="btn btn-info btn-sm" @click="viewPost(post)">查看</button>
                    <button class="btn btn-warning btn-sm" @click="warnUser(post)">警告</button>
                    <button class="btn btn-danger btn-sm" @click="banUser(post)">封禁</button>
                    <button class="btn btn-success btn-sm" @click="pinPost(post)">置顶</button>
                    <button class="btn btn-danger btn-sm" @click="deletePost(post)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 公告管理页面 -->
        <div v-if="currentPage === 'announcements'" class="page-content">
          <div class="page-header">
            <div class="action-buttons">
              <button class="btn btn-primary" @click="showAddAnnouncementModal = true">发布公告</button>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>公告标题</th>
                  <th>发布时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(announcement, index) in announcements" :key="announcement.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ announcement.title }}</td>
                  <td>{{ announcement.date }}</td>
                  <td>
                    <span class="status" :class="announcement.status">{{ getAnnouncementStatusText(announcement.status) }}</span>
                  </td>
                  <td class="actions">
                    <button class="btn btn-info btn-sm" @click="viewAnnouncement(announcement)">查看</button>
                    <button class="btn btn-success btn-sm" @click="editAnnouncement(announcement)">编辑</button>
                    <button class="btn btn-danger btn-sm" @click="deleteAnnouncement(announcement)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 其他页面占位 -->
        <div v-if="['home', 'users', 'article-types', 'carousel', 'reports', 'categories', 'system', 'profile'].includes(currentPage)" class="page-content">
          <div class="placeholder">
            <h3>{{ getPageTitle(currentPage) }}</h3>
            <p>此功能正在开发中...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 文章审核弹窗 -->
    <div v-if="showReviewModal" class="modal-overlay" @click="showReviewModal = false">
      <div class="modal-content" @click.stop>
        <h3>文章审核</h3>
        <div class="review-content">
          <h4>{{ currentReviewArticle.title }}</h4>
          <p>{{ currentReviewArticle.content }}</p>
        </div>
        <div class="review-actions">
          <button class="btn btn-success" @click="approveArticle">通过</button>
          <button class="btn btn-danger" @click="rejectArticle">驳回</button>
          <button class="btn btn-secondary" @click="showReviewModal = false">取消</button>
        </div>
        <div v-if="showRejectReason" class="reject-reason">
          <textarea v-model="rejectReason" placeholder="请输入驳回原因"></textarea>
          <button class="btn btn-danger" @click="confirmReject">确认驳回</button>
        </div>
      </div>
    </div>

    <!-- 发布公告弹窗 -->
    <div v-if="showAddAnnouncementModal" class="modal-overlay" @click="showAddAnnouncementModal = false">
      <div class="modal-content" @click.stop>
        <h3>发布公告</h3>
        <form @submit.prevent="publishAnnouncement">
          <div class="form-group">
            <label>公告标题</label>
            <input v-model="newAnnouncement.title" type="text" required />
          </div>
          <div class="form-group">
            <label>公告内容</label>
            <textarea v-model="newAnnouncement.content" rows="6" required></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="showAddAnnouncementModal = false">取消</button>
            <button type="submit">确定</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminPage',
  data() {
    return {
      currentPage: 'articles',
      articleSearchKeyword: '',
      forumSearchKeyword: '',
      selectAll: false,
      showReviewModal: false,
      showRejectReason: false,
      showAddAnnouncementModal: false,
      currentReviewArticle: {},
      rejectReason: '',
      newAnnouncement: {
        title: '',
        content: ''
      },
      articles: [
        {
          id: '000000000',
          title: '文章标题8',
          type: '文章类型8',
          cover: 'https://via.placeholder.com/60x40?text=Cover8',
          comments: 0,
          collections: 8,
          status: 'published',
          content: '这是文章8的内容...',
          selected: false
        },
        {
          id: '777777777',
          title: '文章标题7',
          type: '文章类型7',
          cover: 'https://via.placeholder.com/60x40?text=Cover7',
          comments: 0,
          collections: 7,
          status: 'pending',
          content: '这是文章7的内容...',
          selected: false
        },
        {
          id: '666666666',
          title: '文章标题6',
          type: '文章类型6',
          cover: 'https://via.placeholder.com/60x40?text=Cover6',
          comments: 0,
          collections: 6,
          status: 'published',
          content: '这是文章6的内容...',
          selected: false
        },
        {
          id: '555555555',
          title: '文章标题5',
          type: '文章类型5',
          cover: 'https://via.placeholder.com/60x40?text=Cover5',
          comments: 0,
          collections: 5,
          status: 'pending',
          content: '这是文章5的内容...',
          selected: false
        },
        {
          id: '444444444',
          title: '文章标题4',
          type: '文章类型4',
          cover: 'https://via.placeholder.com/60x40?text=Cover4',
          comments: 0,
          collections: 4,
          status: 'published',
          content: '这是文章4的内容...',
          selected: false
        },
        {
          id: '333333333',
          title: '文章标题3',
          type: '文章类型3',
          cover: 'https://via.placeholder.com/60x40?text=Cover3',
          comments: 0,
          collections: 3,
          status: 'rejected',
          content: '这是文章3的内容...',
          selected: false
        }
      ],
      forumPosts: [
        {
          id: 'f1',
          title: '地方美食文化探讨',
          author: '用户A',
          category: '美食',
          replies: 15,
          date: '2023-10-25',
          status: 'normal'
        },
        {
          id: 'f2',
          title: '传统手工艺的魅力',
          author: '用户B',
          category: '手工',
          replies: 8,
          date: '2023-10-24',
          status: 'violation'
        },
        {
          id: 'f3',
          title: '民俗节庆活动分享',
          author: '用户C',
          category: '民俗',
          replies: 23,
          date: '2023-10-23',
          status: 'normal'
        }
      ],
      announcements: [
        {
          id: 'a1',
          title: '系统维护通知',
          content: '系统将于今晚进行维护...',
          date: '2023-10-25',
          status: 'published'
        },
        {
          id: 'a2',
          title: '新功能上线',
          content: '我们新增了评论功能...',
          date: '2023-10-24',
          status: 'published'
        }
      ]
    }
  },
  computed: {
    filteredArticles() {
      if (!this.articleSearchKeyword) return this.articles
      return this.articles.filter(article => 
        article.title.includes(this.articleSearchKeyword)
      )
    },
    filteredForumPosts() {
      if (!this.forumSearchKeyword) return this.forumPosts
      return this.forumPosts.filter(post => 
        post.title.includes(this.forumSearchKeyword)
      )
    }
  },
  methods: {
    getPageTitle(page) {
      const titles = {
        'home': '系统首页',
        'users': '用户管理',
        'article-types': '文章类型',
        'articles': '文章信息',
        'carousel': '轮播信息',
        'reports': '举报记录',
        'categories': '分类信息',
        'forum': '交流论坛',
        'announcements': '公告管理',
        'system': '系统管理',
        'profile': '个人中心'
      }
      return titles[page] || page
    },
    getStatusText(status) {
      const statusMap = {
        'published': '已发布',
        'pending': '待审核',
        'rejected': '已驳回'
      }
      return statusMap[status] || status
    },
    getPostStatusText(status) {
      const statusMap = {
        'normal': '正常',
        'violation': '违规',
        'pinned': '置顶'
      }
      return statusMap[status] || status
    },
    getAnnouncementStatusText(status) {
      const statusMap = {
        'published': '已发布',
        'draft': '草稿'
      }
      return statusMap[status] || status
    },
    toggleSelectAll() {
      this.articles.forEach(article => {
        article.selected = this.selectAll
      })
    },
    searchArticles() {
      // 搜索逻辑已在computed中实现
    },
    searchForumPosts() {
      // 搜索逻辑已在computed中实现
    },
    viewArticle(article) {
      alert(`查看文章：${article.title}`)
    },
    editArticle(article) {
      alert(`编辑文章：${article.title}`)
    },
    reviewArticle(article) {
      this.currentReviewArticle = article
      this.showReviewModal = true
      this.showRejectReason = false
    },
    approveArticle() {
      this.currentReviewArticle.status = 'published'
      this.showReviewModal = false
      alert('文章审核通过！')
    },
    rejectArticle() {
      this.showRejectReason = true
    },
    confirmReject() {
      if (!this.rejectReason.trim()) {
        alert('请输入驳回原因！')
        return
      }
      this.currentReviewArticle.status = 'rejected'
      this.showReviewModal = false
      this.showRejectReason = false
      alert(`文章已驳回，原因：${this.rejectReason}`)
      this.rejectReason = ''
    },
    viewComments(article) {
      alert(`查看文章评论：${article.title}`)
    },
    deleteArticle(article) {
      if (confirm(`确定要删除文章"${article.title}"吗？`)) {
        const index = this.articles.indexOf(article)
        this.articles.splice(index, 1)
        alert('文章已删除！')
      }
    },
    deleteSelectedArticles() {
      const selectedArticles = this.articles.filter(article => article.selected)
      if (selectedArticles.length === 0) {
        alert('请选择要删除的文章！')
        return
      }
      if (confirm(`确定要删除选中的${selectedArticles.length}篇文章吗？`)) {
        selectedArticles.forEach(article => {
          const index = this.articles.indexOf(article)
          this.articles.splice(index, 1)
        })
        this.selectAll = false
        alert('选中的文章已删除！')
      }
    },
    viewPost(post) {
      alert(`查看帖子：${post.title}`)
    },
    warnUser(post) {
      alert(`警告用户：${post.author}`)
    },
    banUser(post) {
      if (confirm(`确定要封禁用户"${post.author}"吗？`)) {
        alert(`用户"${post.author}"已被封禁！`)
      }
    },
    pinPost(post) {
      post.status = 'pinned'
      alert(`帖子"${post.title}"已置顶！`)
    },
    deletePost(post) {
      if (confirm(`确定要删除帖子"${post.title}"吗？`)) {
        const index = this.forumPosts.indexOf(post)
        this.forumPosts.splice(index, 1)
        alert('帖子已删除！')
      }
    },
    viewAnnouncement(announcement) {
      alert(`查看公告：${announcement.title}`)
    },
    editAnnouncement(announcement) {
      alert(`编辑公告：${announcement.title}`)
    },
    deleteAnnouncement(announcement) {
      if (confirm(`确定要删除公告"${announcement.title}"吗？`)) {
        const index = this.announcements.indexOf(announcement)
        this.announcements.splice(index, 1)
        alert('公告已删除！')
      }
    },
    publishAnnouncement() {
      if (!this.newAnnouncement.title.trim() || !this.newAnnouncement.content.trim()) {
        alert('请填写完整的公告信息！')
        return
      }
      const newAnnouncement = {
        id: 'a' + Date.now(),
        title: this.newAnnouncement.title,
        content: this.newAnnouncement.content,
        date: new Date().toISOString().split('T')[0],
        status: 'published'
      }
      this.announcements.unshift(newAnnouncement)
      this.newAnnouncement = { title: '', content: '' }
      this.showAddAnnouncementModal = false
      alert('公告发布成功！')
    }
  }
}
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 顶部导航栏 */
.admin-header {
  background: #dc3545;
  color: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left h1 {
  margin: 0;
  font-size: 18px;
  font-weight: normal;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-icon {
  font-size: 16px;
}

.dropdown-icon {
  font-size: 12px;
}

/* 主内容区域 */
.admin-content {
  display: flex;
  height: calc(100vh - 60px);
}

/* 左侧导航栏 */
.admin-sidebar {
  width: 200px;
  background: #343a40;
  color: white;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid #495057;
}

.menu-item:hover {
  background: #495057;
}

.menu-item.active {
  background: #dc3545;
}

/* 主内容区域 */
.admin-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 面包屑导航 */
.breadcrumb {
  margin-bottom: 20px;
  color: #666;
}

.breadcrumb span {
  margin-right: 5px;
}

/* 页面内容 */
.page-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.search-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.search-btn:hover {
  background: #c82333;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #1e7e34;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

/* 表格样式 */
.table-container {
  padding: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.data-table th {
  background: #f8f9fa;
  font-weight: bold;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.cover-image {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status.published {
  background: #d4edda;
  color: #155724;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

.status.rejected {
  background: #f8d7da;
  color: #721c24;
}

.status.normal {
  background: #d4edda;
  color: #155724;
}

.status.violation {
  background: #f8d7da;
  color: #721c24;
}

.status.pinned {
  background: #d1ecf1;
  color: #0c5460;
}

.actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

/* 占位内容 */
.placeholder {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

/* 弹窗样式 */
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
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.review-content {
  margin-bottom: 20px;
}

.review-content h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.review-content p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.review-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.reject-reason {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.reject-reason textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  resize: vertical;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>