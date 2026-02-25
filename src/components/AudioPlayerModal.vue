<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content audio-modal">
      <div class="modal-header">
        <h3>{{ title || 'Audio Player' }}</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="modal-body audio-body">
        <div class="player-container">
          <div class="audio-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </div>
          <audio
            ref="audioPlayer"
            controls
            autoplay
            controlsList="nodownload"
            class="audio-element"
            :src="audioUrl"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])
const audioPlayer = ref(null)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
    if (audioPlayer.value) {
      audioPlayer.value.pause()
      audioPlayer.value.currentTime = 0
    }
  }
})

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content.audio-modal {
  background: white;
  border-radius: 12px;
  width: 90vw;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  padding: 0 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-body.audio-body {
  padding: 40px 24px;
  background: #ffffff;
}

.player-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.audio-icon {
  width: 80px;
  height: 80px;
  background: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

.audio-icon svg {
  width: 40px;
  height: 40px;
}

.audio-element {
  width: 100%;
  height: 54px;
  outline: none;
}
</style>
