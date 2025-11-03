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
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.35);
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 2000;
  overflow-y: auto;
}
.modal-container {
  background: #fff; 
  border-radius: 8px; 
  width: auto;
  min-width: 480px;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); 
  position: relative;
  margin: 20px;
  overflow: visible;
}
.modal-close {
  position: absolute; 
  right: 12px; 
  top: 8px; 
  border: none; 
  background: transparent;
  font-size: 24px; 
  cursor: pointer; 
  line-height: 1; 
  color: #666;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.modal-close:hover {
  background: #f3f4f6;
  color: #333;
}
.modal-body { 
  padding: 24px; 
  max-height: calc(90vh - 48px);
  overflow-y: auto;
}
</style>





