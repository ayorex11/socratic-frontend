<template>
  <div class="welcome-overlay" @click="close">
    <div class="welcome-container" @click.stop>
      <!-- Socrates Image -->
      <div class="socrates-image">
        <img :src="socratesImage" alt="Socrates" class="socrates-img" />
      </div>

      <!-- Welcome Message -->
      <div class="welcome-message">
        <h1>Welcome to Socratic</h1>
        <p>The unexamined life is not worth living</p>
        <button @click="close" class="continue-btn">Continue Learning</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import your Socrates image - replace with your actual image path
import socratesImage from '@/assets/socrates.png' // Adjust path as needed

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

// Auto-close after 5 seconds
setTimeout(() => {
  close()
}, 5000)
</script>

<style scoped>
.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(39, 174, 96, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease-out;
}

.welcome-container {
  text-align: center;
  color: white;
  animation: slideUp 0.8s ease-out;
}

/* Socrates Image */
.socrates-image {
  margin: 0 auto 40px;
  animation: float 3s ease-in-out infinite;
}

.socrates-img {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Welcome Message */
.welcome-message h1 {
  font-size: 3rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: textGlow 2s ease-in-out infinite alternate;
}

.welcome-message p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
  font-style: italic;
}

.continue-btn {
  background: white;
  color: #27ae60;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes textGlow {
  from {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
  to {
    text-shadow: 2px 2px 20px rgba(255, 255, 255, 0.5), 2px 2px 30px rgba(255, 255, 255, 0.3);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .welcome-message h1 {
    font-size: 2rem;
  }

  .welcome-message p {
    font-size: 1rem;
  }

  .socrates-img {
    width: 150px;
    height: 150px;
  }
}
</style>
