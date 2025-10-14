<template>
  <div class="page">
    <div class="card" v-for="a in list" :key="a.id">
      <div class="row">
        <div class="title">{{ a.title }}</div>
        <div class="time">{{ formatDate(a.date) }}</div>
      </div>
      <div class="brief">{{ a.brief }}</div>
    </div>
  </div>
  
</template>

<script>
export default {
  name: 'AnnouncementsPage',
  data() {
    return {
      list: [
        { id: 'n1', title: '公告列表', brief: '中秋文化活动报名开启', date: '2025-10-13T15:59:53' },
        { id: 'n2', title: '场馆临时闭馆通知', brief: '本周三设备检修，暂停入馆参观。', date: '2025-10-12T10:12:33' },
      ],
    }
  },
  methods: {
    formatDate(iso) {
      const d = new Date(iso); const p=n=>String(n).padStart(2,'0')
      return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
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
.brief { margin-top: 8px; color: #374151; }
</style>


