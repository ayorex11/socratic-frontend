import { ref, onUnmounted } from 'vue'

/**
 * Custom SSE implementation that supports Authorization headers
 */
class CustomEventSource {
  constructor(url, options = {}) {
    this.url = url
    this.options = options
    this.readyState = 0 // CONNECTING
    this.listeners = {}
    this.abortController = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.shouldReconnect = true
    this.hasError = false
    this.lastEventId = null // NEW: Track Last-Event-ID

    this.connect()
  }

  async connect() {
    if (!this.shouldReconnect) {
      return
    }

    try {
      this.abortController = new AbortController()
      this.readyState = 0 // CONNECTING
      this.hasError = false

      const headers = {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...(this.options.headers || {}),
      }

      // Add Last-Event-ID header if we have one
      if (this.lastEventId) {
        headers['Last-Event-ID'] = this.lastEventId
      }

      const response = await fetch(this.url, {
        method: 'GET',
        headers,
        credentials: this.options.withCredentials ? 'include' : 'same-origin',
        signal: this.abortController.signal,
      })

      if (!response.ok) {
        // If 204 No Content, server is saying "no more data", so stop reconnecting
        if (response.status === 204) {
          this.shouldReconnect = false
          this.close()
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      this.readyState = 1 // OPEN
      this.reconnectAttempts = 0

      if (this.onopen) {
        this.onopen()
      }
      this.dispatchEvent('open', {})

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          console.log('SSE stream ended by server')
          // Stream ended cleanly.
          // IMPORTANT: Native EventSource automatically reconnects here unless close() was called.
          // We should only stop if we intentionally closed it or if the server sent a specific "finished" event previously.
          // Since we use shouldReconnect to track intentional closure, we check that.
          if (this.shouldReconnect) {
            // Treat as a connection drop and reconnect
            throw new Error('Stream ended unexpectedly')
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        let eventType = 'message'
        let eventData = ''
        let eventId = null

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.substring(6).trim()
          } else if (line.startsWith('data:')) {
            eventData += line.substring(5).trim()
          } else if (line.startsWith('id:')) {
            eventId = line.substring(3).trim()
            this.lastEventId = eventId
          } else if (line.startsWith(':')) {
            // Heartbeat / Comment
            continue
          } else if (line === '') {
            // End of event
            if (eventData) {
              const event = {
                type: eventType,
                data: eventData,
                lastEventId: this.lastEventId,
              }

              if (eventType === 'message' && this.onmessage) {
                this.onmessage(event)
              }

              this.dispatchEvent(eventType, event)

              // Handle server-sent close signals
              if (eventType === 'close' || eventType === 'complete') {
                this.shouldReconnect = false
                this.close()
                return
              }

              // Reset for next event
              eventType = 'message'
              eventData = ''
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // User intentionally aborted
        return
      }

      console.warn('SSE connection lost:', error.message)
      this.readyState = 2 // CLOSED
      this.hasError = true

      if (this.onerror) {
        this.onerror(error)
      }
      this.dispatchEvent('error', { error })

      // Reconnect logic
      if (this.shouldReconnect) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          // Exponential backoff with jitter
          const baseDelay = 1000 * Math.pow(2, this.reconnectAttempts - 1)
          const jitter = Math.random() * 500
          const delay = Math.min(baseDelay + jitter, 10000) // Cap at 10s

          console.log(
            `Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})...`,
          )
          setTimeout(() => this.connect(), delay)
        } else {
          console.error('SSE: Max reconnect attempts reached')
          this.dispatchEvent('error', { error: 'Max reconnect attempts reached' })
          this.shouldReconnect = false
        }
      }
    }
  }

  addEventListener(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = []
    }
    this.listeners[type].push(callback)
  }

  removeEventListener(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((cb) => cb !== callback)
    }
  }

  dispatchEvent(type, event) {
    if (this.listeners[type]) {
      this.listeners[type].forEach((callback) => callback(event))
    }
  }

  close() {
    this.shouldReconnect = false
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
    this.readyState = 2 // CLOSED
  }
}

