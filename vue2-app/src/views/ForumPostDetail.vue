<template>
  <div class="page">
    <div class="back-section">
      <router-link class="back-btn" :to="{ name: 'forum' }"><span class="back-icon">←</span> 返回论坛</router-link>
    </div>

    <template v-if="post">
      <div class="article-container">
        <header class="article-header">
          <h1 class="article-title">{{ post.title }}</h1>
          <p class="article-summary">{{ post.brief }}</p>
          <div class="article-meta">
            <div class="meta-item"><span class="meta-label">发布人：</span><span class="meta-value">{{ post.author }}</span></div>
            <div class="meta-item"><span class="meta-label">发布时间：</span><span class="meta-value">{{ formatDate(post.date) }}</span></div>
            <div class="meta-item" v-if="post.tags && post.tags.length">
              <span class="meta-label">标签：</span>
              <div class="tags"><span v-for="t in post.tags" :key="t" class="tag"># {{ t }}</span></div>
            </div>
          </div>
        </header>

        <div class="article-content">
          <div class="content-text">{{ post.content }}</div>
        </div>

        <div class="interaction-section">
          <div class="interaction-buttons">
            <button class="interaction-btn like-btn" :class="{ active: isLikedPost }" @click="toggleLikePost">
              <span class="btn-icon">👍</span><span class="btn-text">{{ isLikedPost ? '已赞' : '点赞' }}</span>
            </button>
            <button class="interaction-btn favorite-btn" :class="{ active: isFavoritedPost }" @click="toggleFavoritePost">
              <span class="btn-icon">⭐</span><span class="btn-text">{{ isFavoritedPost ? '已收藏' : '收藏' }}</span>
            </button>
          </div>
        </div>

        <div class="comments-section">
          <h3 class="comments-title">评论 ({{ allComments.length }})</h3>

          <div class="comment-form">
            <textarea v-model="newComment" rows="3" class="comment-input" placeholder="写下你的想法..."></textarea>
            <button class="comment-submit-btn" :disabled="!newComment.trim()" @click="submitRootComment">发表评论</button>
          </div>

          <div class="comments-list">
            <div v-for="c in rootComments" :key="c.id" class="comment-item" :id="'comment-' + c.id">
              <div class="comment-header">
                <span class="comment-author">{{ c.author }}</span>
                <span class="comment-date">{{ formatDate(c.date) }}</span>
              </div>
              <div class="comment-content">{{ c.content }}</div>
              <div class="comment-actions">
                <button class="comment-like-btn" :class="{ active: isCommentLiked(c.id) }" @click="onToggleCommentLike(c)"><span class="btn-icon">👍</span><span class="btn-text">{{ isCommentLiked(c.id) ? '已赞' : '点赞' }}</span></button>
                <button class="comment-reply-btn" @click="openReplyFor(c.id)">回复</button>
              </div>
              <div v-if="replyOpenId===c.id" class="reply-form">
                <textarea v-model="replyText" rows="2" class="comment-input" placeholder="回复…"></textarea>
                <button class="comment-submit-btn" :disabled="!replyText.trim()" @click="submitReply(c)">提交回复</button>
              </div>

              <div class="replies" v-if="childrenMap[c.id] && childrenMap[c.id].length">
                <div v-for="rc in childrenMap[c.id]" :key="rc.id" class="reply-item" :id="'comment-' + rc.id">
                  <div class="reply-header">
                    <span class="reply-author">{{ rc.author }}</span>
                    <span class="reply-date">{{ formatDate(rc.date) }}</span>
                  </div>
                  <div class="reply-content">{{ rc.content }}</div>
                  <div class="reply-actions">
                    <button class="comment-like-btn" :class="{ active: isCommentLiked(rc.id) }" @click="onToggleCommentLike(rc)"><span class="btn-icon">👍</span><span class="btn-text">{{ isCommentLiked(rc.id) ? '已赞' : '点赞' }}</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="not-found"><h2>未找到该帖子</h2></div>
  </div>
</template>

