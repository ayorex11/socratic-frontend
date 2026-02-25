<template>
  <div class="processing-card" :class="cardStateClass">
    <!-- COMPLETED STATE -->
    <div v-if="document.status === 'COMPLETED'" class="card-content completed-content">
      <div class="completed-header">
        <div class="title-section">
          <div class="success-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div>
            <div class="title-wrapper">
              <h3 class="document-title">{{ document.document_title }}</h3>
              <span v-if="document.is_premium_generation" class="premium-doc-badge">Premium ✨</span>
            </div>
            <p class="completion-time">Completed {{ formatTime(document.created_at) }}</p>
          </div>
        </div>
        <button
          @click="$emit('delete', document.id)"
          class="icon-btn delete-icon"
          :disabled="deleting"
          title="Delete document"
        >
          <svg v-if="!deleting" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
          <div v-else class="mini-spinner"></div>
        </button>
      </div>

      <div class="action-grid">
        <div
          v-if="document.pdf_generated"
          class="action-card pdf-card"
        >
          <div class="action-icon pdf-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/>
            </svg>
          </div>
          <div class="action-info">
            <div class="action-label">PDF Report</div>
            <div class="action-buttons">
              <button class="btn-action view" @click="$emit('view-pdf', document.id)">View</button>
              <button
                class="btn-action download"
                @click="$emit('download-pdf', document.id)"
                :disabled="downloadingPDF || (!document.is_premium_generation && !isPremiumUser)"
                :title="(!document.is_premium_generation && !isPremiumUser) ? 'Premium Required' : 'Download'"
              >
                <span v-if="!document.is_premium_generation && !isPremiumUser">🔒 DL</span>
                <span v-else>Download</span>
              </button>
            </div>
          </div>
          <div v-if="downloadingPDF" class="mini-spinner dark" style="position: absolute; top: 10px; right: 10px;"></div>
        </div>

        <div
          v-if="document.audio_generated"
          class="action-card audio-card"
        >
          <div class="action-icon audio-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM21 16c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/>
            </svg>
          </div>
          <div class="action-info">
            <div class="action-label">Audio Summary</div>
            <div class="action-buttons">
              <button class="btn-action view" @click="$emit('view-audio', document.id)">Listen</button>
              <button
                class="btn-action download"
                @click="$emit('download-audio', document.id)"
                :disabled="downloadingAudio || (!document.is_premium_generation && !isPremiumUser)"
                :title="(!document.is_premium_generation && !isPremiumUser) ? 'Premium Required' : 'Download'"
              >
                <span v-if="!document.is_premium_generation && !isPremiumUser">🔒 DL</span>
                <span v-else>Download</span>
              </button>
            </div>
          </div>
          <div v-if="downloadingAudio" class="mini-spinner dark" style="position: absolute; top: 10px; right: 10px;"></div>
        </div>

        <button
          v-if="document.quiz_generated"
          @click="$emit('view-quiz', document.id)"
          class="action-card quiz-card"
        >
          <div class="action-icon quiz-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
            </svg>
          </div>
          <div class="action-info">
            <div class="action-label">Practice Quiz</div>
            <div class="action-sublabel">Start now</div>
          </div>
        </button>

        <button
          v-if="document.flashcards"
          @click="$emit('view-flashcards', document.id)"
          class="action-card flashcard-card"
        >
          <div class="action-icon flashcard-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="action-info">
            <div class="action-label">Flashcards</div>
            <div class="action-sublabel">Review</div>
          </div>
        </button>
      </div>
    </div>

    <!-- FAILED STATE -->
    <div v-else-if="document.status === 'FAILED'" class="card-content failed-content">
      <div class="failed-header">
        <div class="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="failed-info">
          <h3 class="document-title">{{ document.document_title }}</h3>
          <p class="error-message">{{ document.stage_message || 'Processing failed. Please try again.' }}</p>
        </div>
        <button
          @click="$emit('delete', document.id)"
          class="icon-btn delete-icon"
          :disabled="deleting"
        >
          <svg v-if="!deleting" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <div v-else class="mini-spinner"></div>
        </button>
      </div>
    </div>

    <!-- PROCESSING STATE -->
    <div v-else class="card-content processing-content">
      <div class="processing-header">
        <div class="title-row">
          <div class="title-wrapper">
            <h3 class="document-title">{{ document.document_title }}</h3>
            <span v-if="document.is_premium_generation" class="premium-doc-badge">Premium ✨</span>
          </div>
          <div class="status-badge processing-badge">
            <div class="pulse-dot"></div>
            Processing
          </div>
        </div>
      </div>

      <!-- Current Stage Display -->
      <div class="current-stage">
        <div class="stage-icon-container" :class="currentStageConfig.colorClass">
          <component :is="currentStageConfig.icon" class="stage-icon rotating" />
        </div>
        <div class="stage-details">
          <div class="stage-label">{{ currentStageConfig.label }}</div>
          <div class="stage-message">{{ document.stage_message || 'Please wait...' }}</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Progress</span>
          <span class="progress-percentage">{{ document.stage_progress || 0 }}%</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :class="currentStageConfig.progressClass"
            :style="{ width: `${document.stage_progress || 0}%` }"
          >
            <div class="progress-shine"></div>
          </div>
        </div>
      </div>

      <!-- Compact Stage Tracker -->
      <div class="stage-tracker">
        <div
          v-for="stage in stages"
          :key="stage.key"
          class="stage-dot"
          :class="{
            'completed': isStageCompleted(stage.key),
            'active': document.processing_stage === stage.key,
            'pending': isStagePending(stage.key)
          }"
          :title="stage.label"
        >
          <svg v-if="isStageCompleted(stage.key)" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
      </div>

      <!-- Estimated Time -->
      <div class="time-estimate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <span>Usually takes 2-4 minutes</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FileText, Brain, FileCheck, Mic, HelpCircle, Clock } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isPremiumUser = computed(() => {
  return authStore.user?.premium_user || false
})

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  downloadingPDF: {
    type: Boolean,
    default: false
  },
  downloadingAudio: {
    type: Boolean,
    default: false
  },
  deleting: {
    type: Boolean,
    default: false
  }
})

