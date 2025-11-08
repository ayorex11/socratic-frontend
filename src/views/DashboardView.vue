<template>
  <div class="dashboard">
    <div class="dashboard-content">
      <h1>Welcome to Your Dashboard</h1>
      <p>Start by uploading a PDF to get AI-powered summaries and quizzes.</p>

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
      </div>

      <div class="dashboard-actions">
        <router-link to="/upload" class="action-button primary"> 📄 Upload Document </router-link>
      </div>

      <!-- Recent Documents Section -->
      <div v-if="!loading && documents.length > 0" class="recent-documents">
        <div class="section-header">
          <h2>Recent Documents</h2>
          <router-link to="/documents" class="view-all-link"> View All → </router-link>
        </div>

        <div class="documents-grid">
          <div v-for="doc in recentDocuments" :key="doc.id" class="document-card">
            <!-- Header with title and badges -->
            <div class="card-header">
              <h3 class="document-title">{{ doc.document_title }}</h3>
              <div class="status-badges">
                <span v-if="doc.quiz_generated" class="badge badge-success" title="Quiz generated">
                  🎯 Quiz
                </span>
                <span
                  v-if="doc.used_past_questions"
                  class="badge badge-info"
                  title="Used past questions"
                >
                  ❓ Past Qs
                </span>
              </div>
            </div>

            <!-- Document metadata -->
            <div class="card-metadata">
              <div class="metadata-column">
                <div class="metadata-item">
                  <span class="metadata-label">Created:</span>
                  <span class="metadata-value">{{ formatDate(doc.created_at) }}</span>
                </div>
                <div class="metadata-item">
                  <span class="metadata-label">Processing Time:</span>
                  <span class="metadata-value">{{ Math.round(doc.processing_time) }}s</span>
                </div>
              </div>
            </div>

            <!-- Download section -->
            <div class="download-section">
              <div class="download-header">
                <span class="download-label">📥 Downloads</span>
              </div>
              <div class="download-buttons">
                <button
                  class="download-btn pdf-btn"
                  @click="downloadPDF(doc.id)"
                  :disabled="downloadingPDF[doc.id]"
                  title="Download PDF Report"
                >
                  <span v-if="!downloadingPDF[doc.id]">📄 PDF</span>
                  <span v-else class="loading-spinner"></span>
                </button>
                <button
                  class="download-btn audio-btn"
                  @click="downloadAudio(doc.id)"
                  :disabled="downloadingAudio[doc.id]"
                  title="Download Audio Summary"
                >
                  <span v-if="!downloadingAudio[doc.id]">🎵 Audio</span>
                  <span v-else class="loading-spinner"></span>
                </button>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="card-actions">
              <button
                class="card-btn quiz-btn"
                @click="viewQuiz(doc.id)"
                :disabled="!doc.quiz_generated"
                :class="{ disabled: !doc.quiz_generated }"
              >
                🎯 Quiz
              </button>
              <button
                class="card-btn delete-btn"
                @click="confirmDelete(doc.id)"
                :disabled="deleting[doc.id]"
                title="Delete this document"
              >
                <span v-if="!deleting[doc.id]">🗑️</span>
                <span v-else class="loading-spinner-delete"></span>
              </button>
            </div>
          </div>
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

      <!-- Download Error Toast -->
      <div v-if="downloadError" class="error-toast">
        {{ downloadError }}
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const documents = ref([])
const loading = ref(true)
const error = ref('')
const downloadError = ref('')
const downloadingPDF = ref({})
const downloadingAudio = ref({})
const deleting = ref({})
const deleteConfirmId = ref(null)

// Computed properties
const recentDocuments = computed(() => {
  return documents.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6)
})

const quizCount = computed(() => {
  return documents.value.filter((doc) => doc.quiz_generated).length
})

const avgProcessingTime = computed(() => {
  if (documents.value.length === 0) return 0
  const total = documents.value.reduce((sum, doc) => sum + doc.processing_time, 0)
  return Math.round(total / documents.value.length)
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
      'https://socratic-f2kh.onrender.com/socratic/list_processing_results/',
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
    } else if (response.status === 401) {
      router.push('/login')
    } else {
      throw new Error('Failed to fetch documents')
    }
  } catch (err) {
    console.error('Error fetching documents:', err)
    error.value = 'Failed to load documents. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const viewQuiz = (documentId) => {
  router.push(`/quiz/${documentId}`)
}

// Download PDF function - Using direct public URL
const downloadPDF = async (documentId) => {
  try {
    downloadingPDF.value[documentId] = true
    const token = localStorage.getItem('accessToken')

    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(
      `https://socratic-f2kh.onrender.com/socratic/download_pdf/${documentId}/`,
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
    } else if (response.status === 401) {
      router.push('/login')
    } else {
      showDownloadError('Failed to download PDF')
    }
  } catch (err) {
    console.error('Error downloading PDF:', err)
    showDownloadError('Network error. Please try again.')
  } finally {
    downloadingPDF.value[documentId] = false
  }
}

const downloadAudio = async (documentId) => {
  try {
    downloadingAudio.value[documentId] = true
    const token = localStorage.getItem('accessToken')

    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(
      `https://socratic-f2kh.onrender.com/socratic/download_audio/${documentId}/`,
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
    } else if (response.status === 401) {
      router.push('/login')
    } else {
      showDownloadError('Failed to download audio')
    }
  } catch (err) {
    console.error('Error downloading audio:', err)
    showDownloadError('Network error. Please try again.')
  } finally {
    downloadingAudio.value[documentId] = false
  }
}

