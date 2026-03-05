<template>
  <div class="pricing">
    <div class="container">
      <!-- Location Indicator -->
      <div class="location-indicator" v-if="!locationStore.isLoading">
        <span class="location-badge">
          🌍 Detected: {{ locationStore.isNigeria ? 'Nigeria' : 'International' }} ({{
            locationStore.isNigeria ? '₦' : '$'
          }})
        </span>
        <button @click="toggleLocation" class="location-toggle">
          Switch to {{ locationStore.isNigeria ? 'International' : 'Nigeria' }}
        </button>
      </div>

      <div class="pricing-header">
        <h1>Simple, Transparent Pricing</h1>
        <p>Choose the plan that works best for your learning journey</p>
      </div>

      <div v-if="locationStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Detecting your location...</p>
      </div>

      <div v-else class="pricing-grid">
        <!-- Free Plan -->
        <div class="pricing-card">
          <div class="plan-badge">Free</div>
          <div class="plan-header">
            <h3>Starter</h3>
            <div class="price">{{ locationStore.isNigeria ? '₦0' : '$0' }}<span>/month</span></div>
          </div>
          <ul class="features-list">
            <li>✓ Audio Generation</li>
            <li>✓ Summary Generation</li>
            <li>✓ <strong>10+ questions</strong> per summary & quiz</li>
            <li>✓ <strong>3 generations</strong></li>
            <li>✓ Community support</li>
          </ul>
          <button
            v-if="isLoggedIn"
            @click="handleFreePlan"
            class="plan-button secondary"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing">Processing...</span>
            <span v-else>Continue with Free Plan</span>
          </button>
          <router-link v-else to="/register" class="plan-button secondary">
            Get Started Free
          </router-link>
        </div>

        <!-- Pay As You Use Plan -->
        <div class="pricing-card">
          <div class="plan-badge" style="background-color: #9b59b6">Pay As You Use</div>
          <div class="plan-header">
            <h3>Single Gen</h3>
            <div class="price">
              {{ locationStore.isNigeria ? '₦500' : '$1' }}<span>/credit</span>
            </div>
            <div v-if="!locationStore.isNigeria" class="coming-soon-badge">Coming Soon</div>
          </div>
          <ul class="features-list">
            <li>✓ Audio Generation</li>
            <li>✓ Premium AI Models</li>
            <li>✓ <strong>Flashcards Generation</strong></li>
            <li>✓ Export capabilities</li>
            <li>✓ Unlocked forever for specific doc</li>
            <li>✓ Top quality output</li>
          </ul>
          <button
            v-if="isLoggedIn && locationStore.isNigeria"
            @click="handlePayUPlan"
            class="plan-button"
            style="background-color: #9b59b6; color: white"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing">Processing...</span>
            <span v-else>Buy 1 Credit</span>
          </button>
          <router-link
            v-else-if="!isLoggedIn && locationStore.isNigeria"
            to="/register?plan=payu"
            class="plan-button"
            style="background-color: #9b59b6; color: white"
          >
            Buy 1 Credit
          </router-link>
          <button v-else class="plan-button disabled" disabled>Coming Soon</button>
        </div>

        <!-- Student Plan -->
        <div class="pricing-card student-card">
          <div class="plan-badge student-badge">Student Discount</div>
          <div class="plan-header">
            <h3>Student</h3>
            <div class="price">
              {{ locationStore.isNigeria ? '₦3,000' : '$4' }}<span>/month</span>
            </div>
            <div v-if="!locationStore.isNigeria" class="coming-soon-badge">Coming Soon</div>
            <div v-else class="student-requirement">📚 Requires student email</div>
          </div>
          <ul class="features-list">
            <li>✓ Audio Generation</li>
            <li>✓ Summary Generation</li>
            <li>✓ <strong>Flashcards Generation</strong></li>
            <li>✓ <strong>20+ questions</strong> per summary & quiz</li>
            <li>✓ <strong>Unlimited generations</strong> at a time</li>
            <li>✓ No need to delete - generate freely</li>
            <li>✓ Priority support</li>
            <li>✓ Export capabilities</li>
            <li>✓ Community support</li>
          </ul>
          <button
            v-if="isLoggedIn && locationStore.isNigeria"
            @click="handleStudentPlan"
            class="plan-button student"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing">Processing...</span>
            <span v-else>Get Student Plan</span>
          </button>
          <router-link
            v-else-if="!isLoggedIn && locationStore.isNigeria"
            to="/register?plan=student-ng"
            class="plan-button student"
          >
            Get Student Plan
          </router-link>
          <button v-else class="plan-button student disabled" disabled>Coming Soon</button>
        </div>

        <!-- Premium Plan -->
        <div class="pricing-card featured">
          <div class="plan-badge featured-badge">Most Popular</div>
          <div class="plan-header">
            <h3>Premium</h3>
            <div class="price">
              {{ locationStore.isNigeria ? '₦7,500' : '$9' }}<span>/month</span>
            </div>
            <div v-if="!locationStore.isNigeria" class="coming-soon-badge">Coming Soon</div>
          </div>
          <ul class="features-list">
            <li>✓ Audio Generation</li>
            <li>✓ Summary Generation</li>
            <li>✓ <strong>Flashcards Generation</strong></li>
            <li>✓ <strong>20+ questions</strong> per summary & quiz</li>
            <li>✓ <strong>Unlimited generations</strong> at a time</li>
            <li>✓ No need to delete - generate freely</li>
            <li>✓ Priority support</li>
            <li>✓ Export capabilities</li>
            <li>✓ Community support</li>
          </ul>
          <button
            v-if="isLoggedIn && locationStore.isNigeria"
            @click="handlePremiumPlan"
            class="plan-button primary"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing">Processing...</span>
            <span v-else>Get Premium</span>
          </button>
          <router-link
            v-else-if="!isLoggedIn && locationStore.isNigeria"
            to="/register?plan=premium-ng"
            class="plan-button primary"
          >
            Get Premium
          </router-link>
          <button v-else class="plan-button primary disabled" disabled>Coming Soon</button>
        </div>
      </div>

      <!-- Feature Comparison Table -->
      <div v-if="!locationStore.isLoading" class="feature-comparison">
        <h3>Plan Comparison</h3>
        <div class="comparison-table-mobile">
          <div class="comparison-card">
            <div class="comparison-card-header">Starter Plan</div>
            <div class="comparison-item">
              <span class="feature-label">Audio Generation</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Summary Generation</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Flashcards Generation</span>
              <span class="feature-value">-</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Questions per Summary</span>
              <span class="feature-value">5</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Simultaneous Generations</span>
              <span class="feature-value">3</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Priority Support</span>
              <span class="feature-value">-</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Export Capabilities</span>
              <span class="feature-value">-</span>
            </div>
          </div>

          <div class="comparison-card" style="border-top: 4px solid #9b59b6">
            <div class="comparison-card-header">Single Gen (Pay As You Use)</div>
            <div class="comparison-item">
              <span class="feature-label">Audio Generation</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Summary Generation</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Flashcards Generation</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Questions per Summary</span>
              <span class="feature-value">20+</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Simultaneous Generations</span>
              <span class="feature-value">1 per credit</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Priority Support</span>
              <span class="feature-value">-</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Export Capabilities</span>
              <span class="feature-value">✓</span>
            </div>
          </div>

          <div class="comparison-card student-comparison-card">
            <div class="comparison-card-header">Student Plan</div>
            <div class="comparison-item">
              <span class="feature-label">Audio Generation</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Summary Generation</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Flashcards Generation</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Questions per Summary</span>
              <span class="feature-value">20+</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Simultaneous Generations</span>
              <span class="feature-value">Unlimited</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Priority Support</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Export Capabilities</span>
              <span class="feature-value">✓</span>
            </div>
          </div>

          <div class="comparison-card featured-card">
            <div class="comparison-card-header">Premium Plan</div>
            <div class="comparison-item">
              <span class="feature-label">Audio Generation</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Summary Generation</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Flashcards Generation</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Questions per Summary</span>
              <span class="feature-value">20+</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Simultaneous Generations</span>
              <span class="feature-value">Unlimited</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Priority Support</span>
              <span class="feature-value">✓</span>
            </div>
            <div class="comparison-item">
              <span class="feature-label">Export Capabilities</span>
              <span class="feature-value">✓</span>
            </div>
          </div>
        </div>

        <!-- Desktop Table (hidden on mobile) -->
        <div class="comparison-table-desktop">
          <div class="comparison-header">
            <div class="feature-name">Feature</div>
            <div class="plan-type">Starter</div>
            <div class="plan-type">Single Gen</div>
            <div class="plan-type">Student</div>
            <div class="plan-type">Premium</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Audio Generation</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Summary Generation</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Flashcards Generation</div>
            <div class="plan-feature">-</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Questions per Summary</div>
            <div class="plan-feature">5</div>
            <div class="plan-feature">20+</div>
            <div class="plan-feature">20+</div>
            <div class="plan-feature">20+</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Simultaneous Generations</div>
            <div class="plan-feature">3</div>
            <div class="plan-feature">1 / credit</div>
            <div class="plan-feature">Unlimited</div>
            <div class="plan-feature">Unlimited</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Priority Support</div>
            <div class="plan-feature">-</div>
            <div class="plan-feature">-</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Export Capabilities</div>
            <div class="plan-feature">-</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
          </div>
        </div>
      </div>

      <!-- Payment Methods Info -->
      <div v-if="!locationStore.isLoading" class="payment-methods-info">
        <h3>Available Payment Methods</h3>
        <div class="methods-grid">
          <div v-if="locationStore.isNigeria" class="methods-list">
            <span>📱 Paystack</span>
          </div>
          <div v-else class="methods-list">
            <span>📊 Stripe (Coming Soon)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocationStore } from '@/stores/locationStore'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { API_BASE } from '@/config'

