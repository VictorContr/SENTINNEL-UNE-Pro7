// ══════════════════════════════════════════════════════════════════
// conversacionStore.js — Store de Conversaciones y Trazabilidad (Backend NestJS)
// Gestiona el historial de logs de sistema y mensajes de texto.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { api as api_vc } from 'src/boot/axios'

/**
 * Store central para la trazabilidad basada en eventos.
 * Sigue el estándar de nomenclatura _sm_vc.
 */
export const useConversacionStore_sm_vc = defineStore('conversacion', () => {
  /* ── State ── */
  const conversaciones_sm_vc = ref([])
  const cargando_sm_vc       = ref(false)

  /* ── Actions ── */

  /**
   * Obtiene el historial de conversación/trazabilidad de un estudiante.
   * @param {number|string} estudianteId_sm_vc - ID del estudiante a consultar.
   * @returns {Promise<Array|null>}
   */
  const obtenerConversacion_sm_vc = async (estudianteId_sm_vc) => {
    if (!estudianteId_sm_vc) return null

    cargando_sm_vc.value = true
    try {
      const { data } = await api_vc.get(`/conversaciones/${estudianteId_sm_vc}`)
      
      // El backend devuelve un array de objetos con sufijo _sm_vc
      conversaciones_sm_vc.value = data
      return data
    } catch (err_sm_vc) {
      console.error('[conversacionStore] Error:', err_sm_vc)
      
      Notify.create({
        type: 'negative',
        message: err_sm_vc.response?.data?.message || 'Error al cargar la trazabilidad.',
        icon: 'error',
        position: 'top-right'
      })
      
      return null
    } finally {
      cargando_sm_vc.value = false
    }
  }

  /**
   * Limpia el estado de conversaciones (opcional)
   */
  const limpiarConversaciones_sm_vc = () => {
    conversaciones_sm_vc.value = []
  }

  return {
    /* State */
    conversaciones_sm_vc,
    cargando_sm_vc,

    /* Actions */
    obtenerConversacion_sm_vc,
    limpiarConversaciones_sm_vc
  }
})