// Show error toast
const showDownloadError = (message) => {
  downloadError.value = message
  setTimeout(() => {
    downloadError.value = ''
  }, 3000)
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
    deleteConfirmId.value = null // Close modal

    const token = localStorage.getItem('accessToken')

    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(
      `https://socratic-f2kh.onrender.com/socratic/delete/${documentId}/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (response.ok || response.status === 204) {
      // Remove document from local list
      documents.value = documents.value.filter((doc) => doc.id !== documentId)

      // Show success message
      showDownloadError('✅ Document deleted successfully')
    } else if (response.status === 401) {
      router.push('/login')
    } else if (response.status === 404) {
      showDownloadError('Document not found')
      // Refresh the list
      await fetchDocuments()
    } else {
      const errorData = await response.json().catch(() => ({}))
      showDownloadError(errorData.error || 'Failed to delete document')
    }
  } catch (err) {
    console.error('Error deleting document:', err)
    showDownloadError('Network error. Please try again.')
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
  padding: 40px 20px;
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-content h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.dashboard-content > p {
  font-size: 1.2rem;
  color: #5a6c7d;
  margin-bottom: 40px;
  text-align: center;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  color: #5a6c7d;
  font-size: 0.9rem;
  margin-top: 4px;
}

/* Dashboard Actions */
.dashboard-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 600px;
  margin: 0 auto 40px;
}

.action-button {
  padding: 20px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  text-align: center;
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
  background: white;
  color: #5a6c7d;
  border: 2px solid #ecf0f1;
}

.action-button.secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-button.secondary:not(:disabled):hover {
  border-color: #27ae60;
  color: #27ae60;
  transform: translateY(-2px);
}

/* Recent Documents */
.recent-documents {
  margin-top: 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin: 0;
}

.view-all-link {
  color: #27ae60;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.view-all-link:hover {
  color: #219a52;
}

/* Equal height document cards */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  grid-auto-rows: 1fr;
}

.document-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #27ae60;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 12px;
}

.document-title {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.status-badges {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.badge {
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
}

.badge-success {
  background: #e8f6ef;
  color: #27ae60;
  border-color: #27ae60;
}

.badge-info {
  background: #e8f4fd;
  color: #3498db;
  border-color: #3498db;
}

/* Card Metadata */
.card-metadata {
  margin-bottom: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.metadata-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.metadata-item:last-child {
  border-bottom: none;
}

.metadata-label {
  color: #5a6c7d;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 120px;
}

.metadata-value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.95rem;
  text-align: right;
}

/* Download Section */
.download-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.download-header {
  margin-bottom: 12px;
}

.download-label {
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
}

.download-buttons {
  display: flex;
  gap: 10px;
}

.download-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
}

.pdf-btn {
  background: #e74c3c;
  color: white;
}

.pdf-btn:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-1px);
}

.audio-btn {
  background: #3498db;
  color: white;
}

.audio-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
  align-items: stretch;
}

.card-btn {
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.quiz-btn {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
}

.quiz-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.quiz-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #2980b9 0%, #21618c 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.4);
}

.quiz-disabled-btn {
  background: #ecf0f1;
  color: #95a5a6;
  cursor: not-allowed;
  box-shadow: none;
}

.delete-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  width: 56px;
  flex: 0 0 56px;
  padding: 0;
  font-size: 1.3rem;
}

.delete-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.5);
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner-delete {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 40px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 1.5rem;
}

.empty-state p {
  color: #5a6c7d;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.upload-cta-btn {
  display: inline-block;
  padding: 14px 28px;
  background: #27ae60;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
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
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #27ae60;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-state p {
  color: #5a6c7d;
  font-size: 1.1rem;
}

/* Error Toast */
.error-toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #e74c3c;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Delete Confirmation Modal */
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
  animation: fadeIn 0.2s ease;
  padding: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 0;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(100px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-header {
  padding: 32px 32px 24px;
  background: linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%);
  position: relative;
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
}

.modal-body {
  padding: 32px;
}

.modal-body p {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.05rem;
  line-height: 1.6;
}

.warning-text {
  color: #c0392b;
  font-size: 0.95rem;
  font-weight: 600;
  background: linear-gradient(135deg, #ffe8e8 0%, #ffd4d4 100%);
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #e74c3c;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.1);
}

.modal-actions {
  padding: 0 32px 32px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
}

.cancel-btn {
  background: white;
  color: #7f8c8d;
  border: 2px solid #ecf0f1;
  box-shadow: none;
}

.cancel-btn:hover {
  background: #f8f9fa;
  border-color: #bdc3c7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.confirm-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.confirm-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition:
    width 0.6s,
    height 0.6s;
}

.confirm-btn:hover::before {
  width: 300px;
  height: 300px;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(231, 76, 60, 0.4);
}

.confirm-btn:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-actions {
    grid-template-columns: 1fr;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .status-badges {
    align-self: flex-start;
  }

  .metadata-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .metadata-value {
    text-align: left;
  }

  .card-actions {
    grid-template-columns: 1fr 1fr auto;
    gap: 8px;
  }

  .card-btn {
    min-width: auto;
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .delete-btn {
    width: 44px;
    height: 44px;
  }

  .download-buttons {
    flex-direction: column;
  }

  .dashboard-content h1 {
    font-size: 2rem;
  }

  .document-title {
    font-size: 1.2rem;
  }

  .error-toast {
    bottom: 20px;
    right: 20px;
    left: 20px;
  }

  .modal-content {
    width: 95%;
    border-radius: 16px;
  }

  .modal-header {
    padding: 24px 24px 20px;
  }

  .modal-header h3 {
    font-size: 1.3rem;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-actions {
    padding: 0 24px 24px;
    flex-direction: column-reverse;
  }

  .modal-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 20px 15px;
  }

  .document-card {
    padding: 20px;
  }

  .card-header {
    gap: 8px;
  }
}
</style>
