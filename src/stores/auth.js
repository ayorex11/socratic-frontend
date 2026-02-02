import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const login = async (credentials) => {
    try {
      const response = await fetch('https://socratic-production-e023.up.railway.app/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('accessToken', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('accessExpiration', data.access_expiration)
        localStorage.setItem('refreshExpiration', data.refresh_expiration)

        user.value = data.user
        isAuthenticated.value = true
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
    stopTokenMonitoring()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('accessExpiration')
    localStorage.removeItem('refreshExpiration')
    user.value = null
    isAuthenticated.value = false
  }

  const isTokenExpired = (expirationDate) => {
    if (!expirationDate) return true
    return new Date() > new Date(expirationDate)
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await fetch(
        'https://socratic-production-e023.up.railway.app/auth/token/refresh/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        },
      )

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      localStorage.setItem('accessToken', data.access)
      if (data.access_expiration) {
        localStorage.setItem('accessExpiration', data.access_expiration)
      }

      return data.access
    } catch (error) {
      logout()
      throw error
    }
  }

  let tokenCheckInterval = null

  const startTokenMonitoring = () => {
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

    if (isTokenExpired(accessExpiration) && isTokenExpired(refreshExpiration)) {
      console.log('Both tokens expired, logging out...')
      logout()
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session_expired=true'
      }
      return false
    }

    if (isTokenExpired(accessExpiration) && !isTokenExpired(refreshExpiration)) {
      console.log('Access token expired, attempting refresh...')
      refreshToken().catch((error) => {
        console.error('Token refresh failed:', error)
      })
    }

    return true
  }

  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('accessToken')
    const accessExpiration = localStorage.getItem('accessExpiration')

    if (storedUser && accessToken && accessExpiration) {
      if (!isTokenExpired(accessExpiration)) {
        user.value = JSON.parse(storedUser)
        isAuthenticated.value = true
        startTokenMonitoring()
      } else {
        const refreshExpiration = localStorage.getItem('refreshExpiration')
        if (!isTokenExpired(refreshExpiration)) {
          refreshToken()
            .then(() => {
              user.value = JSON.parse(storedUser)
              isAuthenticated.value = true
              startTokenMonitoring()
            })
            .catch(() => {
              logout()
            })
        } else {
          logout()
        }
      }
    }
  }

  // Updated Google Auth to use credential instead of access_token
  const googleAuth = async (credential) => {
    try {
      const response = await fetch(
        'https://socratic-production-e023.up.railway.app/Account/google/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: credential, // Send the ID token as 'credential'
          }),
        },
      )

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('accessToken', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('accessExpiration', data.access_expiration)
        localStorage.setItem('refreshExpiration', data.refresh_expiration)

        user.value = data.user
        isAuthenticated.value = true
        startTokenMonitoring()

        return { success: true, isNewUser: data.is_new_user }
      } else {
        return { success: false, error: data }
      }
    } catch (error) {
      console.error('Google auth error:', error)
      return { success: false, error: { error: 'Network error during Google authentication' } }
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
    isTokenExpired,
    googleAuth,
  }
})
