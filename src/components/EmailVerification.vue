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
  padding: 16px;
}

.verification-card {
  background: white;
  padding: clamp(24px, 5vw, 40px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: min(500px, 90vw);
  margin: 0 auto;
}

.logo-section {
  text-align: center;
  margin-bottom: clamp(20px, 4vw, 30px);
}

.logo-section h1 {
  color: #27ae60;
  font-size: clamp(2rem, 6vw, 2.5rem);
  font-weight: bold;
  margin-bottom: 8px;
  line-height: 1.2;
}

.logo-section p {
  color: #7f8c8d;
  font-size: clamp(0.8rem, 3vw, 0.9rem);
}

.verification-content {
  text-align: center;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(12px, 3vw, 15px);
}

.spinner {
  width: clamp(32px, 8vw, 40px);
  height: clamp(32px, 8vw, 40px);
  border: 3px solid #f3f3f3;
  border-top: 3px solid #27ae60;
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
  font-size: clamp(1rem, 3vw, 1.1rem);
}

.success-state .icon,
.error-state .icon {
  font-size: clamp(3rem, 12vw, 4rem);
  margin-bottom: clamp(16px, 4vw, 20px);
}

.success-state h2,
.error-state h2 {
  margin-bottom: clamp(12px, 3vw, 15px);
  font-size: clamp(1.5rem, 5vw, 1.8rem);
  line-height: 1.3;
}

.success-state h2 {
  color: #27ae60;
}

.error-state h2 {
  color: #e74c3c;
}

.success-state p,
.error-state p {
  color: #5a6c7d;
  margin-bottom: clamp(12px, 3vw, 15px);
  line-height: 1.6;
  font-size: clamp(0.9rem, 3vw, 1rem);
}

.login-btn {
  display: inline-block;
  padding: clamp(10px, 3vw, 12px) clamp(20px, 4vw, 24px);
  background: #27ae60;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: clamp(12px, 3vw, 15px);
  font-size: clamp(0.9rem, 3vw, 1rem);
  border: none;
  cursor: pointer;
  min-height: 44px; /* Better touch targets on mobile */
}

.login-btn:hover {
  background: #219a52;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 2vw, 10px);
  margin-top: clamp(16px, 4vw, 20px);
}

.resend-link,
.login-link {
  text-decoration: none;
  padding: clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px);
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: clamp(0.85rem, 3vw, 0.9rem);
  min-height: 44px; /* Better touch targets */
  display: flex;
  align-items: center;
  justify-content: center;
}

.resend-link {
  color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.login-link {
  color: #5a6c8d;
  background: rgba(90, 108, 141, 0.1);
  border: 1px solid rgba(90, 108, 141, 0.2);
}

.resend-link:hover,
.login-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resend-link:hover {
  background: rgba(39, 174, 96, 0.2);
  text-decoration: none;
}

.login-link:hover {
  background: rgba(90, 108, 141, 0.2);
  text-decoration: none;
}

/* Mobile-first responsive design */
@media (max-width: 480px) {
  .verification-container {
    padding: 12px;
    align-items: flex-start;
    padding-top: 20vh; /* Better positioning on mobile */
  }

  .verification-card {
    padding: 20px;
    border-radius: 10px;
  }

  .actions {
    flex-direction: column;
  }
}

/* Tablet and desktop enhancements */
@media (min-width: 768px) {
  .verification-container {
    padding: 24px;
  }

  .actions {
    flex-direction: row;
    justify-content: center;
  }

  .resend-link,
  .login-link {
    min-width: 160px;
  }
}

/* Large desktop */
@media (min-width: 1200px) {
  .verification-card {
    padding: 48px;
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation-duration: 2s;
  }

  .login-btn,
  .resend-link,
  .login-link {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .verification-card {
    border: 2px solid #000;
  }

  .resend-link,
  .login-link {
    border-width: 2px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .verification-card {
    background: #1a1a1a;
    color: #ffffff;
  }

  .logo-section p,
  .success-state p,
  .error-state p,
  .loading p {
    color: #cccccc;
  }

  input, .password-input {
    background: #2d2d2d;
    border-color: #444;
    color: #ffffff;
  }

  input:focus {
    border-color: #27ae60;
    background: #2d2d2d;
  }
}
</style>