const locationStore = useLocationStore()
const authStore = useAuthStore()
const router = useRouter()
const { showToast } = useToast()

const isProcessing = ref(false)

// Check if user is logged in
const isLoggedIn = computed(() => {
  return authStore.isAuthenticated
})

// Get user email safely
const getUserEmail = () => {
  if (!authStore.user) {
    console.error('No user found in auth store')
    return null
  }

  console.log('Full user object:', authStore.user)

  // Try different possible email fields
  const email = authStore.user.email || authStore.user.user_email || authStore.user.user_email

  if (!email) {
    console.error('No email found in user object. Available keys:', Object.keys(authStore.user))
  } else {
    console.log('Found email:', email)
  }

  return email
}

// Toggle location for testing
const toggleLocation = () => {
  locationStore.setManualLocation(locationStore.isNigeria ? 'US' : 'NG')
}

// Check if email is a student/educational email
const isStudentEmail = (email) => {
  if (!email || !email.includes('@')) {
    return false
  }

  const emailLower = email.toLowerCase()
  const domain = emailLower.split('@')[1]

  // Keywords that indicate educational institutions
  const studentKeywords = ['university', 'college', 'school', 'edu', 'ac', 'student']

  // Check if domain contains any student keywords
  return studentKeywords.some((keyword) => domain.includes(keyword))
}

