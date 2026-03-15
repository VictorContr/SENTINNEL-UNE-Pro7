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
  // Reservado para interceptores futuros (JWT header injection, etc.)
})

export { api }
