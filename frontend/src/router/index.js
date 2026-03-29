import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory
} from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import routes from './routes'

/*
 * SENTINNEL — Router
 * Guard global: usa isAuthenticated_sm_vc y user_sm_vc de la API corregida.
 * Navegación vía router.push() — jamás window.location.href.
 */
export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  /* Guard global — verifica autenticación y roles */
  Router.beforeEach((to_sm_vc) => {
    const auth_sm_vc = useAuthStore()

    /* Ruta pública: si ya está autenticado, redirige al dashboard */
    if (!to_sm_vc.meta.requiresAuth) {
      if (
        auth_sm_vc.isAuthenticated_sm_vc &&
        (to_sm_vc.name === 'login' || to_sm_vc.name === 'landing')
      ) {
        return { name: 'notificaciones' }
      }
      return true
    }

    /* Ruta privada sin sesión → login */
    if (!auth_sm_vc.isAuthenticated_sm_vc) {
      return { name: 'login', query: { redirect: to_sm_vc.fullPath } }
    }

    /* Verificación de roles requeridos */
    const rolesRequeridos_sm_vc = to_sm_vc.meta.roles ?? []
    if (
      rolesRequeridos_sm_vc.length > 0 &&
      !rolesRequeridos_sm_vc.includes(auth_sm_vc.user_sm_vc?.rol_sm_vc)
    ) {
      return { name: 'notificaciones' }
    }

    return true
  })

  return Router
})