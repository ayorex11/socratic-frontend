<template>
  <div class="quiz-page">
    <div class="quiz-container">
      <!-- Quiz Header -->
      <div class="quiz-header">
        <div class="header-content">
          <router-link to="/documents" class="back-button"> ← Back to Documents </router-link>
          <h1>Quiz</h1>
          <p>Test your knowledge from the document</p>
        </div>

        <!-- Quiz Progress -->
        <div class="quiz-progress">
          <div class="progress-info">
            <span class="progress-text">
              Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
            </span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
          <div class="progress-stats">
            <span class="answered-count"
              >{{ answeredQuestions }} / {{ questions.length }} answered</span
            >
            <div class="timer" v-if="timeLimit > 0">⏱️ {{ formatTime(timeRemaining) }}</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading quiz questions...</p>
      </div>

      <!-- Quiz Content - Show when not completed and not reviewing answers -->
      <div
        v-else-if="questions.length > 0 && !quizCompleted && !showReviewSection && !reviewMode"
        class="quiz-content"
      >
        <!-- Current Question -->
        <div class="question-card">
          <div class="question-header">
            <h2 class="question-number">Question {{ currentQuestionIndex + 1 }}</h2>
            <div class="question-status">
              <span v-if="isQuestionAnswered(currentQuestion.id)" class="answered-badge"
                >✓ Answered</span
              >
            </div>
          </div>

          <div class="question-text" v-html="formatQuestionText(currentQuestion.text)"></div>

          <!-- Options -->
          <div class="options-container">
            <div
              v-for="(option, index) in options"
              :key="index"
              class="option-card"
              :class="{
                selected: getSelectedOption(currentQuestion.id) === index,
                answered: isQuestionAnswered(currentQuestion.id),
              }"
              @click="selectOption(index)"
            >
              <div class="option-header">
                <div class="option-identifier">
                  <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                </div>
                <div class="option-status" v-if="isQuestionAnswered(currentQuestion.id)">
                  <span class="status-answered">Selected</span>
                </div>
              </div>
              <div class="option-content" v-html="formatOptionText(option)"></div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="quiz-navigation">
            <button
              class="nav-btn prev-btn"
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              ← Previous
            </button>

            <div class="navigation-center">
              <button
                class="nav-btn review-btn"
                @click="showReviewSection = true"
                :disabled="answeredQuestions === 0"
              >
                📋 Review Answers ({{ answeredQuestions }}/{{ questions.length }})
              </button>
              <span class="question-jump">
                Jump to:
                <select v-model="currentQuestionIndex" class="question-select">
                  <option v-for="(question, index) in questions" :key="question.id" :value="index">
                    Q{{ index + 1 }} {{ isQuestionAnswered(question.id) ? '✓' : '' }}
                  </option>
                </select>
              </span>
            </div>

            <button
              class="nav-btn next-btn"
              @click="nextQuestion"
              :disabled="currentQuestionIndex === questions.length - 1"
            >
              Next Question →
            </button>
          </div>
        </div>
      </div>

      <!-- Review Section - Show before submission -->
      <div
        v-else-if="questions.length > 0 && !quizCompleted && showReviewSection && !reviewMode"
        class="review-section"
      >
        <div class="review-card">
          <div class="review-header">
            <div class="review-icon">📝</div>
            <h2>Review Your Answers</h2>
            <p>You've answered {{ answeredQuestions }} out of {{ questions.length }} questions</p>
          </div>

          <div class="answer-summary">
            <div
              v-for="(question, index) in questions"
              :key="question.id"
              class="summary-item"
              :class="{ unanswered: !isQuestionAnswered(question.id) }"
              @click="jumpToQuestion(index)"
            >
              <span class="question-number">Q{{ index + 1 }}</span>
              <span class="answer-status" :class="{ answered: isQuestionAnswered(question.id) }">
                {{ isQuestionAnswered(question.id) ? '✓ Answered' : '❌ Not answered' }}
              </span>
            </div>
          </div>

          <div class="review-actions">
            <button class="action-btn continue-btn" @click="showReviewSection = false">
              📖 Continue Quiz
            </button>
            <button
              class="action-btn submit-final-btn"
              @click="submitAllAnswers"
              :disabled="answeredQuestions === 0"
              :class="{ disabled: answeredQuestions === 0 }"
            >
              🚀 Submit Quiz
            </button>
          </div>
        </div>
      </div>

      <!-- Quiz Results -->
      <div v-else-if="quizCompleted && !reviewMode" class="quiz-results">
        <div class="results-card">
          <div class="results-header">
            <div class="results-icon">🎉</div>
            <h2>Quiz Completed!</h2>
            <p>You've finished the quiz. Here's how you did:</p>
          </div>

          <div class="score-section">
            <div class="score-circle">
              <div class="score-percentage">{{ results.scorePercentage }}%</div>
              <div class="score-text">Score</div>
            </div>

            <div class="score-details">
              <div class="score-item">
                <span class="score-label">Correct Answers:</span>
                <span class="score-value correct">{{ results.score }}</span>
              </div>
              <div class="score-item">
                <span class="score-label">Total Questions:</span>
                <span class="score-value">{{ results.totalQuestions }}</span>
              </div>
              <div class="score-item">
                <span class="score-label">Percentage:</span>
                <span class="score-value">{{ results.percentage }}%</span>
              </div>
              <div class="score-item">
                <span class="score-label">Status:</span>
                <span
                  class="score-value"
                  :class="{ passed: results.isPassed, failed: !results.isPassed }"
                >
                  {{ results.isPassed ? 'Passed' : 'Failed' }}
                </span>
              </div>
            </div>
          </div>

          <div class="performance-message">
            <p v-if="results.percentage >= 80" class="excellent">
              Excellent work! You've mastered this material. 🏆
            </p>
            <p v-else-if="results.percentage >= 70" class="good">
              Good job! You passed the quiz. 👍
            </p>
            <p v-else-if="results.percentage >= 50" class="average">
              Not bad! Review the material to improve. 📚
            </p>
            <p v-else class="poor">Keep studying! You'll get better with practice. 💪</p>
          </div>

          <div class="results-actions">
            <button class="action-btn review-btn" @click="enterReviewMode">📖 Review Quiz</button>
            <button class="action-btn retry-btn" @click="retryQuiz">🔄 Retry Quiz</button>
            <router-link to="/documents" class="action-btn documents-btn">
              📚 Back to Documents
            </router-link>
          </div>
        </div>
      </div>

      <!-- Review Quiz Mode - Show after completion to review answers -->
      <div v-else-if="questions.length > 0 && reviewMode" class="quiz-content">
        <div class="review-mode-header">
          <h2>📖 Quiz Review</h2>
          <p>Review your answers and see the correct solutions</p>
          <div class="review-stats">
            <span class="score-display"
              >Score: {{ results.score }}/{{ results.totalQuestions }} ({{
                results.percentage
              }}%)</span
            >
            <button class="nav-btn exit-review-btn" @click="exitReviewMode">
              ← Back to Results
            </button>
          </div>
        </div>

        <!-- Review Question Card -->
        <div
          class="question-card review-question-card"
          :class="{
            correct: isAnswerCorrect(currentQuestion.id),
            incorrect:
              !isAnswerCorrect(currentQuestion.id) && isQuestionAnswered(currentQuestion.id),
            unanswered: !isQuestionAnswered(currentQuestion.id),
          }"
        >
          <div class="question-header">
            <h2 class="question-number">
              Question {{ currentQuestionIndex + 1 }}
              <span
                class="review-status-badge"
                :class="{
                  'correct-badge': isAnswerCorrect(currentQuestion.id),
                  'incorrect-badge':
                    !isAnswerCorrect(currentQuestion.id) && isQuestionAnswered(currentQuestion.id),
                  'unanswered-badge': !isQuestionAnswered(currentQuestion.id),
                }"
              >
                {{ getQuestionStatus(currentQuestion.id) }}
              </span>
            </h2>
          </div>

          <div class="question-text" v-html="formatQuestionText(currentQuestion.text)"></div>

          <!-- Options in Review Mode -->
          <div class="options-container">
            <div
              v-for="(option, index) in options"
              :key="index"
              class="option-card review-option"
              :class="{
                'correct-answer': isCorrectAnswer(currentQuestion, index),
                'user-answer': getUserAnswerIndex(currentQuestion.id) === index,
                'wrong-user-answer':
                  getUserAnswerIndex(currentQuestion.id) === index &&
                  !isCorrectAnswer(currentQuestion, index),
              }"
            >
              <div class="option-header">
                <div class="option-identifier">
                  <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                  <span v-if="isCorrectAnswer(currentQuestion, index)" class="correct-indicator"
                    >✓ Correct Answer</span
                  >
                  <span
                    v-if="
                      getUserAnswerIndex(currentQuestion.id) === index &&
                      !isCorrectAnswer(currentQuestion, index)
                    "
                    class="user-answer-indicator"
                    >✗ Your Answer</span
                  >
                  <span
                    v-if="
                      getUserAnswerIndex(currentQuestion.id) === index &&
                      isCorrectAnswer(currentQuestion, index)
                    "
                    class="correct-user-indicator"
                    >✓ Your Answer</span
                  >
                </div>
              </div>
              <div class="option-content" v-html="formatOptionText(option)"></div>
            </div>
          </div>

          <!-- Explanation Section -->
          <div class="explanation-section" v-if="currentQuestion.explanation">
            <div class="explanation-header">
              <strong>📝 Explanation:</strong>
            </div>
            <div
              class="explanation-content"
              v-html="formatOptionText(currentQuestion.explanation)"
            ></div>
          </div>

          <!-- Navigation Buttons for Review Mode -->
          <div class="quiz-navigation">
            <button
              class="nav-btn prev-btn"
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              ← Previous Question
            </button>

            <div class="navigation-center">
              <span class="question-jump">
                Jump to:
                <select v-model="currentQuestionIndex" class="question-select">
                  <option v-for="(question, index) in questions" :key="question.id" :value="index">
                    Q{{ index + 1 }}
                    <span v-if="isAnswerCorrect(question.id)">✓</span>
                    <span v-else-if="isQuestionAnswered(question.id)">✗</span>
                    <span v-else>○</span>
                  </option>
                </select>
              </span>
            </div>

            <button
              class="nav-btn next-btn"
              @click="nextQuestion"
              :disabled="currentQuestionIndex === questions.length - 1"
            >
              Next Question →
            </button>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Unable to Load Quiz</h3>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button class="action-btn" @click="retryLoading">🔄 Try Again</button>
          <router-link to="/documents" class="action-btn secondary">
            📚 Back to Documents
          </router-link>
        </div>
      </div>

      <!-- No Questions State -->
      <div v-else class="no-questions-state">
        <div class="no-questions-icon">❓</div>
        <h3>No Questions Available</h3>
        <p>This document doesn't have any quiz questions yet.</p>
        <router-link to="/documents" class="action-btn"> 📚 Back to Documents </router-link>
      </div>

      <!-- Submission Loading Overlay -->
      <div v-if="submitting" class="submission-overlay">
        <div class="submission-loading">
          <div class="spinner"></div>
          <p>Submitting your answers...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Reactive data
