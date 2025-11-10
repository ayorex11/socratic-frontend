import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  let expirationCheckInterval = null

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
        // Save tokens, user data, and expiration times
        localStorage.setItem('accessToken', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('accessExpiration', data.access_expiration)
        localStorage.setItem('refreshExpiration', data.refresh_expiration)

        user.value = data.user
        isAuthenticated.value = true

        // Start checking for token expiration
        startExpirationCheck()

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
    localStorage.removeItem('accessExpiration')
    localStorage.removeItem('refreshExpiration')
    user.value = null
    isAuthenticated.value = false

    // Stop the expiration check interval
    if (expirationCheckInterval) {
      clearInterval(expirationCheckInterval)
      expirationCheckInterval = null
    }
  }

  const isTokenExpired = (expirationDate) => {
    if (!expirationDate) return true

    const expiration = new Date(expirationDate)
    const now = new Date()

    return now >= expiration
  }

  const checkTokenExpiration = () => {
    const accessExpiration = localStorage.getItem('accessExpiration')
    const refreshExpiration = localStorage.getItem('refreshExpiration')

    // If refresh token is expired, log out immediately
    if (isTokenExpired(refreshExpiration)) {
      console.log('Refresh token expired, logging out')
      logout()
      return
    }

    // If access token is expired but refresh token is still valid,
    // you could attempt to refresh the token here
    if (isTokenExpired(accessExpiration)) {
      console.log('Access token expired')
      // Option 1: Log out immediately
      logout()

    }
  }

  const startExpirationCheck = () => {
    // Clear any existing interval
    if (expirationCheckInterval) {
      clearInterval(expirationCheckInterval)
    }

    // Check immediately
    checkTokenExpiration()

    // Check every minute
    expirationCheckInterval = setInterval(() => {
      checkTokenExpiration()
    }, 60000) // 60000ms = 1 minute
  }

  // Initialize auth state on app start
  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('accessToken')
    const accessExpiration = localStorage.getItem('accessExpiration')

    if (storedUser && accessToken && accessExpiration) {
      // Check if token is already expired
      if (isTokenExpired(accessExpiration)) {
        console.log('Token expired on initialization, logging out')
        logout()
      } else {
        user.value = JSON.parse(storedUser)
        isAuthenticated.value = true
        // Start checking for expiration
        startExpirationCheck()
      }
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    initializeAuth,
    checkTokenExpiration,
  }
})
