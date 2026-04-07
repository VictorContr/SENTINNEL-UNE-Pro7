// ══════════════════════════════════════════════════════════════════
// conversacionStore.js — Store de Conversaciones y Trazabilidad
// Consume el endpoint /conversaciones/:estudianteId que retorna
// { id_sm_vc, estudiante_id_sm_vc, mensajes_sm_vc: [...] }.
// Extrae el array mensajes_sm_vc como dicta el claude.md del módulo.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { getConversacionesByEstudianteId_sm_vc } from 'src/services/conversacionesService'

export const useConversacionStore_sm_vc = defineStore('conversacion', () => {
  /* ── State ── */
  const conversaciones_sm_vc = ref([])
  const cargando_sm_vc       = ref(false)
  const error_sm_vc          = ref(null)

  /* ── Actions ── */

  /**
   * Obtiene el historial de trazabilidad de un estudiante.
   * El backend retorna { id_sm_vc, estudiante_id_sm_vc, mensajes_sm_vc: [...] }.
   * FIX: se extrae data.mensajes_sm_vc || [] en vez de asignar el objeto completo.
   *
   * @param {number|string} estudianteId_sm_vc
   * @returns {Promise<Array|null>}
   */
  const obtenerConversacion_sm_vc = async (estudianteId_sm_vc) => {
    if (!estudianteId_sm_vc) return null

    cargando_sm_vc.value = true
    error_sm_vc.value    = null

    try {
      const data = await getConversacionesByEstudianteId_sm_vc(estudianteId_sm_vc)

      // ── FIX: el contrato del backend entrega mensajes_sm_vc anidados ──
      // Antes: conversaciones_sm_vc.value = data  ← asignaba el objeto padre
      // Ahora: extraemos el array para que ConvTimeline lo itere correctamente
      conversaciones_sm_vc.value = data.mensajes_sm_vc || []

      return conversaciones_sm_vc.value
    } catch (err_sm_vc) {
      const mensaje_sm_vc =
        err_sm_vc.response?.data?.message ||
        err_sm_vc?.message ||
        'Error al cargar la trazabilidad.'

      error_sm_vc.value = mensaje_sm_vc

      Notify.create({
        type:     'negative',
        message:  mensaje_sm_vc,
        icon:     'error',
        position: 'top-right',
        timeout:  4000,
      })

      return null
    } finally {
      // ── Siempre liberar el spinner independientemente del resultado ──
      cargando_sm_vc.value = false
    }
  }

  /**
   * Resetea el estado de conversaciones al navegar entre estudiantes.
   */
  const limpiarConversaciones_sm_vc = () => {
    conversaciones_sm_vc.value = []
    error_sm_vc.value          = null
  }

  return {
    /* State */
    conversaciones_sm_vc,
    cargando_sm_vc,
    error_sm_vc,

    /* Actions */
    obtenerConversacion_sm_vc,
    limpiarConversaciones_sm_vc,
  }
})