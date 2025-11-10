<template>
  <div class="pricing">
    <div class="container">
      <!-- Location Indicator -->
      <div class="location-indicator" v-if="!locationStore.isLoading">
        <span class="location-badge">
          🌍 Detected: {{ locationStore.isNigeria ? 'Nigeria' : 'International' }}
          ({{ locationStore.isNigeria ? '₦' : '$' }})
        </span>
        <button @click="toggleLocation" class="location-toggle">
          Switch to {{ locationStore.isNigeria ? 'International' : 'Nigeria' }}
        </button>
      </div>

      <div class="pricing-header">
        <h1>Simple, Transparent Pricing</h1>
        <p>Choose the plan that works best for your learning journey</p>
      </div>

      <div v-if="locationStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Detecting your location...</p>
      </div>

      <div v-else class="pricing-grid">
        <!-- Free Plan -->
        <div class="pricing-card">
          <div class="plan-badge">Free</div>
          <div class="plan-header">
            <h3>Starter</h3>
            <div class="price">
              {{ locationStore.isNigeria ? '₦0' : '$0' }}<span>/month</span>
            </div>
          </div>
          <ul class="features-list">
            <li>✓ Audio Generation</li>
            <li>✓ Summary Generation</li>
            <li>✓ <strong>5 questions</strong> per summary & quiz</li>
            <li>✓ <strong>3 generations</strong> at a time</li>
            <li>✓ Delete old generations to create new ones</li>
            <li>✓ Community support</li>
          </ul>
          <router-link to="/register" class="plan-button secondary">
            Get Started Free
          </router-link>
        </div>

        <!-- Premium Plan -->
        <div class="pricing-card featured">
          <div class="plan-badge featured-badge">Most Popular</div>
          <div class="plan-header">
            <h3>Premium</h3>
            <div class="price">
              {{ locationStore.isNigeria ? '₦7,500' : '$9' }}<span>/month</span>
            </div>
          </div>
          <ul class="features-list">
            <li>✓ Audio Generation</li>
            <li>✓ Summary Generation</li>
            <li>✓ <strong>20+ questions</strong> per summary & quiz</li>
            <li>✓ <strong>Unlimited generations</strong> at a time</li>
            <li>✓ No need to delete - generate freely</li>
            <li>✓ Priority support</li>
            <li>✓ Export capabilities</li>
            <li>✓ Community support</li>
          </ul>
          <router-link
            :to="locationStore.isNigeria ? '/register?plan=premium-ng' : '/register?plan=premium-us'"
            class="plan-button primary"
          >
            Get Premium
          </router-link>
        </div>

        <!-- Student Plan -->
        <div class="pricing-card">
          <div class="plan-badge">Student</div>
          <div class="plan-header">
            <h3>Student Pro</h3>
            <div class="price">
              {{ locationStore.isNigeria ? '₦3,300' : '$4' }}<span>/month</span>
            </div>
          </div>
          <ul class="features-list">
            <li>✓ All Premium features</li>
            <li>✓ <strong>20+ questions</strong> per summary & quiz</li>
            <li>✓ <strong>Unlimited generations</strong> at a time</li>
            <li>✓ No deletion required</li>
            <li>✓ Student verification required</li>
          </ul>
          <router-link
            :to="locationStore.isNigeria ? '/register?plan=student-ng' : '/register?plan=student-us'"
            class="plan-button secondary"
          >
            Get Student Plan
          </router-link>
        </div>
      </div>

      <!-- Feature Comparison Table -->
      <div v-if="!locationStore.isLoading" class="feature-comparison">
        <h3>Plan Comparison</h3>
        <div class="comparison-table">
          <div class="comparison-header">
            <div class="feature-name">Feature</div>
            <div class="plan-type">Starter</div>
            <div class="plan-type">Premium</div>
            <div class="plan-type">Student Pro</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Audio Generation</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Summary Generation</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Questions per Summary</div>
            <div class="plan-feature">5</div>
            <div class="plan-feature">20+</div>
            <div class="plan-feature">20+</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Simultaneous Generations</div>
            <div class="plan-feature">3</div>
            <div class="plan-feature">Unlimited</div>
            <div class="plan-feature">Unlimited</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Delete to Generate New</div>
            <div class="plan-feature">Required</div>
            <div class="plan-feature">Not Required</div>
            <div class="plan-feature">Not Required</div>
          </div>

          <div class="comparison-row">
            <div class="feature-name">Priority Support</div>
            <div class="plan-feature">-</div>
            <div class="plan-feature">✓</div>
            <div class="plan-feature">✓</div>
          </div>
        </div>
      </div>

      <!-- Payment Methods Info -->
      <div v-if="!locationStore.isLoading" class="payment-methods-info">
        <h3>Available Payment Methods</h3>
        <div class="methods-grid">
          <div v-if="locationStore.isNigeria" class="methods-list">
            <span>📱 Paystack</span>
          </div>
          <div v-else class="methods-list">
            <span>📊 Stripe</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useLocationStore } from '@/stores/locationStore';

