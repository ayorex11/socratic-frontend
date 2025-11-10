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
        // Save tokens, user data, AND expiration dates
        localStorage.setItem('accessToken', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('accessExpiration', data.access_expiration)
        localStorage.setItem('refreshExpiration', data.refresh_expiration)

        user.value = data.user
        isAuthenticated.value = true

        // Start token monitoring after successful login
        startTokenMonitoring()

        return { success: true }
      } else {
        return { success: false, error: data }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    // Stop token monitoring
    stopTokenMonitoring()

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('accessExpiration')
    localStorage.removeItem('refreshExpiration')
    user.value = null
    isAuthenticated.value = false
  }

  // Check if token is expired
  const isTokenExpired = (expirationDate) => {
    if (!expirationDate) return true
    return new Date() > new Date(expirationDate)
  }

  // Refresh token method
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await fetch('https://socratic-f2kh.onrender.com/auth/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()

      // Update access token and expiration
      localStorage.setItem('accessToken', data.access)
      if (data.access_expiration) {
        localStorage.setItem('accessExpiration', data.access_expiration)
      }

      return data.access
    } catch (error) {
      // If refresh fails, logout user
      logout()
      throw error
    }
  }

  // Token monitoring
  let tokenCheckInterval = null

  const startTokenMonitoring = () => {
    // Check token every 30 seconds
    tokenCheckInterval = setInterval(() => {
      checkTokenValidity()
    }, 30000)
  }

  const stopTokenMonitoring = () => {
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval)
      tokenCheckInterval = null
    }
  }

  const checkTokenValidity = () => {
    const accessExpiration = localStorage.getItem('accessExpiration')
    const refreshExpiration = localStorage.getItem('refreshExpiration')

    // If both tokens are expired, logout immediately
    if (isTokenExpired(accessExpiration) && isTokenExpired(refreshExpiration)) {
      console.log('Both tokens expired, logging out...')
      logout()
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session_expired=true'
      }
      return false
    }

    // If access token is expired but refresh token is still valid, try to refresh
    if (isTokenExpired(accessExpiration) && !isTokenExpired(refreshExpiration)) {
      console.log('Access token expired, attempting refresh...')
      refreshToken().catch(error => {
        console.error('Token refresh failed:', error)
      })
    }

    return true
  }

  // Enhanced initializeAuth that checks token validity
  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('accessToken')
    const accessExpiration = localStorage.getItem('accessExpiration')

    if (storedUser && accessToken && accessExpiration) {
      // Check if token is still valid
      if (!isTokenExpired(accessExpiration)) {
        user.value = JSON.parse(storedUser)
        isAuthenticated.value = true
        startTokenMonitoring()
      } else {
        // Token is expired, check if we can refresh
        const refreshExpiration = localStorage.getItem('refreshExpiration')
        if (!isTokenExpired(refreshExpiration)) {
          // Try to refresh token silently
          refreshToken().then(() => {
            user.value = JSON.parse(storedUser)
            isAuthenticated.value = true
            startTokenMonitoring()
          }).catch(() => {
            // Refresh failed, logout
            logout()
          })
        } else {
          // Both tokens expired, logout
          logout()
        }
      }
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    initializeAuth,
    refreshToken,
    checkTokenValidity,
    isTokenExpired
  }
})
