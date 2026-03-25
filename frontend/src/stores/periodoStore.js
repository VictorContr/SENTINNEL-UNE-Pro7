// ══════════════════════════════════════════════════════════════════
// periodoStore.js — Store Mock-First del Periodo Académico Global
// Extendido para manejar fechaInicio y fechaCierre del periodo.
// Mantiene compatibilidad con periodoFormateado_sm_vc().
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { usePasantiasStore } from './pasantiasStore'

const DELAY_MOCK_sm_vc = 800

const simularDelay_sm_vc = () =>
  new Promise((r) => setTimeout(r, DELAY_MOCK_sm_vc))

export const usePeriodoStore = defineStore('periodo', () => {
  const $q_sm_vc = useQuasar()

  /* ── Estado ── */
  const periodoActual_sm_vc = ref('P-165')
  const fechaInicio_sm_vc   = ref('')   // formato YYYY/MM
  const fechaCierre_sm_vc   = ref('')   // formato YYYY/MM
  const loading_sm_vc       = ref(false)

  /* ── Formatea el periodo actual para visualización ── */
  const periodoFormateado_sm_vc = () => {
    const base_sm_vc = periodoActual_sm_vc.value.replace('P-', 'Periodo ')
    if (fechaInicio_sm_vc.value && fechaCierre_sm_vc.value) {
      const anio_sm_vc = fechaInicio_sm_vc.value.split('/')[0]
      const mesInicio_sm_vc = formatearMesSolo_sm_vc(fechaInicio_sm_vc.value)
      const mesCierre_sm_vc = formatearMesSolo_sm_vc(fechaCierre_sm_vc.value)
      return `${base_sm_vc} (de ${mesInicio_sm_vc} a ${mesCierre_sm_vc} ${anio_sm_vc})`
    }
    return base_sm_vc
  }

  /* ── Simula GET /api/admin/configuracion/periodo ── */
  const cargarPeriodoActual_sm_vc = async () => {
    loading_sm_vc.value = true
    try {
      await simularDelay_sm_vc()
      // Mock: los valores ya están inicializados en los refs
    } catch {
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
  // Acepta un objeto { fechaInicio: 'YYYY/MM', fechaCierre: 'YYYY/MM' }
  const actualizarPeriodo_sm_vc = async ({ fechaInicio, fechaCierre }) => {
    // Validación de presencia
    if (!fechaInicio || !fechaCierre) {
      $q_sm_vc.notify({
        type: 'warning',
        message: 'Debes seleccionar ambas fechas (inicio y cierre).',
        position: 'top-right', icon: 'warning'
      })
      return false
    }

    // Validación de rango: cierre debe ser estrictamente posterior al inicio
    if (fechaCierre <= fechaInicio) {
      $q_sm_vc.notify({
        type: 'negative',
        message: 'La fecha de cierre debe ser posterior a la de inicio.',
        position: 'top-right', icon: 'error'
      })
      return false
    }

    loading_sm_vc.value = true
    try {
      await simularDelay_sm_vc()

      // Actualizar estado del store
      fechaInicio_sm_vc.value = fechaInicio
      fechaCierre_sm_vc.value = fechaCierre

      // Generar código de periodo incrementándolo en +1 (Mock)
      // Ej: P-165 → P-166 (lógica real sería asíncrona del backend)
      const numActual_sm_vc = parseInt(periodoActual_sm_vc.value.replace('P-', ''), 10) || 165
      periodoActual_sm_vc.value = `P-${numActual_sm_vc + 1}`

      // Conectar con pasantiasStore para reprobar los incompletos
      const pasantias_sm_vc = usePasantiasStore()
      pasantias_sm_vc.procesarCambioPeriodo_sm_vc(periodoActual_sm_vc.value)

      $q_sm_vc.notify({
        type: 'positive',
        message: `Periodo actualizado correctamente`,
        caption: `${formatearMes_sm_vc(fechaInicio)} → ${formatearMes_sm_vc(fechaCierre)}`,
        icon: 'calendar_today',
        position: 'top-right',
        timeout: 4000
      })
      return true
    } catch {
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

  /* ── Utilidad interna: formatea YYYY/MM → "Mes YYYY" ── */
  const formatearMes_sm_vc = (valor_sm_vc) => {
    if (!valor_sm_vc) return ''
    const [anio_sm_vc, mes_sm_vc] = valor_sm_vc.split('/')
    const fecha_sm_vc = new Date(Number(anio_sm_vc), Number(mes_sm_vc) - 1, 1)
    const mes_str_sm_vc = fecha_sm_vc.toLocaleDateString('es-ES', { month: 'long' })
    const mesCap_sm_vc = mes_str_sm_vc.charAt(0).toUpperCase() + mes_str_sm_vc.slice(1)
    return `${mesCap_sm_vc} ${anio_sm_vc}`
  }

  /* ── Utilidad interna: formatea YYYY/MM → "Mes" capitalizado ── */
  const formatearMesSolo_sm_vc = (valor_sm_vc) => {
    if (!valor_sm_vc) return ''
    const [anio_sm_vc, mes_sm_vc] = valor_sm_vc.split('/')
    const fecha_sm_vc = new Date(Number(anio_sm_vc), Number(mes_sm_vc) - 1, 1)
    const mes_str_sm_vc = fecha_sm_vc.toLocaleDateString('es-ES', { month: 'long' })
    return mes_str_sm_vc.charAt(0).toUpperCase() + mes_str_sm_vc.slice(1)
  }

  return {
    periodoActual_sm_vc,
    fechaInicio_sm_vc,
    fechaCierre_sm_vc,
    loading_sm_vc,
    periodoFormateado_sm_vc,
    cargarPeriodoActual_sm_vc,
    actualizarPeriodo_sm_vc
  }
})