defineEmits(['download-pdf', 'download-audio', 'view-pdf', 'view-audio', 'view-quiz', 'view-flashcards', 'delete'])

// Stage configuration
const STAGE_CONFIG = {
  pending: {
    label: 'Queued',
    icon: Clock,
    colorClass: 'stage-pending',
    progressClass: 'progress-pending'
  },
  extracting_text: {
    label: 'Reading Document',
    icon: FileText,
    colorClass: 'stage-extracting',
    progressClass: 'progress-extracting'
  },
  generating_summary: {
    label: 'AI Processing',
    icon: Brain,
    colorClass: 'stage-summary',
    progressClass: 'progress-summary'
  },
  creating_pdf: {
    label: 'Building PDF',
    icon: FileCheck,
    colorClass: 'stage-pdf',
    progressClass: 'progress-pdf'
  },
  generating_audio: {
    label: 'Creating Audio',
    icon: Mic,
    colorClass: 'stage-audio',
    progressClass: 'progress-audio'
  },
  creating_quiz: {
    label: 'Generating Quiz',
    icon: HelpCircle,
    colorClass: 'stage-quiz',
    progressClass: 'progress-quiz'
  }
}

const stages = [
  { key: 'extracting_text', label: 'Extract' },
  { key: 'generating_summary', label: 'AI Process' },
  { key: 'creating_pdf', label: 'PDF' },
  { key: 'generating_audio', label: 'Audio' },
  { key: 'creating_quiz', label: 'Quiz' }
]

const currentStageConfig = computed(() => {
  return STAGE_CONFIG[props.document.processing_stage] || STAGE_CONFIG.pending
})

const cardStateClass = computed(() => {
  return {
    'state-completed': props.document.status === 'COMPLETED',
    'state-failed': props.document.status === 'FAILED',
    'state-processing': props.document.status === 'PROCESSING' || props.document.status === 'PENDING'
  }
})

const isStageCompleted = (stageKey) => {
  const stageOrder = stages.map(s => s.key)
  const currentIndex = stageOrder.indexOf(props.document.processing_stage)
  const targetIndex = stageOrder.indexOf(stageKey)
  return props.document.status === 'COMPLETED' || currentIndex > targetIndex
}

const isStagePending = (stageKey) => {
  const stageOrder = stages.map(s => s.key)
  const currentIndex = stageOrder.indexOf(props.document.processing_stage)
  const targetIndex = stageOrder.indexOf(stageKey)
  return currentIndex < targetIndex
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}
</script>

