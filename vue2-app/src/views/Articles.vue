<template>
  <div class="page">
    <div class="header">
      <h1>文章列表</h1>
      <input v-model="localQ" class="search after-title" placeholder="搜索标题/摘要" @keyup.enter="applyFilter" />
      <div class="actions">
        <button class="btn primary" @click="openPublish">发布文章</button>
        <select v-model="sortBy">
          <option value="latest">最新</option>
          <option value="oldest">最早</option>
        </select>
      </div>
    </div>

    <div class="grid">
      <div v-for="a in presented" :key="a.id" class="card">
        <div class="cover"></div>
        <div class="body">
          <router-link class="title" :to="{ name: 'article-detail', params: { id: a.id } }">{{ a.title }}</router-link>
          <p class="summary">{{ a.summary }}</p>
          <div class="tags">
            <span v-for="t in a.tags" :key="t" class="tag"># {{ t }}</span>
          </div>
          <div class="meta">
            <span>{{ formatDate(a.date) }}</span>
            <div class="ops">
              <button class="btn">点赞</button>
              <button class="btn">收藏</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <BaseModal v-if="showPublish" @close="closePublish">
      <ArticlePublishForm @cancel="closePublish" @submit="handlePublish" />
    </BaseModal>
  </div>
  
</template>

<script>
import articles from '@/data/articles'
import BaseModal from '@/components/Modal.vue'
import ArticlePublishForm from '@/components/ArticlePublishForm.vue'
export default {
  name: 'ArticlesPage',
  data() {
    return { list: articles, localQ: this.$route.query.q || '', sortBy: 'latest', showPublish: false }
  },
  components: { BaseModal, ArticlePublishForm },
  computed: {
    filtered() {
      const q = (this.localQ || '').toLowerCase()
      if (!q) return this.list
      return this.list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        (a.tags || []).some(t => t.toLowerCase().includes(q))
      )
    },
    sorted() {
      const arr = [...this.filtered]
      arr.sort((a, b) => this.sortBy === 'latest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date))
      return arr
    },
    presented() {
      return this.sorted
    }
  },
  watch: {
    '$route.query.q'(v) { this.localQ = v || '' }
  },
  methods: {
    openPublish() { this.showPublish = true },
    closePublish() { this.showPublish = false },
    applyFilter() {
      this.$router.replace({ query: { q: this.localQ || undefined } })
    },
    formatDate(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
    },
    handlePublish(payload) {
      const newId = String(Date.now())
      const newArticle = { id: newId, date: new Date().toISOString(), ...payload }
      this.list.unshift(newArticle)
      this.closePublish()
      this.$nextTick(() => {
        alert('发布成功！')
        this.$router.push({ name: 'article-detail', params: { id: newId }, query: { from: 'list' } })
      })
    }
  }
}
</script>

<style scoped>
.page { padding: 16px; width: 75%; margin: 0 auto; }
.header { display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: 12px; margin-bottom: 12px; }
.actions { display: inline-flex; gap: 8px; align-items: center; }
.search { padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 6px; }
.after-title { min-width: 220px; }

.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.card { display: grid; grid-template-columns: 1fr 1fr; background: #fff; border: 1px solid #eceff3; border-radius: 10px; overflow: hidden; }
.cover { background: #f3f5f7; }
.body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.title { font-weight: 700; color: #1f2d3d; text-decoration: none; }
.title:hover { text-decoration: underline; }
.summary { color: #6b7280; margin: 0; }
.tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag { background: #f3f4f6; border-radius: 12px; padding: 2px 8px; font-size: 12px; color: #374151; }
.meta { display: flex; align-items: center; justify-content: space-between; color: #6b7280; font-size: 12px; }
.ops { display: flex; gap: 8px; }
.btn { border: 1px solid #dcdfe6; background: #fff; border-radius: 4px; padding: 4px 10px; cursor: pointer; }
.btn:hover { background: #f2f3f5; }
.btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
</style>


