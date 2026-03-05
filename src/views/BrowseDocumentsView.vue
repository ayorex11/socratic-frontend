<template>
  <div class="browse-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Browse Community Documents</h1>
        <p v-if="user?.premium_user" class="premium-badge">
          ⭐ Premium Access - Browse all documents
        </p>
        <p v-else>Discover documents shared by the community</p>
      </div>
      <div class="header-actions">
        <router-link to="/dashboard" class="back-button"> ← Back to Dashboard </router-link>
        <router-link to="/upload" class="upload-button"> 📄 Upload Document </router-link>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="search-filter-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by title..."
          class="search-input"
          @input="debouncedSearch"
        />
        <span class="search-icon">🔍</span>
      </div>

      <div class="filter-group">
        <div class="filter-item">
          <label for="quiz-filter">Filter:</label>
          <select id="quiz-filter" v-model="quizFilter">
            <option value="all">All Documents</option>
            <option value="with_quiz">With Quiz</option>
            <option value="without_quiz">Without Quiz</option>
          </select>
        </div>

        <div class="filter-item">
          <label for="sort-select">Sort by:</label>
          <select id="sort-select" v-model="sortBy">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="most_quizzes">Most Quizzes</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results Summary -->
    <div v-if="!loading && documents.length > 0" class="results-summary">
      <div class="summary-text">
        <strong>{{ filteredDocuments.length }}</strong>
        {{ filteredDocuments.length === 1 ? 'document' : 'documents' }} found
        <span v-if="searchQuery" class="search-term"> for "{{ searchQuery }}" </span>
      </div>
      <button v-if="hasActiveFilters" @click="clearFilters" class="clear-btn">Clear Filters</button>
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
          <div class="stat-number">{{ documentsWithQuizCount }}</div>
          <div class="stat-label">With Quizzes</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <div class="stat-number">{{ totalQuizzes }}</div>
          <div class="stat-label">Total Quizzes</div>
        </div>
      </div>
      <div class="stat-card" :class="{ premium: user?.premium_user }">
        <div class="stat-icon">{{ user?.premium_user ? '⭐' : '🔓' }}</div>
        <div class="stat-info">
          <div class="stat-number">{{ user?.premium_user ? 'Premium' : 'Free' }}</div>
          <div class="stat-label">Access Level</div>
        </div>
      </div>
    </div>

    <!-- Documents Grid -->
    <div v-if="!loading && filteredDocuments.length > 0" class="documents-grid">
      <div v-for="doc in paginatedDocuments" :key="doc.id" class="document-card">
        <div class="card-header">
          <h3 class="doc-title">{{ doc.document_title }}</h3>
          <div v-if="doc.Quiz && doc.Quiz.length > 0" class="quiz-badge">
            🎯 {{ doc.Quiz.length }} {{ doc.Quiz.length === 1 ? 'Quiz' : 'Quizzes' }}
          </div>
        </div>

        <div class="card-body">
          <div class="doc-info">
            <div class="info-item">
              <span class="info-icon">📄</span>
              <span class="info-text">PDF Available</span>
            </div>
            <div class="info-item">
              <span class="info-icon">🔊</span>
              <span class="info-text">Audio Summary</span>
            </div>
          </div>

          <!-- Quizzes List -->
          <div v-if="doc.Quiz && doc.Quiz.length > 0" class="quizzes-list">
            <p class="quizzes-label">Available Quizzes:</p>
            <div class="quiz-chips">
              <div v-for="quiz in doc.Quiz.slice(0, 3)" :key="quiz.id" class="quiz-chip">
                {{ quiz.name }}
              </div>
              <div v-if="doc.Quiz.length > 3" class="quiz-chip more">
                +{{ doc.Quiz.length - 3 }} more
              </div>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button
            @click="downloadPDF(doc.id)"
            :disabled="downloadingPDF[doc.id]"
            class="action-btn primary"
          >
            <span v-if="downloadingPDF[doc.id]">⏳ Downloading...</span>
            <span v-else>📥 Download PDF</span>
          </button>
          <button
            @click="downloadAudio(doc.id)"
            :disabled="downloadingAudio[doc.id]"
            class="action-btn secondary"
          >
            <span v-if="downloadingAudio[doc.id]">⏳ Downloading...</span>
            <span v-else>🔊 Download Audio</span>
          </button>
          <button
            v-if="doc.Quiz && doc.Quiz.length > 0"
            @click="viewQuizzes(doc)"
            class="action-btn quiz"
          >
            🎯 View Quizzes
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && filteredDocuments.length > itemsPerPage" class="pagination">
      <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">
        ← Previous
      </button>
      <div class="page-numbers">
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="currentPage = page"
          :class="['page-num', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
      </div>
      <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">
        Next →
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && documents.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No Community Documents Yet</h3>
      <p>Be the first to share a document with the community!</p>
      <router-link to="/upload" class="upload-cta-btn"> Upload Your First Document </router-link>
    </div>

    <!-- No Results State -->
    <div
      v-if="!loading && documents.length > 0 && filteredDocuments.length === 0"
      class="no-results"
    >
      <div class="no-results-icon">🔍</div>
      <h3>No documents found</h3>
      <p>Try adjusting your search or filter criteria</p>
      <button class="clear-filters-btn" @click="clearFilters">Clear All Filters</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading community documents...</p>
    </div>

    <!-- Toast Notifications -->
    <div v-if="toastMessage" class="toast" :class="toastType">
      <span class="toast-icon">{{ toastType === 'success' ? '✅' : '⚠️' }}</span>
      <span class="toast-message">{{ toastMessage }}</span>
      <button class="toast-close" @click="toastMessage = ''">×</button>
    </div>

    <!-- Quizzes Modal -->
    <div v-if="selectedDocument" class="modal-overlay" @click="closeQuizzesModal">
      <div class="modal-content quizzes-modal" @click.stop>
        <div class="modal-header">
          <h3>📚 {{ selectedDocument.document_title }}</h3>
          <button class="close-modal" @click="closeQuizzesModal">×</button>
        </div>
        <div class="modal-body">
          <p class="quizzes-count">
            {{ selectedDocument.Quiz.length }}
            {{ selectedDocument.Quiz.length === 1 ? 'Quiz' : 'Quizzes' }}
            Available
          </p>
          <div class="quizzes-grid">
            <div
              v-for="quiz in selectedDocument.Quiz"
              :key="quiz.id"
              class="quiz-item"
              @click="viewQuiz(selectedDocument.id)"
            >
              <div class="quiz-icon">🎯</div>
              <div class="quiz-details">
                <h4>{{ quiz.name }}</h4>
                <p>Click to start quiz</p>
              </div>
              <div class="quiz-arrow">→</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { API_BASE } from '@/config'

