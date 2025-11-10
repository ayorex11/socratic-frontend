import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth state after pinia is installed
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

// Pass router instance to auth store to avoid circular dependency
authStore.setRouter(router)

// Initialize auth
authStore.initializeAuth()

app.mount('#app')
