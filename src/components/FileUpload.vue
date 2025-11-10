<template>
  <div class="file-upload-container">
    <div class="upload-card">
      <div class="upload-header">
        <h1>Create Study Materials</h1>
        <p>Upload your documents to generate summaries, Q&A, and quizzes</p>
      </div>

      <form @submit.prevent="handleUpload" class="upload-form">
        <!-- Document Title -->
        <div class="input-group">
          <label>Document Title *</label>
          <input
            v-model="form.document_title"
            type="text"
            placeholder="Enter a title for your document"
            required
            :disabled="uploading"
          />
        </div>

        <!-- Study Material Upload -->
        <div class="file-input-group">
          <label>Study Material *</label>
          <div
            class="file-dropzone"
            :class="{
              'drag-over': dragOver.study,
              'has-file': form.study_material,
              uploading: uploading,
            }"
            @dragover.prevent="handleDragOver('study')"
            @dragleave.prevent="handleDragLeave('study')"
            @drop.prevent="handleFileDrop($event, 'study')"
            @click="triggerFileInput('study')"
          >
            <div class="dropzone-content">
              <div class="file-icon">📄</div>
              <p class="dropzone-text">
                {{ getFileName('study') }}
              </p>
              <p class="file-requirements">PDF or DOCX documents only</p>
              <input
                type="file"
                ref="studyInput"
                @change="handleFileSelect($event, 'study')"
                accept=".pdf,.docx"
                :disabled="uploading"
                hidden
              />
              <button
                type="button"
                @click.stop="triggerFileInput('study')"
                class="browse-btn"
                :disabled="uploading"
              >
                {{ form.study_material ? 'Change File' : 'Browse Files' }}
              </button>
            </div>
          </div>
          <div v-if="form.study_material" class="file-preview">
            <span class="file-name">{{ form.study_material.name }}</span>
            <span class="file-size">({{ formatFileSize(form.study_material.size) }})</span>
            <button
              type="button"
              @click="removeFile('study')"
              class="remove-file"
              :disabled="uploading"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Past Questions Upload (Optional) -->
        <div class="file-input-group">
          <label>Past Questions (Optional)</label>
          <div
            class="file-dropzone"
            :class="{
              'drag-over': dragOver.pastQuestions,
              'has-file': form.past_questions,
              uploading: uploading,
            }"
            @dragover.prevent="handleDragOver('pastQuestions')"
            @dragleave.prevent="handleDragLeave('pastQuestions')"
            @drop.prevent="handleFileDrop($event, 'pastQuestions')"
            @click="triggerFileInput('pastQuestions')"
          >
            <div class="dropzone-content">
              <div class="file-icon">❓</div>
              <p class="dropzone-text">
                {{ getFileName('pastQuestions') }}
              </p>
              <p class="file-requirements">PDF, DOCX, JPG, JPEG, or PNG files</p>
              <input
                type="file"
                ref="pastQuestionsInput"
                @change="handleFileSelect($event, 'pastQuestions')"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                :disabled="uploading"
                hidden
              />
              <button
                type="button"
                @click.stop="triggerFileInput('pastQuestions')"
                class="browse-btn"
                :disabled="uploading"
              >
                {{ form.past_questions ? 'Change File' : 'Browse Files' }}
              </button>
            </div>
          </div>
          <div v-if="form.past_questions" class="file-preview">
            <span class="file-name">{{ form.past_questions.name }}</span>
            <span class="file-size">({{ formatFileSize(form.past_questions.size) }})</span>
            <button
              type="button"
              @click="removeFile('pastQuestions')"
              class="remove-file"
              :disabled="uploading"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploading" class="upload-progress">
          <div class="progress-header">
            <span>Processing your document...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <p class="progress-text">{{ progressMessage }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="success-message">
          {{ success }}
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
          <div v-if="isGenerationLimitError" class="upgrade-prompt">
            <p>You've reached the free generation limit.</p>
            <router-link to="/pricing" class="upgrade-link">Upgrade to Premium</router-link>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="!canSubmit || uploading"
          class="upload-btn"
          :title="!canSubmit ? 'Please fill in document title and upload study material' : ''"
        >
          {{ uploading ? 'Processing...' : 'Generate Study Materials' }}
        </button>

        <!-- Premium Badge for Free Users -->
        <div v-if="!userStore.user?.premium_user" class="free-user-notice">
          <div class="premium-badge">Free</div>
          <p>You have {{ remainingGenerations }} free generations remaining</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useAuthStore()

const form = ref({
  document_title: '',
  study_material: null,
  past_questions: null,
})

const dragOver = ref({
  study: false,
  pastQuestions: false,
})

const uploading = ref(false)
const uploadProgress = ref(0)
const progressMessage = ref('Uploading files...')
const error = ref('')
const success = ref('')

const studyInput = ref(null)
const pastQuestionsInput = ref(null)

// Computed properties
const canSubmit = computed(() => {
  const hasTitle = !!form.value.document_title?.trim()
  const hasStudyMaterial = !!form.value.study_material
  return hasTitle && hasStudyMaterial
})

const isGenerationLimitError = computed(() => {
  return error.value?.includes('free users') || error.value?.includes('generation limit')
})

// FIXED: Calculate remaining generations correctly
const remainingGenerations = computed(() => {
  // If premium user, show unlimited
  if (userStore.user?.premium_user) {
    return '∞'
  }

  // For free users: 3 total generations allowed, subtract what they've used
  const usedGenerations = userStore.user?.number_of_generations || 0
  const remaining = 3 - usedGenerations
  return Math.max(0, remaining)
})

// Method to refresh user data from backend
const refreshUserData = async () => {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const response = await fetch('https://socratic-f2kh.onrender.com/auth/user/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const userData = await response.json()
      // Update the user store with fresh data
      if (authStore.setUser) {
        authStore.setUser(userData)
      } else {
        authStore.user = userData
      }
      console.log(
        'User data refreshed. Used generations:',
        userData.number_of_generations,
        'Remaining:',
        3 - userData.number_of_generations,
      )
    }
  } catch (err) {
    console.error('Failed to refresh user data:', err)
  }
}

