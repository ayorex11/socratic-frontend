<template>
  <div class="dashboard">
    <div class="dashboard-content">
      <h1>Welcome to Your Dashboard</h1>
      <p>Start by uploading a PDF to get AI-powered summaries and quizzes.</p>

      <!-- SSE Connection Status Indicator -->
      <div v-if="sseConnected" class="sse-status connected">
        <span class="status-dot"></span>
        Live updates connected
      </div>
      <div v-else-if="documents.length > 0 && processingCount > 0" class="sse-status disconnected">
        <span class="status-dot"></span>
        Reconnecting...
      </div>

      <!-- Quick Stats -->
      <div v-if="!loading && documents.length > 0" class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <div class="stat-number">{{ documents.length }}</div>
            <div class="stat-label">Total Documents</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <div class="stat-number">{{ quizCount }}</div>
            <div class="stat-label">Quizzes Generated</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <div class="stat-number">{{ avgProcessingTime }}s</div>
            <div class="stat-label">Avg. Processing</div>
          </div>
        </div>
        <div class="stat-card processing" :class="{ active: processingCount > 0 }">
          <div class="stat-icon">{{ processingCount > 0 ? '🔄' : '✅' }}</div>
          <div class="stat-info">
            <div class="stat-number">{{ processingCount }}</div>
            <div class="stat-label">Processing Now</div>
          </div>
        </div>
      </div>

      <div class="dashboard-actions">
        <router-link to="/upload" class="action-button primary"> 📄 Upload Document </router-link>
        <router-link to="/browse" class="action-button secondary">🌐 Browse Community </router-link>
      </div>

      <!-- Recent Documents Section -->
      <div v-if="!loading && documents.length > 0" class="recent-documents">
        <div class="section-header">
          <h2>Recent Documents</h2>
          <router-link to="/documents" class="view-all-link"> View All → </router-link>
        </div>

        <div class="documents-grid">
          <ProcessingCard
            v-for="doc in recentDocuments"
            :key="doc.id"
            :document="doc"
            :downloading-p-d-f="downloadingPDF[doc.id]"
            :downloading-audio="downloadingAudio[doc.id]"
            :deleting="deleting[doc.id]"
            @download-pdf="downloadPDF"
            @download-audio="downloadAudio"
            @view-quiz="viewQuiz"
            @delete="confirmDelete"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>No documents yet</h3>
        <p>Upload your first document to generate study materials</p>
        <router-link to="/upload" class="upload-cta-btn"> Upload Your First Document </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your documents...</p>
      </div>

      <!-- Toast Notifications -->
      <div v-if="toastMessage" class="toast" :class="toastType">
        <span class="toast-icon">{{ toastType === 'success' ? '✅' : '⚠️' }}</span>
        <span class="toast-message">{{ toastMessage }}</span>
        <button class="toast-close" @click="toastMessage = ''">×</button>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="deleteConfirmId" class="modal-overlay" @click="cancelDelete">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>⚠️ Confirm Deletion</h3>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this document?</p>
            <p class="warning-text">
              This action cannot be undone. All associated files (PDF, audio, quiz) will be
              permanently deleted.
            </p>
          </div>
          <div class="modal-actions">
            <button class="modal-btn cancel-btn" @click="cancelDelete">Cancel</button>
            <button class="modal-btn confirm-btn" @click="deleteDocument(deleteConfirmId)">
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ProcessingCard from '../components/ProcessingCard.vue'
import { useProcessingSSE } from '../composables/useProcessingSSE'

const router = useRouter()
const documents = ref([])
const loading = ref(true)
const error = ref('')
const toastMessage = ref('')
const toastType = ref('info')
const downloadingPDF = ref({})
const downloadingAudio = ref({})
const deleting = ref({})
const deleteConfirmId = ref(null)

// SSE composable
const {
  isConnected: sseConnected,
  connectToAllDocuments,
  disconnect: disconnectSSE,
} = useProcessingSSE()

// Computed properties
const recentDocuments = computed(() => {
  return [...documents.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6)
})