const locationStore = useLocationStore();

// Toggle location for testing
const toggleLocation = () => {
  locationStore.setManualLocation(locationStore.isNigeria ? 'US' : 'NG');
};

onMounted(() => {
  locationStore.detectUserLocation();
});
</script>

<style scoped>
.pricing {
  padding: clamp(40px, 8vw, 80px) 0;
  background: #f8f9fa;
  min-height: calc(100vh - clamp(60px, 8vw, 70px));
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 20px);
}

.location-indicator {
  text-align: center;
  margin-bottom: clamp(20px, 4vw, 30px);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(10px, 2.5vw, 15px);
  flex-wrap: wrap;
}

.location-badge {
  background: #27ae60;
  color: white;
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px);
  border-radius: 20px;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  font-weight: 500;
  white-space: nowrap;
}

.location-toggle {
  background: transparent;
  color: #27ae60;
  border: 1px solid #27ae60;
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px);
  border-radius: 20px;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-height: 40px;
}

.location-toggle:hover {
  background: #27ae60;
  color: white;
}

.loading-state {
  text-align: center;
  padding: clamp(40px, 8vw, 60px) 0;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #27ae60;
  border-radius: 50%;
  width: clamp(32px, 8vw, 40px);
  height: clamp(32px, 8vw, 40px);
  animation: spin 1s linear infinite;
  margin: 0 auto clamp(16px, 3vw, 20px);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #5a6c7d;
  font-size: clamp(0.9rem, 3vw, 1rem);
}

.pricing-header {
  text-align: center;
  margin-bottom: clamp(40px, 6vw, 60px);
}

.pricing-header h1 {
  font-size: clamp(2rem, 6vw, 3rem);
  color: #2c3e50;
  margin-bottom: clamp(12px, 3vw, 20px);
  line-height: 1.2;
}

.pricing-header p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: #5a6c7d;
  line-height: 1.4;
  max-width: 600px;
  margin: 0 auto;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: clamp(20px, 4vw, 30px);
  max-width: 1100px;
  margin: 0 auto;
}

.pricing-card {
  background: white;
  padding: clamp(24px, 5vw, 40px) clamp(20px, 4vw, 30px);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 520px;
}

.pricing-card:hover {
  transform: translateY(-5px);
}

.pricing-card.featured {
  border: 2px solid #27ae60;
  transform: scale(1.02);
}

.pricing-card.featured:hover {
  transform: scale(1.02) translateY(-5px);
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #95a5a6;
  color: white;
  padding: clamp(4px, 1vw, 6px) clamp(16px, 3vw, 20px);
  border-radius: 20px;
  font-size: clamp(0.7rem, 2.5vw, 0.8rem);
  font-weight: 600;
  white-space: nowrap;
}

