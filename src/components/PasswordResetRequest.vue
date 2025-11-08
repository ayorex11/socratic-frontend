<template>
  <div class="password-reset-container">
    <div class="password-reset-card">
      <div class="logo-section">
        <h1>Socratic</h1>
        <p>Reset your password</p>
      </div>

      <form @submit.prevent="handleResetRequest" class="reset-form">
        <div class="input-group">
          <label>Email Address</label>
          <input v-model="email" type="email" placeholder="Enter your email address" required />
          <p class="help-text">
            Enter the email address associated with your account. We'll send you a link to reset
            your password.
          </p>
        </div>

        <button type="submit" :disabled="loading" class="reset-btn">
          {{ loading ? 'Sending Reset Link...' : 'Send Reset Link' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
          <p class="success-help">
            Check your email for the reset link. If you don't see it, check your spam folder.
          </p>
        </div>

        <div class="back-to-login">
          <router-link to="/login">← Back to Login</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleResetRequest = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await fetch(
      'https://socratic-f2kh.onrender.com/resetpassword/password/reset/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
        }),
      },
    )

    const data = await response.json()

    if (response.ok) {
      success.value = data.detail || 'Password reset email has been sent!'
      email.value = ''
    } else {
      error.value =
        data.email?.[0] || data.detail || 'Failed to send reset email. Please try again.'
    }
  } catch (error) {
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.password-reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.password-reset-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
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

.help-text {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-top: 8px;
  line-height: 1.4;
}

.reset-btn {
  width: 100%;
  padding: 14px;
  background: #e67e22;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.reset-btn:hover:not(:disabled) {
  background: #d35400;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
}

.reset-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

.success-message {
  margin-top: 16px;
  padding: 12px;
  background: #e8f6ef;
  color: #27ae60;
  border: 1px solid #a3e4d7;
  border-radius: 6px;
  text-align: center;
  font-size: 0.9rem;
}

.success-help {
  font-size: 0.85rem;
  margin-top: 8px;
  color: #27ae60;
  opacity: 0.8;
}

.back-to-login {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.back-to-login a {
  color: #27ae60;
  text-decoration: none;
  font-weight: 500;
}

.back-to-login a:hover {
  text-decoration: underline;
}
</style>
