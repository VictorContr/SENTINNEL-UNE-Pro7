// ══════════════════════════════════════════════════════════════════
// periodoStore.js — Store del Periodo Académico Global (Módulo Admin)
// Gestiona GET/PUT del periodo académico mediante la arquitectura
// _sm_vc delegando en adminService.js (Axios API).
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { usePasantiasStore } from './pasantiasStore'
import { 
  obtenerPeriodoActual_sm_vc as getPeriodoApi_sm_vc, 
  actualizarPeriodo_sm_vc as putPeriodoApi_sm_vc 
} from 'src/services/adminService'

export const usePeriodoStore = defineStore('periodo', () => {

  /* ── Estado ── */
  const periodoActual_sm_vc = ref('P-165') // Fallback default
  const fechaInicio_sm_vc   = ref('')   // YYYY/MM
  const fechaCierre_sm_vc   = ref('')   // YYYY/MM
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

  /* ── GET /admin/configuracion/periodo ── */
  const cargarPeriodoActual_sm_vc = async () => {
    loading_sm_vc.value = true
    try {
      const resp_sm_vc = await getPeriodoApi_sm_vc()
      if (resp_sm_vc) {
        periodoActual_sm_vc.value = resp_sm_vc.periodoActual_sm_vc || resp_sm_vc.codigo_sm_vc || periodoActual_sm_vc.value
        fechaInicio_sm_vc.value   = resp_sm_vc.fechaInicio_sm_vc || resp_sm_vc.fecha_inicio_sm_vc || fechaInicio_sm_vc.value
        fechaCierre_sm_vc.value   = resp_sm_vc.fechaCierre_sm_vc || resp_sm_vc.fecha_cierre_sm_vc || fechaCierre_sm_vc.value
      }
    } catch (err_sm_vc) {
      Notify.create({
        type: 'negative',
        message: err_sm_vc.response?.data?.message || err_sm_vc.message || 'No se pudo cargar el periodo académico.',
        position: 'top-right'
      })
    } finally {
      loading_sm_vc.value = false
    }
  }

  /* ── PUT /admin/configuracion/periodo ── */
  const actualizarPeriodo_sm_vc = async ({ fechaInicio, fechaCierre }) => {
    // Validación de presencia
    if (!fechaInicio || !fechaCierre) {
      Notify.create({
        type: 'warning',
        message: 'Debes seleccionar ambas fechas (inicio y cierre).',
        position: 'top-right', icon: 'warning'
      })
      return false
    }

    // Validación de rango
    if (fechaCierre <= fechaInicio) {
      Notify.create({
        type: 'negative',
        message: 'La fecha de cierre debe ser posterior a la de inicio.',
        position: 'top-right', icon: 'error'
      })
      return false
    }

    loading_sm_vc.value = true
    try {
      // DTO que espera el NestJS admin endpoint
      const dto_sm_vc = {
        fecha_inicio_sm_vc: fechaInicio,
        fecha_cierre_sm_vc: fechaCierre
      }
      
      const resp_sm_vc = await putPeriodoApi_sm_vc(dto_sm_vc)

      // Actualizar estado local desde la respuesta real del servidor
      fechaInicio_sm_vc.value = fechaInicio
      fechaCierre_sm_vc.value = fechaCierre
      
      if (resp_sm_vc?.codigo_sm_vc) {
        periodoActual_sm_vc.value = resp_sm_vc.codigo_sm_vc
      } else {
        // Fallback local si la API solo devuelve OK
        const numActual_sm_vc = parseInt(periodoActual_sm_vc.value.replace('P-', ''), 10) || 165
        periodoActual_sm_vc.value = `P-${numActual_sm_vc + 1}`
      }

      // Hook de pasantias
      const pasantias_sm_vc = usePasantiasStore()
      if (pasantias_sm_vc.procesarCambioPeriodo_sm_vc) {
        pasantias_sm_vc.procesarCambioPeriodo_sm_vc(periodoActual_sm_vc.value)
      }

      Notify.create({
        type: 'positive',
        message: `Periodo actualizado correctamente`,
        caption: `${formatearMes_sm_vc(fechaInicio)} → ${formatearMes_sm_vc(fechaCierre)}`,
        icon: 'calendar_today',
        position: 'top-right',
        timeout: 4000
      })
      return true
    } catch (err_sm_vc) {
      Notify.create({
        type: 'negative',
        message: err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al actualizar el periodo académico.',
        position: 'top-right'
      })
      return false
    } finally {
      loading_sm_vc.value = false
    }
  }

  /* ── Utilidad interna ── */
  const formatearMes_sm_vc = (valor_sm_vc) => {
    if (!valor_sm_vc) return ''
    const [anio_sm_vc, mes_sm_vc] = valor_sm_vc.split('/')
    const fecha_sm_vc = new Date(Number(anio_sm_vc), Number(mes_sm_vc) - 1, 1)
    const mes_str_sm_vc = fecha_sm_vc.toLocaleDateString('es-ES', { month: 'long' })
    const mesCap_sm_vc = mes_str_sm_vc.charAt(0).toUpperCase() + mes_str_sm_vc.slice(1)
    return `${mesCap_sm_vc} ${anio_sm_vc}`
  }

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