const router = useRouter()
const authStore = useAuthStore()

const documents = ref([])
const loading = ref(true)
const searchQuery = ref('')
const sortBy = ref('newest')
const quizFilter = ref('all')
const toastMessage = ref('')
const toastType = ref('info')
const downloadingPDF = ref({})
const downloadingAudio = ref({})
const selectedDocument = ref(null)
const currentPage = ref(1)
const itemsPerPage = 12

const user = computed(() => authStore.user)

// Computed properties
const documentsWithQuizCount = computed(() => {
  return documents.value.filter((doc) => doc.Quiz && doc.Quiz.length > 0).length
})

const totalQuizzes = computed(() => {
  return documents.value.reduce((sum, doc) => sum + (doc.Quiz?.length || 0), 0)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || quizFilter.value !== 'all' || sortBy.value !== 'newest'
})

const sortedDocuments = computed(() => {
  const docs = [...documents.value]

  switch (sortBy.value) {
    case 'newest':
      return docs.reverse()
    case 'oldest':
      return docs
    case 'title_asc':
      return docs.sort((a, b) => a.document_title.localeCompare(b.document_title))
    case 'title_desc':
      return docs.sort((a, b) => b.document_title.localeCompare(a.document_title))
    case 'most_quizzes':
      return docs.sort((a, b) => (b.Quiz?.length || 0) - (a.Quiz?.length || 0))
    default:
      return docs
  }
})

