import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { LocalStorage, Notify } from 'quasar'

/**
 * SENTINNEL — Axios Boot
 * Composition API only: import { api } from 'src/boot/axios' en stores/composables.
 */
const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:4000/api',
})

export default defineBoot(() => {
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
      // Acción:
      //   1. Limpiar localStorage
      //   2. Mostrar notificación descriptiva al usuario
      //   3. Redirigir a /login con window.location (reset limpio de Pinia)
      //
      // ⚠️  NO usamos el Router de Vue directamente para evitar
      //     la dependencia circular boot ↔ router. window.location
      //     garantiza un reset completo del estado de Pinia también.
      if (status_sm_vc === 401) {
        // Solo actuar si había una sesión activa (evitar loops en /login)
        const sesionActiva_sm_vc = LocalStorage.getItem('sentinnel_session')

        if (sesionActiva_sm_vc) {
          LocalStorage.remove('sentinnel_session')
          LocalStorage.remove('token_sm_vc')

          Notify.create({
            type:     'warning',
            message:  'Tu sesión ha expirado.',
            caption:  'Por razones de seguridad vuelve a iniciar sesión.',
            icon:     'lock_clock',
            position: 'top',
            timeout:  3500,
          })

          // Pequeño delay para que la notificación sea visible antes del redirect
          setTimeout(() => {
            window.location.href = '/#/login'
          }, 800)
        }
      }

      return Promise.reject(error_sm_vc)
    },
  )
})

export { api }