<style scoped>
.processing-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
}

.processing-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.state-completed {
  border-color: #10b981;
}

.state-failed {
  border-color: #ef4444;
}

.state-processing {
  border-color: #3b82f6;
}

.card-content {
  padding: 24px;
}

/* COMPLETED STATE */
.completed-content {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.completed-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex: 1;
}

.success-icon {
  width: 40px;
  height: 40px;
  background: #10b981;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.document-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.completion-time {
  font-size: 13px;
  color: #059669;
  margin: 0;
  font-weight: 500;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.action-card {
  padding: 16px;
  border-radius: 12px;
  border: 2px solid;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  position: relative;
}

.action-card:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.action-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pdf-card {
  border-color: #fca5a5;
}

.pdf-card:hover:not(:disabled) {
  border-color: #ef4444;
  background: #fef2f2;
}

.audio-card {
  border-color: #93c5fd;
}

.audio-card:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #eff6ff;
}

.quiz-card {
  border-color: #fcd34d;
}

.quiz-card:hover:not(:disabled) {
  border-color: #f59e0b;
  background: #fffbeb;
}

.flashcard-card {
  border-color: #8b5cf6;
}

.flashcard-card:hover:not(:disabled) {
  border-color: #7c3aed;
  background: #f5f3ff;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.pdf-icon {
  background: #ef4444;
}

.audio-icon {
  background: #3b82f6;
}

.quiz-icon {
  background: #f59e0b;
}

.flashcard-icon {
  background: #8b5cf6;
}

.action-info {
  flex: 1;
}

.action-label {
  font-weight: 700;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 2px;
}

.action-sublabel {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  justify-content: center;
}

.btn-action {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-action.view {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-action.view:hover {
  background: #e5e7eb;
}

.btn-action.download {
  background: #e0f2fe;
  color: #0284c7;
}

.btn-action.download:hover:not(:disabled) {
  background: #bae6fd;
}

.btn-action.download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 4px 0;
}

.title-wrapper .document-title {
  margin: 0;
}

.premium-doc-badge {
  background: #fdf2e9;
  color: #d35400;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  border: 1px solid #e67e22;
  white-space: nowrap;
}

/* FAILED STATE */
.failed-content {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.failed-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.error-icon {
  width: 40px;
  height: 40px;
  background: #ef4444;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.failed-info {
  flex: 1;
}

.error-message {
  font-size: 14px;
  color: #dc2626;
  margin: 4px 0 0 0;
  line-height: 1.5;
}

/* PROCESSING STATE */
.processing-content {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.processing-header {
  margin-bottom: 20px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.processing-badge {
  background: #3b82f6;
  color: white;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.current-stage {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stage-icon-container {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stage-icon {
  width: 28px;
  height: 28px;
  color: white;
}

.rotating {
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.stage-pending {
  background: #6b7280;
}

.stage-extracting {
  background: #3b82f6;
}

.stage-summary {
  background: #8b5cf6;
}

.stage-pdf {
  background: #ef4444;
}

.stage-audio {
  background: #10b981;
}

.stage-quiz {
  background: #f59e0b;
}

.stage-details {
  flex: 1;
  min-width: 0;
}

.stage-label {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stage-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.progress-percentage {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.progress-track {
  height: 12px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  to {
    left: 100%;
  }
}

.progress-pending {
  background: #6b7280;
}

.progress-extracting {
  background: #3b82f6;
}

.progress-summary {
  background: #8b5cf6;
}

.progress-pdf {
  background: #ef4444;
}

.progress-audio {
  background: #10b981;
}

.progress-quiz {
  background: #f59e0b;
}

.stage-tracker {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 10px;
}

.stage-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  cursor: pointer;
}

.stage-dot.completed {
  background: #10b981;
  color: white;
}

.stage-dot.active {
  background: #3b82f6;
  color: white;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

.stage-dot.pending {
  background: #e5e7eb;
  color: #9ca3af;
}

.time-estimate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.mini-spinner.dark {
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: currentColor;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .card-content {
    padding: 16px;
  }

  .document-title {
    font-size: 16px;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .current-stage {
    flex-direction: column;
    text-align: center;
  }

  .title-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
