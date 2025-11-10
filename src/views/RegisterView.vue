<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// 1. Form state
const form = ref({
  username: '',
  email: '',
  password: '',
  password2: '' // Confirmation field
})

// 2. Local error state
const localError = ref(null)

// 3. Handle submission
const handleSubmit = async () => {
  localError.value = null

  if (form.value.password !== form.value.password2) {
    localError.value = "Passwords do not match."
    return
  }

  try {
    // Call the store action
    await authStore.register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password
    })

    // On success, navigate to the dashboard/home page
    router.push({ name: 'home' })

  } catch (error) {
    // Error is set in the store and caught here.
    // The store provides a detailed error message.
    localError.value = authStore.error || 'An unexpected registration error occurred.'
    console.error('Registration API Error:', error)
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="card-title">Create Your Study Account</h2>
      <p class="card-subtitle">Unlock personalized study materials and quizzes.</p>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            type="text"
            v-model="form.username"
            required
            :disabled="authStore.loading"
          >
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            type="email"
            v-model="form.email"
            required
            :disabled="authStore.loading"
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            required
            :disabled="authStore.loading"
          >
        </div>

        <div class="form-group">
          <label for="password2">Confirm Password</label>
          <input
            id="password2"
            type="password"
            v-model="form.password2"
            required
            :disabled="authStore.loading"
          >
        </div>

        <p v-if="localError" class="error-message">{{ localError }}</p>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="submit-button"
        >
          {{ authStore.loading ? 'Registering...' : 'Sign Up' }}
        </button>
      </form>

      <div class="login-link">
        Already have an account? <RouterLink to="/login">Sign In</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Basic styling for Edutech aesthetic */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f7f9; /* Light, educational background */
  padding: 20px;
  -webkit-overflow-scrolling: touch;
}

.register-card {
  width: 100%;
  max-width: 450px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card-title {
  font-size: 1.8rem;
  color: #007bff; /* Primary Edutech color */
  margin-bottom: 5px;
}

.card-subtitle {
  color: #6c757d;
  margin-bottom: 25px;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.3s;
  font-size: 16px; /* Prevent zoom on iOS */
  min-height: 48px; /* Better touch target */
}

.form-group input:focus {
  border-color: #007bff;
  outline: none;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #28a745; /* Success/Action green */
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
  min-height: 50px; /* Better touch target */
  font-size: 16px; /* Prevent zoom on iOS */
}

.submit-button:hover:not(:disabled) {
  background-color: #218838;
}

.submit-button:disabled {
  background-color: #a2c8ae;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
  background-color: #f8d7da;
  text-align: left;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.login-link {
  margin-top: 20px;
  color: #6c757d;
}

.login-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .register-container {
    padding: 15px;
    align-items: flex-start;
    min-height: calc(100vh - 30px);
  }

  .register-card {
    padding: 30px 25px;
    margin-top: 20px;
    max-width: 100%;
  }

  .card-title {
    font-size: 1.6rem;
    margin-bottom: 8px;
  }

  .card-subtitle {
    font-size: 0.95rem;
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group input {
    padding: 14px 12px;
    min-height: 52px;
  }

  .submit-button {
    padding: 14px;
    min-height: 54px;
    font-size: 1.05rem;
  }

  .error-message {
    padding: 12px;
    font-size: 0.85rem;
    margin-bottom: 12px;
  }

  .login-link {
    margin-top: 15px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 10px;
  }

  .register-card {
    padding: 25px 20px;
    margin-top: 10px;
    border-radius: 10px;
  }

  .card-title {
    font-size: 1.4rem;
  }

  .card-subtitle {
    font-size: 0.9rem;
    margin-bottom: 18px;
  }

  .form-group {
    margin-bottom: 14px;
  }

  .form-group label {
    font-size: 0.95rem;
  }

  .form-group input {
    padding: 12px;
    min-height: 48px;
    font-size: 15px;
  }

  .submit-button {
    padding: 12px;
    min-height: 50px;
    font-size: 1rem;
  }

  .error-message {
    padding: 10px;
    font-size: 0.8rem;
  }

  .login-link {
    font-size: 0.9rem;
  }
}

/* Small phone optimizations */
@media (max-width: 380px) {
  .register-card {
    padding: 20px 15px;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .card-subtitle {
    font-size: 0.85rem;
  }

  .form-group input {
    padding: 10px;
    min-height: 46px;
  }

  .submit-button {
    padding: 10px;
    min-height: 48px;
    font-size: 0.95rem;
  }
}

/* Safe area insets for notched phones */
@supports (padding: max(0px)) {
  .register-container {
    padding-left: max(10px, env(safe-area-inset-left));
    padding-right: max(10px, env(safe-area-inset-right));
    padding-top: max(10px, env(safe-area-inset-top));
    padding-bottom: max(10px, env(safe-area-inset-bottom));
  }
}

/* Improved touch feedback for mobile */
@media (max-width: 768px) {
  .submit-button:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  .form-group input:active {
    border-color: #007bff;
  }
}

/* Prevent horizontal scrolling */
@media (max-width: 768px) {
  .register-container {
    overflow-x: hidden;
  }

  .register-card {
    width: calc(100% - 20px);
  }
}

/* Keyboard avoidance for mobile */
@media (max-width: 768px) {
  .register-container {
    align-items: flex-start;
    padding-top: 40px;
  }
}
</style>
