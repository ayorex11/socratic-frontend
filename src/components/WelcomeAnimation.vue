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
import socratesImage from '@/assets/socrates.png'

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
  padding: clamp(16px, 4vw, 20px);
}

.welcome-container {
  text-align: center;
  color: white;
  animation: slideUp 0.8s ease-out;
  width: 100%;
  max-width: min(500px, 90vw);
}

/* Socrates Image */
.socrates-image {
  margin: 0 auto clamp(20px, 5vw, 40px);
  animation: float 3s ease-in-out infinite;
}

.socrates-img {
  width: clamp(120px, 25vw, 200px);
  height: clamp(120px, 25vw, 200px);
  border-radius: 50%;
  object-fit: cover;
  border: clamp(3px, 1vw, 4px) solid white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Welcome Message */
.welcome-message h1 {
  font-size: clamp(1.8rem, 6vw, 3rem);
  margin-bottom: clamp(8px, 2vw, 10px);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: textGlow 2s ease-in-out infinite alternate;
  line-height: 1.2;
}

.welcome-message p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  margin-bottom: clamp(20px, 4vw, 30px);
  opacity: 0.9;
  font-style: italic;
  line-height: 1.4;
}

.continue-btn {
  background: white;
  color: #27ae60;
  border: none;
  padding: clamp(10px, 2.5vw, 12px) clamp(20px, 4vw, 30px);
  border-radius: 25px;
  font-size: clamp(0.9rem, 3vw, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  min-height: 48px;
  min-width: 160px;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.continue-btn:active {
  transform: translateY(0);
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

/* Mobile-specific optimizations */
@media (max-width: 480px) {
  .welcome-overlay {
    padding: 12px;
  }

  .socrates-img {
    width: 100px;
    height: 100px;
  }

  .welcome-message h1 {
    font-size: 1.6rem;
  }

  .welcome-message p {
    font-size: 0.9rem;
  }

  .continue-btn {
    min-height: 44px;
    min-width: 140px;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1023px) {
  .welcome-container {
    max-width: 400px;
  }

  .socrates-img {
    width: 180px;
    height: 180px;
  }
}

/* Large desktop enhancements */
@media (min-width: 1200px) {
  .welcome-container {
    max-width: 500px;
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .welcome-overlay,
  .welcome-container,
  .socrates-image {
    animation: none;
  }

  .continue-btn {
    transition: none;
  }

  .continue-btn:hover {
    transform: none;
  }
}

/* Landscape mode for mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .welcome-container {
    flex-direction: row;
    gap: 20px;
    align-items: center;
    text-align: left;
  }

  .socrates-image {
    margin: 0;
    flex-shrink: 0;
  }

  .socrates-img {
    width: 80px;
    height: 80px;
  }

  .welcome-message h1 {
    font-size: 1.4rem;
    margin-bottom: 4px;
  }

  .welcome-message p {
    font-size: 0.8rem;
    margin-bottom: 12px;
  }

  .continue-btn {
    min-height: 36px;
    min-width: 120px;
    font-size: 0.8rem;
    padding: 8px 16px;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .welcome-overlay {
    background: #27ae60;
    border: 2px solid #000;
  }

  .socrates-img {
    border: 3px solid #000;
  }

  .continue-btn {
    border: 2px solid #000;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .welcome-overlay {
    background: rgba(39, 174, 96, 0.98);
  }

  .continue-btn {
    background: #ffffff;
    color: #27ae60;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .continue-btn:hover {
    transform: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .continue-btn:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}
</style>
