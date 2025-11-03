<template>
  <button 
    :class="['animated-btn', buttonClass]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <LoadingSpinner v-if="loading" :text="loadingText" />
    <span v-else class="button-content">
      <slot />
    </span>
  </button>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'AnimatedButton',
  components: { LoadingSpinner },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '加载中...'
    },
    buttonClass: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
.animated-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  overflow: hidden;
}

.animated-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.animated-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.animated-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 点击波纹效果 */
.animated-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.animated-btn:active::before {
  width: 200px;
  height: 200px;
}
</style>
