import { ref } from 'vue'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

export function useFingerprint() {
  const fingerprint = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const getFingerprint = async () => {
    isLoading.value = true
    error.value = null
    try {
      const fp = await FingerprintJS.load()
      const result = await fp.get()
      fingerprint.value = result.visitorId
      return result.visitorId
    } catch (err) {
      console.error('Fingerprint generation failed:', err)
      error.value = 'Failed to generate device fingerprint'
      // Instead of failing, we might want to return a fallback or null
      // depend on strictness requirements. For now, we log and return null.
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    fingerprint,
    isLoading,
    error,
    getFingerprint,
  }
}
