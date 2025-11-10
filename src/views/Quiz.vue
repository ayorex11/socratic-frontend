<template>
  <div class="quiz-page">
    <div class="quiz-container">
      <!-- Quiz Header -->
      <div class="quiz-header">
        <div class="header-content">
          <router-link to="/documents" class="back-button"> ← Back </router-link>
          <h1>Quiz</h1>
          <p>Test your knowledge from the document</p>
        </div>

        <!-- Quiz Progress -->
        <div class="quiz-progress">
          <div class="progress-info">
            <span class="progress-text">
              Q{{ currentQuestionIndex + 1 }}/{{ questions.length }}
            </span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
          <div class="progress-stats">
            <span class="answered-count">{{ answeredQuestions }}/{{ questions.length }}</span>
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
              ← Prev
            </button>

            <div class="navigation-center">
              <button
                class="nav-btn review-btn"
                @click="showReviewSection = true"
                :disabled="answeredQuestions === 0"
              >
                📋 Review ({{ answeredQuestions }})
              </button>
              <select v-model="currentQuestionIndex" class="question-select">
                <option v-for="(question, index) in questions" :key="question.id" :value="index">
                  Q{{ index + 1 }}{{ isQuestionAnswered(question.id) ? '✓' : '' }}
                </option>
              </select>
            </div>

            <button
              class="nav-btn next-btn"
              @click="nextQuestion"
              :disabled="currentQuestionIndex === questions.length - 1"
            >
              Next →
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
            <h2>Review Answers</h2>
            <p>{{ answeredQuestions }} of {{ questions.length }} answered</p>
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
                {{ isQuestionAnswered(question.id) ? '✓' : '❌' }}
              </span>
            </div>
          </div>

          <div class="review-actions">
            <button class="action-btn continue-btn" @click="showReviewSection = false">
              Continue
            </button>
            <button
              class="action-btn submit-final-btn"
              @click="submitAllAnswers"
              :disabled="answeredQuestions === 0"
              :class="{ disabled: answeredQuestions === 0 }"
            >
              Submit Quiz
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
            <p>Here's how you did:</p>
          </div>

          <div class="score-section">
            <div class="score-circle">
              <div class="score-percentage">{{ results.scorePercentage }}%</div>
              <div class="score-text">Score</div>
            </div>

            <div class="score-details">
              <div class="score-item">
                <span class="score-label">Correct:</span>
                <span class="score-value correct">{{ results.score }}</span>
              </div>
              <div class="score-item">
                <span class="score-label">Total:</span>
                <span class="score-value">{{ results.totalQuestions }}</span>
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
              Excellent work! 🏆
            </p>
            <p v-else-if="results.percentage >= 70" class="good">
              Good job! 👍
            </p>
            <p v-else-if="results.percentage >= 50" class="average">
              Review the material 📚
            </p>
            <p v-else class="poor">Keep studying! 💪</p>
          </div>

          <div class="results-actions">
            <button class="action-btn review-btn" @click="enterReviewMode">Review Quiz</button>
            <button class="action-btn retry-btn" @click="retryQuiz">Retry Quiz</button>
            <router-link to="/documents" class="action-btn documents-btn">
              Back to Documents
            </router-link>
          </div>
        </div>
      </div>

      <!-- Review Quiz Mode - Show after completion to review answers -->
      <div v-else-if="questions.length > 0 && reviewMode" class="quiz-content">
        <div class="review-mode-header">
          <h2>📖 Quiz Review</h2>
          <p>Review your answers</p>
          <div class="review-stats">
            <span class="score-display"
              >{{ results.score }}/{{ results.totalQuestions }} ({{ results.percentage }}%)</span
            >
            <button class="nav-btn exit-review-btn" @click="exitReviewMode">
              ← Back
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
              Q{{ currentQuestionIndex + 1 }}
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
                    >✓ Correct</span
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
              ← Previous
            </button>

            <select v-model="currentQuestionIndex" class="question-select">
              <option v-for="(question, index) in questions" :key="question.id" :value="index">
                Q{{ index + 1 }}
                <span v-if="isAnswerCorrect(question.id)">✓</span>
                <span v-else-if="isQuestionAnswered(question.id)">✗</span>
                <span v-else>○</span>
              </option>
            </select>

            <button
              class="nav-btn next-btn"
              @click="nextQuestion"
              :disabled="currentQuestionIndex === questions.length - 1"
            >
              Next →
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
          <button class="action-btn" @click="retryLoading">Try Again</button>
          <router-link to="/documents" class="action-btn secondary">
            Back to Documents
          </router-link>
        </div>
      </div>

      <!-- No Questions State -->
      <div v-else class="no-questions-state">
        <div class="no-questions-icon">❓</div>
        <h3>No Questions Available</h3>
        <p>This document doesn't have any quiz questions yet.</p>
        <router-link to="/documents" class="action-btn"> Back to Documents </router-link>
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
// ... (script section remains exactly the same) ...
</script>

