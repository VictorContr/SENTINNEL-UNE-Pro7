import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import routes from './routes'

/*
 * SENTINNEL - Router
 * Las rutas se importan desde './routes.js'.
 * El wrapper 'route' permite integrarse correctamente con el ecosistema híbrido/SSR de Quasar.
 */
export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    
    // Dejar esto como está y en su lugar hacer cambios en quasar.config.js
    // quasar.config.js -> build -> vueRouterMode
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  /* ──────────────── NAVIGATION GUARD ──────────────── */
  Router.beforeEach((to) => {
    const auth = useAuthStore()

    // Ruta pública: si ya está autenticado, redirigir a dashboard (notificaciones)
    if (!to.meta.requiresAuth) {
      if (auth.isAuthenticated && (to.name === 'login' || to.name === 'landing')) {
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

  return Router
})
