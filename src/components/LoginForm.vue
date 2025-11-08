<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo/Header -->
      <div class="logo-section">
        <h1>Socratic</h1>
        <p>Welcome back</p>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
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
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
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

.input-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
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
  padding: 12px 45px 12px 16px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
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
  padding: 14px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-1px);
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
  margin: 15px 0;
}

.forgot-password {
  color: #7f8c8d;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  color: #27ae60;
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
  font-size: 0.9rem;
}

.verification-prompt {
  margin-top: 10px;
  padding: 10px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
}

.verification-prompt p {
  margin: 0 0 8px 0;
  color: #856404;
  font-size: 0.85rem;
}

.resend-btn {
  padding: 8px 16px;
  background: #e67e22;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.resend-btn:hover:not(:disabled) {
  background: #d35400;
}

.resend-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.signup-link {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
  color: #7f8c8d;
}

.signup-link a {
  color: #27ae60;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
