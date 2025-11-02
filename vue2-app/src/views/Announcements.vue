<template>
  <div class="page">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="list.length === 0" class="empty">暂无公告</div>
    <div v-else class="card" v-for="a in list" :key="a.id">
      <div class="row">
        <div class="title">{{ a.title }}</div>
        <div class="time">{{ formatDate(a.publishTime || a.createTime || a.date) }}</div>
      </div>
      <div class="brief">{{ a.summary || (a.content ? (a.content.length > 100 ? a.content.substring(0, 100) + '...' : a.content) : '') }}</div>
    </div>
  </div>
  
</template>

<script>
export default {
  name: 'AnnouncementsPage',
  computed: {
    list() { return this.$store.state.announcements.list || [] },
    loading() { return this.$store.state.announcements.loading || false }
  },
  created() {
    this.$store.dispatch('announcements/fetchAnnouncements')
  },
  methods: {
    formatDate(iso) {
      if (!iso) return '-'
      try {
        const d = new Date(iso)
        if (isNaN(d.getTime())) return '-'
        const p = n => String(n).padStart(2, '0')
        return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
      } catch (e) {
        return '-'
      }
    }
  }
}
</script>

<style scoped>
.page { padding: 16px; width: 75%; margin: 0 auto; }
.card { background: #fff; border-radius: 10px; padding: 16px 20px; margin-bottom: 16px; border: 1px solid #eceff3; }
.row { display: flex; align-items: center; justify-content: space-between; }
.title { font-size: 18px; font-weight: 700; color: #1f2d3d; }
.time { color: #6b7280; font-size: 12px; }
.brief { margin-top: 8px; color: #374151; line-height: 1.6; }
.loading, .empty { text-align: center; padding: 40px; color: #6b7280; }
</style>


