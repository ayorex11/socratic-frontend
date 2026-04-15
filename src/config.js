/**
 * Centralized API configuration.
 *
 * In production, requests go to api.socraseek.com (same registrable domain
 * as the frontend at socraseek.com), which ensures cookies work in Safari.
 * In development, the Vite proxy rewrites /api → the backend.
 */
export const API_BASE = import.meta.env.DEV
  ? '/api'  // Routes through Vite proxy → backend
  : 'https://api.socraseek.com'
