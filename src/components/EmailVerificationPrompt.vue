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
  padding: 20px;
}

.verification-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-section h1 {
  color: #27ae60;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.logo-section p {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.verification-content {
  text-align: center;
}

.icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.verification-content h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.verification-content p {
  color: #5a6c7d;
  margin-bottom: 15px;
  line-height: 1.6;
}

.verification-actions {
  margin: 30px 0;
}

.resend-btn {
  padding: 12px 24px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.resend-btn:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-2px);
}

.resend-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.login-link {
  color: #27ae60;
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #ffeaea;
  color: #e74c3c;
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  text-align: center;
}

.success-message {
  margin-top: 16px;
  padding: 12px;
  background: #e8f6ef;
  color: #27ae60;
  border: 1px solid #a3e4d7;
  border-radius: 6px;
  text-align: center;
}

.help-text {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.help-text p {
  margin-bottom: 10px;
  font-weight: 600;
}

.help-text ul {
  margin: 0;
  padding-left: 20px;
  color: #5a6c7d;
}

.help-text li {
  margin-bottom: 5px;
}
</style>
