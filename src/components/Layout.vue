<template>
  <div class="layout" :class="{ 'hiatus-layout': isHiatus }">
    <!-- Route transition loading bar -->
    <div class="route-loading-bar" :class="{ active: isRouteLoading }"></div>

    <nav class="navbar" v-if="!isHiatus">
      <div class="nav-container">
        <!-- Logo -->
        <div class="nav-logo">
          <router-link to="/" class="logo-link">
            <img src="/logo.png" alt="SocraSeek Logo" class="logo-image" />
            <h2>SocraSeek</h2>
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Toggle navigation menu"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <!-- Navigation Links -->
        <div class="nav-links" :class="{ 'mobile-open': isMobileMenuOpen }">
          <router-link to="/pricing" class="nav-link" @click="closeMobileMenu">
            Pricing
          </router-link>
          <router-link
            to="/dashboard"
            class="nav-link"
            v-if="authStore.isAuthenticated"
            @click="closeMobileMenu"
          >
            Dashboard
          </router-link>
          <router-link
            to="/login"
            class="nav-link"
            v-if="!authStore.isAuthenticated"
            @click="closeMobileMenu"
          >
            Login
          </router-link>
          <router-link
            to="/register"
            class="nav-link register-btn"
            v-if="!authStore.isAuthenticated"
            @click="closeMobileMenu"
          >
            Get Started
          </router-link>
          <div class="user-menu" v-else>
            <router-link to="/profile" class="username-link" @click="closeMobileMenu">
              Welcome, {{ authStore.user?.username || authStore.user?.first_name || 'User' }}
            </router-link>
            <button @click="handleLogout" class="logout-btn">Logout</button>
          </div>
        </div>

        <!-- Mobile Menu Overlay -->
        <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
      </div>
    </nav>

    <!-- Welcome Animation -->
    <WelcomeAnimation v-if="showWelcome && !isHiatus" @close="showWelcome = false" />

    <!-- Toast Notifications -->
    <ToastContainer />

    <!-- Main Content — only render after auth state is resolved -->
    <main class="main-content" :class="{ 'hiatus-content': isHiatus }" v-if="authStore.authReady || isHiatus">
      <router-view />
    </main>

    <!-- Auth loading state — shown while verifying session -->
    <main class="main-content auth-loading-state" v-else-if="!isHiatus">
      <div class="auth-loading-spinner">
        <div class="spinner-ring"></div>
        <p class="spinner-text">Loading...</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import WelcomeAnimation from './WelcomeAnimation.vue'
import ToastContainer from './ToastContainer.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isHiatus = computed(() => route.path === '/')

watch(
  isHiatus,
  (newVal) => {
    if (newVal) {
      document.body.classList.add('hiatus-layout-body')
    } else {
      document.body.classList.remove('hiatus-layout-body')
    }
  },
  { immediate: true },
)

const showWelcome = ref(false)
const isMobileMenuOpen = ref(false)
const isRouteLoading = ref(false)

// Watch for authentication changes to show welcome animation
watch(
  () => authStore.isAuthenticated,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      showWelcome.value = true
      // Redirect to dashboard after login (for both login and registration)
      if (
        router.currentRoute.value.path === '/login' ||
        router.currentRoute.value.path === '/register'
      ) {
        router.push('/dashboard')
      }
    }
  },
)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  closeMobileMenu()
  // Redirect to home page after logout
  router.push('/')
}

// Close mobile menu when clicking outside or on escape key
const handleClickOutside = (event) => {
  if (
    isMobileMenuOpen.value &&
    !event.target.closest('.nav-links') &&
    !event.target.closest('.mobile-menu-btn')
  ) {
    closeMobileMenu()
  }
}

const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// Handle window resize
const handleResize = () => {
  if (window.innerWidth >= 768) {
    closeMobileMenu()
  }
}

// Route transition loading bar
let routeLoadingTimeout = null
router.beforeEach(() => {
  // Small delay so instant navigations don't flash the bar
  routeLoadingTimeout = setTimeout(() => {
    isRouteLoading.value = true
  }, 80)
})
router.afterEach(() => {
  clearTimeout(routeLoadingTimeout)
  // Brief delay to let the bar reach the end before hiding
  setTimeout(() => {
    isRouteLoading.value = false
  }, 150)
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

/* Route transition loading bar */
.route-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0;
  background: linear-gradient(90deg, #27ae60, #2ecc71, #27ae60);
  z-index: 9999;
  transition: width 0.1s ease;
  pointer-events: none;
}

.route-loading-bar.active {
  width: 85%;
  transition: width 8s cubic-bezier(0.1, 0.5, 0.3, 1);
}

/* Auth loading spinner */
.auth-loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid #e9ecef;
  border-top-color: #27ae60;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner-text {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: clamp(60px, 8vw, 70px);
  position: relative;
}

.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: clamp(8px, 2vw, 12px);
}

