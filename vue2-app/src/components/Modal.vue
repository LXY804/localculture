<template>
  <div class="modal-mask" @click.self="onClose">
    <div class="modal-container">
      <button class="modal-close" @click="onClose">×</button>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  methods: {
    onClose() { this.$emit('close') }
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-container {
  background: #fff; border-radius: 8px; width: 420px; max-width: 92vw;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); position: relative;
}
.modal-close {
  position: absolute; right: 8px; top: 4px; border: none; background: transparent;
  font-size: 20px; cursor: pointer; line-height: 1; color: #666;
}
.modal-body { padding: 20px 20px 16px; }
</style>