.plan-badge.featured-badge {
  background: #e67e22;
}

.plan-header {
  margin-bottom: clamp(20px, 4vw, 30px);
  margin-top: 10px;
}

.plan-header h3 {
  font-size: clamp(1.3rem, 4vw, 1.5rem);
  color: #2c3e50;
  margin-bottom: clamp(12px, 2.5vw, 15px);
  line-height: 1.2;
}

.price {
  font-size: clamp(2.5rem, 6vw, 3rem);
  font-weight: bold;
  color: #27ae60;
  line-height: 1;
}

.price span {
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  color: #7f8c8d;
  font-weight: normal;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: clamp(20px, 4vw, 30px) 0;
  text-align: left;
  flex-grow: 1;
}

.features-list li {
  padding: clamp(8px, 2vw, 10px) 0;
  color: #5a6c7d;
  border-bottom: 1px solid #ecf0f1;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  line-height: 1.4;
}

.features-list li:last-child {
  border-bottom: none;
}

.features-list li strong {
  color: #2c3e50;
}

.plan-button {
  display: inline-block;
  padding: clamp(12px, 3vw, 14px) clamp(20px, 4vw, 30px);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
  text-align: center;
  margin-top: auto;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-button.primary {
  background: #27ae60;
  color: white;
}

.plan-button.primary:hover {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(39, 174, 96, 0.3);
}

.plan-button.secondary {
  background: transparent;
  color: #27ae60;
  border: 2px solid #27ae60;
}

.plan-button.secondary:hover {
  background: #27ae60;
  color: white;
  transform: translateY(-2px);
}

/* Feature Comparison Table */
.feature-comparison {
  margin-top: clamp(50px, 8vw, 80px);
  text-align: center;
}

.feature-comparison h3 {
  color: #2c3e50;
  margin-bottom: clamp(20px, 4vw, 30px);
  font-size: clamp(1.4rem, 4vw, 1.8rem);
  line-height: 1.2;
}

.comparison-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  max-width: 1000px;
  margin: 0 auto;
}

.comparison-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background: #34495e;
  color: white;
  font-weight: 600;
  padding: clamp(16px, 3vw, 20px);
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
}

.comparison-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: clamp(12px, 2.5vw, 15px) clamp(16px, 3vw, 20px);
  border-bottom: 1px solid #ecf0f1;
  align-items: center;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
}

.comparison-row:last-child {
  border-bottom: none;
}

.comparison-row:nth-child(even) {
  background: #f8f9fa;
}

.feature-name {
  text-align: left;
  font-weight: 500;
  color: #2c3e50;
}

.plan-type, .plan-feature {
  text-align: center;
  color: #5a6c7d;
}

.plan-feature {
  font-weight: 500;
}

