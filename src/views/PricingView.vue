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
  padding: 80px 0;
  background: #f8f9fa;
  min-height: calc(100vh - 70px);
}

.location-indicator {
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.location-badge {
  background: #27ae60;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.location-toggle {
  background: transparent;
  color: #27ae60;
  border: 1px solid #27ae60;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.location-toggle:hover {
  background: #27ae60;
  color: white;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #27ae60;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pricing-header {
  text-align: center;
  margin-bottom: 60px;
}

.pricing-header h1 {
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.pricing-header p {
  font-size: 1.2rem;
  color: #5a6c7d;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  max-width: 1100px;
  margin: 0 auto;
}

.pricing-card {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease;
  position: relative;
}

.pricing-card:hover {
  transform: translateY(-5px);
}

.pricing-card.featured {
  border: 2px solid #27ae60;
  transform: scale(1.05);
}

.pricing-card.featured:hover {
  transform: scale(1.05) translateY(-5px);
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #95a5a6;
  color: white;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.plan-badge.featured-badge {
  background: #e67e22;
}

.plan-header {
  margin-bottom: 30px;
  margin-top: 10px;
}

.plan-header h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.price {
  font-size: 3rem;
  font-weight: bold;
  color: #27ae60;
}

.price span {
  font-size: 1rem;
  color: #7f8c8d;
  font-weight: normal;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 30px 0;
  text-align: left;
}

.features-list li {
  padding: 10px 0;
  color: #5a6c7d;
  border-bottom: 1px solid #ecf0f1;
}

.features-list li:last-child {
  border-bottom: none;
}

.features-list li strong {
  color: #2c3e50;
}

.plan-button {
  display: inline-block;
  padding: 12px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
  text-align: center;
  margin-top: 10px;
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
  margin-top: 80px;
  text-align: center;
}

.feature-comparison h3 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 1.8rem;
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
  padding: 20px;
}

.comparison-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 15px 20px;
  border-bottom: 1px solid #ecf0f1;
  align-items: center;
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
  margin-top: 60px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.payment-methods-info h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.methods-list {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.methods-list span {
  background: #f8f9fa;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 0.9rem;
  color: #5a6c7d;
  border: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .pricing-card.featured {
    transform: none;
  }

  .pricing-card.featured:hover {
    transform: translateY(-5px);
  }

  .location-indicator {
    flex-direction: column;
  }

  .methods-list {
    gap: 10px;
  }

  .methods-list span {
    font-size: 0.8rem;
    padding: 8px 16px;
  }

  .comparison-header,
  .comparison-row {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 15px 10px;
  }

  .feature-name {
    text-align: center;
    font-weight: 600;
    background: #f8f9fa;
    margin: -15px -10px 10px -10px;
    padding: 10px;
  }

  .comparison-row {
    position: relative;
    padding-top: 50px;
  }
}
</style>
