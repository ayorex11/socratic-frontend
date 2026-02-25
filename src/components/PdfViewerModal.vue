<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content pdf-modal">
      <div class="modal-header">
        <h3>{{ title || 'Document Viewer' }}</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="modal-body pdf-body">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading document...</p>
        </div>
        <iframe
          :src="pdfUrl ? `${pdfUrl}#toolbar=0` : ''"
          class="pdf-iframe"
          @load="isLoading = false"
          title="PDF Viewer"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  pdfUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const isLoading = ref(true)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isLoading.value = true
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content.pdf-modal {
  background: white;
  border-radius: 12px;
  width: 90vw;
  max-width: 1200px;
  height: 90vh;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1e293b;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  padding: 0 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-body.pdf-body {
  flex: 1;
  position: relative;
  padding: 0;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white; /* Optional: adds a white background behind the PDF if it's transparent */
}

.loading-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #cbd5e1;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loading-state p {
  color: #475569;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
  }
  .modal-content.pdf-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-height: none;
    max-width: none;
  }
}
</style>
