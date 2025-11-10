<template>
  <div class="user-profile">
    <div class="profile-container">
      <div class="profile-header">
        <h1>User Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div class="profile-sections">
        <!-- Profile Information Section -->
        <div class="profile-card">
          <h2>Profile Information</h2>
          <div class="profile-info">
            <div class="info-group">
              <label>Username</label>
              <div class="info-value">{{ userData.username }}</div>
            </div>

            <div class="info-group">
              <label>Email</label>
              <div class="info-value">{{ userData.email }}</div>
            </div>

            <div class="info-group">
              <label>First Name</label>
              <div class="info-value">{{ userData.first_name || 'Not set' }}</div>
            </div>

            <div class="info-group">
              <label>Last Name</label>
              <div class="info-value">{{ userData.last_name || 'Not set' }}</div>
            </div>

            <div class="info-group">
              <label>Account Type</label>
              <div class="info-value">
                <span :class="['premium-badge', userData.premium_user ? 'premium' : 'free']">
                  {{ userData.premium_user ? 'Premium' : 'Free' }}
                </span>
              </div>
            </div>

            <div class="info-group" v-if="userData.subscription_end_date">
              <label>Subscription End Date</label>
              <div class="info-value">{{ formatDate(userData.subscription_end_date) }}</div>
            </div>
          </div>
        </div>

        <!-- Password Change Section -->
        <div class="profile-card">
          <h2>Change Password</h2>
          <form @submit.prevent="handlePasswordChange" class="password-form">
            <div class="input-group">
              <label for="new_password1">New Password</label>
              <div class="password-input-container">
                <input
                  id="new_password1"
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
              <label for="new_password2">Confirm New Password</label>
              <div class="password-input-container">
                <input
                  id="new_password2"
                  v-model="passwordForm.new_password2"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm new password"
                  required
                  class="password-input"
                />
                <button
                  type="button"
                  @click="toggleConfirmPasswordVisibility"
                  class="password-toggle"
                >
                  <span v-if="showConfirmPassword">👁️</span>
                  <span v-else>👁️‍🗨️</span>
                </button>
              </div>
            </div>

            <div v-if="passwordError" class="error-message">
              {{ passwordError }}
            </div>

            <div v-if="passwordSuccess" class="success-message">
              {{ passwordSuccess }}
            </div>

            <button type="submit" :disabled="changingPassword" class="change-password-btn">
              {{ changingPassword ? 'Changing Password...' : 'Change Password' }}
            </button>
          </form>
        </div>
      </div>

      <div class="profile-actions">
        <button @click="goToDashboard" class="action-btn secondary">Back to Dashboard</button>
        <button @click="goToPricing" class="action-btn primary" v-if="!userData.premium_user">
          Upgrade to Premium
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const userData = ref({})
const loading = ref(true)

// Password change state
const passwordForm = ref({
  new_password1: '',
  new_password2: '',
})
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const fetchUserData = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken')
    const response = await fetch('https://socratic-f2kh.onrender.com/auth/user/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      userData.value = await response.json()
    } else {
      console.error('Failed to fetch user data')
      // Fallback to stored user data
      userData.value = authStore.user || {}
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    // Fallback to stored user data
    userData.value = authStore.user || {}
  } finally {
    loading.value = false
  }
}

const handlePasswordChange = async () => {
  changingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  // Validation
  if (passwordForm.value.new_password1 !== passwordForm.value.new_password2) {
    passwordError.value = 'Passwords do not match'
    changingPassword.value = false
    return
  }

  if (passwordForm.value.new_password1.length < 8) {
    passwordError.value = 'Password must be at least 8 characters long'
    changingPassword.value = false
    return
  }

  try {
    const accessToken = localStorage.getItem('accessToken')
    const response = await fetch('https://socratic-f2kh.onrender.com/auth/password/change/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_password1: passwordForm.value.new_password1,
        new_password2: passwordForm.value.new_password2,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      passwordSuccess.value = data.detail || 'Password changed successfully!'
      passwordForm.value.new_password1 = ''
      passwordForm.value.new_password2 = ''

      // Logout user after 2 seconds so they can verify legitimacy
      setTimeout(() => {
        authStore.logout()
        router.push('/login')
      }, 2000)
    } else {
      // Handle password validation errors from Django
      if (data.new_password2) {
        passwordError.value = data.new_password2.join(' ')
      } else if (data.new_password1) {
        passwordError.value = data.new_password1.join(' ')
      } else if (data.detail) {
        passwordError.value = data.detail
      } else {
        passwordError.value = 'Failed to change password. Please try again.'
      }
    }
  } catch (error) {
    console.error('Error changing password:', error)
    passwordError.value = 'Network error. Please try again.'
  } finally {
    changingPassword.value = false
  }
}

