<template>
  <div class="page">
    <div class="header">
      <h1>交流论坛</h1>
      <div class="searchbar">
        <input v-model="q" placeholder="关键词" @keyup.enter="applyFilter" />
        <button @click="applyFilter">查询</button>
        <button class="publish-btn" @click="openPostModal">发布帖子</button>
      </div>
    </div>

    <div class="tabs">
      <button v-for="c in categories" :key="c.key" class="tab" :class="{ active: c.key===current }" @click="switchCat(c.key)">{{ c.name }}</button>
    </div>

    <div class="list">
      <div v-for="p in presented" :key="p.id" class="row">
        <img class="thumb" :src="p.img" alt="thumb" />
        <div class="info">
          <div class="title">{{ p.title }}</div>
          <div class="brief">{{ p.brief }}</div>
          <div class="tags">
            <span class="tag" v-for="t in p.tags" :key="t"># {{ t }}</span>
          </div>
        </div>
        <div class="meta">
          <div>{{ formatDate(p.date) }}</div>
          <button class="reply-btn" @click="openReplyModal(p)">回复</button>
        </div>
      </div>
    </div>

    <!-- 发布帖子弹窗 -->
    <BaseModal v-if="showPostModal" @close="showPostModal=false">
      <h3>发布帖子</h3>
      <div class="form-col">
        <label>主题分类
          <select v-model="newPost.cat">
            <option v-for="c in categories" :key="c.key" :value="c.key">{{ c.name }}</option>
          </select>
        </label>
        <label>标题
          <input v-model="newPost.title" placeholder="请输入标题" />
        </label>
        <label>内容摘要
          <textarea v-model="newPost.brief" rows="3" placeholder="简要描述你的观点"></textarea>
        </label>
        <div class="dialog-actions">
          <button @click="submitPost">提交</button>
          <button class="ghost" @click="showPostModal=false">取消</button>
        </div>
      </div>
    </BaseModal>

    <!-- 回复弹窗 -->
    <BaseModal v-if="showReplyModal" @close="showReplyModal=false">
      <h3>回复帖子</h3>
      <p class="hint">{{ replyTarget ? replyTarget.title : '' }}</p>
      <div class="form-col">
        <textarea v-model="replyText" rows="4" placeholder="写下你的观点…"></textarea>
        <div class="dialog-actions">
          <button @click="submitReply">提交</button>
          <button class="ghost" @click="showReplyModal=false">取消</button>
        </div>
      </div>
    </BaseModal>
  </div>
  
</template>

<script>
import cover from '@/assets/logo.png'
import BaseModal from '@/components/Modal.vue'
export default {
  name: 'ForumPage',
  components: { BaseModal },
  data() {
    return {
      q: '',
      current: 'all',
      categories: [
        { key: 'all', name: '全部' },
        { key: 'food', name: '美食' },
        { key: 'folk', name: '民俗' },
        { key: 'craft', name: '手工' },
        { key: 'art', name: '艺术' },
      ],
      posts: [
        { id: 'f1', title: '地方戏曲的前世今生', brief: '从秦腔到越剧的流变与创新。', tags: ['戏曲'], cat: 'art', img: cover, date: '2025-10-13T13:39:53' },
        { id: 'f2', title: '徽派建筑赏读', brief: '马头墙与徽州民居美学。', tags: ['建筑'], cat: 'art', img: cover, date: '2025-10-13T14:39:53' },
        { id: 'f3', title: '茶马古道的记忆', brief: '古道贸易与民族交流。', tags: ['民俗','茶'], cat: 'folk', img: cover, date: '2025-10-13T13:39:53' },
        { id: 'f4', title: '苗绣的纹样语言', brief: '针法与图腾背后的故事。', tags: ['手艺'], cat: 'craft', img: cover, date: '2025-10-13T12:39:53' },
        { id: 'f5', title: '地方美食图鉴·早茶', brief: '一盅两件的城市记忆。', tags: ['美食'], cat: 'food', img: cover, date: '2025-10-13T15:39:53' },
      ],
      showPostModal: false,
      newPost: { cat: 'all', title: '', brief: '' },
      showReplyModal: false,
      replyTarget: null,
      replyText: '',
    }
  },
  computed: {
    filtered() {
      const q = (this.q || '').toLowerCase()
      return this.posts.filter(p =>
        (this.current==='all' || p.cat===this.current) &&
        (!q || p.title.toLowerCase().includes(q) || (p.brief||'').toLowerCase().includes(q) || (p.tags||[]).some(t => t.toLowerCase().includes(q)))
      )
    },
    presented() {
      return [...this.filtered].sort((a,b)=> new Date(b.date)-new Date(a.date))
    }
  },
  methods: {
    switchCat(key) { this.current = key },
    applyFilter() {},
    openPostModal() { this.showPostModal = true },
    submitPost() {
      if (!this.newPost.title) return alert('请输入标题')
      const post = {
        id: 'f' + (Date.now()),
        title: this.newPost.title,
        brief: this.newPost.brief,
        tags: [],
        cat: this.newPost.cat || 'all',
        img: cover,
        date: new Date().toISOString(),
      }
      this.posts.unshift(post)
      this.showPostModal = false
      this.newPost = { cat: this.current, title: '', brief: '' }
    },
    openReplyModal(p) { this.replyTarget = p; this.replyText=''; this.showReplyModal = true },
    submitReply() {
      if (!this.replyText) return alert('请输入回复内容')
      // 演示用：这里仅提示，真实应提交到后端
      alert('回复成功！')
      this.showReplyModal = false
      this.replyText = ''
    },
    formatDate(iso) {
      const d = new Date(iso); const p=n=>String(n).padStart(2,'0')
      return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
    }
  }
}
</script>

<style scoped>
.page { padding: 16px; width: 75%; margin: 0 auto; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.searchbar { display: inline-flex; gap: 6px; }
.searchbar input { padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 6px; }
.searchbar button { padding: 6px 10px; border: 1px solid #dcdfe6; background: #fff; border-radius: 6px; cursor: pointer; }
.publish-btn { background: #cf2f25; color: #fff; border-color: #cf2f25; }

.tabs { display: flex; gap: 8px; border-bottom: 2px solid #cf2f25; padding: 6px 0; margin-bottom: 8px; }
.tab { padding: 4px 10px; border-radius: 4px; background: #cf2f25; color: #fff; border: none; cursor: pointer; }
.tab.active { background: #aa241c; }

.list { background: #f7f9f5; border: 1px solid #e6e9ef; }
.row { display: grid; grid-template-columns: 86px 1fr auto; align-items: center; gap: 12px; padding: 12px; border-bottom: 2px solid #cf2f25; }
.thumb { width: 86px; height: 56px; object-fit: cover; background: #eee; }
.info { overflow: hidden; }
.title { font-weight: 700; color: #1f2d3d; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.brief { color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tags { margin-top: 4px; display: flex; gap: 8px; }
.tag { background: #f3f4f6; border-radius: 12px; padding: 2px 8px; font-size: 12px; color: #374151; }
.meta { color: #6b7280; font-size: 12px; display: grid; gap: 8px; justify-items: end; }
.reply-btn { border: 1px solid #dcdfe6; background: #fff; border-radius: 4px; padding: 4px 10px; cursor: pointer; }
.reply-btn:hover { background: #f2f3f5; }

.form-col { display: grid; gap: 10px; }
.form-col input, .form-col textarea, .form-col select { width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px; }
.dialog-actions { display: flex; gap: 8px; justify-content: flex-end; }
.dialog-actions .ghost { background: #f3f4f6; border: 1px solid #e5e7eb; }
</style>


