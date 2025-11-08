<template>
  <div class="documents-page">
    <div class="page-header">
      <div class="header-content">
        <h1>All Documents</h1>
        <p>Manage and access all your processed documents</p>
      </div>
      <div class="header-actions">
        <router-link to="/dashboard" class="back-button"> ← Back to Dashboard </router-link>
        <router-link to="/upload" class="upload-button"> 📄 Upload New </router-link>
      </div>
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
          <div class="stat-label">Quizzes Ready</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-info">
          <div class="stat-number">{{ avgProcessingTime }}s</div>
          <div class="stat-label">Avg. Processing</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-number">{{ processedCount }}</div>
          <div class="stat-label">Processed</div>
        </div>
      </div>
    </div>

    <!-- Documents List -->
    <div v-if="!loading && documents.length > 0" class="documents-list">
      <div class="list-header">
        <h2>
          Your Documents <span class="doc-count">({{ documents.length }})</span>
        </h2>
        <div class="controls">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search documents..."
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
          <div class="sort-controls">
            <label for="sort-select">Sort by:</label>
            <select id="sort-select" v-model="sortBy" @change="sortDocuments">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="processing">Processing Time</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-button', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }} ({{ getTabCount(tab.value) }})
        </button>
      </div>

      <div class="documents-container">
        <div
          v-for="doc in filteredDocuments"
          :key="doc.id"
          class="document-card"
          :class="{ 'has-quiz': doc.quiz_generated }"
        >
          <!-- Header with title and status -->
          <div class="card-header">
            <div class="title-section">
              <h3 class="document-title" :title="doc.document_title">
                {{ truncateTitle(doc.document_title) }}
              </h3>
              <span class="document-date">{{ formatDate(doc.created_at) }}</span>
            </div>
            <div class="status-badges">
              <span v-if="doc.quiz_generated" class="badge badge-success" title="Quiz generated">
                🎯 Quiz Ready
              </span>
              <span v-else class="badge badge-warning" title="Quiz not generated">
                ⏳ No Quiz
              </span>
              <span
                v-if="doc.used_past_questions"
                class="badge badge-info"
                title="Used past questions"
              >
                📚 Past Questions
              </span>
            </div>
          </div>

          <!-- Document metadata -->
          <div class="card-metadata">
            <div class="metadata-item">
              <span class="metadata-label">Processing Time:</span>
              <span class="metadata-value">{{ Math.round(doc.processing_time) }} seconds</span>
            </div>
          </div>

          <!-- Progress and status -->
          <div class="progress-section">
            <div class="status-indicators">
              <div class="status-item" :class="{ completed: doc.quiz_generated }">
                <span class="status-icon">{{ doc.quiz_generated ? '✅' : '⏳' }}</span>
                <span class="status-text">Quiz Generated</span>
              </div>
              <div class="status-item" :class="{ completed: doc.pdf_generated }">
                <span class="status-icon">{{ doc.pdf_generated ? '✅' : '⏳' }}</span>
                <span class="status-text">PDF Ready</span>
              </div>
              <div class="status-item" :class="{ completed: doc.audio_generated }">
                <span class="status-icon">{{ doc.audio_generated ? '✅' : '⏳' }}</span>
                <span class="status-text">Audio Ready</span>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="action-section">
            <div class="download-buttons">
              <button
                class="download-btn pdf-btn"
                @click="downloadPDF(doc.id)"
                :disabled="downloadingPDF[doc.id]"
                title="Download PDF Report"
              >
                <span class="btn-icon">📄</span>
                <span class="btn-text">
                  <span v-if="!downloadingPDF[doc.id]">PDF</span>
                  <span v-else class="loading-spinner"></span>
                </span>
              </button>
              <button
                class="download-btn audio-btn"
                @click="downloadAudio(doc.id)"
                :disabled="downloadingAudio[doc.id]"
                title="Download Audio Summary"
              >
                <span class="btn-icon">🎵</span>
                <span class="btn-text">
                  <span v-if="!downloadingAudio[doc.id]">Audio</span>
                  <span v-else class="loading-spinner"></span>
                </span>
              </button>
            </div>

            <div class="action-buttons">
              <button
                class="action-btn quiz-btn"
                @click="viewQuiz(doc.id)"
                :disabled="!doc.quiz_generated"
                :class="{ disabled: !doc.quiz_generated }"
                title="Take generated quiz"
              >
                <span class="btn-icon">🎯</span>
                <span class="btn-text">Take Quiz</span>
              </button>
              <button
                class="action-btn delete-btn"
                @click="confirmDelete(doc.id)"
                :disabled="deleting[doc.id]"
                title="Delete this document"
              >
                <span class="btn-icon">
                  <span v-if="!deleting[doc.id]">🗑️</span>
                  <span v-else class="loading-spinner-delete"></span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No results state -->
      <div v-if="!loading && filteredDocuments.length === 0" class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No documents found</h3>
        <p>Try adjusting your search or filter criteria</p>
        <button class="clear-filters-btn" @click="clearFilters">Clear Filters</button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No documents yet</h3>
      <p>Upload your first document to generate AI-powered study materials</p>
      <router-link to="/upload" class="upload-cta-btn"> Upload Your First Document </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your documents...</p>
    </div>

    <!-- Download Error Toast -->
    <div v-if="downloadError" class="error-toast">
      <span class="toast-icon">⚠️</span>
      <span class="toast-message">{{ downloadError }}</span>
      <button class="toast-close" @click="downloadError = ''">×</button>
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
const sortBy = ref('newest')
const searchQuery = ref('')
const activeTab = ref('all')

