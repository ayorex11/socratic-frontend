<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo-section">
        <h1>Socratic</h1>
        <p>Create your account</p>
      </div>

      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="name-fields">
          <div class="input-group">
            <label>First Name</label>
            <input
              v-model="form.first_name"
              type="text"
              placeholder="Enter your first name"
              required
              :disabled="loading"
            />
          </div>

          <div class="input-group">
            <label>Last Name</label>
            <input
              v-model="form.last_name"
              type="text"
              placeholder="Enter your last name"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div class="input-group">
          <label>Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            required
            :disabled="loading"
          />
        </div>

        <div class="input-group">
          <label>Username</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="Choose a username"
            required
            :disabled="loading"
          />
        </div>

        <div class="input-group">
          <label>Password</label>
          <div class="password-input-container">
            <input
              v-model="form.password1"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Create a password"
              required
              class="password-input"
              :disabled="loading"
            />
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

        <div class="input-group">
          <label>Confirm Password</label>
          <input
            v-model="form.password2"
            type="password"
            placeholder="Confirm your password"
            required
            :disabled="loading"
          />
        </div>

        <button type="submit" :disabled="loading" class="register-btn">
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>

        <div class="login-link">
          Already have an account? <router-link to="/login">Sign in</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  password1: '',
  password2: '',
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  // Basic validation
  if (form.value.password1 !== form.value.password2) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  if (form.value.password1.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    loading.value = false
    return
  }

  try {
    const response = await fetch('https://socratic-f2kh.onrender.com/registration/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.value),
    })

    const data = await response.json()

    if (response.ok) {
      success.value = 'Registration successful! Please check your email to verify your account.'

      // Store email for verification prompt
      const userEmail = form.value.email

      // Clear form
      form.value = {
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password1: '',
        password2: '',
      }

      // Redirect to verification prompt after a short delay
      setTimeout(() => {
        router.push(`/verify-email-prompt?email=${encodeURIComponent(userEmail)}`)
      }, 2000)
    } else {
      // Handle registration errors
      if (data.username) {
        error.value = `Username: ${data.username[0]}`
      } else if (data.email) {
        error.value = `Email: ${data.email[0]}`
      } else if (data.password1) {
        error.value = `Password: ${data.password1[0]}`
      } else if (data.non_field_errors) {
        error.value = data.non_field_errors[0]
      } else {
        error.value = data.detail || 'Registration failed. Please try again.'
      }
    }
  } catch (err) {
    error.value = 'Network error. Please try again.'
    console.error('Registration error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: clamp(12px, 4vw, 20px);
}

.register-card {
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

.name-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(12px, 3vw, 15px);
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

.register-btn {
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

.register-btn:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.register-btn:disabled {
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

.login-link {
  text-align: center;
  margin-top: clamp(16px, 3vw, 20px);
  color: #7f8c8d;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  line-height: 1.4;
}

.login-link a {
  color: #27ae60;
  text-decoration: none;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.login-link a:hover {
  text-decoration: none;
  background-color: #f8f9fa;
}

/* Mobile-specific optimizations */
@media (max-width: 480px) {
  .register-container {
    padding: 8px;
    align-items: flex-start;
    padding-top: 5vh;
  }

  .register-card {
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
  .register-container {
    padding: 24px;
  }

  .register-card {
    padding: 32px;
  }

  .name-fields {
    grid-template-columns: 1fr 1fr;
    gap: clamp(12px, 3vw, 15px);
  }
}

/* Large desktop enhancements */
@media (min-width: 1200px) {
  .register-card {
    padding: 48px;
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  input,
  .register-btn,
  .password-toggle,
  .login-link a {
    transition: none;
  }

  .register-btn:hover:not(:disabled) {
    transform: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .register-card {
    background: #1a1a1a;
    color: #ffffff;
  }

  .logo-section p,
  .login-link {
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

  .password-toggle:hover:not(:disabled) {
    background-color: #2d2d2d;
  }

  .login-link a:hover {
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
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .register-card {
    border: 2px solid #000;
  }

  input {
    border-width: 2px;
  }

  .register-btn {
    border: 2px solid #000;
  }
}
</style>
