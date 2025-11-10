<template>
  <div class="verification-container">
    <div class="verification-card">
      <div class="logo-section">
        <h1>Socratic</h1>
        <p>Verify your email address</p>
      </div>

      <div class="verification-content">
        <div class="icon">📧</div>
        <h2>Check your email</h2>
        <p v-if="email">
          We've sent a verification link to <strong>{{ email }}</strong>
        </p>
        <p v-else>We've sent a verification link to your email address.</p>
        <p>Click the link in the email to verify your account and start using Socratic.</p>

        <div class="verification-actions">
          <button @click="resendVerification" :disabled="loading" class="resend-btn">
            {{ loading ? 'Sending...' : 'Resend Verification Email' }}
          </button>
          <router-link to="/login" class="login-link">Back to Login</router-link>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>

        <div class="help-text">
          <p><strong>Didn't receive the email?</strong></p>
          <ul>
            <li>Check your spam folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes and try again</li>
            <li>Contact support if the problem persists</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => {
  email.value = route.query.email || ''
})

const resendVerification = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  if (!email.value) {
    error.value = 'Email address is required to resend verification.'
    loading.value = false
    return
  }

  try {
    console.log('Resending verification to:', email.value)

    const response = await fetch('https://socratic-f2kh.onrender.com/registration/resend-email/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
      }),
    })

    console.log('Resend response status:', response.status)
    const data = await response.json()
    console.log('Resend response data:', data)

    if (response.ok) {
      success.value = 'Verification email sent successfully! Please check your inbox.'
    } else {
      if (data.detail) {
        error.value = data.detail
      } else if (data.email) {
        error.value = `Email error: ${data.email.join(' ')}`
      } else {
        error.value = 'Failed to send verification email. Please try again.'
      }
    }
  } catch (err) {
    console.error('Resend verification error:', err)
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.verification-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: clamp(12px, 4vw, 20px);
}

.verification-card {
  background: white;
  padding: clamp(20px, 5vw, 40px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: min(500px, 92vw);
  margin: 0 auto;
}

.logo-section {
  text-align: center;
  margin-bottom: clamp(20px, 4vw, 30px);
}

.logo-section h1 {
  color: #27ae60;
  font-size: clamp(1.8rem, 6vw, 2.5rem);
  font-weight: bold;
  margin-bottom: 6px;
  line-height: 1.2;
}

.logo-section p {
  color: #7f8c8d;
  font-size: clamp(0.8rem, 3vw, 0.9rem);
}

.verification-content {
  text-align: center;
}

.icon {
  font-size: clamp(3rem, 12vw, 4rem);
  margin-bottom: clamp(16px, 4vw, 20px);
}

.verification-content h2 {
  color: #2c3e50;
  margin-bottom: clamp(12px, 3vw, 15px);
  font-size: clamp(1.4rem, 5vw, 1.6rem);
  line-height: 1.3;
}

.verification-content p {
  color: #5a6c7d;
  margin-bottom: clamp(10px, 2.5vw, 15px);
  line-height: 1.6;
  font-size: clamp(0.9rem, 3vw, 1rem);
}

.verification-actions {
  margin: clamp(20px, 5vw, 30px) 0;
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 3vw, 15px);
}

.resend-btn {
  padding: clamp(12px, 3vw, 14px) clamp(16px, 4vw, 24px);
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(0.9rem, 3vw, 1rem);
  min-height: 48px;
  width: 100%;
}

.resend-btn:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.resend-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-link {
  color: #27ae60;
  text-decoration: none;
  font-weight: 500;
  font-size: clamp(0.9rem, 3vw, 1rem);
  padding: clamp(10px, 2vw, 12px);
  border-radius: 6px;
  transition: all 0.3s ease;
  display: inline-block;
  min-height: 44px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-link:hover {
  text-decoration: none;
  background: rgba(39, 174, 96, 0.1);
  transform: translateY(-1px);
}

.error-message {
  margin-top: clamp(12px, 3vw, 16px);
  padding: clamp(10px, 2.5vw, 12px);
  background: #ffeaea;
  color: #e74c3c;
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  text-align: center;
  font-size: clamp(0.85rem, 3vw, 0.9rem);
}

.success-message {
  margin-top: clamp(12px, 3vw, 16px);
  padding: clamp(10px, 2.5vw, 12px);
  background: #e8f6ef;
  color: #27ae60;
  border: 1px solid #a3e4d7;
  border-radius: 6px;
  text-align: center;
  font-size: clamp(0.85rem, 3vw, 0.9rem);
}

.help-text {
  margin-top: clamp(20px, 5vw, 30px);
  padding: clamp(16px, 4vw, 20px);
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.help-text p {
  margin-bottom: clamp(8px, 2vw, 10px);
  font-weight: 600;
  font-size: clamp(0.9rem, 3vw, 1rem);
}

.help-text ul {
  margin: 0;
  padding-left: clamp(16px, 4vw, 20px);
  color: #5a6c7d;
}

.help-text li {
  margin-bottom: clamp(4px, 1vw, 5px);
  font-size: clamp(0.85rem, 3vw, 0.9rem);
  line-height: 1.5;
}

/* Mobile-specific adjustments */
@media (max-width: 480px) {
  .verification-container {
    padding: 8px;
    align-items: flex-start;
    padding-top: 10vh;
  }

  .verification-card {
    padding: 20px 16px;
    border-radius: 10px;
  }

  .verification-actions {
    margin: 24px 0;
  }
}

/* Tablet adjustments */
@media (min-width: 768px) {
  .verification-container {
    padding: 24px;
  }

  .verification-actions {
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .resend-btn {
    width: auto;
    min-width: 200px;
  }

  .login-link {
    min-width: 120px;
  }
}

/* Large desktop enhancements */
@media (min-width: 1200px) {
  .verification-card {
    padding: 48px;
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .resend-btn,
  .login-link {
    transition: none;
  }

  .resend-btn:hover:not(:disabled),
  .login-link:hover {
    transform: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .verification-card {
    background: #1a1a1a;
    color: #ffffff;
  }

  .logo-section p,
  .verification-content p,
  .help-text {
    color: #cccccc;
  }

  .help-text {
    background: #2d2d2d;
  }

  .verification-content h2 {
    color: #ffffff;
  }

  .help-text ul {
    color: #aaaaaa;
  }
}
</style>