// Helper methods
const getFileName = (field) => {
  const file = form.value[field === 'study' ? 'study_material' : 'past_questions']
  if (file) {
    return file.name
  }
  return field === 'study'
    ? 'Drop your study material here or click to browse'
    : 'Drop past questions here or click to browse'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const triggerFileInput = (field) => {
  if (uploading.value) return

  if (field === 'study') {
    studyInput.value.click()
  } else {
    pastQuestionsInput.value.click()
  }
}

// File handling methods
const handleDragOver = (field) => {
  if (!uploading.value) {
    dragOver.value[field] = true
  }
}

const handleDragLeave = (field) => {
  dragOver.value[field] = false
}

const handleFileDrop = (event, field) => {
  dragOver.value[field] = false
  if (uploading.value) return

  const files = event.dataTransfer.files
  if (files.length > 0) {
    handleFile(files[0], field)
  }
}

const handleFileSelect = (event, field) => {
  const files = event.target.files
  if (files.length > 0) {
    handleFile(files[0], field)
  }
}

const handleFile = (file, field) => {
  // Validate file type
  const validTypes = {
    study: ['.pdf', '.docx'],
    pastQuestions: ['.pdf', '.docx', '.jpg', '.jpeg', '.png'],
  }

  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

  if (!validTypes[field].includes(fileExtension)) {
    error.value = `Invalid file type. Allowed types: ${validTypes[field].join(', ')}`
    return
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'File size must be less than 10MB'
    return
  }

  // Store file
  if (field === 'study') {
    form.value.study_material = file
  } else {
    form.value.past_questions = file
  }

  error.value = ''
  success.value = ''
}

const removeFile = (field) => {
  if (!uploading.value) {
    if (field === 'study') {
      form.value.study_material = null
      studyInput.value.value = ''
    } else {
      form.value.past_questions = null
      pastQuestionsInput.value.value = ''
    }
  }
}

// Upload method with user data refresh
const handleUpload = async () => {
  // Check generation limit before uploading
  if (!userStore.user?.premium_user && remainingGenerations.value <= 0) {
    error.value = 'You have reached your free generation limit. Please upgrade to premium.'
    return
  }

  if (!canSubmit.value || uploading.value) return

  uploading.value = true
  uploadProgress.value = 0
  error.value = ''
  success.value = ''

  try {
    // Create FormData with correct field names matching backend
    const formData = new FormData()
    formData.append('document_title', form.value.document_title.trim())
    formData.append('study_material', form.value.study_material)

    // Add past questions if present
    if (form.value.past_questions) {
      formData.append('past_questions', form.value.past_questions)
    }

    // Get auth token
    const token = localStorage.getItem('accessToken')

    if (!token) {
      error.value = 'Authentication required. Please log in again.'
      router.push('/login')
      return
    }

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 300)

    // Make API request
    const response = await fetch('https://socratic-f2kh.onrender.com/socratic/create_processing/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    const data = await response.json()

    if (response.ok) {
      // Success (202 ACCEPTED)
      success.value = 'Document uploaded successfully! Processing in background...'
      progressMessage.value = 'Upload complete! Redirecting...'

      // Refresh user data to update remaining generation count
      await refreshUserData()

      // Redirect to documents page after short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else if (response.status === 403) {
      // Generation limit reached
      error.value = data.error || 'Generation limit reached. Please upgrade to premium.'
      // Refresh user data to show accurate remaining count
      await refreshUserData()
    } else if (response.status === 401) {
      // Unauthorized
      error.value = 'Session expired. Please log in again.'
      setTimeout(() => router.push('/login'), 2000)
    } else if (response.status === 400) {
      // Validation errors
      const errors = []
      if (data.study_material) {
        errors.push(
          `Study Material: ${Array.isArray(data.study_material) ? data.study_material.join(' ') : data.study_material}`,
        )
      }
      if (data.past_questions) {
        errors.push(
          `Past Questions: ${Array.isArray(data.past_questions) ? data.past_questions.join(' ') : data.past_questions}`,
        )
      }
      if (data.document_title) {
        errors.push(
          `Document Title: ${Array.isArray(data.document_title) ? data.document_title.join(' ') : data.document_title}`,
        )
      }
      error.value = errors.length > 0 ? errors.join('. ') : data.detail || 'Validation error'
    } else {
      // Other errors
      error.value = data.error || data.detail || 'Upload failed. Please try again.'
    }
  } catch (err) {
    console.error('Upload error:', err)
    error.value = 'Network error. Please check your connection and try again.'
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }

  // Refresh user data on mount to ensure we have latest generation count
  refreshUserData()
})
</script>

