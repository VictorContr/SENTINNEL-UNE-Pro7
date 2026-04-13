import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { LocalStorage } from 'quasar'

/**
 * SENTINNEL — Axios Boot
 * Composition API only: import { api } from 'src/boot/axios' en stores/composables.
 */
const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000/api',
})

export default defineBoot(({ router: router_sm_vc }) => {
  // ── Interceptor de REQUEST: inyectar JWT en cada petición ──────
  api.interceptors.request.use(
    (config_sm_vc) => {
      const token_sm_vc = LocalStorage.getItem('token_sm_vc')
      if (token_sm_vc) {
        config_sm_vc.headers.Authorization = `Bearer ${token_sm_vc}`
      }
      return config_sm_vc
    },
    (error_sm_vc) => Promise.reject(error_sm_vc),
  )

  // ── Interceptor de RESPONSE: manejo centralizado de errores ───
  api.interceptors.response.use(
    (response_sm_vc) => response_sm_vc,
    (error_sm_vc) => {
      const status_sm_vc = error_sm_vc.response?.status

      // ── FIX #5 + #8: 401 Unauthorized ─────────────────────────
      //
      // Causas posibles:
      //   a) Token expirado durante un upload largo
      //   b) Token inválido o manipulado
      //   c) Sesión revocada por el administrador
      //
      // Acción: Invocamos logout_sm_vc de manera global.
      if (status_sm_vc === 401) {
        
        // Obtenemos el AuthStore inyectado por Pinia importando su store dinamicamente.
        // ES Module dinámico evita problemas de dependencia circular.
        import('src/stores/authStore').then(({ useAuthStore }) => {
            const authStore_sm_vc = useAuthStore()
            
            // Evitamos llamar a logout si ya estamos en /login o no hay sesión
            const sesionActiva_sm_vc = LocalStorage.getItem('sentinnel_session')

            if (sesionActiva_sm_vc) {
              authStore_sm_vc.logout_sm_vc('expirado')

              // Redirección SPA limpia a login
              if (router_sm_vc) {
                  router_sm_vc.push({ name: 'login' })
              } else {
                  window.location.hash = '#/login' 
              }
            }
        })
      }

      return Promise.reject(error_sm_vc)
    },
  )
})

export { api }