const questions = ref([])
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const currentQuestionIndex = ref(0)
const userAnswers = ref({}) // Store as { questionId: selectedOptionIndex }
const quizCompleted = ref(false)
const showReviewSection = ref(false)
const reviewMode = ref(false) // New state for review mode after completion
const timeRemaining = ref(0)
const quizStartTime = ref(null)
const totalTimeTaken = ref(0)
const results = ref({
  score: 0,
  totalQuestions: 0,
  percentage: 0,
  isPassed: false,
  scorePercentage: 0,
})

// Quiz settings
const timeLimit = ref(0) // 0 means no time limit

// Computed properties
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || {}
})

const options = computed(() => {
  return [
    currentQuestion.value.option_1,
    currentQuestion.value.option_2,
    currentQuestion.value.option_3,
    currentQuestion.value.option_4,
  ].filter((option) => option !== undefined && option !== null)
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === questions.value.length - 1
})

const progressPercentage = computed(() => {
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100
})

const answeredQuestions = computed(() => {
  return Object.keys(userAnswers.value).length
})

// Methods
const fetchQuizQuestions = async () => {
  try {
    loading.value = true
    error.value = ''
    const documentId = route.params.id
    const token = localStorage.getItem('accessToken')

    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(
      `https://socratic-f2kh.onrender.com/quiz/quizzes/${documentId}/start/`,
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
      questions.value = data
      initializeQuiz()
    } else if (response.status === 401) {
      router.push('/login')
    } else if (response.status === 404) {
      error.value = 'Quiz not found for this document'
    } else {
      throw new Error('Failed to fetch quiz questions')
    }
  } catch (err) {
    console.error('Error fetching quiz:', err)
    error.value = 'Failed to load quiz. Please try again.'
  } finally {
    loading.value = false
  }
}

