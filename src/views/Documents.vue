<template>
  <div class="documents-page">
    <div class="page-header">
      <div class="header-content">
        <h1>All Documents</h1>
        <p>Manage and access all your processed documents</p>
      </div>
      <div class="header-actions">
        <router-link to="/dashboard" class="back-button"> ← Back to Dashboard </router-link>
        <router-link to="/browse" class="browse-button"> 🌐 Browse </router-link>
        <router-link to="/upload" class="upload-button"> 📄 Upload New </router-link>

      </div>
    </div>

    <!-- SSE Connection Status -->
    <div v-if="sseConnected" class="sse-status connected">
      <span class="status-dot"></span>
      Live updates connected
    </div>
    <div v-else-if="documents.length > 0 && processingDocumentsCount > 0" class="sse-status disconnected">
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
      <div class="stat-card processing" :class="{ active: processingDocumentsCount > 0 }">
        <div class="stat-icon">{{ processingDocumentsCount > 0 ? '🔄' : '✅' }}</div>
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
            <select id="sort-select" v-model="sortBy">
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
        <ProcessingCard
          v-for="doc in filteredDocuments"
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
const sortBy = ref('newest')
const searchQuery = ref('')
const activeTab = ref('all')

// SSE composable
const {
  isConnected: sseConnected,
  connectToAllDocuments,
  disconnect: disconnectSSE
} = useProcessingSSE()

