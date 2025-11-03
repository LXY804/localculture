<template>
  <div class="loading-spinner" :class="{ 'loading-overlay': overlay }">
    <div class="spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    text: {
      type: String,
      default: ''
    },
    overlay: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.spinner {
  position: relative;
  width: 40px;
  height: 40px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.4s;
  border-top-color: #3b82f6;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.8s;
  border-top-color: #60a5fa;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 16px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}
</style>
