<template>
  <div class="flashcards-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Flashcards</h1>
        <p v-if="document">{{ document.document_title }}</p>
      </div>
      <div class="header-actions">
        <button @click="router.back()" class="back-button">← Back to Documents</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your flashcards...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Failed to load flashcards</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchFlashcards">Retry</button>
    </div>

    <!-- Empty/No Flashcards State -->
    <div v-else-if="!flashcards || flashcards.length === 0" class="empty-state">
      <div class="empty-icon">📇</div>
      <h3>No flashcards available</h3>
      <p>This document does not have any flashcards generated.</p>
    </div>

    <!-- Flashcards UI -->
    <div v-else class="flashcards-container">
      <div class="progress-indicator">
        Card {{ currentIndex + 1 }} of {{ flashcards.length }}
      </div>

      <div class="flashcard-viewport">
        <transition :name="transitionName" mode="out-in">
          <div
            :key="currentIndex"
            class="flashcard"
            :class="{ 'is-flipped': isFlipped }"
            @click="flipCard"
          >
            <div class="flashcard-inner">
              <div class="flashcard-front">
                <div class="card-label">Question</div>
                <div class="card-content">{{ currentCard.front }}</div>
                <div class="flip-hint">Click to flip <span class="icon">↻</span></div>
              </div>
              <div class="flashcard-back">
                <div class="card-label">Answer</div>
                <div class="card-content">{{ currentCard.back }}</div>
                <div class="flip-hint">Click to flip <span class="icon">↻</span></div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="flashcard-controls">
        <button
          @click="prevCard"
          class="control-btn"
          :disabled="currentIndex === 0"
        >
          ← Previous
        </button>
        <button
          @click="resetDeck"
          class="control-btn secondary"
          title="Restart Deck"
        >
          ↺ Restart
        </button>
        <button
          @click="nextCard"
          class="control-btn"
          :disabled="currentIndex === flashcards.length - 1"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const documentId = route.params.id

const document = ref(null)
const flashcards = ref([])
const loading = ref(true)
const error = ref('')

const currentIndex = ref(0)
const isFlipped = ref(false)
const transitionName = ref('slide-right')

const currentCard = computed(() => {
  if (flashcards.value && flashcards.value.length > 0) {
    return flashcards.value[currentIndex.value]
  }
  return { front: '', back: '' }
})

const fetchFlashcards = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(
      `https://socratic-production-e023.up.railway.app/socratic/retrieve/${documentId}/`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      document.value = data

      // Parse flashcards if necessary (sometimes it comes as a string)
      if (typeof data.flashcards === 'string') {
        try {
          flashcards.value = JSON.parse(data.flashcards)
        } catch {
          flashcards.value = data.flashcards
        }
      } else {
        flashcards.value = data.flashcards || []
      }
    } else if (response.status === 401) {
      router.push('/login?session_expired=true')
    } else {
      error.value = 'Failed to load document data.'
    }
  } catch (err) {
    console.error('Error fetching flashcards:', err)
    error.value = 'Network error. Please try again later.'
  } finally {
    loading.value = false
  }
}

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const nextCard = () => {
  if (currentIndex.value < flashcards.value.length - 1) {
    transitionName.value = 'slide-left'
    isFlipped.value = false
    setTimeout(() => {
      currentIndex.value++
    }, 150) // wait for flip state to clear before switching card
  }
}

const prevCard = () => {
  if (currentIndex.value > 0) {
    transitionName.value = 'slide-right'
    isFlipped.value = false
    setTimeout(() => {
      currentIndex.value--
    }, 150)
  }
}

const resetDeck = () => {
  transitionName.value = 'fade'
  isFlipped.value = false
  setTimeout(() => {
    currentIndex.value = 0
  }, 150)
}

// Handle keyboard arrows
const handleKeydown = (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    if (isFlipped.value) {
      nextCard()
    } else {
      flipCard()
    }
    e.preventDefault()
  } else if (e.key === 'ArrowLeft') {
    prevCard()
    e.preventDefault()
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    flipCard()
    e.preventDefault()
  }
}

onMounted(() => {
  fetchFlashcards()
  window.addEventListener('keydown', handleKeydown)
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.flashcards-page {
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
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
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
  font-weight: 500;
}

.back-button {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.back-button:hover {
  border-color: #4299e1;
  color: #4299e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #48bb78;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 20px;
  background: #e53e3e;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.flashcards-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-indicator {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 20px;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.flashcard-viewport {
  width: 100%;
  perspective: 1000px;
  min-height: 400px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.flashcard {
  width: 100%;
  max-width: 600px;
  height: 400px;
  cursor: pointer;
  perspective: 1000px;
  user-select: none;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}

.flashcard.is-flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-front, .flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 20px;
  background: white;
  display: flex;
  flex-direction: column;
  padding: 40px;
  border: 2px solid #e2e8f0;
}

.flashcard-back {
  transform: rotateY(180deg);
  background: #faf5ff;
  border-color: #d6bcfa;
}

.card-label {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  color: #a0aec0;
  margin-bottom: 20px;
}

.flashcard-back .card-label {
  color: #9f7aea;
}

.card-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.2rem, 3.5vw, 1.8rem);
  font-weight: 500;
  color: #2d3748;
  line-height: 1.5;
  overflow-y: auto;
}

.flip-hint {
  font-size: 0.9rem;
  color: #cbd5e0;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.flashcard-controls {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 600px;
  justify-content: center;
  align-items: center;
}

.control-btn {
  padding: 14px 24px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  max-width: 160px;
}

.control-btn:hover:not(:disabled) {
  background: #3182ce;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

.control-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.control-btn.secondary {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  flex: 0 0 auto;
}

.control-btn.secondary:hover {
  background: #f7fafc;
  color: #2b6cb0;
  border-color: #cbd5e0;
}

/* Transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar for long content */
.card-content::-webkit-scrollbar {
  width: 6px;
}
.card-content::-webkit-scrollbar-track {
  background: transparent;
}
.card-content::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}
</style>