export function useProcessingSSE() {
  const eventSource = ref(null)
  const isConnected = ref(false)
  const error = ref(null)
  const reconnectAttempts = ref(0)

  /**
   * Connect to SSE endpoint for a single document with auth headers
   */
  const connectToDocument = (documentId, onUpdate, onComplete, onError) => {
    disconnect()

    const url = `https://socratic-production-e023.up.railway.app/socratic/processing-status-stream/${documentId}/`

    try {
      eventSource.value = new CustomEventSource(url, {
        withCredentials: true,
      })

      eventSource.value.onopen = () => {
        console.log('SSE connection opened for document:', documentId)
        isConnected.value = true
        error.value = null
        reconnectAttempts.value = 0
      }

      eventSource.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE update received:', data)
          if (onUpdate) onUpdate(data)
        } catch (err) {
          console.error('Error parsing SSE data:', err)
          error.value = err.message
        }
      }

      eventSource.value.addEventListener('close', (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE close event:', data)
          if (onComplete) onComplete(data)
        } catch (err) {
          console.error('Error parsing close event:', err)
        }
        disconnect()
      })

      eventSource.value.addEventListener('complete', (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE complete event:', data)
          if (onComplete) onComplete(data)
        } catch (err) {
          console.error('Error parsing complete event:', err)
        }
        disconnect()
      })

      eventSource.value.addEventListener('error', (event) => {
        try {
          if (event.data) {
            const data = JSON.parse(event.data)
            console.error('SSE error event:', data)
            if (onError) onError(data)
          }
        } catch (err) {
          console.error('SSE error event parse error:', err)
        }
      })

      eventSource.value.addEventListener('timeout', (event) => {
        console.log('SSE timeout - will reconnect')
        if (onError) onError({ error: 'Connection timeout' })
      })

      eventSource.value.onerror = (err) => {
        if (eventSource.value.hasError) {
          console.error('SSE connection error:', err)
          error.value = 'Connection error'
          isConnected.value = false
          reconnectAttempts.value = eventSource.value.reconnectAttempts

          if (onError) onError(err)
        }
      }
    } catch (err) {
      console.error('Failed to create EventSource:', err)
      error.value = err.message
      if (onError) onError(err)
    }
  }

  /**
   * Connect to SSE endpoint for all user documents
   */
  const connectToAllDocuments = (onUpdate, onComplete, onError) => {
    disconnect()

    const url = `https://socratic-production-e023.up.railway.app/socratic/all-processing-status-stream/`

    try {
      eventSource.value = new CustomEventSource(url, {
        withCredentials: true,
      })

      eventSource.value.onopen = () => {
        console.log('SSE connection opened for all documents')
        isConnected.value = true
        error.value = null
        reconnectAttempts.value = 0
      }

      eventSource.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE bulk update received:', data)
          if (onUpdate) onUpdate(data)
        } catch (err) {
          console.error('Error parsing SSE data:', err)
          error.value = err.message
        }
      }

      eventSource.value.addEventListener('complete', (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE complete event:', data)
          if (onComplete) onComplete(data)
        } catch (err) {
          console.error('Error parsing complete event:', err)
        }
        disconnect()
      })

      eventSource.value.addEventListener('close', (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE close event:', data)
          if (onComplete) onComplete(data)
        } catch (err) {
          console.error('Error parsing close event:', err)
        }
        disconnect()
      })

      eventSource.value.addEventListener('error', (event) => {
        try {
          if (event.data) {
            const data = JSON.parse(event.data)
            console.error('SSE error event:', data)
            if (onError) onError(data)
          }
        } catch (err) {
          console.error('SSE error event parse error:', err)
        }
      })

      eventSource.value.addEventListener('timeout', (event) => {
        console.log('SSE timeout - will reconnect')
        if (onError) onError({ error: 'Connection timeout' })
      })

      eventSource.value.onerror = (err) => {
        if (eventSource.value.hasError) {
          console.error('SSE connection error:', err)
          error.value = 'Connection error'
          isConnected.value = false
          reconnectAttempts.value = eventSource.value.reconnectAttempts

          if (onError) onError(err)
        }
      }
    } catch (err) {
      console.error('Failed to create EventSource:', err)
      error.value = err.message
      if (onError) onError(err)
    }
  }

  /**
   * Disconnect from SSE
   */
  const disconnect = () => {
    if (eventSource.value) {
      console.log('Closing SSE connection')
      eventSource.value.close()
      eventSource.value = null
      isConnected.value = false
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    eventSource,
    isConnected,
    error,
    reconnectAttempts,
    connectToDocument,
    connectToAllDocuments,
    disconnect,
  }
}
