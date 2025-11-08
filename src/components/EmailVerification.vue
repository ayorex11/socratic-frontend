<template>
  <div class="verification-container">
    <div class="verification-card">
      <div class="logo-section">
        <h1>Socratic</h1>
        <p>Verify your email</p>
      </div>

      <div class="verification-content">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Verifying your email...</p>
        </div>

        <div v-else-if="success" class="success-state">
          <div class="icon">✅</div>
          <h2>Email Verified Successfully!</h2>
          <p>Your email has been successfully verified.</p>
          <p>You can now login to your account and start using Socratic.</p>
          <router-link to="/login" class="login-btn">Go to Login</router-link>
        </div>

        <div v-else class="error-state">
          <div class="icon">❌</div>
          <h2>Verification Failed</h2>
          <p>{{ error }}</p>
          <div class="actions">
            <router-link to="/verify-email-prompt" class="resend-link"
              >Resend Verification Email</router-link
            >
            <router-link to="/login" class="login-link">Back to Login</router-link>
          </div>
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
const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const key = route.params.key

  if (!key) {
    error.value = 'Invalid verification link. Please check the link and try again.'
    loading.value = false
    return
  }

  try {
    console.log('Verifying email with key:', key)

    const response = await fetch('https://socratic-f2kh.onrender.com/registration/verify-email/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: key,
      }),
    })

    console.log('Verification response status:', response.status)

    if (response.ok) {
      success.value = true
    } else {
      const data = await response.json()
      console.log('Verification error data:', data)

      if (data.detail) {
        error.value = data.detail
      } else if (data.key) {
        error.value = `Key error: ${data.key.join(' ')}`
      } else {
        error.value = 'Verification failed. The link may be invalid or expired.'
      }
    }
  } catch (err) {
    console.error('Verification network error:', err)
    error.value = 'Network error. Please check your connection and try again.'
  } finally {
    loading.value = false
  }
})
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

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #27ae60;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading p {
  color: #5a6c7d;
  font-size: 1.1rem;
}

.success-state .icon,
.error-state .icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.success-state h2 {
  color: #27ae60;
  margin-bottom: 15px;
}

.error-state h2 {
  color: #e74c3c;
  margin-bottom: 15px;
}

.success-state p,
.error-state p {
  color: #5a6c7d;
  margin-bottom: 15px;
  line-height: 1.6;
}

.login-btn {
  display: inline-block;
  padding: 12px 24px;
  background: #27ae60;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.3s ease;
  margin-top: 15px;
}

.login-btn:hover {
  background: #219a52;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.resend-link {
  color: #27ae60;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
}

.login-link {
  color: #5a6c8d;
  text-decoration: none;
  padding: 8px 16px;
}

.resend-link:hover,
.login-link:hover {
  text-decoration: underline;
}
</style>
