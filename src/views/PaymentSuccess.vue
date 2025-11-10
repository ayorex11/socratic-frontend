<template>
  <div class="payment-success">
    <div class="container">
      <div class="success-card">
        <div class="success-icon">🎉</div>
        <h1>Payment Successful!</h1>
        <p class="success-message">
          Thank you for upgrading to Premium! Your account has been upgraded and you now have access to all premium features.
        </p>

        <div class="premium-features">
          <h3>You now have access to:</h3>
          <ul>
            <li><span class="check">✓</span> Unlimited generations at a time</li>
            <li><span class="check">✓</span> 20+ questions per summary & quiz</li>
            <li><span class="check">✓</span> No need to delete old generations</li>
            <li><span class="check">✓</span> Priority support</li>
            <li><span class="check">✓</span> Export capabilities</li>
          </ul>
        </div>

        <div class="action-buttons">
          <router-link to="/dashboard" class="btn primary">
            Go to Dashboard
          </router-link>
          <router-link to="/upload" class="btn secondary">
            Start Generating
          </router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

onMounted(() => {
  // Check for query parameters
  const reference = route.query.reference;
  const plan = route.query.plan;

  if (reference) {
    console.log('Payment reference:', reference);
  }
});
</script>

<style scoped>
.payment-success {
  padding: clamp(20px, 8vw, 80px) clamp(16px, 4vw, 20px);
  background: #f8f9fa;
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.success-card {
  background: white;
  padding: clamp(24px, 6vw, 50px) clamp(20px, 4vw, 40px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  margin: 0 auto;
}

.success-icon {
  font-size: clamp(2.5rem, 10vw, 4rem);
  margin-bottom: clamp(16px, 4vw, 30px);
  display: block;
}

h1 {
  color: #27ae60;
  font-size: clamp(1.5rem, 6vw, 2.5rem);
  margin-bottom: clamp(12px, 3vw, 20px);
  line-height: 1.3;
  font-weight: 700;
}

.success-message {
  color: #5a6c7d;
  font-size: clamp(0.95rem, 3.5vw, 1.1rem);
  line-height: 1.6;
  margin-bottom: clamp(20px, 5vw, 35px);
}

.premium-features {
  background: #f8f9fa;
  padding: clamp(16px, 4vw, 25px);
  border-radius: 12px;
  margin-bottom: clamp(20px, 5vw, 35px);
  text-align: left;
}

.premium-features h3 {
  color: #2c3e50;
  margin-bottom: clamp(12px, 3vw, 16px);
  font-size: clamp(1rem, 4vw, 1.2rem);
  text-align: center;
  font-weight: 600;
}

.premium-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.premium-features li {
  padding: clamp(10px, 2.5vw, 12px) 0;
  color: #5a6c7d;
  font-size: clamp(0.9rem, 3.5vw, 1rem);
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: flex-start;
  line-height: 1.4;
}

.premium-features li:last-child {
  border-bottom: none;
}

.check {
  color: #27ae60;
  font-weight: bold;
  margin-right: 10px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: clamp(10px, 3vw, 16px);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: clamp(16px, 4vw, 25px);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: clamp(14px, 4vw, 16px) clamp(20px, 5vw, 30px);
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  font-size: clamp(0.95rem, 3.5vw, 1rem);
  min-width: min(140px, 100%);
  min-height: 52px;
  text-align: center;
  border: 2px solid transparent;
  flex: 1;
  max-width: 200px;
}

.btn.primary {
  background: #27ae60;
  color: white;
  border-color: #27ae60;
}

.btn.primary:hover, .btn.primary:active {
  background: #219a52;
  border-color: #219a52;
  transform: translateY(-1px);
}

.btn.secondary {
  background: transparent;
  color: #27ae60;
  border-color: #27ae60;
}

.btn.secondary:hover, .btn.secondary:active {
  background: #27ae60;
  color: white;
  transform: translateY(-1px);
}

.support-note {
  border-top: 1px solid #e9ecef;
  padding-top: clamp(16px, 4vw, 20px);
}

.support-note p {
  color: #7f8c8d;
  font-size: clamp(0.85rem, 3vw, 0.9rem);
  margin: 0;
  line-height: 1.4;
}

.support-note a {
  color: #27ae60;
  text-decoration: none;
  font-weight: 500;
}

.support-note a:hover {
  text-decoration: underline;
}

/* Enhanced Mobile Optimizations */
@media (max-width: 480px) {
  .payment-success {
    padding: 16px 12px;
    align-items: flex-start;
    padding-top: max(20px, env(safe-area-inset-top));
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }

  .success-card {
    padding: 20px 16px;
    border-radius: 12px;
    margin-top: 10px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .btn {
    max-width: none;
    min-height: 56px;
    font-size: 1rem;
  }

  .premium-features li {
    padding: 12px 0;
    font-size: 0.95rem;
  }
}

/* Very small phones */
@media (max-width: 360px) {
  .success-card {
    padding: 18px 14px;
  }

  h1 {
    font-size: 1.4rem;
  }

  .success-message {
    font-size: 0.9rem;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1024px) {
  .container {
    max-width: 500px;
  }

  .success-card {
    padding: 40px 35px;
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }

  .btn:hover, .btn:active {
    transform: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .payment-success {
    background: #1a1a1a;
  }

  .success-card {
    background: #2d2d2d;
    color: #ffffff;
  }

  .premium-features {
    background: #3d3d3d;
  }

  .premium-features h3 {
    color: #ffffff;
  }

  .premium-features li {
    color: #cccccc;
    border-bottom-color: #555;
  }

  .support-note {
    border-top-color: #555;
  }

  .support-note p {
    color: #cccccc;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .btn {
    border-width: 3px;
  }

  .success-card {
    border: 2px solid #27ae60;
  }
}

/* Portrait orientation specific */
@media (max-width: 480px) and (orientation: portrait) {
  .payment-success {
    padding-top: max(24px, env(safe-area-inset-top));
  }
}
</style>
