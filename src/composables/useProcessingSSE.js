import { ref, onUnmounted } from 'vue'

export function useProcessingSSE() {
  const eventSource = ref(null)
  const isConnected = ref(false)
  const error = ref(null)

  /**
   * Connect to SSE endpoint for a single document
   */
  const connectToDocument = (documentId, token, onUpdate, onComplete, onError) => {
    disconnect()

    const url = `https://socratic-f2kh.onrender.com/socratic/processing-status-stream/${documentId}/?token=${token}`

    eventSource.value = new EventSource(url)
    isConnected.value = true

    eventSource.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (onUpdate) onUpdate(data)
      } catch (err) {
        console.error('Error parsing SSE data:', err)
        error.value = err
      }
    }

    eventSource.value.addEventListener('close', (event) => {
      try {
        const data = JSON.parse(event.data)
        if (onComplete) onComplete(data)
      } catch (err) {
        console.error('Error parsing close event:', err)
      }
      disconnect()
    })

    eventSource.value.addEventListener('error', (event) => {
      try {
        const data = JSON.parse(event.data)
        error.value = data.error
        if (onError) onError(data)
      } catch (err) {
        console.error('SSE error event:', err)
      }
    })

    eventSource.value.onerror = (err) => {
      console.error('SSE connection error:', err)
      error.value = 'Connection error'
      if (onError) onError(err)
      disconnect()
    }
  }

  /**
   * Connect to SSE endpoint for all user documents
   */
  const connectToAllDocuments = (token, onUpdate, onComplete, onError) => {
    disconnect()

    const url = `https://socratic-f2kh.onrender.com/socratic/all-processing-status-stream/?token=${token}`

    eventSource.value = new EventSource(url)
    isConnected.value = true

    eventSource.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (onUpdate) onUpdate(data)
      } catch (err) {
        console.error('Error parsing SSE data:', err)
        error.value = err
      }
    }

    eventSource.value.addEventListener('complete', (event) => {
      try {
        const data = JSON.parse(event.data)
        if (onComplete) onComplete(data)
      } catch (err) {
        console.error('Error parsing complete event:', err)
      }
      disconnect()
    })

    eventSource.value.addEventListener('error', (event) => {
      try {
        const data = JSON.parse(event.data)
        error.value = data.error
        if (onError) onError(data)
      } catch (err) {
        console.error('SSE error event:', err)
      }
    })

    eventSource.value.onerror = (err) => {
      console.error('SSE connection error:', err)
      error.value = 'Connection error'
      if (onError) onError(err)
      disconnect()
    }
  }

  /**
   * Disconnect from SSE
   */
  const disconnect = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      isConnected.value = false
    }
  }

  // Cleanup on component unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    eventSource,
    isConnected,
    error,
    connectToDocument,
    connectToAllDocuments,
    disconnect
  }
}
