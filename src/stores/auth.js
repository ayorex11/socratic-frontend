import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const login = async (credentials, fingerprint = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      if (fingerprint) {
        headers['X-Device-Fingerprint'] = fingerprint
      }

      const response = await fetch('https://socratic-production-e023.up.railway.app/auth/login/', {
        method: 'POST',
        headers,
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
        return { success: false, error: data.detail || 'Login failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const register = async (userData) => {
    try {
      // Extract fingerprint to headers
      const { fingerprint, ...rest } = userData
      const headers = {
        'Content-Type': 'application/json',
      }

      if (fingerprint) {
        headers['X-Device-Fingerprint'] = fingerprint
      }

      // Ensure password fields match backend expectations (password1/password2)
      const payload = { ...rest }
      if (payload.password && !payload.password1) {
        payload.password1 = payload.password
        payload.password2 = payload.password
        delete payload.password
      }

      const response = await fetch(
        'https://socratic-production-e023.up.railway.app/registration/',
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        },
      )

      const data = await response.json()

      if (response.ok) {
        if (data.access && data.refresh) {
          localStorage.setItem('accessToken', data.access)
          localStorage.setItem('refreshToken', data.refresh)
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('accessExpiration', data.access_expiration)
          localStorage.setItem('refreshExpiration', data.refresh_expiration)

          user.value = data.user
          isAuthenticated.value = true
          startTokenMonitoring()
        }
        return { success: true }
      } else {
        // Handle field-specific errors
        const errorMessage = data.username
          ? data.username[0]
          : data.email
            ? data.email[0]
            : data.password1
              ? data.password1[0]
              : data.non_field_errors
                ? data.non_field_errors[0]
                : data.detail || 'Registration failed'
        return { success: false, error: errorMessage }
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

  const logoutAllDevices = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const response = await fetch(
        'https://socratic-production-e023.up.railway.app/Account/logout-all-devices/',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      const data = await response.json()

      if (response.ok) {
        logout()
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error || 'Failed to logout all devices' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
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
  const googleAuth = async (credential, fingerprint = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      if (fingerprint) {
        headers['X-Device-Fingerprint'] = fingerprint
      }

      const response = await fetch(
        'https://socratic-production-e023.up.railway.app/Account/google/',
        {
          method: 'POST',
          headers,
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
    logoutAllDevices,
    initializeAuth,
    refreshToken,
    checkTokenValidity,
    isTokenExpired,
    googleAuth,
    register,
  }
})
