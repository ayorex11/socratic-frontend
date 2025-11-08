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
            />
          </div>

          <div class="input-group">
            <label>Last Name</label>
            <input
              v-model="form.last_name"
              type="text"
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>

        <div class="input-group">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="Enter your email" required />
        </div>

        <div class="input-group">
          <label>Username</label>
          <input v-model="form.username" type="text" placeholder="Choose a username" required />
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
            />
            <button type="button" @click="togglePasswordVisibility" class="password-toggle">
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
        router.push(`/verify-email-prompt?email=${encodeURIComponent(form.value.email)}`)
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
  padding: 20px;
}

.register-card {
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

.name-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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

.password-toggle:hover {
  background-color: #f8f9fa;
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.register-btn:disabled {
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

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #7f8c8d;
}

.login-link a {
  color: #27ae60;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .name-fields {
    grid-template-columns: 1fr;
  }

  .register-card {
    padding: 30px 20px;
  }
}
</style>