<style scoped>
.file-upload-container {
  padding: clamp(16px, 4vw, 40px) clamp(8px, 2vw, 20px);
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.upload-card {
  background: white;
  padding: clamp(20px, 5vw, 40px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: min(600px, 96vw);
  margin: 0 auto;
}

.upload-header {
  text-align: center;
  margin-bottom: clamp(24px, 5vw, 40px);
}

.upload-header h1 {
  color: #2c3e50;
  font-size: clamp(1.8rem, 6vw, 2.5rem);
  margin-bottom: clamp(8px, 2vw, 10px);
  line-height: 1.2;
}

.upload-header p {
  color: #5a6c7d;
  font-size: clamp(0.95rem, 3vw, 1.1rem);
  line-height: 1.4;
}

.input-group {
  margin-bottom: clamp(20px, 4vw, 30px);
}

label {
  display: block;
  margin-bottom: clamp(6px, 1.5vw, 8px);
  color: #2c3e50;
  font-weight: 600;
  font-size: clamp(0.9rem, 3vw, 1rem);
}

input[type='text'] {
  width: 100%;
  padding: clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px);
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: clamp(0.9rem, 3vw, 1rem);
  transition: all 0.3s ease;
  min-height: 48px;
}

input[type='text']:focus {
  outline: none;
  border-color: #27ae60;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

input[type='text']:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.file-input-group {
  margin-bottom: clamp(20px, 4vw, 30px);
}

.file-dropzone {
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  padding: clamp(20px, 4vw, 40px) clamp(12px, 3vw, 20px);
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-dropzone:hover:not(.uploading) {
  border-color: #27ae60;
  background-color: #f8f9fa;
}

.file-dropzone.drag-over {
  border-color: #27ae60;
  background-color: #e8f6ef;
}

.file-dropzone.has-file {
  border-color: #27ae60;
  background-color: #e8f6ef;
}

.file-dropzone.uploading {
  cursor: not-allowed;
  opacity: 0.6;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(6px, 1.5vw, 10px);
  width: 100%;
}

.file-icon {
  font-size: clamp(2rem, 8vw, 3rem);
  margin-bottom: clamp(6px, 1.5vw, 10px);
}

.dropzone-text {
  color: #2c3e50;
  font-weight: 500;
  margin: 0;
  font-size: clamp(0.85rem, 3vw, 0.95rem);
  line-height: 1.4;
  word-break: break-word;
}

.file-requirements {
  color: #7f8c8d;
  font-size: clamp(0.75rem, 2.5vw, 0.9rem);
  margin: 0;
  line-height: 1.3;
}

.browse-btn {
  padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 20px);
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  min-height: 40px;
  min-width: 120px;
}

.browse-btn:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-1px);
}

.browse-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px);
  border-radius: 6px;
  margin-top: clamp(6px, 1.5vw, 10px);
  gap: clamp(6px, 1.5vw, 10px);
  flex-wrap: wrap;
}

.file-name {
  color: #2c3e50;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  min-width: 0;
}

.file-size {
  color: #7f8c8d;
  font-size: clamp(0.75rem, 2.5vw, 0.85rem);
  white-space: nowrap;
}

.remove-file {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: clamp(20px, 5vw, 24px);
  height: clamp(20px, 5vw, 24px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1rem, 3vw, 1.2rem);
  line-height: 1;
  flex-shrink: 0;
  min-width: 20px;
}

