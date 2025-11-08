<template>
  <div class="layout">
    <nav class="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <div class="nav-logo">
          <router-link to="/" class="logo-link">
            <h2>Socratic</h2>
          </router-link>
        </div>

        <!-- Navigation Links -->
        <div class="nav-links">
          <router-link to="/pricing" class="nav-link">Pricing</router-link>
          <router-link to="/dashboard" class="nav-link" v-if="authStore.isAuthenticated">Dashboard</router-link>
          <router-link to="/login" class="nav-link" v-if="!authStore.isAuthenticated">Login</router-link>
          <router-link to="/register" class="nav-link register-btn" v-if="!authStore.isAuthenticated">
            Get Started
          </router-link>
          <div class="user-menu" v-else>
            <router-link to="/profile" class="username-link">
              Welcome, {{ authStore.user?.username || authStore.user?.first_name || 'User' }}
            </router-link>
            <button @click="handleLogout" class="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Welcome Animation -->
    <WelcomeAnimation v-if="showWelcome" @close="showWelcome = false" />

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import WelcomeAnimation from './WelcomeAnimation.vue'

const authStore = useAuthStore()
const router = useRouter()
const showWelcome = ref(false)

// Watch for authentication changes to show welcome animation
watch(() => authStore.isAuthenticated, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    showWelcome.value = true
    // Redirect to dashboard after login (for both login and registration)
    if (router.currentRoute.value.path === '/login' || router.currentRoute.value.path === '/register') {
      router.push('/dashboard')
    }
  }
})

const handleLogout = () => {
  authStore.logout()
  // Redirect to home page after logout
  router.push('/')
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo-link {
  text-decoration: none;
}

.logo-link h2 {
  color: #27ae60;
  margin: 0;
  font-size: 1.8rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  transition: color 0.3s ease;
  padding: 8px 16px;
  border-radius: 6px;
}

.nav-link:hover {
  color: #27ae60;
}

.register-btn {
  background: #27ae60;
  color: white !important;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.register-btn:hover {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username-link {
  color: #2c3e50;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s ease;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.username-link:hover {
  color: #27ae60;
  background-color: #f8f9fa;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background: #c0392b;
}

.main-content {
  min-height: calc(100vh - 70px);
}
</style>
