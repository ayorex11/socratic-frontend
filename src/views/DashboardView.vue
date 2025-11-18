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
                  :disabled="!doc.pdf_generated"
                  title="Download PDF Report"
                >
                  <span v-if="!downloadingPDF[doc.id]">📄 PDF</span>
                  <span v-else class="loading-spinner"></span>
                </button>
                <button
                  class="download-btn audio-btn"
                  @click="downloadAudio(doc.id)"
                  :disabled="!doc.audio_generated"
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

/* Equal height document cards */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));
  gap: clamp(16px, 3vw, 24px);
  grid-auto-rows: 1fr;
}

.document-card {
  background: white;
  border-radius: 12px;
  padding: clamp(16px, 3vw, 24px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 320px;
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
  margin-bottom: clamp(16px, 3vw, 20px);
  gap: clamp(8px, 2vw, 12px);
}

.document-title {
  color: #2c3e50;
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  font-weight: 600;
  margin: 0;
  flex: 1;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.status-badges {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.badge {
  padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 10px);
  border-radius: 20px;
  font-size: clamp(0.7rem, 2vw, 0.75rem);
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
  margin-bottom: clamp(16px, 3vw, 20px);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.metadata-column {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 2vw, 12px);
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(6px, 1.5vw, 8px) 0;
  border-bottom: 1px solid #f0f0f0;
}

.metadata-item:last-child {
  border-bottom: none;
}

.metadata-label {
  color: #5a6c7d;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  font-weight: 500;
  min-width: 100px;
}

.metadata-value {
  color: #2c3e50;
  font-weight: 600;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  text-align: right;
}

/* Download Section */
.download-section {
  background: #f8f9fa;
  padding: clamp(12px, 2.5vw, 16px);
  border-radius: 8px;
  margin-bottom: clamp(12px, 2.5vw, 16px);
}

.download-header {
  margin-bottom: clamp(8px, 2vw, 12px);
}

.download-label {
  color: #2c3e50;
  font-weight: 600;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
}

.download-buttons {
  display: flex;
  gap: clamp(8px, 2vw, 10px);
}

.download-btn {
  flex: 1;
  padding: clamp(8px, 2vw, 10px) clamp(12px, 2.5vw, 16px);
  border-radius: 6px;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
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
  gap: clamp(8px, 2vw, 12px);
  margin-top: auto;
  align-items: stretch;
}

.card-btn {
  padding: clamp(10px, 2.5vw, 12px) clamp(16px, 3vw, 20px);
  border-radius: 10px;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-height: 48px;
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

.delete-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  width: clamp(48px, 8vw, 56px);
  flex: 0 0 auto;
  padding: 0;
  font-size: clamp(1.1rem, 3vw, 1.3rem);
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
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Error Toast */
.error-toast {
  position: fixed;
  bottom: clamp(16px, 4vw, 30px);
  right: clamp(16px, 4vw, 30px);
  left: clamp(16px, 4vw, 30px);
  background: #e74c3c;
  color: white;
  padding: clamp(12px, 3vw, 16px) clamp(16px, 3vw, 24px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease;
  text-align: center;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  max-width: 400px;
  margin: 0 auto;
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
  padding: clamp(12px, 3vw, 20px);
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
  max-width: min(480px, 100%);
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
  padding: clamp(24px, 5vw, 32px) clamp(24px, 5vw, 32px) clamp(20px, 4vw, 24px);
  background: linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%);
  position: relative;
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: clamp(1.3rem, 4vw, 1.5rem);
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  line-height: 1.2;
}

.modal-body {
  padding: clamp(24px, 5vw, 32px);
}

.modal-body p {
  margin: 0 0 clamp(12px, 3vw, 16px) 0;
  color: #2c3e50;
  font-size: clamp(1rem, 3vw, 1.05rem);
  line-height: 1.6;
}

.warning-text {
  color: #c0392b;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  font-weight: 600;
  background: linear-gradient(135deg, #ffe8e8 0%, #ffd4d4 100%);
  padding: clamp(12px, 3vw, 16px);
  border-radius: 12px;
  border-left: 4px solid #e74c3c;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.1);
}

.modal-actions {
  padding: 0 clamp(24px, 5vw, 32px) clamp(24px, 5vw, 32px);
  display: flex;
  gap: clamp(8px, 2vw, 12px);
  justify-content: flex-end;
  flex-wrap: wrap;
}

.modal-btn {
  padding: clamp(12px, 3vw, 14px) clamp(20px, 4vw, 28px);
  border-radius: 12px;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-height: 54px;
  flex: 1;
  min-width: 120px;
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

/* Mobile-specific optimizations */
@media (max-width: 480px) {
  .dashboard {
    padding: 16px 12px;
  }

  .document-card {
    padding: 16px;
    min-height: 300px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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

  .download-buttons {
    flex-direction: column;
  }

  .card-actions {
    flex-direction: column;
  }

  .delete-btn {
    width: 100%;
    height: 48px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-btn {
    width: 100%;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1023px) {
  .documents-grid {
    grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  }
}

/* Large desktop enhancements */
@media (min-width: 1200px) {
  .documents-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .stat-card,
  .document-card,
  .action-button,
  .card-btn,
  .download-btn,
  .modal-btn,
  .upload-cta-btn {
    transition: none;
  }

  .stat-card:hover,
  .document-card:hover,
  .action-button.primary:hover,
  .card-btn:hover:not(:disabled),
  .download-btn:hover:not(:disabled),
  .modal-btn:hover,
  .upload-cta-btn:hover {
    transform: none;
  }

  .confirm-btn::before {
    display: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .dashboard {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
  }

  .stat-card,
  .document-card,
  .empty-state,
  .modal-content {
    background: #2d2d2d;
    color: #ffffff;
  }

  .dashboard-content h1,
  .section-header h2,
  .document-title,
  .metadata-value,
  .download-label {
    color: #ffffff;
  }

  .dashboard-content > p,
  .stat-label,
  .metadata-label,
  .empty-state p {
    color: #cccccc;
  }

  .download-section {
    background: #3d3d3d;
  }

  .cancel-btn {
    background: #3d3d3d;
    color: #cccccc;
    border-color: #555;
  }

  .cancel-btn:hover {
    background: #4d4d4d;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .stat-card,
  .document-card,
  .empty-state,
  .modal-content {
    border: 2px solid #000;
  }

  .action-button,
  .card-btn,
  .download-btn,
  .modal-btn,
  .upload-cta-btn {
    border: 2px solid #000;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .stat-card:hover,
  .document-card:hover,
  .action-button.primary:hover,
  .card-btn:hover:not(:disabled),
  .download-btn:hover:not(:disabled),
  .modal-btn:hover,
  .upload-cta-btn:hover {
    transform: none;
  }

  .action-button.primary:active,
  .card-btn:active:not(:disabled),
  .download-btn:active:not(:disabled),
  .modal-btn:active,
  .upload-cta-btn:active {
    transform: scale(0.98);
  }
}
</style>