// Tabs for filtering
const tabs = [
  { label: 'All Documents', value: 'all' },
  { label: 'With Quiz', value: 'with_quiz' },
  { label: 'Without Quiz', value: 'without_quiz' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Recent', value: 'recent' },
]

// Computed properties
const quizCount = computed(() => {
  return documents.value.filter((doc) => doc.quiz_generated).length
})

const processedCount = computed(() => {
  return documents.value.filter((doc) => doc.status === 'COMPLETED').length
})

const avgProcessingTime = computed(() => {
  const completedDocs = documents.value.filter((doc) => doc.processing_time)
  if (completedDocs.length === 0) return 0
  const total = completedDocs.reduce((sum, doc) => sum + doc.processing_time, 0)
  return Math.round(total / completedDocs.length)
})

const processingDocumentsCount = computed(() => {
  return documents.value.filter(
    (doc) => doc.status === 'PROCESSING' || doc.status === 'PENDING'
  ).length
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
      return docs.sort((a, b) => (b.processing_time || 0) - (a.processing_time || 0))
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
        doc.document_title.toLowerCase().includes(query) ||
        doc.id.toString().toLowerCase().includes(query)
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
    case 'processing':
      filtered = filtered.filter((doc) => doc.status === 'PROCESSING' || doc.status === 'PENDING')
      break
    case 'completed':
      filtered = filtered.filter((doc) => doc.status === 'COMPLETED')
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

// Watch for processing count changes
watch(processingDocumentsCount, (newCount, oldCount) => {
  if (newCount > 0 && !sseConnected.value) {
    setupSSE()
  } else if (newCount === 0 && oldCount > 0 && sseConnected.value) {
    disconnectSSE()
  }
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
      }
    )

    if (response.ok) {
      const data = await response.json()
      documents.value = data

      // Connect to SSE if there are processing documents
      if (processingDocumentsCount.value > 0) {
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
const setupSSE = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) return

  connectToAllDocuments(
    token,
    (data) => {
      console.log('SSE UPDATE RECEIVED:', data) // Keep this

      if (data.updates && Array.isArray(data.updates)) {
        // Create NEW array - 100% triggers Vue reactivity
        documents.value = documents.value.map(doc => {
          const update = data.updates.find(u => u.id === doc.id)
          if (update) {
            console.log('UPDATING DOC:', doc.id, update) // Keep this

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
    (data) => {
      showToast('All documents processed!', 'success')
      disconnectSSE()
      fetchDocuments()
    },
    (err) => {
      if (err?.error) {
        showToast('Connection issue', 'error')
      }
    }
  )
}

// Fallback polling
let pollingInterval = null
const startPolling = () => {
  stopPolling()
  pollingInterval = setInterval(async () => {
    if (processingDocumentsCount.value === 0) {
      stopPolling()
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch(
        'https://socratic-f2kh.onrender.com/socratic/list_processing_results/',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()

        const completedIds = new Set()
        data.forEach((newDoc) => {
          const oldDoc = documents.value.find((d) => d.id === newDoc.id)
          if (oldDoc && oldDoc.status !== 'COMPLETED' && newDoc.status === 'COMPLETED') {
            completedIds.add(newDoc.id)
          }
        })

        documents.value = data

        completedIds.forEach((docId) => {
          const doc = documents.value.find((d) => d.id === docId)
          if (doc) {
            showToast(`"${doc.document_title}" processing completed!`, 'success')
          }
        })

        if (processingDocumentsCount.value === 0) {
          stopPolling()
        }
      }
    } catch (err) {
      console.error('Polling error:', err)
    }
  }, 5000)
}

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

const getTabCount = (tabValue) => {
  switch (tabValue) {
    case 'all':
      return documents.value.length
    case 'with_quiz':
      return documents.value.filter((doc) => doc.quiz_generated).length
    case 'without_quiz':
      return documents.value.filter((doc) => !doc.quiz_generated).length
    case 'processing':
      return documents.value.filter(
        (doc) => doc.status === 'PROCESSING' || doc.status === 'PENDING'
      ).length
    case 'completed':
      return documents.value.filter((doc) => doc.status === 'COMPLETED').length
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

const viewQuiz = (documentId) => {
  router.push(`/quiz/${documentId}`)
}

const downloadPDF = async (documentId) => {
  try {
    const doc = documents.value.find((d) => d.id === documentId)
    if (doc && doc.status !== 'COMPLETED') {
      showToast(
        `Document is ${doc.status.toLowerCase()}. Please wait for processing to complete.`,
        'error'
      )
      return
    }

    downloadingPDF.value = { ...downloadingPDF.value, [documentId]: true }
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
      }
    )

    if (response.ok) {
      const blob = await response.blob()
      const filename =
        response.headers
          .get('Content-Disposition')
          ?.split('filename=')[1]
          ?.replace(/"/g, '') || `document_${documentId}.pdf`

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
    downloadingPDF.value = { ...downloadingPDF.value, [documentId]: false }
  }
}

const downloadAudio = async (documentId) => {
  try {
    const doc = documents.value.find((d) => d.id === documentId)
    if (doc && doc.status !== 'COMPLETED') {
      showToast(
        `Document is ${doc.status.toLowerCase()}. Please wait for processing to complete.`,
        'error'
      )
      return
    }

    downloadingAudio.value = { ...downloadingAudio.value, [documentId]: true }
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
      }
    )

    if (response.ok) {
      const blob = await response.blob()
      const filename =
        response.headers
          .get('Content-Disposition')
          ?.split('filename=')[1]
          ?.replace(/"/g, '') || `audio_${documentId}.mp3`

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
    downloadingAudio.value = { ...downloadingAudio.value, [documentId]: false }
  }
}

const showToast = (message, type = 'info') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}

const confirmDelete = (documentId) => {
  deleteConfirmId.value = documentId
}

const cancelDelete = () => {
  deleteConfirmId.value = null
}

const deleteDocument = async (documentId) => {
  try {
    deleting.value = { ...deleting.value, [documentId]: true }
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
      }
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
    deleting.value = { ...deleting.value, [documentId]: false }
  }
}

onMounted(() => {
  fetchDocuments()
})

onUnmounted(() => {
  disconnectSSE()
  stopPolling()
})
</script>

<style scoped>
.documents-page {
  padding: clamp(20px, 4vw, 30px) clamp(12px, 3vw, 20px);
  min-height: calc(100vh - clamp(60px, 8vw, 80px));
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: clamp(20px, 4vw, 30px);
  flex-wrap: wrap;
  gap: clamp(16px, 3vw, 20px);
}

.header-content h1 {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  color: #1a202c;
  margin-bottom: clamp(6px, 1.5vw, 8px);
  font-weight: 700;
  line-height: 1.2;
}

.header-content p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: #4a5568;
  margin: 0;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  gap: clamp(8px, 2vw, 12px);
  flex-wrap: wrap;
}

.back-button,
.upload-button {
  padding: clamp(10px, 2.5vw, 12px) clamp(16px, 3vw, 24px);
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid;
  white-space: nowrap;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.browse-button {
  padding: clamp(10px, 2.5vw, 12px) clamp(16px, 3vw, 24px);
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid;
  white-space: nowrap;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.browse-button:hover {
  background: linear-gradient(135deg, #5568d3 0%, #65408a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.back-button {
  background: white;
  color: #4a5568;
  border-color: #e2e8f0;
}

.back-button:hover {
  border-color: #4299e1;
  color: #4299e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
}

.upload-button {
  background: #48bb78;
  color: white;
  border-color: #48bb78;
}

.upload-button:hover {
  background: #38a169;
  border-color: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
  gap: clamp(12px, 3vw, 20px);
  margin-bottom: clamp(24px, 5vw, 40px);
}

.stat-card {
  background: white;
  padding: clamp(16px, 3vw, 24px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: clamp(12px, 3vw, 16px);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  min-height: 100px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-card.processing.active {
  background: linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%);
  border: 2px solid #ffa500;
}

.stat-card.processing.active .stat-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stat-icon {
  font-size: clamp(2rem, 6vw, 2.5rem);
}

.stat-number {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: #1a202c;
  line-height: 1;
}

.stat-label {
  color: #4a5568;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  margin-top: 4px;
}

/* Documents List */
.documents-list {
  background: white;
  border-radius: 20px;
  padding: clamp(20px, 4vw, 32px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(20px, 4vw, 24px);
  flex-wrap: wrap;
  gap: clamp(16px, 3vw, 20px);
}

.list-header h2 {
  color: #1a202c;
  font-size: clamp(1.4rem, 4vw, 1.8rem);
  margin: 0;
  font-weight: 700;
  line-height: 1.2;
}

.doc-count {
  color: #718096;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: clamp(12px, 3vw, 20px);
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: min(250px, 100%);
}

.search-input {
  padding: clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px) clamp(10px, 2.5vw, 12px)
    clamp(32px, 6vw, 40px);
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #1a202c;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  transition: all 0.3s ease;
  width: 100%;
  min-height: 48px;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.search-icon {
  position: absolute;
  left: clamp(10px, 2.5vw, 12px);
  color: #a0aec0;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: clamp(8px, 2vw, 12px);
  flex-wrap: wrap;
}

.sort-controls label {
  color: #4a5568;
  font-weight: 600;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  white-space: nowrap;
}

.sort-controls select {
  padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #1a202c;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.3s ease;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  min-height: 44px;
}

.sort-controls select:focus {
  outline: none;
  border-color: #4299e1;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: clamp(6px, 1.5vw, 8px);
  margin-bottom: clamp(20px, 4vw, 24px);
  flex-wrap: wrap;
}

.tab-button {
  padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 20px);
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  min-height: 44px;
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
  grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));
  gap: clamp(16px, 3vw, 24px);
}

/* No Results State */
.no-results {
  text-align: center;
  padding: clamp(40px, 8vw, 60px) clamp(16px, 4vw, 20px);
  background: #f7fafc;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
}

.no-results-icon {
  font-size: clamp(2.5rem, 8vw, 3rem);
  margin-bottom: clamp(12px, 3vw, 16px);
}

.no-results h3 {
  color: #1a202c;
  margin-bottom: clamp(6px, 1.5vw, 8px);
  font-size: clamp(1.3rem, 4vw, 1.5rem);
  line-height: 1.2;
}

.no-results p {
  color: #718096;
  margin-bottom: clamp(20px, 4vw, 24px);
  font-size: clamp(1rem, 3vw, 1.1rem);
  line-height: 1.4;
}

.clear-filters-btn {
  padding: clamp(10px, 2.5vw, 12px) clamp(16px, 3vw, 24px);
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(0.9rem, 3vw, 1rem);
  min-height: 48px;
}

.clear-filters-btn:hover {
  background: #3182ce;
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: clamp(60px, 10vw, 80px) clamp(16px, 4vw, 20px);
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  font-size: clamp(3rem, 10vw, 4rem);
  margin-bottom: clamp(20px, 4vw, 24px);
}

.empty-state h3 {
  color: #1a202c;
  margin-bottom: clamp(12px, 3vw, 16px);
  font-size: clamp(1.4rem, 4vw, 1.8rem);
  line-height: 1.2;
}

.empty-state p {
  color: #718096;
  margin-bottom: clamp(24px, 5vw, 32px);
  font-size: clamp(1rem, 3vw, 1.1rem);
  line-height: 1.4;
}

.upload-cta-btn {
  display: inline-block;
  padding: clamp(12px, 3vw, 16px) clamp(20px, 4vw, 32px);
  background: #48bb78;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: clamp(1rem, 3vw, 1.1rem);
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
  padding: clamp(60px, 10vw, 80px) clamp(16px, 4vw, 20px);
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: clamp(40px, 8vw, 50px);
  height: clamp(40px, 8vw, 50px);
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin-loader 1s linear infinite;
  margin: 0 auto clamp(20px, 4vw, 24px);
}

@keyframes spin-loader {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #718096;
  font-size: clamp(1rem, 3vw, 1.2rem);
}

/* Toast */
.toast {
  position: fixed;
  bottom: clamp(16px, 4vw, 30px);
  right: clamp(16px, 4vw, 30px);
  padding: clamp(12px, 3vw, 16px) clamp(16px, 3vw, 20px);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease;
  display: flex;
  align-items: center;
  gap: clamp(8px, 2vw, 12px);
  max-width: 400px;
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
  font-size: clamp(1rem, 3vw, 1.2rem);
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-weight: 600;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0.7;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
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
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
}

.modal-header h3 {
  margin: 0;
  color: #c53030;
  font-size: clamp(1.3rem, 4vw, 1.5rem);
}

.modal-body {
  padding: clamp(24px, 5vw, 32px);
}

.modal-body p {
  margin: 0 0 clamp(12px, 3vw, 16px) 0;
  color: #1a202c;
  font-size: clamp(1rem, 3vw, 1.05rem);
}

.warning-text {
  color: #c53030;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  font-weight: 600;
  background: #fed7d7;
  padding: clamp(12px, 3vw, 16px);
  border-radius: 12px;
  border-left: 4px solid #feb2b2;
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
  background: #e2e8f0;
  color: #718096;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

.confirm-btn {
  background: #fc8181;
  color: white;
}

.confirm-btn:hover {
  background: #f56565;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .sort-controls {
    justify-content: space-between;
    width: 100%;
  }

  .filter-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .tab-button {
    flex-shrink: 0;
  }

  .documents-container {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-btn {
    width: 100%;
  }
}
</style>