// Handle free plan selection for logged-in users
const handleFreePlan = async () => {
  if (!isLoggedIn.value) {
    router.push('/register')
    return
  }

  isProcessing.value = true

  try {
    router.push('/dashboard')
  } catch (error) {
    console.error('Error handling free plan:', error)
  } finally {
    isProcessing.value = false
  }
}

// Handle student plan selection for logged-in users
const handleStudentPlan = async () => {
  if (!isLoggedIn.value) {
    router.push('/register?plan=student-ng')
    return
  }

  if (!locationStore.isNigeria) {
    return
  }

  isProcessing.value = true

  try {
    // Get user email safely
    const userEmail = getUserEmail()

    if (!userEmail) {
      showToast(
        'Unable to retrieve your email. Please ensure your account has a valid email address.',
        'error',
      )
      isProcessing.value = false
      return
    }

    // Validate student email
    if (!isStudentEmail(userEmail)) {
      showToast(
        'Student plan requires a student or educational email address. Your email must contain one of: university, college, school, edu, ac, or student.',
        'warning',
        6000,
      )
      isProcessing.value = false
      return
    }

    console.log('Initiating student plan payment for email:', userEmail)

    // Call your payment endpoint with authorization
    const response = await fetch(`${API_BASE}/payment/initialize_deposit/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 3000, // ₦3,000 for Student plan
        email: userEmail,
      }),
    })

    console.log('Payment response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Payment error response:', errorText)
      throw new Error(`Payment initialization failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Payment response data:', data)

    // Handle multiple possible response structures from Paystack
    const authUrl =
      data.data?.data?.authorization_url || data.data?.authorization_url || data.authorization_url

    if (authUrl) {
      // Redirect to Paystack payment page
      window.location.href = authUrl
    } else {
      console.error('Invalid payment response structure:', data)
      showToast(
        'Payment server did not return authorization URL. Please contact support if this persists.',
        'error',
        6000,
      )
    }
  } catch (error) {
    console.error('Payment error:', error)
    showToast(`Payment initialization failed: ${error.message}. Please try again.`, 'error')
  } finally {
    isProcessing.value = false
  }
}

// Handle Single Generation (PAYU) for logged-in users
const handlePayUPlan = async () => {
  if (!isLoggedIn.value) {
    router.push('/register?plan=payu')
    return
  }

  if (!locationStore.isNigeria) {
    return
  }

  isProcessing.value = true

  try {
    const userEmail = getUserEmail()

    if (!userEmail) {
      alert('Unable to retrieve your email. Please ensure your account has a valid email address.')
      return
    }

    console.log('Initiating PAYU payment for email:', userEmail)

    const response = await fetch(`${API_BASE}/payment/initialize_payu/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 500, // ₦500 for single generation
        email: userEmail,
      }),
    })

    console.log('Payment response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Payment error response:', errorText)
      throw new Error(`Payment initialization failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Payment response data:', data)

    const authUrl =
      data.data?.data?.authorization_url || data.data?.authorization_url || data.authorization_url

    if (authUrl) {
      window.location.href = authUrl
    } else {
      console.error('Invalid payment response structure:', data)
      showToast(
        'Payment server did not return authorization URL. Please contact support if this persists.',
        'error',
        6000,
      )
    }
  } catch (error) {
    console.error('Payment error:', error)
    showToast(`Payment initialization failed: ${error.message}. Please try again.`, 'error')
  } finally {
    isProcessing.value = false
  }
}

// Handle premium plan selection for logged-in users
const handlePremiumPlan = async () => {
  if (!isLoggedIn.value) {
    router.push('/register?plan=premium-ng')
    return
  }

  if (!locationStore.isNigeria) {
    return
  }

  isProcessing.value = true

  try {
    // Get user email safely
    const userEmail = getUserEmail()

    if (!userEmail) {
      alert('Unable to retrieve your email. Please ensure your account has a valid email address.')
      return
    }

    console.log('Initiating payment for email:', userEmail)

    // Call your payment endpoint with authorization
    const response = await fetch(`${API_BASE}/payment/initialize_deposit/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 7500, // ₦7,500 for Nigeria
        email: userEmail,
      }),
    })

    console.log('Payment response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Payment error response:', errorText)
      throw new Error(`Payment initialization failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Payment response data:', data)

    // Handle multiple possible response structures from Paystack
    const authUrl =
      data.data?.data?.authorization_url || data.data?.authorization_url || data.authorization_url

    if (authUrl) {
      // Redirect to Paystack payment page
      window.location.href = authUrl
    } else {
      console.error('Invalid payment response structure:', data)
      showToast(
        'Payment server did not return authorization URL. Please contact support if this persists.',
        'error',
        6000,
      )
    }
  } catch (error) {
    console.error('Payment error:', error)
    showToast(`Payment initialization failed: ${error.message}. Please try again.`, 'error')
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  locationStore.detectUserLocation()
  // Debug: log auth state
  console.log('Auth state on mount:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
  })
})
</script>

<style scoped>
/* Add disabled state styling */
.plan-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.plan-button:disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

/* Rest of the styles remain the same */
.pricing {
  padding: clamp(40px, 8vw, 80px) 0;
  background: #f8f9fa;
  min-height: calc(100vh - clamp(60px, 8vw, 70px));
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 20px);
}

.location-indicator {
  text-align: center;
  margin-bottom: clamp(20px, 4vw, 30px);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(10px, 2.5vw, 15px);
  flex-wrap: wrap;
}

.location-badge {
  background: #27ae60;
  color: white;
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px);
  border-radius: 20px;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  font-weight: 500;
  white-space: nowrap;
}