<style scoped>
.quiz-page {
  padding: 10px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.quiz-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* Quiz Header */
.quiz-header {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 20px;
}

.back-button {
  color: white;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 12px;
  display: inline-block;
  opacity: 0.9;
  font-size: 0.9rem;
}

.back-button:hover {
  opacity: 1;
}

.quiz-header h1 {
  font-size: 1.8rem;
  margin: 0 0 6px 0;
  font-weight: 700;
}

.quiz-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.quiz-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.progress-info {
  width: 100%;
}

.progress-text {
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
  font-size: 0.9rem;
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
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.answered-count {
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
}

.timer {
  font-weight: 700;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 16px;
}

/* Quiz Content */
.quiz-content {
  padding: 20px;
}

.question-card {
  background: #f8fafc;
  border-radius: 14px;
  padding: 20px;
  border: 2px solid #e2e8f0;
}

.question-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.question-number {
  color: #1e293b;
  font-size: 1.2rem;
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
  font-size: 1.1rem;
  line-height: 1.5;
  color: #1e293b;
  margin-bottom: 20px;
  font-weight: 500;
}

/* Options */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.option-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.option-card:hover:not(.answered) {
  border-color: #94a3b8;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 10px;
}

.option-identifier {
  min-width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #64748b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.option-card.selected .option-identifier {
  background: #3b82f6;
}

.option-card.answered .option-identifier {
  background: #10b981;
}

.option-status {
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}

.status-answered {
  color: #10b981;
}

.option-content {
  line-height: 1.5;
  color: #475569;
  font-size: 0.95rem;
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
  margin: 6px 0;
  padding-left: 18px;
}

.option-content :deep(li) {
  margin-bottom: 3px;
  font-size: 0.9rem;
}

/* Navigation */
.quiz-navigation {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-btn {
  padding: 14px 16px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  flex: 1;
}

.prev-btn {
  background: #f1f5f9;
  color: #475569;
  order: 1;
}

.prev-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.prev-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-btn {
  background: #10b981;
  color: white;
  order: 3;
}

.next-btn:hover:not(:disabled) {
  background: #059669;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.navigation-center {
  display: flex;
  flex-direction: column;
  gap: 10px;
  order: 2;
}

.review-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.review-btn:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.review-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-select {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #1e293b;
  font-size: 0.95rem;
  width: 100%;
}

/* Review Section */
.review-section {
  padding: 20px;
}

.review-card {
  background: #f8fafc;
  border-radius: 14px;
  padding: 24px;
  border: 2px solid #e2e8f0;
  text-align: center;
}

.review-header {
  margin-bottom: 24px;
}

.review-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.review-header h2 {
  color: #1e293b;
  margin: 0 0 8px 0;
  font-size: 1.5rem;
}

.review-header p {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.answer-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin: 20px 0;
  max-height: 150px;
  overflow-y: auto;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 50px;
  justify-content: center;
}

.summary-item:hover {
  border-color: #3b82f6;
}

.summary-item.unanswered {
  background: #fef2f2;
  border-color: #fecaca;
}

.question-number {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.answer-status {
  font-size: 0.8rem;
  font-weight: 600;
}

.answer-status.answered {
  color: #166534;
}

.answer-status:not(.answered) {
  color: #dc2626;
}

.review-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  padding: 14px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.95rem;
  width: 100%;
}

.continue-btn {
  background: #3b82f6;
  color: white;
}

.continue-btn:hover {
  background: #2563eb;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.submit-final-btn {
  background: #10b981;
  color: white;
}

.submit-final-btn:hover:not(.disabled) {
  background: #059669;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.submit-final-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Results */
.quiz-results {
  padding: 20px;
}

.results-card {
  text-align: center;
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #e2e8f0;
}

.results-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.results-header h2 {
  font-size: 1.6rem;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.results-header p {
  color: #64748b;
  font-size: 1rem;
  margin: 0 0 24px 0;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin: 24px 0;
}

.score-circle {
  width: 120px;
  height: 120px;
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
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
}

.score-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  position: relative;
  z-index: 1;
}

.score-text {
  position: absolute;
  bottom: 20px;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
  z-index: 1;
}

.score-details {
  text-align: center;
  width: 100%;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.score-item:last-child {
  border-bottom: none;
}

.score-label {
  color: #64748b;
  font-weight: 500;
  font-size: 0.95rem;
}

.score-value {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
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
  margin: 20px 0;
  padding: 16px;
  border-radius: 10px;
  background: #f8fafc;
}

.performance-message p {
  margin: 0;
  font-size: 1rem;
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
  flex-direction: column;
  gap: 10px;
}

.review-btn {
  background: #3b82f6;
  color: white;
}

.review-btn:hover {
  background: #2563eb;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.retry-btn {
  background: #f59e0b;
  color: white;
}

.retry-btn:hover {
  background: #d97706;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.documents-btn {
  background: #64748b;
  color: white;
}

.documents-btn:hover {
  background: #475569;
  box-shadow: 0 2px 8px rgba(100, 116, 139, 0.3);
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
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
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
  font-size: 3rem;
  margin-bottom: 16px;
}

.error-state h3,
.no-questions-state h3 {
  color: #1e293b;
  margin: 0 0 8px 0;
  font-size: 1.3rem;
}

.error-state p,
.no-questions-state p {
  color: #64748b;
  margin: 0 0 24px 0;
  font-size: 1rem;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  padding: 20px;
}

.submission-loading {
  background: white;
  padding: 30px;
  border-radius: 14px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 300px;
}

.submission-loading p {
  margin: 16px 0 0 0;
  color: #64748b;
  font-size: 1rem;
}

/* Review Mode Styles */
.review-mode-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border-radius: 14px;
}

.review-mode-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.review-mode-header p {
  margin: 0 0 12px 0;
  opacity: 0.9;
  font-size: 1rem;
}

.review-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.score-display {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
}

.exit-review-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 16px;
}

.exit-review-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Review question card states */
.review-question-card.correct {
  border-left: 4px solid #10b981;
}

.review-question-card.incorrect {
  border-left: 4px solid #ef4444;
}

.review-question-card.unanswered {
  border-left: 4px solid #f59e0b;
}

.review-status-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 16px;
  margin-left: 8px;
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
  gap: 6px;
  flex-wrap: wrap;
}

.correct-indicator,
.user-answer-indicator,
.correct-user-indicator {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
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
  border-radius: 10px;
  padding: 16px;
  margin-top: 20px;
  border-left: 3px solid #3b82f6;
}

.explanation-header {
  color: #1e293b;
  font-size: 1rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.explanation-content {
  color: #475569;
  line-height: 1.5;
  font-size: 0.95rem;
}

/* Desktop-specific styles */
@media (min-width: 768px) {
  .quiz-page {
    padding: 20px;
  }

  .quiz-header {
    padding: 30px;
  }

  .quiz-header h1 {
    font-size: 2.5rem;
  }

  .quiz-progress {
    flex-direction: row;
    align-items: center;
  }

  .progress-info {
    flex: 1;
  }

  .progress-stats {
    justify-content: flex-end;
    gap: 20px;
    width: auto;
  }

  .quiz-content {
    padding: 40px;
  }

  .question-card {
    padding: 30px;
  }

  .question-header {
    flex-direction: row;
    align-items: center;
  }

  .quiz-navigation {
    flex-direction: row;
    gap: 15px;
  }

  .navigation-center {
    flex-direction: row;
    gap: 15px;
    order: 0;
  }

  .nav-btn {
    width: auto;
  }

  .prev-btn {
    order: 0;
  }

  .next-btn {
    order: 0;
  }

  .review-section {
    padding: 40px;
  }

  .answer-summary {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }

  .review-actions {
    flex-direction: row;
  }

  .action-btn {
    width: auto;
  }

  .score-section {
    flex-direction: row;
    gap: 50px;
  }

  .score-details {
    text-align: left;
  }

  .results-actions,
  .error-actions {
    flex-direction: row;
  }

  .review-mode-header {
    padding: 25px;
  }

  .review-stats {
    flex-direction: row;
    justify-content: space-between;
  }

  .quiz-navigation {
    flex-direction: row;
  }
}

@media (max-width: 380px) {
  .quiz-header h1 {
    font-size: 1.6rem;
  }

  .question-text {
    font-size: 1rem;
  }

  .option-card {
    padding: 12px;
  }

  .answer-summary {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }

  .score-circle {
    width: 100px;
    height: 100px;
  }

  .score-circle::before {
    width: 80px;
    height: 80px;
  }

  .score-percentage {
    font-size: 1.3rem;
  }
}
</style>
