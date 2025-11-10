import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/LoginForm.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/components/RegisterForm.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: () => import('@/views/PricingView.vue')
  },
  {
    path: '/password-reset',
    name: 'PasswordResetRequest',
    component: () => import('@/components/PasswordResetRequest.vue'),
    meta: { requiresGuest: true }
  },
   {
    path: '/reset-password/confirm/:uid/:token',
    name: 'PasswordResetConfirmNew',
    component: () => import('@/components/PasswordResetConfirm.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/password-reset/confirm/:uid/:token',
    name: 'PasswordResetConfirm',
    component: () => import('@/components/PasswordResetConfirm.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/verify-email-prompt',
    name: 'EmailVerificationPrompt',
    component: () => import('@/components/EmailVerificationPrompt.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/registration/account-confirm-email/:key',
    name: 'EmailVerification',
    component: () => import('@/components/EmailVerification.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/resend-verification',
    name: 'ResendVerification',
    component: () => import('@/components/EmailVerificationPrompt.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/upload',
    name: 'FileUpload',
    component: () => import('@/components/FileUpload.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: () => import('@/views/Documents.vue'),
    meta: { requiresAuth: true }
  },
  {
  path: '/quiz/:id',
  name: 'Quiz',
  component: () => import('@/views/Quiz.vue')
}
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // List of routes that require authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // List of public routes (login, register, etc.)
  const publicRoutes = ['/login', '/register', '/password-reset', '/verify-email-prompt']
  const isPublicRoute = publicRoutes.includes(to.path)

  if (requiresAuth && !authStore.isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to login
    next('/login')
  } else if (isPublicRoute && authStore.isAuthenticated) {
    // If user is authenticated and tries to access login/register, redirect to home
    next('/')
  } else {
    // Otherwise, proceed as normal
    next()
  }
})


