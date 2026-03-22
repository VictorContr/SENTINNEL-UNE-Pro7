import { defineStore } from '#q-app/wrappers'
import { createPinia } from 'pinia'

/**
 * SENTINNEL — Pinia Store Setup
 * Archivo requerido por Quasar CLI para registrar Pinia automáticamente.
 * Referenciado en quasar.config.js > sourceFiles > store
 */
export default defineStore((/* { ssrContext } */) => {
  const pinia_sm_vc = createPinia()
  return pinia_sm_vc
})