.payment-methods-info {
  text-align: center;
  margin-top: clamp(40px, 6vw, 60px);
  padding: clamp(20px, 4vw, 30px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.payment-methods-info h3 {
  color: #2c3e50;
  margin-bottom: clamp(16px, 3vw, 20px);
  font-size: clamp(1.2rem, 4vw, 1.4rem);
  line-height: 1.2;
}

.methods-list {
  display: flex;
  justify-content: center;
  gap: clamp(10px, 2.5vw, 20px);
  flex-wrap: wrap;
}

.methods-list span {
  background: #f8f9fa;
  padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 20px);
  border-radius: 25px;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  color: #5a6c7d;
  border: 1px solid #e9ecef;
  white-space: nowrap;
}

/* Mobile-specific optimizations */
@media (max-width: 768px) {
  .pricing-card.featured {
    transform: none;
    order: -1;
  }

  .pricing-card.featured:hover {
    transform: translateY(-5px);
  }

  .location-indicator {
    flex-direction: column;
    text-align: center;
  }

  .pricing-card {
    min-height: auto;
    padding: 20px 16px;
  }

  .features-list {
    margin: 20px 0;
  }

  .comparison-header,
  .comparison-row {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 12px 10px;
    gap: 8px;
  }

  .feature-name {
    text-align: center;
    font-weight: 600;
    background: #f8f9fa;
    margin: -12px -10px 8px -10px;
    padding: 10px;
    border-bottom: 1px solid #e9ecef;
    font-size: 0.9rem;
  }

  .comparison-row {
    position: relative;
    padding-top: 50px;
  }

  .plan-type {
    font-weight: 600;
    background: #34495e;
    color: white;
    margin: -12px -10px 8px -10px;
    padding: 8px;
    border-radius: 0;
  }

  .comparison-header {
    display: none;
  }
}

/* Small mobile optimizations */
@media (max-width: 480px) {
  .pricing {
    padding: 30px 0;
  }

  .pricing-grid {
    gap: 16px;
  }

  .pricing-card {
    padding: 20px 16px;
    border-radius: 10px;
  }

  .plan-button {
    min-height: 48px;
    font-size: 0.9rem;
  }

  .methods-list {
    gap: 8px;
  }

  .methods-list span {
    padding: 8px 16px;
    font-size: 0.8rem;
  }
}

/* Tablet optimizations */
@media (min-width: 769px) and (max-width: 1024px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .pricing-card.featured {
    grid-column: span 2;
    transform: none;
  }

  .pricing-card.featured:hover {
    transform: translateY(-5px);
  }
}

/* Large desktop enhancements */
@media (min-width: 1200px) {
  .pricing-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .pricing-card.featured {
    transform: scale(1.05);
  }

  .pricing-card.featured:hover {
    transform: scale(1.05) translateY(-5px);
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .pricing-card,
  .plan-button,
  .location-toggle {
    transition: none;
  }

  .pricing-card:hover,
  .pricing-card.featured:hover,
  .plan-button:hover,
  .location-toggle:hover {
    transform: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .pricing {
    background: #1a1a1a;
  }

  .pricing-header h1,
  .feature-comparison h3,
  .payment-methods-info h3,
  .plan-header h3,
  .feature-name {
    color: #ffffff;
  }

  .pricing-header p,
  .features-list li,
  .plan-feature,
  .methods-list span {
    color: #cccccc;
  }

  .pricing-card,
  .comparison-table,
  .payment-methods-info {
    background: #2d2d2d;
    color: #ffffff;
  }

  .features-list li {
    border-bottom-color: #444;
  }

  .features-list li strong {
    color: #ffffff;
  }

  .comparison-row:nth-child(even) {
    background: #3d3d3d;
  }

  .methods-list span {
    background: #3d3d3d;
    border-color: #555;
  }

  .plan-button.secondary {
    border-color: #27ae60;
    color: #27ae60;
  }

  .plan-button.secondary:hover {
    background: #27ae60;
    color: #ffffff;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .pricing-card,
  .comparison-table,
  .payment-methods-info {
    border: 2px solid #000;
  }

  .plan-button {
    border: 2px solid #000;
  }

  .location-badge,
  .plan-badge {
    border: 1px solid #000;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .pricing-card:hover,
  .pricing-card.featured:hover,
  .plan-button:hover,
  .location-toggle:hover {
    transform: none;
  }

  .pricing-card:active,
  .plan-button:active,
  .location-toggle:active {
    transform: scale(0.98);
  }

  .plan-button.primary:active {
    background: #219a52;
  }

  .plan-button.secondary:active {
    background: #27ae60;
    color: white;
  }
}

/* Print styles */
@media print {
  .location-indicator,
  .plan-button,
  .payment-methods-info {
    display: none;
  }

  .pricing-card {
    box-shadow: none;
    border: 1px solid #ddd;
    break-inside: avoid;
  }

  .pricing-card.featured {
    border: 2px solid #27ae60;
  }
}
</style>