.location-toggle {
  background: transparent;
  color: #27ae60;
  border: 1px solid #27ae60;
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px);
  border-radius: 20px;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-height: 40px;
}

.location-toggle:hover {
  background: #27ae60;
  color: white;
}

.loading-state {
  text-align: center;
  padding: clamp(40px, 8vw, 60px) 0;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #27ae60;
  border-radius: 50%;
  width: clamp(32px, 8vw, 40px);
  height: clamp(32px, 8vw, 40px);
  animation: spin 1s linear infinite;
  margin: 0 auto clamp(16px, 3vw, 20px);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #5a6c7d;
  font-size: clamp(0.9rem, 3vw, 1rem);
}

.pricing-header {
  text-align: center;
  margin-bottom: clamp(40px, 6vw, 60px);
}

.pricing-header h1 {
  font-size: clamp(2rem, 6vw, 3rem);
  color: #2c3e50;
  margin-bottom: clamp(12px, 3vw, 20px);
  line-height: 1.2;
}

.pricing-header p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: #5a6c7d;
  line-height: 1.4;
  max-width: 600px;
  margin: 0 auto;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: clamp(20px, 4vw, 30px);
  max-width: 900px;
  margin: 0 auto;
}

.pricing-card {
  background: white;
  padding: clamp(24px, 5vw, 40px) clamp(20px, 4vw, 30px);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 520px;
}