// Tabs for filtering
const tabs = [
  { label: 'All Documents', value: 'all' },
  { label: 'With Quiz', value: 'with_quiz' },
  { label: 'Without Quiz', value: 'without_quiz' },
  { label: 'Recent', value: 'recent' },
]

// Computed properties
const quizCount = computed(() => {
  return documents.value.filter((doc) => doc.quiz_generated).length
})

const processedCount = computed(() => {
  return documents.value.length
})

const avgProcessingTime = computed(() => {
  if (documents.value.length === 0) return 0
  const total = documents.value.reduce((sum, doc) => sum + doc.processing_time, 0)
  return Math.round(total / documents.value.length)
})

const sortedDocuments = computed(() => {
  const docs = [...documents.value]
  switch (sortBy.value) {
    case 'newest':
      return docs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    case 'oldest':
      return docs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    case 'title':
      return docs.sort((a, b) => a.document_title.localeCompare(b.document_title))
    case 'processing':
      return docs.sort((a, b) => b.processing_time - a.processing_time)
    default:
      return docs
  }
})

const filteredDocuments = computed(() => {
  let filtered = sortedDocuments.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (doc) =>
        doc.document_title.toLowerCase().includes(query) || doc.id.toString().includes(query),
    )
  }

  // Apply tab filter
  switch (activeTab.value) {
    case 'with_quiz':
      filtered = filtered.filter((doc) => doc.quiz_generated)
      break
    case 'without_quiz':
      filtered = filtered.filter((doc) => !doc.quiz_generated)
      break
    case 'recent':
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      filtered = filtered.filter((doc) => new Date(doc.created_at) > oneWeekAgo)
      break
    case 'all':
    default:
      break
  }

  return filtered
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

const truncateTitle = (title) => {
  const maxLength = 60
  return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
}