const quizCount = computed(() => {
  return documents.value.filter((doc) => doc.quiz_generated).length
})

const avgProcessingTime = computed(() => {
  if (documents.value.length === 0) return 0
  const total = documents.value.reduce((sum, doc) => sum + (doc.processing_time || 0), 0)
  return Math.round(total / documents.value.length)
})

const processingCount = computed(() => {
  return documents.value.filter((doc) => doc.status === 'PROCESSING' || doc.status === 'PENDING')
    .length
})

// Methods
const fetchDocuments = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('accessToken')

    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(
      'https://socratic-production-e023.up.railway.app/socratic/list_processing_results/',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      documents.value = data

      // Connect to SSE if there are processing documents
      if (processingCount.value > 0) {
        setupSSE()
      }
    } else if (response.status === 401) {
      router.push('/login')
    } else {
      throw new Error('Failed to fetch documents')
    }
  } catch (err) {
    console.error('Error fetching documents:', err)
    error.value = 'Failed to load documents. Please try again.'
    showToast('Failed to load documents', 'error')
  } finally {
    loading.value = false
  }
}

// Setup SSE connection
// Setup SSE connection
const isConnecting = ref(false)
let connectionWatchdog = null

const setupSSE = () => {
  if (sseConnected.value || isConnecting.value) return

  const token = localStorage.getItem('accessToken')
  if (!token) return

  isConnecting.value = true

  connectToAllDocuments(
    token,
    (data) => {
      // console.log('SSE UPDATE RECEIVED:', data)

      if (data.updates && Array.isArray(data.updates)) {
        documents.value = documents.value.map((doc) => {
          const update = data.updates.find((u) => u.id === doc.id)
          if (update) {
            console.log('UPDATING DOC:', doc.id, update.status)

            const wasProcessing = doc.status !== 'COMPLETED'
            if (update.status === 'COMPLETED' && wasProcessing) {
              showToast(`"${update.document_title}" completed!`, 'success')
            }
            return { ...doc, ...update }
          }
          return doc
        })
      }
    },
    () => {
      showToast('All documents processed!', 'success')
      disconnectSSE()
      fetchDocuments()
    },
    (err) => {
      if (err?.error) {
        console.warn('SSE Error:', err)
        // showToast('Connection issue', 'error')
      }
      isConnecting.value = false // Reset connecting state on error
    },
  )

  // Start watchdog to ensure we stay connected while processing
  if (!connectionWatchdog) {
    connectionWatchdog = setInterval(() => {
      if (processingCount.value > 0 && !sseConnected.value && !isConnecting.value) {
        console.log('Watchdog: Reconnecting SSE...')
        setupSSE()
      }
    }, 5000)
  }

  setTimeout(() => {
    isConnecting.value = false
  }, 1000)
}

onUnmounted(() => {
  disconnectSSE()
  if (connectionWatchdog) {
    clearInterval(connectionWatchdog)
  }
})

const viewQuiz = (documentId) => {
  router.push(`/quiz/${documentId}`)
}

