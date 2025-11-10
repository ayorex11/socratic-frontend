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
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email address"
            required
            :disabled="loading"
          />
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
  padding: clamp(12px, 4vw, 20px);
}

.password-reset-card {
  background: white;
  padding: clamp(24px, 5vw, 40px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: min(450px, 92vw);
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

.input-group {
  margin-bottom: clamp(20px, 4vw, 30px);
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

.help-text {
  font-size: clamp(0.8rem, 2.5vw, 0.85rem);
  color: #7f8c8d;
  margin-top: clamp(6px, 1.5vw, 8px);
  line-height: 1.4;
}

.reset-btn {
  width: 100%;
  padding: clamp(12px, 3vw, 14px);
  background: #e67e22;
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

.reset-btn:hover:not(:disabled) {
  background: #d35400;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
}

.reset-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

.success-message {
  margin-top: clamp(12px, 3vw, 16px);
  padding: clamp(12px, 3vw, 16px);
  background: #e8f6ef;
  color: #27ae60;
  border: 1px solid #a3e4d7;
  border-radius: 6px;
  text-align: center;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  line-height: 1.4;
}

.success-help {
  font-size: clamp(0.8rem, 2.5vw, 0.85rem);
  margin-top: clamp(6px, 1.5vw, 8px);
  color: #27ae60;
  opacity: 0.8;
  line-height: 1.4;
}

.back-to-login {
  text-align: center;
  margin-top: clamp(16px, 3vw, 20px);
  padding-top: clamp(16px, 3vw, 20px);
  border-top: 1px solid #ecf0f1;
}

.back-to-login a {
  color: #27ae60;
  text-decoration: none;
  font-weight: 500;
  font-size: clamp(0.9rem, 3vw, 1rem);
  padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
  border-radius: 6px;
  transition: all 0.3s ease;
  display: inline-block;
  min-height: 44px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-to-login a:hover {
  text-decoration: none;
  background-color: #f8f9fa;
  transform: translateY(-1px);
}

/* Mobile-specific optimizations */
@media (max-width: 480px) {
  .password-reset-container {
    padding: 8px;
    align-items: flex-start;
    padding-top: 10vh;
  }

  .password-reset-card {
    padding: 20px 16px;
    border-radius: 10px;
  }

  .help-text {
    font-size: 0.8rem;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) {
  .password-reset-container {
    padding: 24px;
  }

  .password-reset-card {
    padding: 32px;
  }
}

/* Large desktop enhancements */
@media (min-width: 1200px) {
  .password-reset-card {
    padding: 48px;
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  input,
  .reset-btn,
  .back-to-login a {
    transition: none;
  }

  .reset-btn:hover:not(:disabled),
  .back-to-login a:hover {
    transform: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .password-reset-card {
    background: #1a1a1a;
    color: #ffffff;
  }

  .logo-section p,
  .help-text {
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

  input:disabled {
    background: #3d3d3d;
  }

  .back-to-login a:hover {
    background-color: #2d2d2d;
  }

  .error-message {
    background: #442222;
    border-color: #663333;
    color: #ff6b6b;
  }

  .success-message {
    background: #224422;
    border-color: #336633;
    color: #6bff6b;
  }

  .success-help {
    color: #6bff6b;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .password-reset-card {
    border: 2px solid #000;
  }

  input {
    border-width: 2px;
  }

  .reset-btn,
  .back-to-login a {
    border: 1px solid #000;
  }

  .error-message,
  .success-message {
    border-width: 2px;
  }
}
</style>
