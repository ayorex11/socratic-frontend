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

        <div class="pdf-toolbar" v-if="!isLoading && pageCount > 0">
          <div class="zoom-controls">
            <button @click="zoomOut" class="tool-btn" :disabled="scale <= 0.5">-</button>
            <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
            <button @click="zoomIn" class="tool-btn" :disabled="scale >= 3">+</button>
          </div>
          <div class="page-controls">
            <button @click="prevPage" class="tool-btn" :disabled="currentPage <= 1">&lt;</button>
            <span class="page-info">{{ currentPage }} / {{ pageCount }}</span>
            <button @click="nextPage" class="tool-btn" :disabled="currentPage >= pageCount">
              &gt;
            </button>
          </div>
        </div>

        <div class="pdf-container" ref="pdfContainer">
          <VuePdfEmbed
            v-if="pdfUrl"
            :source="pdfUrl"
            :page="currentPage"
            :width="pdfWidth"
            @rendered="onRendered"
            @loaded="onLoaded"
            class="vue-pdf-embed"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  pdfUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

const isLoading = ref(true)
const currentPage = ref(1)
const pageCount = ref(0)
const scale = ref(1.0)
const pdfWidth = ref(800)
const pdfContainer = ref(null)

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      isLoading.value = true
      currentPage.value = 1
      scale.value = 1.0
      document.body.style.overflow = 'hidden'
      setTimeout(updateWidth, 100)
    } else {
      document.body.style.overflow = ''
    }
  },
)

// Listen to window resizes to adjust PDF width dynamically
onMounted(() => {
  window.addEventListener('resize', updateWidth)
})

const updateWidth = () => {
  if (pdfContainer.value) {
    // 48px is the padding of the modal body
    const containerWidth = pdfContainer.value.clientWidth - 48
    pdfWidth.value = containerWidth * scale.value
  }
}

watch(scale, () => {
  updateWidth()
})

const onLoaded = (pdf) => {
  pageCount.value = pdf.numPages
}

const onRendered = () => {
  isLoading.value = false
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToTop()
  }
}

const nextPage = () => {
  if (currentPage.value < pageCount.value) {
    currentPage.value++
    scrollToTop()
  }
}

const zoomIn = () => {
  if (scale.value < 3) scale.value += 0.25
}

const zoomOut = () => {
  if (scale.value > 0.5) scale.value -= 0.25
}

const scrollToTop = () => {
  if (pdfContainer.value) {
    pdfContainer.value.scrollTop = 0
  }
}

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
  min-height: 0;
  position: relative;
  padding: 0;
  background: #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pdf-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.zoom-controls,
.page-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tool-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-level,
.page-info {
  font-size: 0.95rem;
  font-weight: 500;
  color: #475569;
  min-width: 48px;
  text-align: center;
}

.pdf-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.vue-pdf-embed {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  margin: 0 auto;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
