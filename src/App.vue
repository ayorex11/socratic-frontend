<template>
  <Layout />
</template>

<script setup>
import Layout from './components/Layout.vue'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

// Initialize auth when app starts
onMounted(() => {
  authStore.initializeAuth()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f8f9fa;
}
</style>
