<template>
  <div class="quiz-page">
    <div class="quiz-container">
      <!-- Quiz Header -->
      <div class="quiz-header">
        <div class="header-content">
          <router-link to="/documents" class="back-button">
            <span class="back-icon">←</span>
            <span class="back-text">Back to Documents</span>
          </router-link>
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
            <span class="answered-count">
              {{ answeredQuestions }}/{{ questions.length }} answered
            </span>
            <div class="timer" v-if="timeLimit > 0">
              <span class="timer-icon">⏱️</span>
              {{ formatTime(timeRemaining) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading quiz questions...</p>
      </div>

      <!-- Quiz Content -->
      <div
        v-else-if="questions.length > 0 && !quizCompleted && !showReviewSection && !reviewMode"
        class="quiz-content"
      >
        <!-- Current Question -->
        <div class="question-card">
          <div class="question-header">
            <h2 class="question-number">Question {{ currentQuestionIndex + 1 }}</h2>
            <div class="question-status">
              <span v-if="isQuestionAnswered(currentQuestion.id)" class="answered-badge">
                ✓ Answered
              </span>
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
              <div class="option-content">
                <div class="option-identifier">
                  <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                </div>
                <div class="option-text" v-html="formatOptionText(option)"></div>
              </div>
              <div class="option-status" v-if="isQuestionAnswered(currentQuestion.id) && getSelectedOption(currentQuestion.id) === index">
                <span class="status-answered">Selected</span>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="quiz-navigation">
            <button
              class="nav-btn prev-btn"
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              <span class="btn-icon">←</span>
              <span class="btn-text">Previous</span>
            </button>

            <div class="navigation-center">
              <button
                class="nav-btn review-btn"
                @click="showReviewSection = true"
                :disabled="answeredQuestions === 0"
              >
                <span class="btn-icon">📋</span>
                <span class="btn-text">Review ({{ answeredQuestions }})</span>
              </button>
              <div class="question-jump">
                <label class="jump-label">Jump to:</label>
                <select v-model="currentQuestionIndex" class="question-select">
                  <option v-for="(question, index) in questions" :key="question.id" :value="index">
                    Q{{ index + 1 }} {{ isQuestionAnswered(question.id) ? '✓' : '' }}
                  </option>
                </select>
              </div>
            </div>

            <button
              class="nav-btn next-btn"
              @click="nextQuestion"
              :disabled="currentQuestionIndex === questions.length - 1"
            >
              <span class="btn-text">Next</span>
              <span class="btn-icon">→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Review Section -->
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
                {{ isQuestionAnswered(question.id) ? '✓' : '○' }}
              </span>
            </div>
          </div>

          <div class="review-actions">
            <button class="action-btn continue-btn" @click="showReviewSection = false">
              Continue Quiz
            </button>
            <button
              class="action-btn submit-final-btn"
              @click="submitAllAnswers"
              :disabled="answeredQuestions === 0"
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
            <p>You've finished the quiz. Here's how you did:</p>
          </div>

          <div class="score-section">
            <div class="score-circle">
              <div class="score-percentage">{{ results.scorePercentage }}%</div>
              <div class="score-text">Score</div>
            </div>

            <div class="score-details">
              <div class="score-item">
                <span class="score-label">Correct:</span>
                <span class="score-value correct">{{ results.score }}/{{ results.totalQuestions }}</span>
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
            <button class="action-btn review-btn" @click="enterReviewMode">
              Review Quiz
            </button>
            <button class="action-btn retry-btn" @click="retryQuiz">
              Retry Quiz
            </button>
            <router-link to="/documents" class="action-btn documents-btn">
              Back to Documents
            </router-link>
          </div>
        </div>
      </div>

      <!-- Review Quiz Mode -->
      <div v-else-if="questions.length > 0 && reviewMode" class="quiz-content">
        <div class="review-mode-header">
          <h2>Quiz Review</h2>
          <p>Review your answers and see the correct solutions</p>
          <div class="review-stats">
            <span class="score-display">
              Score: {{ results.score }}/{{ results.totalQuestions }} ({{ results.percentage }}%)
            </span>
            <button class="nav-btn exit-review-btn" @click="exitReviewMode">
              Back to Results
            </button>
          </div>
        </div>

        <!-- Review Question Card -->
        <div
          class="question-card review-question-card"
          :class="{
            correct: isAnswerCorrect(currentQuestion.id),
            incorrect: !isAnswerCorrect(currentQuestion.id) && isQuestionAnswered(currentQuestion.id),
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
                  'incorrect-badge': !isAnswerCorrect(currentQuestion.id) && isQuestionAnswered(currentQuestion.id),
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
                'wrong-user-answer': getUserAnswerIndex(currentQuestion.id) === index && !isCorrectAnswer(currentQuestion, index),
              }"
            >
              <div class="option-content">
                <div class="option-identifier">
                  <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                  <span v-if="isCorrectAnswer(currentQuestion, index)" class="correct-indicator">
                    ✓
                  </span>
                  <span
                    v-if="getUserAnswerIndex(currentQuestion.id) === index && !isCorrectAnswer(currentQuestion, index)"
                    class="user-answer-indicator"
                  >
                    ✗
                  </span>
                </div>
                <div class="option-text" v-html="formatOptionText(option)"></div>
              </div>
            </div>
          </div>

          <!-- Explanation Section -->
          <div class="explanation-section" v-if="currentQuestion.explanation">
            <div class="explanation-header">
              <strong>Explanation:</strong>
            </div>
            <div class="explanation-content" v-html="formatOptionText(currentQuestion.explanation)"></div>
          </div>

          <!-- Navigation Buttons for Review Mode -->
          <div class="quiz-navigation">
            <button
              class="nav-btn prev-btn"
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              Previous
            </button>

            <div class="navigation-center">
              <div class="question-jump">
                <label class="jump-label">Jump to:</label>
                <select v-model="currentQuestionIndex" class="question-select">
                  <option v-for="(question, index) in questions" :key="question.id" :value="index">
                    Q{{ index + 1 }}
                    <span v-if="isAnswerCorrect(question.id)">✓</span>
                    <span v-else-if="isQuestionAnswered(question.id)">✗</span>
                    <span v-else>○</span>
                  </option>
                </select>
              </div>
            </div>

            <button
              class="nav-btn next-btn"
              @click="nextQuestion"
              :disabled="currentQuestionIndex === questions.length - 1"
            >
              Next
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
        <router-link to="/documents" class="action-btn">Back to Documents</router-link>
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
// ... (keep the same script section as your original, it's already well-structured)
</script>

<style scoped>
/* Base Styles */
.quiz-page {
  padding: 16px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.quiz-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Quiz Header */
.quiz-header {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 24px 20px;
}

.back-button {
  color: white;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  opacity: 0.9;
  font-size: 0.9rem;
}

.back-text {
  display: inline;
}

.back-icon {
  display: inline;
}

.quiz-header h1 {
  font-size: 1.75rem;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.quiz-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.quiz-progress {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
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
  font-size: 0.85rem;
}

.timer {
  font-weight: 700;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.timer-icon {
  font-size: 0.8rem;
}

/* Quiz Content */
.quiz-content {
  padding: 20px;
}

.question-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.question-number {
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.question-status {
  flex-shrink: 0;
}

.answered-badge {
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.question-text {
  font-size: 1.1rem;
  line-height: 1.5;
  color: #1e293b;
  margin-bottom: 24px;
  font-weight: 500;
}

/* Options */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.option-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
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

.option-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.option-identifier {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #64748b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.option-card.selected .option-identifier {
  background: #3b82f6;
}

.option-card.answered .option-identifier {
  background: #10b981;
}

.option-text {
  line-height: 1.5;
  color: #475569;
  flex: 1;
  font-size: 0.95rem;
}

.option-text :deep(strong) {
  color: #1e293b;
  font-weight: 600;
}

.option-text :deep(em) {
  color: #475569;
  font-style: italic;
}

.option-text :deep(ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.option-text :deep(li) {
  margin-bottom: 4px;
}

.option-status {
  flex-shrink: 0;
}

.status-answered {
  color: #10b981;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Navigation */
.quiz-navigation {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-btn {
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  gap: 12px;
  order: 2;
}

.review-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.review-btn:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.review-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #64748b;
  justify-content: center;
}

.jump-label {
  white-space: nowrap;
}

.question-select {
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #1e293b;
  font-size: 0.85rem;
  min-width: 80px;
}

.btn-icon {
  display: inline;
}

.btn-text {
  display: inline;
}

/* Review Section */
.review-section {
  padding: 20px;
}

.review-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px 20px;
  border: 1px solid #e2e8f0;
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
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
  margin: 20px 0;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 4px;
  min-height: 60px;
}

.summary-item:hover {
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.summary-item.unanswered {
  background: #fef2f2;
  border-color: #fecaca;
}

.question-number {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.85rem;
}

.answer-status {
  font-size: 1rem;
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
  gap: 12px;
}

.action-btn {
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
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

.submit-final-btn:hover:not(:disabled) {
  background: #059669;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.submit-final-btn:disabled {
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
  padding: 24px 20px;
  border: 1px solid #e2e8f0;
}

.results-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.results-header h2 {
  font-size: 1.75rem;
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
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.score-item:last-child {
  border-bottom: none;
}

.score-label {
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
}

.score-value {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9rem;
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
  border-radius: 12px;
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
  gap: 12px;
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

/* Review Mode Styles */
.review-mode-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border-radius: 12px;
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
  gap: 12px;
  align-items: center;
}

.score-display {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.exit-review-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
}

.exit-review-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Enhanced Mobile Responsiveness */
@media (min-width: 768px) {
  .quiz-page {
    padding: 24px;
  }

  .quiz-header {
    padding: 32px 40px;
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
    width: auto;
    gap: 20px;
  }

  .quiz-content {
    padding: 40px;
  }

  .question-card {
    padding: 32px;
  }

  .quiz-navigation {
    flex-direction: row;
    align-items: center;
  }

  .nav-btn {
    flex: 0 0 auto;
    width: auto;
  }

  .prev-btn {
    order: 1;
  }

  .navigation-center {
    order: 2;
    flex-direction: row;
    flex: 1;
    justify-content: center;
    gap: 20px;
  }

  .next-btn {
    order: 3;
  }

  .review-actions {
    flex-direction: row;
  }

  .action-btn {
    width: auto;
    flex: 1;
  }

  .results-actions {
    flex-direction: row;
  }

  .score-section {
    flex-direction: row;
    justify-content: center;
  }

  .review-stats {
    flex-direction: row;
    justify-content: space-between;
  }

  .back-text {
    display: inline;
  }

  .btn-text {
    display: inline;
  }
}

@media (min-width: 1024px) {
  .quiz-container {
    margin: 24px auto;
  }

  .answer-summary {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }

  .summary-item {
    min-height: 70px;
  }
}

/* Touch-friendly improvements */
@media (max-width: 767px) {
  .option-card {
    min-height: 60px;
    align-items: center;
  }

  .nav-btn {
    min-height: 48px;
  }

  .action-btn {
    min-height: 48px;
  }

  /* Hide some text on very small screens */
  @media (max-width: 360px) {
    .back-text {
      display: none;
    }

    .btn-text {
      display: none;
    }

    .jump-label {
      display: none;
    }

    .timer-icon {
      display: none;
    }
  }
}

/* High DPI screen optimizations */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .quiz-container {
    border-width: 0.5px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .option-card,
  .nav-btn,
  .action-btn,
  .summary-item {
    transition: none;
  }

  .spinner {
    animation-duration: 2s;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .quiz-container {
    background: #1a1a1a;
    color: #ffffff;
  }

  .question-card,
  .review-card,
  .results-card {
    background: #2d2d2d;
    border-color: #404040;
    color: #ffffff;
  }

  .option-card {
    background: #2d2d2d;
    border-color: #404040;
    color: #ffffff;
  }

  .question-text,
  .option-text,
  .question-number {
    color: #ffffff;
  }
}
</style>
