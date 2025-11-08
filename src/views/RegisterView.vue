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
</style>
