<template>
  <div class="page">
    <section class="block">
      <h2>活动预告</h2>
      <ul class="activities">
        <li v-for="(a, i) in activities" :key="i" class="activity-row">
          <div class="activity-info">
            <div class="activity-title">
              <a href="#" @click.prevent="goSearch(a.title)">{{ a.title }}</a>
            </div>
            <div class="activity-meta">{{ a.time }} · {{ a.place }}</div>
          </div>
          <button class="activity-cta" @click.prevent="onSignup(a)">报名</button>
        </li>
      </ul>
    </section>

    <section class="block">
      <h2>热门文章</h2>
      <div class="hot-grid">
        <div v-for="card in hotGrid" :key="card.id" class="card" @click="openArticle(card)">
          <img :src="card.img" alt="封面" />
          <div class="title" :title="card.title">{{ card.title }}</div>
        </div>
      </div>
    </section>
  </div>
  
</template>

<script>
import cover from '@/assets/logo.png'
export default {
  name: 'HomePage',
  data() {
    return {
      activities: [
        { title: '非遗市集', time: '本周六 10:00-18:00', place: '市文化广场' },
        { title: '古琴赏析会', time: '周日 14:00-16:00', place: '市文化馆A厅' },
        { title: '书法体验营', time: '周三 09:30-11:30', place: '博物馆二层' },
        { title: '皮影戏专场', time: '周五 19:00-20:30', place: '剧场小黑盒' },
        { title: '剪纸手作课', time: '下周一 10:00-12:00', place: '社区活动室' },
        { title: '民俗摄影展', time: '本月 10:00-17:00', place: '美术馆一层' },
        { title: '戏曲票友沙龙', time: '周六 15:00-17:00', place: '戏曲传习所' },
        { title: '茶艺品鉴课', time: '周日 13:00-15:00', place: '非遗体验中心' },
        { title: '刺绣基础班', time: '周二 09:00-11:00', place: '妇女文化宫' },
      ],
      // 3 列 × 3 行
      hotGrid: [
        { id: '1', title: '地方传统美食背后的故事', img: cover },
        { id: '2', title: '木版年画的传承与创新', img: cover },
        { id: '3', title: '民俗节庆与社区凝聚力', img: cover },
        { id: 'x4', title: '戏曲进校园的传承实践', img: cover },
        { id: 'x5', title: '地方方言里的文化密码', img: cover },
        { id: 'x6', title: '传统手工艺的现代设计', img: cover },
        { id: 'x7', title: '庙会中的非遗技艺巡礼', img: cover },
        { id: 'x8', title: '古建筑修缮与活化利用', img: cover },
        { id: 'x9', title: '地方音乐的田野采风', img: cover },
      ],
    }
  },
  methods: {
    goSearch(keyword) {
      this.$router.push({ name: 'articles', query: { q: keyword } })
    },
    openArticle(card) {
      if (['1','2','3'].includes(String(card.id))) {
        this.$router.push({ name: 'article-detail', params: { id: card.id } })
      } else {
        this.goSearch(card.title)
      }
    },
    onSignup(a) {
      // 演示用：实际应打开报名表或跳转报名链接
      alert(`报名成功：${a.title}`)
    },
  }
}
</script>

<style scoped>
.page { padding: 16px; width: 75%; margin: 0 auto; font-size: 20px; }
.block { margin-bottom: 24px; }
.activities { padding: 0; list-style: none; margin: 0; }
.activity-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f2f5; }
.activity-info { min-width: 0; }
.activity-title a { color: #1f2d3d; text-decoration: none; font-weight: 600; }
.activity-title a:hover { text-decoration: underline; }
.activity-meta { color: #596c7a; font-size: 20px; margin-top: 2px; }
.activity-cta { border: 1px solid #dcdfe6; background: #fff; border-radius: 4px; padding: 4px 10px; cursor: pointer; transition: background-color 120ms ease, border-color 120ms ease; }
.activity-cta:hover { background: #f2f3f5; border-color: #cfd4dc; }

.hot-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.card {
  cursor: pointer;
  border: 1px solid #e6e9ef;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  transition: box-shadow 120ms ease, transform 120ms ease;
}
.card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.06); transform: translateY(-1px); }
.card img { width: 100%; height: 92px; object-fit: cover; display: block; }
.card .title { padding: 8px; font-size: 20px; color: #2c3e50; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>


