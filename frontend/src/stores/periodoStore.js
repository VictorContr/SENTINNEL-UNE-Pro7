// ══════════════════════════════════════════════════════════════════
// periodoStore.js — Store Mock-First del Periodo Académico Global
// Elimina Axios real y simula latencia de red con Promesas + delay.
// Gestiona el estado reactivo del periodo activo para toda la SPA.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const DELAY_MOCK_sm_vc = 800

const simularDelay_sm_vc = () =>
  new Promise((r) => setTimeout(r, DELAY_MOCK_sm_vc))

export const usePeriodoStore = defineStore('periodo', () => {
  const $q_sm_vc = useQuasar()

  const periodoActual_sm_vc = ref('P-165')
  const loading_sm_vc = ref(false)

  /* ── Formatea el periodo para visualización ── */
  const periodoFormateado_sm_vc = () =>
    periodoActual_sm_vc.value.replace('P-', 'Periodo ')

  /* ── Simula GET /api/admin/configuracion/periodo ── */
  const cargarPeriodoActual_sm_vc = async () => {
    loading_sm_vc.value = true
    try {
      await simularDelay_sm_vc()
      // Mock: el valor ya está inicializado en el ref, no hay nada que cargar
    } catch (err_sm_vc) {
      $q_sm_vc.notify({
        type: 'negative',
        message: 'No se pudo cargar el periodo académico.',
        position: 'top-right'
      })
    } finally {
      loading_sm_vc.value = false
    }
  }

  /* ── Simula PUT /api/admin/configuracion/periodo ── */
  const actualizarPeriodo_sm_vc = async (nuevo_sm_vc) => {
    if (!nuevo_sm_vc || nuevo_sm_vc.length < 4) {
      $q_sm_vc.notify({
        type: 'warning',
        message: 'El periodo debe tener al menos 4 caracteres.',
        position: 'top-right'
      })
      return false
    }

    if (!/^P-\d+$/.test(nuevo_sm_vc)) {
      $q_sm_vc.notify({
        type: 'warning',
        message: 'Formato inválido. Usa el patrón P-XXX (ej: P-166).',
        position: 'top-right'
      })
      return false
    }

    loading_sm_vc.value = true
    try {
      await simularDelay_sm_vc()
      periodoActual_sm_vc.value = nuevo_sm_vc
      $q_sm_vc.notify({
        type: 'positive',
        message: `Periodo actualizado a: ${periodoFormateado_sm_vc()}`,
        icon: 'calendar_today',
        position: 'top-right',
        timeout: 3500
      })
      return true
    } catch (err_sm_vc) {
      $q_sm_vc.notify({
        type: 'negative',
        message: 'Error al actualizar el periodo académico.',
        position: 'top-right'
      })
      return false
    } finally {
      loading_sm_vc.value = false
    }
  }

  return {
    periodoActual_sm_vc,
    loading_sm_vc,
    periodoFormateado_sm_vc,
    cargarPeriodoActual_sm_vc,
    actualizarPeriodo_sm_vc
  }
})