const filteredDocuments = computed(() => {
  let filtered = sortedDocuments.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((doc) => doc.document_title.toLowerCase().includes(query))
  }

  // Apply quiz filter
  if (quizFilter.value === 'with_quiz') {
    filtered = filtered.filter((doc) => doc.Quiz && doc.Quiz.length > 0)
  } else if (quizFilter.value === 'without_quiz') {
    filtered = filtered.filter((doc) => !doc.Quiz || doc.Quiz.length === 0)
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredDocuments.value.length / itemsPerPage)
})

const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredDocuments.value.slice(start, end)
})

const displayedPages = computed(() => {
  const pages = []
  const maxPages = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2))
  let endPage = Math.min(totalPages.value, startPage + maxPages - 1)

  if (endPage - startPage < maxPages - 1) {
    startPage = Math.max(1, endPage - maxPages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

// Debounced search
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

// Methods
const fetchDocuments = async () => {
  try {
    loading.value = true
    const response = await fetch(`${API_BASE}/socratic/get_all_documents/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

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
    showToast('Failed to load documents. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  quizFilter.value = 'all'
  sortBy.value = 'newest'
  currentPage.value = 1
}

const downloadPDF = async (documentId) => {
  try {
    downloadingPDF.value[documentId] = true

    const response = await fetch(`${API_BASE}/socratic/download_pdf/${documentId}/`, {
      method: 'GET',
      credentials: 'include',
    })

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
    downloadingAudio.value[documentId] = true

    const response = await fetch(`${API_BASE}/socratic/download_audio/${documentId}/`, {
      method: 'GET',
      credentials: 'include',
    })

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

const viewQuizzes = (doc) => {
  selectedDocument.value = doc
}

const closeQuizzesModal = () => {
  selectedDocument.value = null
}

const viewQuiz = (documentID) => {
  router.push(`/quiz/${documentID}`)
}

const showToast = (message, type = 'info') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}

onMounted(() => {
  fetchDocuments()
})
</script>

<style scoped>
.browse-page {
  padding: clamp(20px, 4vw, 30px) clamp(12px, 3vw, 20px);
  min-height: calc(100vh - clamp(60px, 8vw, 80px));
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: clamp(24px, 5vw, 32px);
  flex-wrap: wrap;
  gap: clamp(16px, 3vw, 20px);
}

.header-content h1 {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  color: #1a202c;
  margin-bottom: clamp(8px, 2vw, 12px);
  font-weight: 700;
  line-height: 1.2;
}

.header-content p {
  font-size: clamp(1rem, 3vw, 1.1rem);
  color: #4a5568;
  margin: 0;
  line-height: 1.4;
}

.premium-badge {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #7c2d12;
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px);
  border-radius: 20px;
  font-weight: 700;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  display: inline-block;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
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

.back-button {
  background: white;
  color: #4a5568;
  border-color: #e2e8f0;
}

.back-button:hover {
  border-color: #4299e1;
  color: #4299e1;
  transform: translateY(-2px);
}

.upload-button {
  background: #48bb78;
  color: white;
  border-color: #48bb78;
}

.upload-button:hover {
  background: #38a169;
  transform: translateY(-2px);
}

/* Search and Filter Section */
.search-filter-section {
  background: white;
  padding: clamp(20px, 4vw, 24px);
  border-radius: 16px;
  margin-bottom: clamp(20px, 4vw, 24px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.search-box {
  position: relative;
  margin-bottom: clamp(16px, 3vw, 20px);
}

.search-input {
  width: 100%;
  padding: clamp(12px, 3vw, 14px) clamp(16px, 4vw, 20px) clamp(12px, 3vw, 14px)
    clamp(40px, 8vw, 48px);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: clamp(1rem, 3vw, 1.1rem);
  transition: all 0.3s ease;
  background: #f7fafc;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  background: white;
}

.search-icon {
  position: absolute;
  left: clamp(12px, 3vw, 16px);
  top: 50%;
  transform: translateY(-50%);
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  color: #a0aec0;
}

.filter-group {
  display: flex;
  gap: clamp(12px, 3vw, 16px);
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: clamp(8px, 2vw, 12px);
  flex: 1;
  min-width: min(200px, 100%);
}

.filter-item label {
  color: #4a5568;
  font-weight: 600;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  white-space: nowrap;
}

.filter-item select {
  flex: 1;
  padding: clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px);
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #1a202c;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.3s ease;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  min-height: 44px;
}

.filter-item select:focus {
  outline: none;
  border-color: #4299e1;
}

/* Results Summary */
.results-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(12px, 3vw, 16px) clamp(16px, 4vw, 20px);
  background: white;
  border-radius: 12px;
  margin-bottom: clamp(16px, 3vw, 20px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;
  gap: 12px;
}

.summary-text {
  color: #4a5568;
  font-size: clamp(0.95rem, 2.5vw, 1.05rem);
}

.summary-text strong {
  color: #1a202c;
  font-size: clamp(1.1rem, 3vw, 1.2rem);
}

.search-term {
  color: #4299e1;
  font-weight: 600;
}

.clear-btn {
  padding: clamp(8px, 2vw, 10px) clamp(14px, 3vw, 18px);
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
}

.clear-btn:hover {
  background: #cbd5e0;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: clamp(16px, 3vw, 20px);
  margin-bottom: clamp(24px, 5vw, 32px);
}

.stat-card {
  background: white;
  padding: clamp(20px, 4vw, 24px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: clamp(16px, 3vw, 20px);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  min-height: 100px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-card.premium {
  background: linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%);
  border: 2px solid #ffa500;
}

.stat-icon {
  font-size: clamp(2.2rem, 6vw, 2.8rem);
}

.stat-number {
  font-size: clamp(1.6rem, 4vw, 2rem);
  font-weight: 700;
  color: #1a202c;
  line-height: 1;
}

.stat-label {
  color: #4a5568;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  margin-top: 6px;
}

/* Documents Grid */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: clamp(20px, 4vw, 24px);
  margin-bottom: clamp(24px, 5vw, 32px);
}

.document-card {
  background: white;
  border-radius: 16px;
  padding: clamp(20px, 4vw, 24px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 3vw, 20px);
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.doc-title {
  font-size: clamp(1.1rem, 3vw, 1.25rem);
  color: #1a202c;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.quiz-badge {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  color: #0050b3;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 3vw, 16px);
}
.doc-info {
  display: flex;
  gap: clamp(12px, 3vw, 16px);
  flex-wrap: wrap;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f7fafc;
  border-radius: 8px;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  color: #4a5568;
}
.info-icon {
  font-size: 1.1rem;
}
.quizzes-list {
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}
.quizzes-label {
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  color: #4a5568;
  font-weight: 600;
  margin-bottom: 8px;
}
.quiz-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.quiz-chip {
  padding: 6px 12px;
  background: #e6f7ff;
  color: #0050b3;
  border-radius: 16px;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  font-weight: 600;
}
.quiz-chip.more {
  background: #f0f0f0;
  color: #595959;
}
.card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.action-btn {
  padding: clamp(10px, 2.5vw, 12px);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  min-height: 44px;
}
.action-btn.primary {
  background: #4299e1;
  color: white;
}
.action-btn.primary:hover:not(:disabled) {
  background: #3182ce;
}
.action-btn.secondary {
  background: #48bb78;
  color: white;
}
.action-btn.secondary:hover:not(:disabled) {
  background: #38a169;
}
.action-btn.quiz {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.action-btn.quiz:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(8px, 2vw, 12px);
  margin-top: clamp(24px, 5vw, 32px);
  flex-wrap: wrap;
}
.page-btn {
  padding: clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px);
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #4a5568;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  min-height: 44px;
}
.page-btn:hover:not(:disabled) {
  border-color: #4299e1;
  color: #4299e1;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-numbers {
  display: flex;
  gap: clamp(4px, 1vw, 8px);
}
.page-num {
  padding: clamp(10px, 2.5vw, 12px) clamp(14px, 3vw, 18px);
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #4a5568;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-num:hover {
  border-color: #4299e1;
  color: #4299e1;
}
.page-num.active {
  background: #4299e1;
  border-color: #4299e1;
  color: white;
}
/* Empty State */
.empty-state,
.no-results {
  text-align: center;
  padding: clamp(60px, 10vw, 80px) clamp(20px, 4vw, 24px);
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px dashed #e2e8f0;
}
.empty-icon,
.no-results-icon {
  font-size: clamp(3.5rem, 10vw, 4.5rem);
  margin-bottom: clamp(20px, 4vw, 24px);
}
.empty-state h3,
.no-results h3 {
  color: #1a202c;
  margin-bottom: clamp(12px, 3vw, 16px);
  font-size: clamp(1.5rem, 4vw, 1.8rem);
}
.empty-state p,
.no-results p {
  color: #718096;
  margin-bottom: clamp(24px, 5vw, 32px);
  font-size: clamp(1rem, 3vw, 1.1rem);
}
.upload-cta-btn,
.clear-filters-btn {
  display: inline-block;
  padding: clamp(14px, 3vw, 16px) clamp(24px, 5vw, 32px);
  background: #48bb78;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: clamp(1rem, 3vw, 1.1rem);
  cursor: pointer;
  transition: all 0.3s ease;
}
.upload-cta-btn:hover,
.clear-filters-btn:hover {
  background: #38a169;
  transform: translateY(-2px);
}
/* Loading State */
.loading-state {
  text-align: center;
  padding: clamp(60px, 10vw, 80px) clamp(20px, 4vw, 24px);
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.spinner {
  width: clamp(48px, 10vw, 60px);
  height: clamp(48px, 10vw, 60px);
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto clamp(20px, 4vw, 24px);
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.loading-state p {
  color: #718096;
  font-size: clamp(1rem, 3vw, 1.2rem);
}
/* Toast */
.toast {
  position: fixed;
  bottom: clamp(20px, 4vw, 30px);
  right: clamp(20px, 4vw, 30px);
  padding: clamp(14px, 3vw, 16px) clamp(18px, 4vw, 24px);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
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
.toast-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}
.toast-message {
  flex: 1;
  font-weight: 600;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
}
.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  opacity: 0.7;
  transition: all 0.2s;
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
/* Quizzes Modal */
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
  padding: clamp(16px, 4vw, 20px);
}
.modal-content.quizzes-modal {
  background: white;
  border-radius: 20px;
  max-width: min(600px, 100%);
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  padding: clamp(24px, 5vw, 32px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1;
}
.modal-header h3 {
  margin: 0;
  color: white;
  font-size: clamp(1.3rem, 4vw, 1.5rem);
  flex: 1;
  line-height: 1.3;
}
.close-modal {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}
.close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
}
.modal-body {
  padding: clamp(24px, 5vw, 32px);
}
.quizzes-count {
  font-size: clamp(1rem, 3vw, 1.1rem);
  color: #4a5568;
  margin-bottom: clamp(20px, 4vw, 24px);
  font-weight: 600;
}
.quizzes-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.quiz-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: clamp(16px, 3vw, 20px);
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.quiz-item:hover {
  background: white;
  border-color: #4299e1;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
}
.quiz-icon {
  font-size: 2rem;
  flex-shrink: 0;
}
.quiz-details {
  flex: 1;
}
.quiz-details h4 {
  margin: 0 0 4px 0;
  color: #1a202c;
  font-size: clamp(1rem, 3vw, 1.1rem);
  font-weight: 700;
}
.quiz-details p {
  margin: 0;
  color: #718096;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
}
.quiz-arrow {
  font-size: 1.5rem;
  color: #4299e1;
  flex-shrink: 0;
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
  .filter-group {
    flex-direction: column;
  }
  .filter-item {
    min-width: 100%;
  }
  .results-summary {
    flex-direction: column;
    align-items: stretch;
  }
  .documents-grid {
    grid-template-columns: 1fr;
  }
  .page-numbers {
    flex-wrap: wrap;
  }
}
</style>