.pricing-card:hover {
  transform: translateY(-5px);
}

.pricing-card.featured {
  border: 2px solid #27ae60;
  transform: scale(1.02);
}

.pricing-card.featured:hover {
  transform: scale(1.02) translateY(-5px);
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #95a5a6;
  color: white;
  padding: clamp(4px, 1vw, 6px) clamp(16px, 3vw, 20px);
  border-radius: 20px;
  font-size: clamp(0.7rem, 2.5vw, 0.8rem);
  font-weight: 600;
  white-space: nowrap;
}

.plan-badge.featured-badge {
  background: #e67e22;
}

.plan-badge.student-badge {
  background: #3498db;
}

.plan-header {
  margin-bottom: clamp(20px, 4vw, 30px);
  margin-top: 10px;
}

.plan-header h3 {
  font-size: clamp(1.3rem, 4vw, 1.5rem);
  color: #2c3e50;
  margin-bottom: clamp(12px, 2.5vw, 15px);
  line-height: 1.2;
}

.price {
  font-size: clamp(2.5rem, 6vw, 3rem);
  font-weight: bold;
  color: #27ae60;
  line-height: 1;
}

.price span {
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  color: #7f8c8d;
  font-weight: normal;
}

.coming-soon-badge {
  display: inline-block;
  background: #e67e22;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  margin-top: 8px;
  font-weight: 500;
}

