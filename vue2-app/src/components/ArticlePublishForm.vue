<template>
  <form class="form" @submit.prevent="onSubmit">
    <h3 class="title">发布新文章</h3>
    <div class="row">
      <label>标题</label>
      <input v-model.trim="model.title" required placeholder="请输入标题" />
    </div>
    <div class="row">
      <label>摘要</label>
      <textarea v-model.trim="model.summary" rows="2" placeholder="一句话概述"></textarea>
    </div>
    <div class="row">
      <label>内容</label>
      <textarea v-model.trim="model.content" rows="6" required placeholder="正文内容"></textarea>
    </div>
    <div class="row">
      <label>标签（用英文逗号分隔）</label>
      <input v-model.trim="tagsInput" placeholder="例如：美食,非遗" />
    </div>
    <div class="actions">
      <button type="button" class="btn ghost" @click="$emit('cancel')">取消</button>
      <button type="submit" class="btn primary">发布</button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'ArticlePublishForm',
  data() {
    return {
      model: { title: '', summary: '', content: '' },
      tagsInput: '',
    }
  },
  methods: {
    onSubmit() {
      if (!this.model.title || !this.model.content) return;
      const tags = (this.tagsInput || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
      const payload = {
        ...this.model,
        tags,
      }
      this.$emit('submit', payload)
    }
  }
}
</script>

<style scoped>
.form { display: flex; flex-direction: column; gap: 12px; width: 380px; max-width: 80vw; }
.title { margin: 0 0 4px; font-size: 18px; }
.row { display: grid; gap: 6px; }
label { color: #374151; font-size: 13px; }
input, textarea { border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; font: inherit; }
.actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.btn { border: 1px solid #d1d5db; background: #fff; border-radius: 6px; padding: 6px 12px; cursor: pointer; }
.btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
.btn.ghost { background: #fff; }
.btn:hover { filter: brightness(0.98); }
</style>