const toggleNewPasswordVisibility = () => {
  showNewPassword.value = !showNewPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToPricing = () => {
  router.push('/pricing')
}

onMounted(() => {
  fetchUserData()
})
</script>

<style scoped>
.user-profile {
  padding: 40px 20px;
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  -webkit-overflow-scrolling: touch;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.profile-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.profile-header p {
  font-size: 1.1rem;
  color: #5a6c7d;
}

.profile-sections {
  display: grid;
  gap: 30px;
  margin-bottom: 40px;
}

.profile-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.profile-card h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ecf0f1;
}

.profile-info {
  margin-bottom: 0;
}

.info-group {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.info-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.info-group label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.1rem;
  color: #5a6c7d;
}

.premium-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.premium-badge.premium {
  background: #27ae60;
  color: white;
}

.premium-badge.free {
  background: #bdc3c7;
  color: #2c3e50;
}

/* Password Form Styles */
.password-form {
  max-width: 400px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  min-height: 48px;
  font-size: 16px; /* Prevent zoom on iOS */
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
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 40px;
}

.password-toggle:hover {
  background-color: #f8f9fa;
}

.change-password-btn {
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
  min-height: 50px;
  font-size: 16px; /* Prevent zoom on iOS */
}

.change-password-btn:hover:not(:disabled) {
  background: #d35400;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
}

.change-password-btn:disabled {
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
  word-wrap: break-word;
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
  word-wrap: break-word;
}

.profile-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  min-height: 48px;
  font-size: 16px; /* Prevent zoom on iOS */
}

.action-btn.primary {
  background: #27ae60;
  color: white;
}

.action-btn.primary:hover {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.action-btn.secondary {
  background: transparent;
  color: #5a6c7d;
  border: 2px solid #ecf0f1;
}

.action-btn.secondary:hover {
  border-color: #27ae60;
  color: #27ae60;
  transform: translateY(-2px);
}

/* Enhanced Mobile Responsiveness */
@media (max-width: 768px) {
  .user-profile {
    padding: 20px 15px;
    min-height: calc(100vh - 40px);
  }

  .profile-header {
    margin-bottom: 30px;
  }

  .profile-header h1 {
    font-size: 2rem;
  }

  .profile-header p {
    font-size: 1rem;
  }

  .profile-card {
    padding: 25px 20px;
    border-radius: 10px;
  }

  .profile-card h2 {
    font-size: 1.3rem;
    margin-bottom: 20px;
    padding-bottom: 12px;
  }

  .profile-info {
    margin-bottom: 0;
  }

  .info-group {
    margin-bottom: 20px;
    padding-bottom: 12px;
  }

  .info-group label {
    font-size: 0.85rem;
    margin-bottom: 6px;
  }

  .info-value {
    font-size: 1rem;
  }

  .premium-badge {
    font-size: 0.85rem;
    padding: 5px 10px;
  }

  .password-form {
    max-width: 100%;
  }

  .input-group {
    margin-bottom: 16px;
  }

  .password-input {
    padding: 14px 45px 14px 14px;
    min-height: 52px;
  }

  .password-toggle {
    padding: 10px;
    min-height: 44px;
    min-width: 44px;
  }

  .change-password-btn {
    padding: 16px;
    min-height: 54px;
    font-size: 1.05rem;
  }

  .error-message,
  .success-message {
    padding: 14px;
    font-size: 0.85rem;
    margin-top: 12px;
  }

  .profile-actions {
    flex-direction: column;
    gap: 12px;
  }

  .action-btn {
    width: 100%;
    padding: 14px;
    min-height: 52px;
  }

  .profile-sections {
    gap: 20px;
    margin-bottom: 30px;
  }
}

@media (max-width: 480px) {
  .user-profile {
    padding: 15px 10px;
  }

  .profile-header h1 {
    font-size: 1.8rem;
  }

  .profile-header p {
    font-size: 0.95rem;
  }

  .profile-card {
    padding: 20px 15px;
  }

  .profile-card h2 {
    font-size: 1.2rem;
  }

  .info-group label {
    font-size: 0.8rem;
  }

  .info-value {
    font-size: 0.95rem;
  }

  .password-input {
    padding: 12px 40px 12px 12px;
    min-height: 48px;
    font-size: 15px;
  }

  .password-toggle {
    padding: 8px;
    min-height: 40px;
    min-width: 40px;
  }

  .change-password-btn {
    padding: 14px;
    min-height: 50px;
    font-size: 1rem;
  }

  .action-btn {
    padding: 12px;
    min-height: 48px;
    font-size: 15px;
  }
}

/* Small phone optimizations */
@media (max-width: 380px) {
  .profile-card {
    padding: 18px 12px;
  }

  .profile-header h1 {
    font-size: 1.6rem;
  }

  .info-group {
    margin-bottom: 16px;
    padding-bottom: 10px;
  }

  .password-input {
    padding: 10px 38px 10px 10px;
    min-height: 46px;
  }
}

/* Safe area insets for notched phones */
@supports (padding: max(0px)) {
  .user-profile {
    padding-left: max(15px, env(safe-area-inset-left));
    padding-right: max(15px, env(safe-area-inset-right));
    padding-top: max(20px, env(safe-area-inset-top));
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
}

/* Improved touch feedback for mobile */
@media (max-width: 768px) {
  .change-password-btn:active,
  .action-btn:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  .password-toggle:active {
    background-color: #e9ecef;
  }
}

/* Prevent horizontal scrolling */
@media (max-width: 768px) {
  .user-profile {
    overflow-x: hidden;
  }

  .profile-container {
    width: calc(100% - 20px);
  }
}

/* Better focus states for mobile */
@media (max-width: 768px) {
  .password-input:focus {
    border-color: #27ae60;
    box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.2);
  }

  .action-btn:focus {
    outline: 2px solid #27ae60;
    outline-offset: 2px;
  }
}
</style>
