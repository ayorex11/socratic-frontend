import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE = 'https://socratic-production-e023.up.railway.app'

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

      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        // Tokens are now stored as HttpOnly cookies by the backend.
        // We only store non-sensitive user info in localStorage.
        localStorage.setItem('user', JSON.stringify(data.user))

        user.value = data.user
        isAuthenticated.value = true

        return { success: true }
      } else {
        return { success: false, error: data.detail || data }
      }
    } catch {
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

      const response = await fetch(`${API_BASE}/registration/`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
          user.value = data.user
          isAuthenticated.value = true
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
    } catch {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    // Also clear the cookie on the backend via the dj-rest-auth logout endpoint
    try {
      await fetch(`${API_BASE}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (e) {
      // If logout request fails, still clear local state
      console.warn('Backend logout request failed:', e)
    }
    localStorage.removeItem('user')
    user.value = null
    isAuthenticated.value = false
  }

  const logoutAllDevices = async () => {
    try {
      const response = await fetch(`${API_BASE}/Account/logout-all-devices/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.removeItem('user')
        user.value = null
        isAuthenticated.value = false
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error || 'Failed to logout all devices' }
      }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }

  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/token/refresh/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        // No body needed — refresh token comes from the HttpOnly cookie
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      // Cookie is updated automatically by the backend response
      return true
    } catch (error) {
      await logout()
      throw error
    }
  }

  const checkAuth = async () => {
    // Check if we have user data and verify the cookie is still valid
    // by calling the dj-rest-auth user endpoint
    try {
      const response = await fetch(`${API_BASE}/auth/user/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        user.value = data
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(data))
        return true
      } else {
        // Cookie expired or invalid
        localStorage.removeItem('user')
        user.value = null
        isAuthenticated.value = false
        return false
      }
    } catch {
      return false
    }
  }

  const initializeAuth = async () => {
    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      // We have cached user data — set it optimistically
      user.value = JSON.parse(storedUser)
      isAuthenticated.value = true

      // Verify the cookie is still valid in the background
      const valid = await checkAuth()
      if (!valid) {
        // Try refreshing the token
        try {
          await refreshToken()
          await checkAuth()
        } catch {
          // Token refresh failed — user must login again
          user.value = null
          isAuthenticated.value = false
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

      const response = await fetch(`${API_BASE}/Account/google/`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          credential: credential,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user))

        user.value = data.user
        isAuthenticated.value = true

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
    checkAuth,
    googleAuth,
    register,
  }
})