.student-requirement {
  display: inline-block;
  background: #e8f4f8;
  color: #2980b9;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  margin-top: 8px;
  font-weight: 500;
  border: 1px solid #3498db;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: clamp(20px, 4vw, 30px) 0;
  text-align: left;
  flex-grow: 1;
}

.features-list li {
  padding: clamp(8px, 2vw, 10px) 0;
  color: #5a6c7d;
  border-bottom: 1px solid #ecf0f1;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  line-height: 1.4;
}

.features-list li:last-child {
  border-bottom: none;
}

.features-list li strong {
  color: #2c3e50;
}

.plan-button {
  display: inline-block;
  padding: clamp(12px, 3vw, 14px) clamp(20px, 4vw, 30px);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
  text-align: center;
  margin-top: auto;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.plan-button.primary {
  background: #27ae60;
  color: white;
}

.plan-button.primary:hover:not(.disabled):not(:disabled) {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(39, 174, 96, 0.3);
}

.plan-button.primary.disabled {
  background: #95a5a6;
  cursor: not-allowed;
  opacity: 0.7;
}

.plan-button.secondary {
  background: transparent;
  color: #27ae60;
  border: 2px solid #27ae60;
}

.plan-button.secondary:hover:not(:disabled) {
  background: #27ae60;
  color: white;
  transform: translateY(-2px);
}

.plan-button.student {
  background: #3498db;
  color: white;
}

.plan-button.student:hover:not(.disabled):not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.3);
}

.plan-button.student.disabled {
  background: #95a5a6;
  cursor: not-allowed;
  opacity: 0.7;
}

.pricing-card.student-card {
  border: 2px solid #3498db;
}

/* Feature Comparison Table */
.feature-comparison {
  margin-top: clamp(50px, 8vw, 80px);
  text-align: center;
}

.feature-comparison h3 {
  color: #2c3e50;
  margin-bottom: clamp(20px, 4vw, 30px);
  font-size: clamp(1.4rem, 4vw, 1.8rem);
  line-height: 1.2;
}

