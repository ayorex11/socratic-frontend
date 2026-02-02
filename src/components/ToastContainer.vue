<template>
  <div class="toast-container" aria-live="polite" aria-atomic="true">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        role="alert"
      >
        <div class="toast-content">
          <span class="toast-icon">{{ getIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button @click="removeToast(toast.id)" class="toast-close" aria-label="Close notification">
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const getIcon = (type) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: min(400px, calc(100vw - 40px));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  border-left: 4px solid;
  min-width: 300px;
  pointer-events: auto;
  font-size: 0.9rem;
  line-height: 1.4;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.toast-icon {
  font-size: 1.2rem;
  font-weight: bold;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  word-break: break-word;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  margin-left: 8px;
  opacity: 0.6;
  transition: opacity 0.2s;
  flex-shrink: 0;
  border-radius: 4px;
  line-height: 1;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}

/* Toast Types */
.toast-success {
  border-left-color: #27ae60;
  background: #e8f6ef;
  color: #1e7e34;
}

.toast-success .toast-icon {
  color: #27ae60;
}

.toast-error {
  border-left-color: #e74c3c;
  background: #ffeaea;
  color: #c0392b;
}

.toast-error .toast-icon {
  color: #e74c3c;
}

.toast-warning {
  border-left-color: #f39c12;
  background: #fff3cd;
  color: #856404;
}

.toast-warning .toast-icon {
  color: #f39c12;
}

.toast-info {
  border-left-color: #3498db;
  background: #e8f4f8;
  color: #2980b9;
}

.toast-info .toast-icon {
  color: #3498db;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .toast {
    min-width: 0;
    width: 100%;
    padding: 12px 14px;
    font-size: 0.85rem;
  }

  .toast-icon {
    font-size: 1.1rem;
  }

  .toast-close {
    font-size: 1.1rem;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .toast {
    background: #2d2d2d;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .toast-success {
    background: #1a3a2a;
    color: #6bff6b;
  }

  .toast-error {
    background: #3a1a1a;
    color: #ff6b6b;
  }

  .toast-warning {
    background: #3a2f1a;
    color: #ffd700;
  }

  .toast-info {
    background: #1a2a3a;
    color: #6bb6ff;
  }

  .toast-close:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>
