import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'

/**
 * SENTINNEL – Router
 * Rutas protegidas por meta-tags de rol.
 * roles: [] vacío = cualquier usuario autenticado puede acceder.
 */
const routes = [
  /* ────────────────── PÚBLICA ────────────────── */
  {
    path: '/login',
    name: 'login',
    component: () => import('src/pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },

  /* ────────────────── PRIVADAS ────────────────── */
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [

      /* ── GLOBAL (todos los roles) ── */
      {
        path: '',
        redirect: '/notificaciones'
      },
      {
        path: 'notificaciones',
        name: 'notificaciones',
        component: () => import('src/pages/NotificacionesPage.vue'),
        meta: { requiresAuth: true, roles: [] }
      },

      /* ── ADMINISTRADOR ── */
      {
        path: 'admin/usuarios',
        name: 'admin-usuarios',
        component: () => import('src/pages/admin/UsuariosPage.vue'),
        meta: { requiresAuth: true, roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/carga-masiva',
        name: 'admin-carga-masiva',
        component: () => import('src/pages/admin/CargaMasivaPage.vue'),
        meta: { requiresAuth: true, roles: ['ADMINISTRADOR'] }
      },

      /* ── PROFESOR ── */
      {
        path: 'profesor/estudiantes',
        name: 'profesor-estudiantes',
        component: () => import('src/pages/profesor/EstudiantesPage.vue'),
        meta: { requiresAuth: true, roles: ['PROFESOR'] }
      },
      {
        path: 'profesor/estudiantes/:id_sm_vc/trazabilidad',
        name: 'profesor-trazabilidad',
        component: () => import('src/pages/profesor/TrazabilidadPage.vue'),
        meta: { requiresAuth: true, roles: ['PROFESOR'] }
      },
      {
        path: 'profesor/estudiantes/:id_sm_vc/materia/:materia_id/conversacion',
        name: 'profesor-conversacion',
        component: () => import('src/pages/profesor/ConversacionPage.vue'),
        meta: { requiresAuth: true, roles: ['PROFESOR'] }
      },
      {
        path: 'profesor/estudiantes/:id_sm_vc/deploy',
        name: 'profesor-deploy',
        component: () => import('src/pages/profesor/DeployPage.vue'),
        meta: { requiresAuth: true, roles: ['PROFESOR'] }
      },

      /* ── ESTUDIANTE ── */
      {
        path: 'estudiante/trazabilidad',
        name: 'estudiante-trazabilidad',
        component: () => import('src/pages/estudiante/TrazabilidadPage.vue'),
        meta: { requiresAuth: true, roles: ['ESTUDIANTE'] }
      },
      {
        path: 'estudiante/materia/:materia_id/historial',
        name: 'estudiante-historial',
        component: () => import('src/pages/estudiante/HistorialPage.vue'),
        meta: { requiresAuth: true, roles: ['ESTUDIANTE'] }
      },
      {
        path: 'estudiante/deploy',
        name: 'estudiante-deploy',
        component: () => import('src/pages/estudiante/DeployPage.vue'),
        meta: { requiresAuth: true, roles: ['ESTUDIANTE'] }
      }
    ]
  },

  /* ── 404 catch-all ── */
  {
    path: '/:catchAll(.*)*',
    redirect: '/notificaciones'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

/* ──────────────── NAVIGATION GUARD ──────────────── */
router.beforeEach((to) => {
  const auth = useAuthStore()

  // Ruta pública: si ya está autenticado, redirigir al dashboard
  if (!to.meta.requiresAuth) {
    if (auth.isAuthenticated && to.name === 'login') {
      return { name: 'notificaciones' }
    }
    return true
  }

  // Ruta privada: no autenticado → login
  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Verificar roles requeridos
  const requiredRoles = to.meta.roles ?? []
  if (requiredRoles.length > 0 && !requiredRoles.includes(auth.user?.rol_sm_vc)) {
    // Redirigir a notificaciones si no tiene el rol
    return { name: 'notificaciones' }
  }

  return true
})

export default router
