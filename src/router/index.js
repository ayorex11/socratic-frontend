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
  history: createWebHistory(),
  routes
})

// Add navigation guard to protect authenticated routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check token validity on every route change for authenticated users
  if (authStore.isAuthenticated) {
    const isValid = authStore.checkTokenValidity()
    if (!isValid) {
      next('/login?session_expired=true')
      return
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect to dashboard if trying to access login/register while authenticated
    next('/dashboard')
  } else if (to.path === '/' && authStore.isAuthenticated) {
    // Redirect authenticated users from home to dashboard
    next('/dashboard')
  } else {
    next()
  }
})

export default router
