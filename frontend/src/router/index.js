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
      if (auth.is_authenticated_sm_vc && (to.name === 'login' || to.name === 'landing')) {
        return { name: 'notificaciones' }
      }
      return true
    }

    // Ruta privada: no autenticado → login
    if (!auth.is_authenticated_sm_vc) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    // Verificar roles requeridos
    const requiredRoles = to.meta.roles ?? []
    const roleMap = { 'ADMINISTRADOR': 'ADMIN' }
    if (requiredRoles.length > 0) {
      const userRole = auth.user_sm_vc?.rol_sm_vc
      const matches = requiredRoles.some(r => r === userRole || roleMap[r] === userRole || r === roleMap[userRole])
      if (!matches) {
        // Redirigir a notificaciones si no tiene el rol
        return { name: 'notificaciones' }
      }
    }

    return true
  })

  return Router
})