<script>
import forumPosts from '@/data/forumPosts'
import { mapGetters } from 'vuex'
export default {
  name: 'ForumPostDetailPage',
  props: { id: String },
  data() {
    return { newComment: '', replyOpenId: null, replyText: '' }
  },
  computed: {
    ...mapGetters(['isLiked', 'isFavorited', 'getCommentsByArticle', 'isCommentLiked']),
    post() {
      const targetId = this.$route.params.id || this.id
      return forumPosts.find(p => p.id === String(targetId)) || null
    },
    postId() { return this.post ? this.post.id : null },
    isLikedPost() { return this.postId ? this.$store.getters.isLiked(this.postId) : false },
    isFavoritedPost() { return this.postId ? this.$store.getters.isFavorited(this.postId) : false },
    allComments() { return this.postId ? this.$store.getters.getCommentsByArticle(this.postId) : [] },
    rootComments() { return this.allComments.filter(c => !c.parentCommentId) },
    childrenMap() {
      const map = {}
      this.allComments.forEach(c => {
        if (!c.parentCommentId) return
        if (!map[c.parentCommentId]) map[c.parentCommentId] = []
        map[c.parentCommentId].push(c)
      })
      return map
    }
  },
  methods: {
    formatDate(iso) {
      if (!iso) return ''
      const d = new Date(iso); const p = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}年${p(d.getMonth()+1)}月${p(d.getDate())}日 ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    toggleLikePost() { if (this.postId) this.$store.dispatch('toggleLike', this.postId) },
    toggleFavoritePost() { if (this.postId) this.$store.dispatch('toggleFavorite', this.postId) },
    submitRootComment() {
      if (!this.newComment.trim() || !this.postId) return
      this.$store.dispatch('addComment', { articleId: this.postId, content: this.newComment.trim(), parentCommentId: null, targetType: 'forum', targetAuthor: this.post.author })
      this.newComment = ''
    },
    openReplyFor(commentId) { this.replyOpenId = commentId; this.replyText = '' },
    submitReply(parent) {
      if (!this.replyText.trim() || !this.postId) return
      this.$store.dispatch('addComment', { articleId: this.postId, content: this.replyText.trim(), parentCommentId: parent.id, targetType: 'forum', targetAuthor: parent.author })
      this.replyText = ''; this.replyOpenId = null
    },
    onToggleCommentLike(c) {
      this.$store.dispatch('toggleCommentLike', { commentId: c.id, articleId: this.postId, commentAuthor: c.author, targetType: 'forum' })
    }
  },
  mounted() {
    const commentId = this.$route.query.highlight
    if (commentId) {
      this.$nextTick(() => {
        const el = document.getElementById('comment-' + commentId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('highlight'); setTimeout(()=> el.classList.remove('highlight'), 3000)
        }
      })
    }
  }
}
</script>

<style scoped>
/* 基础布局（与文章详情风格接近） */
.page { min-height: 100vh; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 0; }
.back-section { position: sticky; top: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0,0,0,0.1); padding: 16px 24px; z-index: 100; }
.back-btn { display: inline-flex; align-items: center; gap: 8px; color: #4a5568; text-decoration: none; font-size: 14px; font-weight: 500; }
.back-btn:hover { color: #2d3748; }
.back-icon { font-weight: bold; }
.article-container { max-width: 800px; margin: 0 auto; padding: 40px 24px; }
.article-header { background: #fff; border-radius: 16px; padding: 40px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.article-title { font-size: 2.2rem; font-weight: 700; color: #1a202c; line-height: 1.2; margin: 0 0 16px; text-align: center; }
.article-summary { font-size: 1.1rem; color: #4a5568; line-height: 1.6; text-align: center; margin: 0 0 24px; }
.article-meta { display: flex; flex-direction: column; gap: 10px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
.meta-item { display: flex; gap: 8px; align-items: center; }
.meta-label { font-weight: 600; color: #2d3748; font-size: 14px; }
.meta-value { color: #4a5568; font-size: 14px; }
.tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag { background: #f3f4f6; border-radius: 12px; padding: 4px 10px; font-size: 12px; color: #374151; }
.article-content { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 16px; }
.content-text { white-space: pre-wrap; line-height: 1.8; color: #2d3748; font-size: 1.05rem; text-align: justify; }

/* 互动与评论（复用文章页近似样式） */
.interaction-section { background: #fff; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.interaction-buttons { display: flex; gap: 12px; justify-content: center; }
.interaction-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: 2px solid #e2e8f0; background: #fff; border-radius: 25px; cursor: pointer; font-size: 14px; color: #4a5568; }
.interaction-btn.active { color: #fff; }
.like-btn.active { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-color: #ff6b6b; }
.favorite-btn.active { background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%); border-color: #feca57; }
.btn-icon { font-size: 16px; }

.comments-section { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.comments-title { color: #2d3748; margin: 0 0 16px; font-size: 1.4rem; font-weight: 600; }
.comment-form { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
.comment-input { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 72px; }
.comment-submit-btn { margin-top: 10px; padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
.comments-list { display: flex; flex-direction: column; gap: 16px; }
.comment-item { padding: 16px; background: #f8fafc; border-left: 4px solid #667eea; border-radius: 10px; }
.comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.comment-author { font-weight: 600; color: #2d3748; font-size: 14px; }
.comment-date { color: #718096; font-size: 12px; }
.comment-content { color: #4a5568; line-height: 1.6; font-size: 14px; }
.comment-actions { margin-top: 8px; }
.comment-like-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid #d1d5db; background: #fff; border-radius: 16px; cursor: pointer; font-size: 12px; color: #6b7280; }
.comment-like-btn.active { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-color: #ff6b6b; color: #fff; }

/* 回复样式 */
.comment-reply-btn { margin-left: 8px; border: 1px solid #d1d5db; background: #fff; border-radius: 16px; padding: 6px 12px; cursor: pointer; font-size: 12px; color: #6b7280; }
.reply-form { margin-top: 8px; }
.replies { margin-top: 8px; padding-left: 12px; border-left: 2px dashed #e5e7eb; }
.reply-item { background: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 10px; margin-top: 8px; }
.reply-header { display: flex; justify-content: space-between; color: #6b7280; font-size: 12px; margin-bottom: 6px; }
.reply-author { font-weight: 600; color: #2d3748; }
.reply-content { color: #4a5568; font-size: 13px; }

.highlight { background: #fef3c7 !important; }
</style>