.remove-file:hover:not(:disabled) {
  background: #c0392b;
}

.remove-file:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.upload-progress {
  background: #f8f9fa;
  padding: clamp(16px, 3vw, 20px);
  border-radius: 8px;
  margin: clamp(20px, 4vw, 30px) 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: clamp(8px, 2vw, 10px);
  font-weight: 500;
  color: #2c3e50;
  font-size: clamp(0.85rem, 3vw, 0.95rem);
  flex-wrap: wrap;
  gap: 8px;
}

.progress-bar {
  background: #ecf0f1;
  border-radius: 10px;
  height: 6px;
  overflow: hidden;
}

.progress-fill {
  background: #27ae60;
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 10px;
}

.progress-text {
  margin: clamp(8px, 2vw, 10px) 0 0 0;
  color: #5a6c7d;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  text-align: center;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: clamp(12px, 3vw, 16px);
  border-radius: 8px;
  margin: clamp(16px, 3vw, 20px) 0;
  text-align: center;
  border: 1px solid #c3e6cb;
  font-size: clamp(0.85rem, 3vw, 0.95rem);
}

.error-message {
  background: #ffeaea;
  color: #e74c3c;
  padding: clamp(12px, 3vw, 16px);
  border-radius: 8px;
  margin: clamp(16px, 3vw, 20px) 0;
  text-align: center;
  border: 1px solid #ffcdd2;
  font-size: clamp(0.85rem, 3vw, 0.95rem);
}

.upgrade-prompt {
  margin-top: clamp(8px, 2vw, 10px);
  padding-top: clamp(8px, 2vw, 10px);
  border-top: 1px solid #ffcdd2;
}

.upgrade-link {
  color: #27ae60;
  font-weight: 600;
  text-decoration: none;
  font-size: clamp(0.85rem, 3vw, 0.95rem);
}

.upgrade-link:hover {
  text-decoration: underline;
}

.upload-btn {
  width: 100%;
  padding: clamp(14px, 3vw, 16px);
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: clamp(1rem, 3.5vw, 1.1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: clamp(16px, 3vw, 20px);
  min-height: 54px;
}

.upload-btn:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(39, 174, 96, 0.3);
}

.upload-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.free-user-notice {
  text-align: center;
  margin-top: clamp(16px, 3vw, 20px);
  padding: clamp(12px, 3vw, 15px);
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
}

.premium-badge {
  display: inline-block;
  background: #27ae60;
  color: white;
  padding: clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px);
  border-radius: 20px;
  font-size: clamp(0.7rem, 2.5vw, 0.8rem);
  font-weight: 600;
  margin-bottom: clamp(6px, 1.5vw, 8px);
}

.free-user-notice p {
  margin: 0;
  color: #856404;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  line-height: 1.4;
}

/* Mobile-specific optimizations */
@media (max-width: 480px) {
  .file-upload-container {
    padding: 12px 6px;
  }

  .upload-card {
    padding: 16px 12px;
    border-radius: 10px;
  }

  .file-dropzone {
    padding: 24px 12px;
    min-height: 120px;
  }

  .file-preview {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .file-name {
    white-space: normal;
    word-break: break-word;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) {
  .file-upload-container {
    padding: 24px 16px;
  }

  .upload-card {
    padding: 32px;
  }

  .file-preview {
    flex-wrap: nowrap;
  }
}

/* Large desktop enhancements */
@media (min-width: 1200px) {
  .upload-card {
    padding: 48px;
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .upload-btn,
  .browse-btn,
  .remove-file {
    transition: none;
  }

  .upload-btn:hover:not(:disabled),
  .browse-btn:hover:not(:disabled) {
    transform: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .upload-card {
    background: #1a1a1a;
    color: #ffffff;
  }

  .upload-header h1,
  label,
  .dropzone-text,
  .file-name {
    color: #ffffff;
  }

  .upload-header p,
  .file-requirements,
  .progress-text,
  .free-user-notice p {
    color: #cccccc;
  }

  input[type='text'] {
    background: #2d2d2d;
    border-color: #444;
    color: #ffffff;
  }

  input[type='text']:focus {
    border-color: #27ae60;
    background: #2d2d2d;
  }

  .file-dropzone {
    border-color: #444;
    background: #2d2d2d;
  }

  .file-dropzone:hover:not(.uploading) {
    border-color: #27ae60;
    background: #2a2a2a;
  }

  .file-preview {
    background: #2d2d2d;
  }

  .upload-progress {
    background: #2d2d2d;
  }

  .progress-bar {
    background: #444;
  }
}
</style>