const initializeQuiz = () => {
  userAnswers.value = {}
  currentQuestionIndex.value = 0
  quizCompleted.value = false
  showReviewSection.value = false
  reviewMode.value = false
  quizStartTime.value = Date.now()
  results.value = {
    score: 0,
    totalQuestions: 0,
    percentage: 0,
    isPassed: false,
    scorePercentage: 0,
  }

  if (timeLimit.value > 0) {
    timeRemaining.value = timeLimit.value * 60
  }
}

const formatQuestionText = (text) => {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

const formatOptionText = (text) => {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/\* (.*?)(?=\n|$)/g, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const selectOption = (index) => {
  const questionId = currentQuestion.value.id
  if (questionId) {
    userAnswers.value[questionId] = index
  }
}

const getSelectedOption = (questionId) => {
  return userAnswers.value[questionId] ?? null
}

const isQuestionAnswered = (questionId) => {
  return userAnswers.value.hasOwnProperty(questionId)
}

// New methods for review mode
const isAnswerCorrect = (questionId) => {
  const question = questions.value.find((q) => q.id === parseInt(questionId))
  if (!question || !isQuestionAnswered(questionId)) return false

  const userAnswerIndex = userAnswers.value[questionId]
  const userAnswerText = getQuestionOptions(question)[userAnswerIndex]
  return userAnswerText === question.answer
}

const isCorrectAnswer = (question, optionIndex) => {
  const optionText = getQuestionOptions(question)[optionIndex]
  return optionText === question.answer
}

const getUserAnswerIndex = (questionId) => {
  return userAnswers.value[questionId] ?? null
}

const getQuestionOptions = (question) => {
  return [question.option_1, question.option_2, question.option_3, question.option_4].filter(
    (option) => option !== undefined && option !== null,
  )
}

const getQuestionStatus = (questionId) => {
  if (!isQuestionAnswered(questionId)) return 'Unanswered'
  return isAnswerCorrect(questionId) ? 'Correct' : 'Incorrect'
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const jumpToQuestion = (index) => {
  currentQuestionIndex.value = index
  showReviewSection.value = false
}

const submitAllAnswers = async () => {
  if (answeredQuestions.value === 0) return

  try {
    submitting.value = true
    const documentId = route.params.id
    const token = localStorage.getItem('accessToken')

    if (!token) {
      router.push('/login')
      return
    }

    // Prepare answers in the required format: { questionId: "option_text" }
    const submissionData = {}
    Object.entries(userAnswers.value).forEach(([questionId, optionIndex]) => {
      const question = questions.value.find((q) => q.id === parseInt(questionId))
      if (question) {
        const optionText = [
          question.option_1,
          question.option_2,
          question.option_3,
          question.option_4,
        ][optionIndex]

        if (optionText) {
          submissionData[questionId] = optionText
        }
      }
    })

    // Proper JSON parsing and submission
    const response = await fetch(
      `https://socratic-f2kh.onrender.com/quiz/quizzes/${documentId}/submit/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: submissionData,
        }),
      },
    )

    if (response.ok) {
      const result = await response.json()

      // Parse and validate the response with proper JSON handling
      if (result && typeof result === 'object') {
        results.value = {
          score: parseInt(result.score) || 0,
          totalQuestions: parseInt(result.total_questions) || questions.value.length,
          percentage: parseFloat(result.percentage) || 0,
          isPassed: Boolean(result.is_passed),
          scorePercentage: Math.round(
            ((parseInt(result.score) || 0) / (parseInt(result.total_questions) || 1)) * 100,
          ),
        }

        quizCompleted.value = true
        showReviewSection.value = false
        totalTimeTaken.value = Math.floor((Date.now() - quizStartTime.value) / 1000)

        // Save results to localStorage
        localStorage.setItem(
          `quiz_results_${documentId}`,
          JSON.stringify({
            ...results.value,
            documentId: documentId,
            completedAt: new Date().toISOString(),
            timeTaken: totalTimeTaken.value,
          }),
        )
      } else {
        throw new Error('Invalid response format from server')
      }
    } else {
      const errorText = await response.text()
      let errorMessage = `Submission failed: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.detail || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      throw new Error(errorMessage)
    }
  } catch (err) {
    console.error('Error submitting quiz:', err)
    error.value = `Failed to submit quiz: ${err.message}`
  } finally {
    submitting.value = false
  }
}

const enterReviewMode = () => {
  reviewMode.value = true
  currentQuestionIndex.value = 0
}

const exitReviewMode = () => {
  reviewMode.value = false
}

const retryQuiz = () => {
  initializeQuiz()
}

const retryLoading = () => {
  fetchQuizQuestions()
}

// Timer functionality
watch(timeRemaining, (newTime) => {
  if (newTime <= 0 && timeLimit.value > 0) {
    submitAllAnswers()
  }
})

// Start timer if time limit is set
if (timeLimit.value > 0) {
  setInterval(() => {
    if (timeRemaining.value > 0 && !quizCompleted.value && !submitting.value) {
      timeRemaining.value--
    }
  }, 1000)
}

onMounted(() => {
  fetchQuizQuestions()
})
</script>

<style scoped>
.quiz-page {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.quiz-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Quiz Header */
.quiz-header {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 30px;
}

.back-button {
  color: white;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 15px;
  display: inline-block;
  opacity: 0.9;
}

.back-button:hover {
  opacity: 1;
}

.quiz-header h1 {
  font-size: 2.5rem;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.quiz-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.quiz-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.progress-info {
  flex: 1;
}

.progress-text {
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.answered-count {
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 12px;
}

.timer {
  font-weight: 700;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
}

/* Quiz Content */
.quiz-content {
  padding: 40px;
}

.question-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 30px;
  border: 2px solid #e2e8f0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.question-number {
  color: #1e293b;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}

.question-status {
  display: flex;
  align-items: center;
}

.answered-badge {
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.question-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #1e293b;
  margin-bottom: 30px;
  font-weight: 500;
}

/* Options */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.option-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.option-card:hover:not(.answered) {
  border-color: #94a3b8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.option-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-card.answered {
  border-color: #10b981;
  background: #f0fdf4;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.option-identifier {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #64748b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.option-card.selected .option-identifier {
  background: #3b82f6;
}

.option-card.answered .option-identifier {
  background: #10b981;
}

.option-status {
  font-size: 0.85rem;
  font-weight: 600;
}

.status-answered {
  color: #10b981;
}

.option-content {
  line-height: 1.6;
  color: #475569;
}

.option-content :deep(strong) {
  color: #1e293b;
  font-weight: 600;
}

.option-content :deep(em) {
  color: #475569;
  font-style: italic;
}

.option-content :deep(ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.option-content :deep(li) {
  margin-bottom: 4px;
}

/* Navigation */
.quiz-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.prev-btn {
  background: #f1f5f9;
  color: #475569;
}

.prev-btn:hover:not(:disabled) {
  background: #e2e8f0;
  transform: translateX(-2px);
}

.prev-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-btn {
  background: #10b981;
  color: white;
}

.next-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.navigation-center {
  display: flex;
  align-items: center;
  gap: 15px;
}

.review-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.review-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.review-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #64748b;
}

.question-select {
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #1e293b;
  font-size: 0.9rem;
}

/* Review Section */
.review-section {
  padding: 40px;
}

.review-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 30px;
  border: 2px solid #e2e8f0;
  text-align: center;
}

.review-header {
  margin-bottom: 30px;
}

.review-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.review-header h2 {
  color: #1e293b;
  margin: 0 0 10px 0;
  font-size: 1.8rem;
}

.review-header p {
  color: #64748b;
  margin: 0;
  font-size: 1.1rem;
}

.answer-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin: 30px 0;
  max-height: 200px;
  overflow-y: auto;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.summary-item:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.summary-item.unanswered {
  background: #fef2f2;
  border-color: #fecaca;
}

.question-number {
  font-weight: 600;
  color: #1e293b;
}

.answer-status {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.answer-status.answered {
  background: #dcfce7;
  color: #166534;
}

.answer-status:not(.answered) {
  background: #fef2f2;
  color: #dc2626;
}

.review-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.continue-btn {
  background: #3b82f6;
  color: white;
}

.continue-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-final-btn {
  background: #10b981;
  color: white;
}

.submit-final-btn:hover:not(.disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.submit-final-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Results */
.quiz-results {
  padding: 40px;
}

.results-card {
  text-align: center;
  background: #f8fafc;
  border-radius: 20px;
  padding: 40px;
  border: 2px solid #e2e8f0;
}

.results-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.results-header h2 {
  font-size: 2.2rem;
  color: #1e293b;
  margin: 0 0 10px 0;
}

.results-header p {
  color: #64748b;
  font-size: 1.1rem;
  margin: 0 0 30px 0;
}

.score-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
  margin: 40px 0;
  flex-wrap: wrap;
}

.score-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(
    #10b981 0% v-bind('results.scorePercentage') %,
    #e2e8f0 v-bind('results.scorePercentage') % 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-circle::before {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
}

.score-percentage {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  position: relative;
  z-index: 1;
}

.score-text {
  position: absolute;
  bottom: 25px;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
  z-index: 1;
}

.score-details {
  text-align: left;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  min-width: 200px;
}

.score-item:last-child {
  border-bottom: none;
}

.score-label {
  color: #64748b;
  font-weight: 500;
}

.score-value {
  font-weight: 700;
  color: #1e293b;
}

.score-value.correct {
  color: #10b981;
}

.score-value.passed {
  color: #10b981;
}

.score-value.failed {
  color: #ef4444;
}

.performance-message {
  margin: 30px 0;
  padding: 20px;
  border-radius: 12px;
  background: #f8fafc;
}

.performance-message p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.excellent {
  color: #10b981;
}

.good {
  color: #f59e0b;
}

.average {
  color: #f97316;
}

.poor {
  color: #ef4444;
}

.results-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.review-btn {
  background: #3b82f6;
  color: white;
}

.review-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.retry-btn {
  background: #f59e0b;
  color: white;
}

.retry-btn:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.documents-btn {
  background: #64748b;
  color: white;
}

.documents-btn:hover {
  background: #475569;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

/* States */
.loading-state,
.error-state,
.no-questions-state {
  text-align: center;
  padding: 60px 40px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-icon,
.no-questions-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-state h3,
.no-questions-state h3 {
  color: #1e293b;
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.error-state p,
.no-questions-state p {
  color: #64748b;
  margin: 0 0 30px 0;
  font-size: 1.1rem;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Submission Overlay */
.submission-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.submission-loading {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.submission-loading p {
  margin: 20px 0 0 0;
  color: #64748b;
  font-size: 1.1rem;
}

/* Review Mode Styles */
.review-mode-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border-radius: 16px;
}

.review-mode-header h2 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  font-weight: 700;
}

.review-mode-header p {
  margin: 0 0 15px 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.review-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.score-display {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1.1rem;
}

.exit-review-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.exit-review-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Review question card states */
.review-question-card.correct {
  border-left: 6px solid #10b981;
}

.review-question-card.incorrect {
  border-left: 6px solid #ef4444;
}

.review-question-card.unanswered {
  border-left: 6px solid #f59e0b;
}

.review-status-badge {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  margin-left: 12px;
}

.correct-badge {
  background: #dcfce7;
  color: #166534;
}

.incorrect-badge {
  background: #fecaca;
  color: #dc2626;
}

.unanswered-badge {
  background: #fef3c7;
  color: #d97706;
}

/* Review option states */
.review-option.correct-answer {
  border-color: #10b981;
  background: #dcfce7;
}

.review-option.user-answer {
  border-color: #3b82f6;
  background: #eff6ff;
}

.review-option.wrong-user-answer {
  border-color: #ef4444;
  background: #fef2f2;
}

.review-option.correct-answer .option-identifier {
  background: #10b981;
}

.review-option.user-answer .option-identifier {
  background: #3b82f6;
}

.review-option.wrong-user-answer .option-identifier {
  background: #ef4444;
}

.option-identifier {
  display: flex;
  align-items: center;
  gap: 8px;
}

.correct-indicator,
.user-answer-indicator,
.correct-user-indicator {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

.correct-indicator {
  background: #bbf7d0;
  color: #166534;
}

.user-answer-indicator {
  background: #bfdbfe;
  color: #1e40af;
}

.correct-user-indicator {
  background: #bbf7d0;
  color: #166534;
}

/* Explanation section */
.explanation-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-top: 25px;
  border-left: 4px solid #3b82f6;
}

.explanation-header {
  color: #1e293b;
  font-size: 1.1rem;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.explanation-content {
  color: #475569;
  line-height: 1.6;
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .quiz-page {
    padding: 15px;
  }

  .quiz-header {
    padding: 20px;
  }

  .quiz-header h1 {
    font-size: 2rem;
  }

  .quiz-progress {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .progress-stats {
    justify-content: space-between;
  }

  .quiz-content {
    padding: 25px;
  }

  .question-card {
    padding: 20px;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .quiz-navigation {
    flex-direction: column;
    gap: 15px;
  }

  .navigation-center {
    flex-direction: column;
    gap: 10px;
  }

  .nav-btn {
    width: 100%;
  }

  .review-section {
    padding: 25px;
  }

  .answer-summary {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .review-actions {
    flex-direction: column;
  }

  .score-section {
    flex-direction: column;
    gap: 30px;
  }

  .results-actions,
  .error-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .review-mode-header {
    padding: 20px;
  }

  .review-mode-header h2 {
    font-size: 1.6rem;
  }

  .review-stats {
    flex-direction: column;
    gap: 10px;
  }

  .option-identifier {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .explanation-section {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .quiz-header h1 {
    font-size: 1.8rem;
  }

  .question-text {
    font-size: 1.1rem;
  }

  .option-card {
    padding: 15px;
  }

  .review-card,
  .results-card {
    padding: 25px;
  }

  .score-circle {
    width: 120px;
    height: 120px;
  }

  .score-circle::before {
    width: 100px;
    height: 100px;
  }

  .score-percentage {
    font-size: 1.7rem;
  }

  .review-mode-header h2 {
    font-size: 1.4rem;
  }

  .review-status-badge {
    margin-left: 8px;
    font-size: 0.8rem;
  }
}
</style>
