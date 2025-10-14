<template>
  <div class="page">
    <h1>{{ article ? article.title : '文章详情' }}</h1>
    <p v-if="article" class="summary">{{ article.summary }}</p>
    <div v-if="article" class="content">{{ article.content }}</div>
    <div class="actions">
      <router-link class="btn" :to="{ name: 'articles' }">返回文章列表</router-link>
    </div>
    <p v-else>未找到该文章。</p>
  </div>
  
</template>

<script>
import articles from '@/data/articles'
export default {
  name: 'ArticleDetailPage',
  props: { id: String },
  computed: {
    article() {
      const targetId = this.$route.params.id || this.id
      return articles.find(a => a.id === String(targetId)) || null
    }
  }
}
</script>

<style scoped>
.page { padding: 24px; }
.summary { color: #666; margin: 8px 0 16px; }
.content { white-space: pre-wrap; line-height: 1.75; }
.actions { margin-top: 16px; }
.btn { border: 1px solid #dcdfe6; background: #fff; border-radius: 4px; padding: 6px 12px; cursor: pointer; text-decoration: none; color: #1f2d3d; }
.btn:hover { background: #f2f3f5; }
</style>


