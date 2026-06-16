import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/UserProfile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/LoginForm.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/components/RegisterForm.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: () => import('@/views/PricingView.vue'),
  },
  {
    path: '/password-reset',
    name: 'PasswordResetRequest',
    component: () => import('@/components/PasswordResetRequest.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/reset-password/confirm/:uid/:token',
    name: 'PasswordResetConfirmNew',
    component: () => import('@/components/PasswordResetConfirm.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/password-reset/confirm/:uid/:token',
    name: 'PasswordResetConfirm',
    component: () => import('@/components/PasswordResetConfirm.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/verify-email-prompt',
    name: 'EmailVerificationPrompt',
    component: () => import('@/components/EmailVerificationPrompt.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/registration/account-confirm-email/:key',
    name: 'EmailVerification',
    component: () => import('@/components/EmailVerification.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/resend-verification',
    name: 'ResendVerification',
    component: () => import('@/components/EmailVerificationPrompt.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/upload',
    name: 'FileUpload',
    component: () => import('@/components/FileUpload.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/documents',
    name: 'Documents',
    component: () => import('@/views/Documents.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/quiz/:id',
    name: 'Quiz',
    component: () => import('@/views/Quiz.vue'),
  },
  {
    path: '/flashcards/:id',
    name: 'Flashcards',
    component: () => import('@/views/FlashcardsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: () => import('@/views/PaymentSuccess.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/browse',
    name: 'Browse',
    component: () => import('@/views/BrowseDocumentsView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Redirect any route attempt to the hiatus (home) page
router.beforeEach((to, from, next) => {
  if (to.path !== '/') {
    next('/')
  } else {
    next()
  }
})

export default router

