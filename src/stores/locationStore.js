import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLocationStore = defineStore('location', () => {
  const userCountry = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const isNigeria = ref(false);

  async function detectUserLocation() {
    isLoading.value = true;
    error.value = null;

    try {
      // Using ipapi.co (free tier)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      userCountry.value = data.country_code;
      isNigeria.value = data.country_code === 'NG';
    } catch (err) {
      console.error('Location detection failed:', err);
      // Fallback to international
      userCountry.value = 'US';
      isNigeria.value = false;
    } finally {
      isLoading.value = false;
    }
  }

  function setManualLocation(countryCode) {
    userCountry.value = countryCode;
    isNigeria.value = countryCode === 'NG';
  }

  return {
    userCountry,
    isLoading,
    error,
    isNigeria,
    detectUserLocation,
    setManualLocation
  };
});
