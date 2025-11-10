<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo/Header -->
      <div class="logo-section">
        <h1>Socratic</h1>
        <p>Welcome back</p>
      </div>

      <!-- Session Expired Message -->
      <div v-if="$route.query.session_expired" class="session-expired-message">
        Your session has expired. Please log in again.
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="input-group">
          <label>Username</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="Enter your username"
            required
            :disabled="loading"
          >
        </div>

        <div class="input-group">
          <label>Password</label>
          <div class="password-input-container">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              required
              class="password-input"
              :disabled="loading"
            >
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="password-toggle"
              :disabled="loading"
              aria-label="Toggle password visibility"
            >
              <span v-if="showPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </button>

        <div class="form-links">
          <router-link to="/password-reset" class="forgot-password">
            Forgot your password?
          </router-link>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
          <div v-if="showResendVerification" class="verification-prompt">
            <p>Need a new verification email?</p>
            <button @click="resendVerification" :disabled="resendLoading" class="resend-btn">
              {{ resendLoading ? 'Sending...' : 'Resend Verification Email' }}
            </button>
          </div>
        </div>

        <div class="signup-link">
          Don't have an account? <router-link to="/register">Sign up</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loading = ref(false)
const resendLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = ref({
  username: '',
  password: ''
})

// Check if we should show the resend verification option
const showResendVerification = computed(() => {
  return error.value.toLowerCase().includes('verify') ||
         error.value.toLowerCase().includes('verification') ||
         error.value.toLowerCase().includes('confirmed')
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  const result = await authStore.login(form.value)

  if (result.success) {
    console.log('Login successful!', authStore.user)
    // The welcome animation and redirect will be handled by the Layout component
  } else {
    // Handle different types of login errors
    if (result.error?.detail?.toLowerCase().includes('verified') ||
        result.error?.non_field_errors?.some(msg => msg.toLowerCase().includes('verified')) ||
        result.error?.detail?.toLowerCase().includes('confirm') ||
        result.error?.non_field_errors?.some(msg => msg.toLowerCase().includes('confirm'))) {

      error.value = 'Please verify your email address before logging in. Check your email for the verification link.'

    } else if (result.error?.detail?.toLowerCase().includes('invalid') ||
               result.error?.non_field_errors?.some(msg => msg.toLowerCase().includes('invalid'))) {

      error.value = 'Invalid username or password. Please try again.'

    } else if (result.error?.detail) {
      error.value = result.error.detail
    } else if (result.error?.non_field_errors) {
      error.value = result.error.non_field_errors.join(' ')
    } else {
      error.value = 'Login failed. Please check your credentials and try again.'
    }
  }

  loading.value = false
}

const resendVerification = async () => {
  resendLoading.value = true
  error.value = ''

  try {
    // Since we only have username in login form, we need to get the email
    // For now, we'll redirect to verification prompt where user can enter email
    router.push('/verify-email-prompt')
  } catch (err) {
    error.value = 'Please go to the verification page to resend the email.'
    console.error('Resend verification error:', err)
  } finally {
    resendLoading.value = false
  }
}

// Clear session expired message when component mounts
onMounted(() => {
  if (route.query.session_expired) {
    // You can optionally clear the query parameter here
    console.log('Session expired - user needs to login again')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: clamp(12px, 4vw, 20px);
}

.login-card {
  background: white;
  padding: clamp(24px, 5vw, 40px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: min(400px, 92vw);
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
  margin-bottom: 6px;
  line-height: 1.2;
}

.logo-section p {
  color: #7f8c8d;
  font-size: clamp(0.8rem, 3vw, 0.9rem);
}

/* Session expired message */
.session-expired-message {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: clamp(10px, 2.5vw, 12px);
  border-radius: 6px;
  margin-bottom: clamp(16px, 3vw, 20px);
  text-align: center;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  line-height: 1.4;
}

.input-group {
  margin-bottom: clamp(16px, 3vw, 20px);
}

label {
  display: block;
  margin-bottom: clamp(6px, 1.5vw, 8px);
  color: #2c3e50;
  font-weight: 500;
  font-size: clamp(0.9rem, 3vw, 1rem);
}

input {
  width: 100%;
  padding: clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px);
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: clamp(0.9rem, 3vw, 1rem);
  transition: all 0.3s ease;
  min-height: 48px;
}

input:focus {
  outline: none;
  border-color: #27ae60;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding: clamp(10px, 2.5vw, 12px) clamp(40px, 8vw, 45px) clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px);
}

.password-toggle {
  position: absolute;
  right: clamp(8px, 2vw, 12px);
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
}

.password-toggle:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.login-btn {
  width: 100%;
  padding: clamp(12px, 3vw, 14px);
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: clamp(1rem, 3.5vw, 1.1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: clamp(8px, 2vw, 10px);
  min-height: 54px;
}

.login-btn:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.login-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.form-links {
  text-align: center;
  margin: clamp(12px, 3vw, 15px) 0;
}

.forgot-password {
  color: #7f8c8d;
  text-decoration: none;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  padding: clamp(8px, 2vw, 10px);
  border-radius: 4px;
  transition: all 0.3s ease;
  display: inline-block;
  min-height: 44px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forgot-password:hover {
  color: #27ae60;
  text-decoration: none;
  background-color: #f8f9fa;
}

.error-message {
  margin-top: clamp(12px, 3vw, 16px);
  padding: clamp(10px, 2.5vw, 12px);
  background: #ffeaea;
  color: #e74c3c;
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  text-align: center;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  line-height: 1.4;
}

.verification-prompt {
  margin-top: clamp(8px, 2vw, 10px);
  padding: clamp(8px, 2vw, 10px);
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
}

.verification-prompt p {
  margin: 0 0 clamp(6px, 1.5vw, 8px) 0;
  color: #856404;
  font-size: clamp(0.8rem, 2.5vw, 0.85rem);
  line-height: 1.4;
}

.resend-btn {
  padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
  background: #e67e22;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 44px;
  width: 100%;
  font-weight: 500;
}

.resend-btn:hover:not(:disabled) {
  background: #d35400;
  transform: translateY(-1px);
}

.resend-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.signup-link {
  text-align: center;
  margin-top: clamp(16px, 3vw, 20px);
  padding-top: clamp(16px, 3vw, 20px);
  border-top: 1px solid #ecf0f1;
  color: #7f8c8d;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  line-height: 1.4;
}

.signup-link a {
  color: #27ae60;
  text-decoration: none;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.signup-link a:hover {
  text-decoration: none;
  background-color: #f8f9fa;
}

/* Mobile-specific optimizations */
@media (max-width: 480px) {
  .login-container {
    padding: 8px;
    align-items: flex-start;
    padding-top: 10vh;
  }

  .login-card {
    padding: 20px 16px;
    border-radius: 10px;
  }

  .password-toggle {
    min-width: 36px;
    min-height: 36px;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) {
  .login-container {
    padding: 24px;
  }

  .login-card {
    padding: 32px;
  }
}

/* Large desktop enhancements */
@media (min-width: 1200px) {
  .login-card {
    padding: 48px;
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  input,
  .login-btn,
  .password-toggle,
  .forgot-password,
  .resend-btn,
  .signup-link a {
    transition: none;
  }

  .login-btn:hover:not(:disabled),
  .resend-btn:hover:not(:disabled) {
    transform: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .login-card {
    background: #1a1a1a;
    color: #ffffff;
  }

  .logo-section p,
  .signup-link {
    color: #cccccc;
  }

  label {
    color: #ffffff;
  }

  input {
    background: #2d2d2d;
    border-color: #444;
    color: #ffffff;
  }

  input:focus {
    border-color: #27ae60;
    background: #2d2d2d;
  }

  .forgot-password {
    color: #aaaaaa;
  }

  .forgot-password:hover {
    color: #27ae60;
    background-color: #2d2d2d;
  }

  .signup-link a:hover {
    background-color: #2d2d2d;
  }

  .session-expired-message {
    background: #332b00;
    border-color: #665800;
    color: #ffd700;
  }

  .verification-prompt {
    background: #332b00;
    border-color: #665800;
  }

  .verification-prompt p {
    color: #ffd700;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .login-card {
    border: 2px solid #000;
  }

  input {
    border-width: 2px;
  }

  .login-btn,
  .resend-btn {
    border: 2px solid #000;
  }
}
</style>