.logo-image {
  height: clamp(32px, 6vw, 40px);
  width: auto;
  object-fit: contain;
}

.logo-link h2 {
  color: #27ae60;
  margin: 0;
  font-size: clamp(1.4rem, 4vw, 1.8rem);
  font-weight: bold;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  gap: 4px;
  z-index: 1001;
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background: #2c3e50;
  transition: all 0.3s ease;
  transform-origin: center;
}

.mobile-menu-btn[aria-expanded='true'] .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-btn[aria-expanded='true'] .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn[aria-expanded='true'] .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: clamp(16px, 3vw, 30px);
}

.nav-link {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px);
  border-radius: 6px;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  white-space: nowrap;
}

.nav-link:hover {
  color: #27ae60;
  background-color: #f8f9fa;
}

.register-btn {
  background: #27ae60;
  color: white !important;
  padding: clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px);
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  min-height: 44px;
  display: flex;
  align-items: center;
}

.register-btn:hover {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: clamp(12px, 2vw, 15px);
}

.username-link {
  color: #2c3e50;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 12px);
  border-radius: 6px;
  cursor: pointer;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.username-link:hover {
  color: #27ae60;
  background-color: #f8f9fa;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  min-height: 44px;
  white-space: nowrap;
}

.logout-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.main-content {
  min-height: calc(100vh - clamp(60px, 8vw, 70px));
}

.hiatus-layout {
  background-color: #1a1a2e;
}

.hiatus-content {
  min-height: 100vh;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* Mobile Styles */
@media (max-width: 767px) {
  .mobile-menu-btn {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: clamp(60px, 8vw, 70px);
    right: -100%;
    width: min(300px, 85vw);
    height: calc(100vh - clamp(60px, 8vw, 70px));
    background: white;
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
    gap: 0;
    transition: right 0.3s ease;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    z-index: 999;
    overflow-y: auto;
  }

  .nav-links.mobile-open {
    right: 0;
  }

  .nav-link {
    padding: 16px 20px;
    margin: 4px 0;
    border-radius: 8px;
    text-align: left;
    font-size: 1rem;
    min-height: 54px;
    display: flex;
    align-items: center;
    border: 1px solid #f0f0f0;
  }

  .nav-link:hover {
    background-color: #f8f9fa;
  }

  .register-btn {
    margin: 8px 0;
    justify-content: center;
    min-height: 54px;
    font-size: 1rem;
    font-weight: 600;
  }

  .user-menu {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin-top: 8px;
  }

  .username-link {
    padding: 16px 20px;
    margin: 4px 0;
    border-radius: 8px;
    text-align: left;
    font-size: 1rem;
    min-height: 54px;
    display: flex;
    align-items: center;
    border: 1px solid #f0f0f0;
    max-width: none;
  }

  .logout-btn {
    padding: 16px 20px;
    margin: 4px 0;
    border-radius: 8px;
    text-align: center;
    font-size: 1rem;
    min-height: 54px;
    font-weight: 600;
  }
}

/* Tablet Styles */
@media (min-width: 768px) and (max-width: 1023px) {
  .nav-container {
    padding: 0 16px;
  }

  .nav-links {
    gap: 20px;
  }

  .username-link {
    max-width: 150px;
  }
}

/* Large Desktop Styles */
@media (min-width: 1200px) {
  .nav-container {
    padding: 0 24px;
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .register-btn,
  .logout-btn,
  .mobile-menu-btn,
  .nav-links {
    transition: none;
  }

  .register-btn:hover,
  .logout-btn:hover {
    transform: none;
  }

  .route-loading-bar,
  .route-loading-bar.active {
    transition: none;
  }

  .spinner-ring {
    animation: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .navbar {
    background: #1a1a1a;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .nav-link,
  .username-link {
    color: #ffffff;
  }

  .nav-link:hover,
  .username-link:hover {
    background-color: #2d2d2d;
    color: #27ae60;
  }

  .hamburger-line {
    background: #ffffff;
  }

  @media (max-width: 767px) {
    .nav-links {
      background: #1a1a1a;
    }

    .nav-link,
    .username-link {
      border-color: #333;
    }

    .nav-link:hover,
    .username-link:hover {
      background-color: #2d2d2d;
    }
  }

  .mobile-overlay {
    background: rgba(0, 0, 0, 0.7);
  }

  .spinner-ring {
    border-color: #333;
    border-top-color: #27ae60;
  }

  .spinner-text {
    color: #adb5bd;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .navbar {
    border-bottom: 2px solid #000;
  }

  .nav-link,
  .register-btn,
  .logout-btn {
    border: 1px solid #000;
  }
}
</style>

<style>
body.hiatus-layout-body {
  background-color: #1a1a2e !important;
}
</style>

