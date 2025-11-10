import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const login = async (credentials) => {
    try {
      const response = await fetch('https://socratic-f2kh.onrender.com/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        // Save tokens and user data
        localStorage.setItem('accessToken', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))

        user.value = data.user
        isAuthenticated.value = true
        return { success: true }
      } else {
        return { success: false, error: data }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    user.value = null
    isAuthenticated.value = false
  }

  // Initialize auth state on app start
  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('accessToken')

    if (storedUser && accessToken) {
      user.value = JSON.parse(storedUser)
      isAuthenticated.value = true
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    initializeAuth,
  }
})