/* Mobile Comparison Cards */
.comparison-table-mobile {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.comparison-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.comparison-card.featured-card {
  border: 2px solid #27ae60;
}

.comparison-card.student-comparison-card {
  border: 2px solid #3498db;
}

.comparison-card-header {
  background: #34495e;
  color: white;
  padding: 16px;
  font-weight: 700;
  font-size: clamp(1.1rem, 3vw, 1.2rem);
  letter-spacing: 0.5px;
}

.comparison-card.featured-card .comparison-card-header {
  background: #27ae60;
}

.comparison-card.student-comparison-card .comparison-card-header {
  background: #3498db;
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.comparison-item:last-child {
  border-bottom: none;
}

.comparison-item:nth-child(even) {
  background: #f8f9fa;
}

.feature-label {
  font-weight: 600;
  color: #1e293b;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  text-align: left;
}

.feature-value {
  font-weight: 700;
  color: #10b981;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

/* Desktop Table - Hidden on mobile */
.comparison-table-desktop {
  display: none;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  margin: 0 auto;
}

.comparison-header {
  display: grid;
  grid-template-columns: 1.5fr repeat(4, 1fr);
  background: #34495e;
  color: white;
  font-weight: 700;
  padding: clamp(16px, 3vw, 20px);
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  letter-spacing: 0.5px;
}

.comparison-row {
  display: grid;
  grid-template-columns: 1.5fr repeat(4, 1fr);
  padding: clamp(16px, 3vw, 20px);
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.comparison-row:last-child {
  border-bottom: none;
}

.comparison-row:nth-child(even) {
  background: #f8f9fa;
}

.feature-name {
  text-align: left;
  font-weight: 600;
  color: #1e293b;
}

.plan-type {
  text-align: center;
  color: #ffffff;
}

.plan-feature {
  text-align: center;
  color: #334155;
}

.plan-feature {
  font-weight: 600;
}

.payment-methods-info {
  text-align: center;
  margin-top: clamp(40px, 6vw, 60px);
  padding: clamp(20px, 4vw, 30px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.payment-methods-info h3 {
  color: #2c3e50;
  margin-bottom: clamp(16px, 3vw, 20px);
  font-size: clamp(1.2rem, 4vw, 1.4rem);
  line-height: 1.2;
}

.methods-list {
  display: flex;
  justify-content: center;
  gap: clamp(10px, 2.5vw, 20px);
  flex-wrap: wrap;
}

.methods-list span {
  background: #f8f9fa;
  padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 20px);
  border-radius: 25px;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  color: #5a6c7d;
  border: 1px solid #e9ecef;
  white-space: nowrap;
}

/* Tablet and above - Show desktop table */
@media (min-width: 769px) {
  .comparison-table-mobile {
    display: none;
  }

  .comparison-table-desktop {
    display: block;
  }

  .pricing-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large desktop enhancements */
@media (min-width: 1200px) {
  .pricing-card.featured {
    transform: scale(1.05);
  }

  .pricing-card.featured:hover {
    transform: scale(1.05) translateY(-5px);
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .pricing-card,
  .plan-button,
  .location-toggle {
    transition: none;
  }

  .pricing-card:hover,
  .pricing-card.featured:hover,
  .plan-button:hover,
  .location-toggle:hover {
    transform: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .pricing {
    background: #1a1a1a;
  }

  .pricing-header h1,
  .feature-comparison h3,
  .payment-methods-info h3,
  .plan-header h3,
  .feature-name,
  .feature-label {
    color: #ffffff;
  }

  .pricing-header p,
  .features-list li,
  .plan-feature,
  .methods-list span {
    color: #cccccc;
  }

  .pricing-card,
  .comparison-card,
  .comparison-table-desktop,
  .payment-methods-info {
    background: #2d2d2d;
    color: #ffffff;
  }

  .features-list li,
  .comparison-item {
    border-bottom-color: #444;
  }

  .features-list li strong {
    color: #ffffff;
  }

  .comparison-row:nth-child(even),
  .comparison-item:nth-child(even) {
    background: #3d3d3d;
  }

  .methods-list span {
    background: #3d3d3d;
    border-color: #555;
  }

  .plan-button.secondary {
    border-color: #27ae60;
    color: #27ae60;
  }

  .plan-button.secondary:hover:not(:disabled) {
    background: #27ae60;
    color: #ffffff;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .pricing-card,
  .comparison-card,
  .comparison-table-desktop,
  .payment-methods-info {
    border: 2px solid #000;
  }

  .plan-button {
    border: 2px solid #000;
  }

  .location-badge,
  .plan-badge {
    border: 1px solid #000;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .pricing-card:hover,
  .pricing-card.featured:hover,
  .plan-button:hover,
  .location-toggle:hover {
    transform: none;
  }

  .pricing-card:active,
  .plan-button:active:not(.disabled):not(:disabled),
  .location-toggle:active {
    transform: scale(0.98);
  }

  .plan-button.primary:active:not(.disabled):not(:disabled) {
    background: #219a52;
  }

  .plan-button.secondary:active:not(:disabled) {
    background: #27ae60;
    color: white;
  }
}

/* Print styles */
@media print {
  .location-indicator,
  .plan-button,
  .payment-methods-info {
    display: none;
  }

  .pricing-card {
    box-shadow: none;
    border: 1px solid #ddd;
    break-inside: avoid;
  }

  .pricing-card.featured {
    border: 2px solid #27ae60;
  }
}
</style>
