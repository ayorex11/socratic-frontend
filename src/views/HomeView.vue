<template>
  <div class="hiatus-container">
    <div class="hiatus-content-wrapper">
      <!-- Logo Header -->
      <header class="logo-header">
        <img src="/logo.png" alt="SocraSeek Logo" class="logo-image" />
        <h2 class="logo-text">SocraSeek</h2>
      </header>

      <!-- Main Card -->
      <main class="announcement-card">
        <div class="accent-glow"></div>
        <h1 class="headline">We'll Be Back.</h1>
        <p class="subheading">
          SocraSeek is currently on a short break while we rebuild, improve and come back stronger than ever.
        </p>
        <div class="divider"></div>
        <p class="body-text">
          Thank you to every student who trusted us with their notes and their study journey. This is not goodbye — it's a reset. Stay tuned.
        </p>
        
        <div class="button-wrapper">
          <a href="https://x.com/socraseek" target="_blank" rel="noopener noreferrer" class="x-button">
            <svg class="x-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
            <span>Follow us on X for updates</span>
          </a>
        </div>
      </main>

      <!-- Footer -->
      <footer class="hiatus-footer">
        <p>&copy; {{ new Date().getFullYear() }} SocraSeek. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
// Hiatus announcement page - self-contained component
</script>

<style scoped>
.hiatus-container {
  min-height: 100vh;
  width: 100%;
  background-color: #1a1a2e;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #ffffff;
  padding: 24px;
  overflow: hidden;
  position: relative;
}

/* Background grid effect */
.hiatus-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.05) 0%, transparent 40%),
    linear-gradient(rgba(255, 255, 255, 0.003) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.003) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
  z-index: 1;
}

.hiatus-content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Logo Header */
.logo-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-image {
  height: 48px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(34, 197, 94, 0.2));
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Main Card */
.announcement-card {
  width: 100%;
  background: rgba(30, 30, 50, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  padding: 48px 40px;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.accent-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 4px;
  background: linear-gradient(90deg, transparent, #22c55e, transparent);
  box-shadow: 0 0 20px #22c55e;
}

.headline {
  font-size: 2.75rem;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 20px;
  background: linear-gradient(to bottom, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subheading {
  font-size: 1.15rem;
  font-weight: 500;
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 28px;
}

.divider {
  width: 80px;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0 auto 28px;
}

.body-text {
  font-size: 1.05rem;
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 36px;
}

/* Button */
.button-wrapper {
  display: flex;
  justify-content: center;
}

.x-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #22c55e;
  color: #0b0c10;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  padding: 14px 28px;
  border-radius: 9999px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);
  cursor: pointer;
  border: none;
}

.x-button:hover {
  transform: translateY(-2px);
  background-color: #16a34a;
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.5);
}

.x-button:active {
  transform: translateY(0);
}

.x-icon {
  width: 18px;
  height: 18px;
}

/* Footer */
.hiatus-footer {
  font-size: 0.85rem;
  color: #475569;
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .hiatus-container {
    padding: 16px;
  }
  
  .hiatus-content-wrapper {
    gap: 24px;
  }
  
  .announcement-card {
    padding: 36px 24px;
    border-radius: 20px;
  }
  
  .headline {
    font-size: 2.2rem;
  }
  
  .subheading {
    font-size: 1.05rem;
  }
  
  .body-text {
    font-size: 0.95rem;
  }
  
  .x-button {
    width: 100%;
    padding: 14px 20px;
  }
  
  .logo-text {
    font-size: 1.75rem;
  }
}
</style>
