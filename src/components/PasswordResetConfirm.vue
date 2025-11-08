<template>
  <div class="password-reset-confirm-container">
    <div class="password-reset-confirm-card">
      <div class="logo-section">
        <h1>Socratic</h1>
        <p>Set new password</p>
      </div>

      <form @submit.prevent="handleResetConfirm" class="reset-confirm-form">
        <div class="input-group">
          <label>New Password</label>
          <div class="password-input-container">
            <input
              v-model="passwordForm.new_password1"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="Enter new password"
              required
              class="password-input"
            />
            <button type="button" @click="toggleNewPasswordVisibility" class="password-toggle">
              <span v-if="showNewPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>

        <div class="input-group">
          <label>Confirm New Password</label>
          <div class="password-input-container">
            <input
              v-model="passwordForm.new_password2"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm new password"
              required
              class="password-input"
            />
            <button type="button" @click="toggleConfirmPasswordVisibility" class="password-toggle">
              <span v-if="showConfirmPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>

        <button type="submit" :disabled="loading" class="confirm-btn">
          {{ loading ? 'Resetting Password...' : 'Reset Password' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
          <p class="success-help">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <router-link to="/login" class="login-link">Go to Login</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const passwordForm = ref({
  new_password1: '',
  new_password2: '',
})
const loading = ref(false)
const error = ref('')
const success = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Extract uid and token from URL parameters
const uid = ref('')
const token = ref('')

onMounted(() => {
  // Get uid and token from route parameters
  uid.value = route.params.uid
  token.value = route.params.token

  if (!uid.value || !token.value) {
    error.value = 'Invalid reset link. Please request a new password reset.'
  }
})

const handleResetConfirm = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  // Validation
  if (passwordForm.value.new_password1 !== passwordForm.value.new_password2) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  if (passwordForm.value.new_password1.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    loading.value = false
    return
  }

  try {
    const response = await fetch(
      'https://socratic-f2kh.onrender.com/resetpassword/password/reset/confirm/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_password1: passwordForm.value.new_password1,
          new_password2: passwordForm.value.new_password2,
          uid: uid.value,
          token: token.value,
        }),
      },
    )

    const data = await response.json()

    if (response.ok) {
      success.value = data.detail || 'Password has been reset successfully!'
      passwordForm.value.new_password1 = ''
      passwordForm.value.new_password2 = ''
    } else {
      // Handle validation errors
      if (data.new_password2) {
        error.value = data.new_password2.join(' ')
      } else if (data.new_password1) {
        error.value = data.new_password1.join(' ')
      } else if (data.token) {
        error.value = 'Invalid or expired reset token. Please request a new password reset.'
      } else if (data.detail) {
        error.value = data.detail
      } else {
        error.value = 'Failed to reset password. Please try again.'
      }
    }
  } catch (error) {
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}

const toggleNewPasswordVisibility = () => {
  showNewPassword.value = !showNewPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}
</script>

<style scoped>
.password-reset-confirm-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.password-reset-confirm-card {
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

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  width: 100%;
  padding: 12px 45px 12px 16px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.password-input:focus {
  outline: none;
  border-color: #27ae60;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
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

.password-toggle:hover {
  background-color: #f8f9fa;
}

.confirm-btn {
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

.confirm-btn:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.confirm-btn:disabled {
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

.login-link {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 16px;
  background: #27ae60;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.login-link:hover {
  background: #219a52;
}
</style>
