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

export default defineBoot(() => {
  // Integramos el interceptor para agregar el token JWT a todas las peticiones
  api.interceptors.request.use(
    (config_sm_vc) => {
      const token_sm_vc = localStorage.getItem('token_sm_vc')
      if (token_sm_vc) {
        config_sm_vc.headers.Authorization = `Bearer ${token_sm_vc}`
      }
      return config_sm_vc
    },
    (error_sm_vc) => {
      return Promise.reject(error_sm_vc)
    }
  )
})

export { api }
