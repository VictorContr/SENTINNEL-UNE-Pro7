import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

/**
 * SENTINNEL — Axios Boot
 * Composition API only: import { api } from 'src/boot/axios' en stores/composables.
 * NO se inyecta en globalProperties (Options API prohibida).
 */
const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000/api'
})

import { LocalStorage } from 'quasar'

export default defineBoot(() => {
  // Integramos el interceptor para agregar el token JWT a todas las peticiones
  api.interceptors.request.use(
    (config_sm_vc) => {
      const token_sm_vc = LocalStorage.getItem('token_sm_vc')
      if (token_sm_vc) {
        config_sm_vc.headers.Authorization = `Bearer ${token_sm_vc}`
      }
      return config_sm_vc
    },
    (error_sm_vc) => {
      return Promise.reject(error_sm_vc)
    }
  )

  // Manejo centralizado de errores de respuesta (especialmente 401 Unauthorized)
  api.interceptors.response.use(
    (response_sm_vc) => response_sm_vc,
    async (error_sm_vc) => {
      if (error_sm_vc.response?.status === 401) {
        // Token expirado o inválido: limpiamos sesión y forzamos recarga/re-login
        LocalStorage.remove('sentinnel_session')
        LocalStorage.remove('token_sm_vc')
        // No redirigimos aquí directamente para evitar bucles, el RouterGuard se encargará
        // pero podemos emitir un evento o simplemente dejar que la app falle y pida login.
      }
      return Promise.reject(error_sm_vc)
    }
  )
})

export { api }
