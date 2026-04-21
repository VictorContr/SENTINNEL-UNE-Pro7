import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import { Notify } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import routes from './routes'

/**
 * SENTINNEL — Router
 *
 * Navigation Guard (beforeEach) verifica en orden:
 *   1. Ruta pública → redirigir al dashboard si ya está autenticado
 *   2. Ruta privada → redirigir a /login si no está autenticado
 *   3. Roles requeridos → redirigir a /notificaciones si el rol no coincide
 *   4. FIX #3: requiresDeploy → redirigir a /trazabilidad si no tiene el flag
 */
export default route(function () {
  const createHistory_sm_vc = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory_sm_vc(process.env.VUE_ROUTER_BASE),
  })

  /* ── Navigation Guard ──────────────────────────────────────── */
  Router.beforeEach(async (to_sm_vc) => {
    const auth_sm_vc = useAuthStore()

    // ── Paso 0: Esperar hidratación ───────────────────────────
    await auth_sm_vc._hydratePromise

    // ── Paso 1: Ruta pública ──────────────────────────────────
    if (!to_sm_vc.meta.requiresAuth) {
      // Si ya tiene sesión activa y va al login o a la landing,
      // redirigir al dashboard principal para no mostrar el login.
      if (
        auth_sm_vc.is_authenticated_sm_vc &&
        (to_sm_vc.name === 'login' || to_sm_vc.name === 'landing')
      ) {
        return { name: 'notificaciones' }
      }
      return true
    }

    // ── Paso 2: Ruta privada — verificar autenticación ────────
    if (!auth_sm_vc.is_authenticated_sm_vc) {
      return { name: 'login', query: { redirect: to_sm_vc.fullPath } }
    }

    // ── Paso 2.5: Verificación Proactiva de Expiración de JWT ──
    if (auth_sm_vc.verificarExpiracion_sm_vc()) {
      auth_sm_vc.logout_sm_vc('expirado')
      return { name: 'login' }
    }

    // ── Paso 3: Verificar roles requeridos ────────────────────
    const rolesRequeridos_sm_vc = to_sm_vc.meta.roles ?? []

    if (rolesRequeridos_sm_vc.length > 0) {
      const rolUsuario_sm_vc = auth_sm_vc.user_sm_vc?.rol_sm_vc

      // Mapa de equivalencias: el guard acepta tanto 'ADMIN' como 'ADMINISTRADOR'
      // para compatibilidad entre el enum de Prisma y datos legacy.
      const mapaEquivalencias_sm_vc = { ADMINISTRADOR: 'ADMIN', ADMIN: 'ADMINISTRADOR' }

      const tieneRol_sm_vc = rolesRequeridos_sm_vc.some(
        (r_sm_vc) =>
          r_sm_vc === rolUsuario_sm_vc ||
          mapaEquivalencias_sm_vc[r_sm_vc] === rolUsuario_sm_vc,
      )

      if (!tieneRol_sm_vc) {
        // El usuario está autenticado pero no tiene el rol correcto
        return { name: 'notificaciones' }
      }
    }

    // ── Paso 4: FIX #3 — Verificar flag de deploy ─────────────
    //
    // La ruta /estudiante/deploy tiene meta.requiresDeploy = true.
    // Solo se permite el acceso si el backend ha confirmado que el
    // estudiante aprobó todos los requisitos de las 4 materias
    // (campo puede_hacer_deploy_sm_vc en el perfil del estudiante).
    //
    // Sin este guard, un estudiante inelegible podía escribir la URL
    // manualmente en el navegador y ver el formulario de deploy,
    // aunque el submit fuera rechazado por el backend (mala UX).
    if (to_sm_vc.meta.requiresDeploy === true) {
      if (!auth_sm_vc.puede_hacer_deploy_sm_vc) {
        Notify.create({
          type:     'warning',
          message:  'Módulo de Deploy no disponible',
          caption:  'Debes aprobar todos los requisitos académicos para acceder a esta sección.',
          icon:     'lock',
          position: 'top',
          timeout:  4000,
        })
        return { name: 'estudiante-trazabilidad' }
      }
    }

    // ── Todos los checks pasaron ──────────────────────────────
    return true
  })

  return Router
})