const getTabCount = (tabValue) => {
  switch (tabValue) {
    case 'all':
      return documents.value.length
    case 'with_quiz':
      return documents.value.filter((doc) => doc.quiz_generated).length
    case 'without_quiz':
      return documents.value.filter((doc) => !doc.quiz_generated).length
    case 'recent':
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return documents.value.filter((doc) => new Date(doc.created_at) > oneWeekAgo).length
    default:
      return 0
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  activeTab.value = 'all'
  sortBy.value = 'newest'
}

const sortDocuments = () => {
  console.log('Sorting by:', sortBy.value)
}

const viewQuiz = (documentId) => {
  router.push(`/quiz/${documentId}`)
}

// Download PDF function - Fetch as blob then download
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
      documents.value = documents.value.filter((doc) => doc.id !== documentId)
      showDownloadError('✅ Document deleted successfully')
    } else if (response.status === 401) {
      router.push('/login')
    } else if (response.status === 404) {
      showDownloadError('Document not found')
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
.documents-page {
  padding: 30px 20px;
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content h1 {
  font-size: 2.5rem;
  color: #1a202c;
  margin-bottom: 8px;
  font-weight: 700;
}

.header-content p {
  font-size: 1.2rem;
  color: #4a5568;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.back-button {
  padding: 12px 24px;
  background: white;
  color: #4a5568;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid #e2e8f0;
  white-space: nowrap;
}

.back-button:hover {
  border-color: #4299e1;
  color: #4299e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
}

.upload-button {
  padding: 12px 24px;
  background: #48bb78;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid #48bb78;
  white-space: nowrap;
}

.upload-button:hover {
  background: #38a169;
  border-color: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
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
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  line-height: 1;
}

.stat-label {
  color: #4a5568;
  font-size: 0.9rem;
  margin-top: 4px;
}

/* Documents List */
.documents-list {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 20px;
}

.list-header h2 {
  color: #1a202c;
  font-size: 1.8rem;
  margin: 0;
  font-weight: 700;
}

.doc-count {
  color: #718096;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 12px 16px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #1a202c;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  min-width: 250px;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #a0aec0;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-controls label {
  color: #4a5568;
  font-weight: 600;
  font-size: 0.9rem;
}

.sort-controls select {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #1a202c;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.sort-controls select:focus {
  outline: none;
  border-color: #4299e1;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tab-button {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.tab-button:hover {
  border-color: #4299e1;
  color: #4299e1;
}

.tab-button.active {
  background: #4299e1;
  border-color: #4299e1;
  color: white;
}

/* Documents Container */
.documents-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

/* Document Card */
.document-card {
  background: #f7fafc;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: #4299e1;
  background: white;
}

.document-card.has-quiz {
  border-left: 4px solid #48bb78;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

.title-section {
  flex: 1;
}

.document-title {
  color: #1a202c;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.4;
  word-wrap: break-word;
}

.document-date {
  color: #718096;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badges {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid transparent;
}

.badge-success {
  background: #c6f6d5;
  color: #22543d;
  border-color: #9ae6b4;
}

.badge-warning {
  background: #feebc8;
  color: #744210;
  border-color: #fbd38d;
}

.badge-info {
  background: #bee3f8;
  color: #1a365d;
  border-color: #90cdf4;
}

/* Card Metadata */
.card-metadata {
  margin-bottom: 20px;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.metadata-item:last-child {
  border-bottom: none;
}

.metadata-label {
  color: #4a5568;
  font-size: 0.9rem;
  font-weight: 500;
}

.metadata-value {
  color: #1a202c;
  font-weight: 600;
  font-size: 0.9rem;
}

.doc-id {
  font-family: 'Courier New', monospace;
  background: #edf2f7;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

/* Progress Section */
.progress-section {
  margin-bottom: 20px;
}

.status-indicators {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #edf2f7;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.status-item.completed {
  background: #c6f6d5;
}

.status-icon {
  font-size: 0.9rem;
}

.status-text {
  color: #4a5568;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-item.completed .status-text {
  color: #22543d;
}

/* Action Section */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: auto;
}

.download-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.download-btn {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
}

.pdf-btn {
  background: #fed7d7;
  color: #c53030;
  border: 2px solid #fed7d7;
}

.pdf-btn:hover:not(:disabled) {
  background: #feb2b2;
  border-color: #feb2b2;
  transform: translateY(-1px);
}

.audio-btn {
  background: #c6f6d5;
  color: #22543d;
  border: 2px solid #c6f6d5;
}

.audio-btn:hover:not(:disabled) {
  background: #9ae6b4;
  border-color: #9ae6b4;
  transform: translateY(-1px);
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
}

.action-btn {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
}

.quiz-btn {
  background: #4299e1;
  color: white;
  border: 2px solid #4299e1;
}

.quiz-btn:hover:not(:disabled) {
  background: #3182ce;
  border-color: #3182ce;
  transform: translateY(-1px);
}

.quiz-btn.disabled {
  background: #a0aec0;
  border-color: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.delete-btn {
  background: #fed7d7;
  color: #c53030;
  border: 2px solid #fed7d7;
  width: 44px;
  padding: 0;
}

.delete-btn:hover:not(:disabled) {
  background: #feb2b2;
  border-color: #feb2b2;
  transform: translateY(-1px);
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-size: 0.85rem;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner-delete {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(197, 48, 48, 0.3);
  border-top: 2px solid #c53030;
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

/* No Results State */
.no-results {
  text-align: center;
  padding: 60px 20px;
  background: #f7fafc;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.no-results h3 {
  color: #1a202c;
  margin-bottom: 8px;
  font-size: 1.5rem;
}

.no-results p {
  color: #718096;
  margin-bottom: 24px;
}

.clear-filters-btn {
  padding: 12px 24px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: #3182ce;
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 24px;
}

.empty-state h3 {
  color: #1a202c;
  margin-bottom: 16px;
  font-size: 1.8rem;
}

.empty-state p {
  color: #718096;
  margin-bottom: 32px;
  font-size: 1.1rem;
}

.upload-cta-btn {
  display: inline-block;
  padding: 16px 32px;
  background: #48bb78;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.upload-cta-btn:hover {
  background: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.3);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

.loading-state p {
  color: #718096;
  font-size: 1.2rem;
}

/* Error Toast */
.error-toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #fed7d7;
  color: #c53030;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 4px solid #feb2b2;
  max-width: 400px;
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-message {
  flex: 1;
  font-weight: 600;
}

.toast-close {
  background: none;
  border: none;
  color: #c53030;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
  position: relative;
}

.modal-header h3 {
  margin: 0;
  color: #c53030;
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
  color: #1a202c;
  font-size: 1.05rem;
  line-height: 1.6;
}

.warning-text {
  color: #c53030;
  font-size: 0.95rem;
  font-weight: 600;
  background: #fed7d7;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #feb2b2;
  margin-top: 8px;
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
  color: #718096;
  border: 2px solid #e2e8f0;
  box-shadow: none;
}

.cancel-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.confirm-btn {
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
  color: #c53030;
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
  box-shadow: 0 8px 24px rgba(254, 178, 178, 0.4);
}

.confirm-btn:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .documents-container {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .documents-page {
    padding: 20px 15px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-content h1 {
    font-size: 2rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .documents-list {
    padding: 24px 20px;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    min-width: auto;
    width: 100%;
  }

  .documents-container {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .status-badges {
    flex-direction: row;
    align-self: stretch;
    justify-content: flex-start;
  }

  .action-section {
    gap: 12px;
  }

  .download-buttons {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr auto;
  }

  .error-toast {
    bottom: 20px;
    right: 20px;
    left: 20px;
    max-width: none;
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
  .document-card {
    padding: 20px;
  }

  .document-title {
    font-size: 1.2rem;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    flex-direction: column;
  }

  .tab-button {
    text-align: center;
  }
}
</style>