// Download PDF function
const downloadPDF = async (documentId) => {
  try {
    const doc = documents.value.find((d) => d.id === documentId)
    if (doc && doc.status !== 'COMPLETED') {
      showToast(
        `Document is ${doc.status.toLowerCase()}. Please wait for processing to complete.`,
        'error',
      )
      return
    }

    downloadingPDF.value[documentId] = true
    const token = localStorage.getItem('accessToken')

    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(
      `https://socratic-production-e023.up.railway.app/socratic/download_pdf/${documentId}/`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (response.ok) {
      const blob = await response.blob()
      const filename =
        response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') ||
        `document_${documentId}.pdf`

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast('PDF downloaded successfully!', 'success')
    } else if (response.status === 401) {
      router.push('/login')
    } else {
      showToast('Failed to download PDF', 'error')
    }
  } catch (err) {
    console.error('Error downloading PDF:', err)
    showToast('Network error. Please try again.', 'error')
  } finally {
    downloadingPDF.value[documentId] = false
  }
}

const downloadAudio = async (documentId) => {
  try {
    const doc = documents.value.find((d) => d.id === documentId)
    if (doc && doc.status !== 'COMPLETED') {
      showToast(
        `Document is ${doc.status.toLowerCase()}. Please wait for processing to complete.`,
        'error',
      )
      return
    }

    downloadingAudio.value[documentId] = true
    const token = localStorage.getItem('accessToken')

    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(
      `https://socratic-production-e023.up.railway.app/socratic/download_audio/${documentId}/`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (response.ok) {
      const blob = await response.blob()
      const filename =
        response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') ||
        `audio_${documentId}.mp3`

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast('Audio downloaded successfully!', 'success')
    } else if (response.status === 401) {
      router.push('/login')
    } else {
      showToast('Failed to download audio', 'error')
    }
  } catch (err) {
    console.error('Error downloading audio:', err)
    showToast('Network error. Please try again.', 'error')
  } finally {
    downloadingAudio.value[documentId] = false
  }
}

// Show toast notification
const showToast = (message, type = 'info') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}

// Delete confirmation
const confirmDelete = (documentId) => {
  deleteConfirmId.value = documentId
}

const cancelDelete = () => {
  deleteConfirmId.value = null
}

// Delete document
const deleteDocument = async (documentId) => {
  try {
    deleting.value[documentId] = true
    deleteConfirmId.value = null

    const token = localStorage.getItem('accessToken')

    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(
      `https://socratic-production-e023.up.railway.app/socratic/delete/${documentId}/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (response.ok || response.status === 204) {
      documents.value = documents.value.filter((doc) => doc.id !== documentId)
      showToast('Document deleted successfully', 'success')
    } else if (response.status === 401) {
      router.push('/login')
    } else if (response.status === 404) {
      showToast('Document not found', 'error')
      await fetchDocuments()
    } else {
      const errorData = await response.json().catch(() => ({}))
      showToast(errorData.error || 'Failed to delete document', 'error')
    }
  } catch (err) {
    console.error('Error deleting document:', err)
    showToast('Network error. Please try again.', 'error')
  } finally {
    deleting.value[documentId] = false
  }
}

onMounted(() => {
  fetchDocuments()
})
</script>

<style scoped>
.dashboard {
  padding: clamp(20px, 4vw, 40px) clamp(12px, 3vw, 20px);
  min-height: calc(100vh - clamp(60px, 8vw, 70px));
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-content h1 {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  color: #2c3e50;
  margin-bottom: clamp(12px, 3vw, 20px);
  text-align: center;
  line-height: 1.2;
}

.dashboard-content > p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: #5a6c7d;
  margin-bottom: clamp(24px, 5vw, 40px);
  text-align: center;
  line-height: 1.4;
}

/* SSE Status Indicator */
.sse-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 20px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.sse-status.connected {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.sse-status.disconnected {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.sse-status.connected .status-dot {
  background: #28a745;
  animation: pulse 2s ease-in-out infinite;
}

.sse-status.disconnected .status-dot {
  background: #ffc107;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: clamp(12px, 3vw, 20px);
  margin-bottom: clamp(24px, 5vw, 40px);
}

.stat-card {
  background: white;
  padding: clamp(16px, 3vw, 24px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: clamp(12px, 3vw, 16px);
  transition: transform 0.3s ease;
  min-height: 100px;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card.processing.active {
  background: linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%);
  border: 2px solid #ffa500;
}

.stat-card.processing.active .stat-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.stat-icon {
  font-size: clamp(2rem, 6vw, 2.5rem);
}

.stat-number {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  color: #5a6c7d;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  margin-top: 4px;
}

/* Dashboard Actions */
.dashboard-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: clamp(12px, 3vw, 20px);
  max-width: 600px;
  margin: 0 auto clamp(24px, 5vw, 40px);
}

.action-button {
  padding: clamp(16px, 3vw, 20px);
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  font-size: clamp(0.9rem, 3vw, 1rem);
  cursor: pointer;
  text-align: center;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button.primary {
  background: #27ae60;
  color: white;
}

.action-button.primary:hover {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(39, 174, 96, 0.3);
}

.action-button.secondary {
  background: #4299e1;
  color: white;
}

.action-button.secondary:hover {
  background: #3182ce;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 153, 225, 0.3);
}

/* Recent Documents */
.recent-documents {
  margin-top: clamp(30px, 6vw, 60px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(20px, 4vw, 30px);
  flex-wrap: wrap;
  gap: 12px;
}

.section-header h2 {
  color: #2c3e50;
  font-size: clamp(1.4rem, 4vw, 1.8rem);
  margin: 0;
  line-height: 1.2;
}

.view-all-link {
  color: #27ae60;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  white-space: nowrap;
}

.view-all-link:hover {
  color: #219a52;
}

/* Documents Grid */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));
  gap: clamp(16px, 3vw, 24px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: clamp(40px, 8vw, 60px) clamp(16px, 4vw, 20px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: clamp(24px, 5vw, 40px);
}

.empty-icon {
  font-size: clamp(3rem, 10vw, 4rem);
  margin-bottom: clamp(16px, 4vw, 20px);
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: clamp(8px, 2vw, 12px);
  font-size: clamp(1.3rem, 4vw, 1.5rem);
  line-height: 1.2;
}

.empty-state p {
  color: #5a6c7d;
  margin-bottom: clamp(20px, 4vw, 30px);
  font-size: clamp(1rem, 3vw, 1.1rem);
  line-height: 1.4;
}

.upload-cta-btn {
  display: inline-block;
  padding: clamp(12px, 3vw, 14px) clamp(20px, 4vw, 28px);
  background: #27ae60;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: clamp(0.9rem, 3vw, 1rem);
  transition: all 0.3s ease;
}

.upload-cta-btn:hover {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: clamp(40px, 8vw, 60px) clamp(16px, 4vw, 20px);
}

.spinner {
  width: clamp(32px, 8vw, 40px);
  height: clamp(32px, 8vw, 40px);
  border: 4px solid #ecf0f1;
  border-top: 4px solid #27ae60;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto clamp(16px, 4vw, 20px);
}

.loading-state p {
  color: #5a6c7d;
  font-size: clamp(1rem, 3vw, 1.1rem);
}

/* Toast */
.toast {
  position: fixed;
  bottom: clamp(16px, 4vw, 30px);
  right: clamp(16px, 4vw, 30px);
  padding: clamp(12px, 3vw, 16px) clamp(16px, 3vw, 24px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.toast.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.toast.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.toast-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-weight: 600;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Delete Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: clamp(12px, 3vw, 20px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: min(480px, 100%);
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.modal-header {
  padding: clamp(24px, 5vw, 32px);
  background: linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%);
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: clamp(1.3rem, 4vw, 1.5rem);
}

.modal-body {
  padding: clamp(24px, 5vw, 32px);
}

.modal-body p {
  margin: 0 0 clamp(12px, 3vw, 16px) 0;
  color: #2c3e50;
  font-size: clamp(1rem, 3vw, 1.05rem);
}

.warning-text {
  color: #c0392b;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  font-weight: 600;
  background: #ffe8e8;
  padding: clamp(12px, 3vw, 16px);
  border-radius: 12px;
  border-left: 4px solid #e74c3c;
}

.modal-actions {
  padding: 0 clamp(24px, 5vw, 32px) clamp(24px, 5vw, 32px);
  display: flex;
  gap: clamp(8px, 2vw, 12px);
}

.modal-btn {
  flex: 1;
  padding: clamp(12px, 3vw, 14px);
  border-radius: 12px;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #ecf0f1;
  color: #7f8c8d;
}

.cancel-btn:hover {
  background: #bdc3c7;
}

.confirm-btn {
  background: #e74c3c;
  color: white;
}

.confirm-btn:hover {
  background: #c0392b;
}
</style>
