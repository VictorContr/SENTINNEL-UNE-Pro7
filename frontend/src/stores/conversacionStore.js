// ══════════════════════════════════════════════════════════════════
// conversacionStore.js — Store de Conversaciones y Trazabilidad
// Consume el endpoint /conversaciones/:estudianteId
// con soporte de filtro por materia: ?materiaId=X
//
// Contrato del backend:
//   { id_sm_vc, estudiante_id_sm_vc, materia_id_sm_vc, mensajes_sm_vc: [...] }
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { getConversacionesByEstudianteId_sm_vc } from 'src/services/conversacionesService'

export const useConversacionStore_sm_vc = defineStore('conversacion', () => {
  /* ── State ── */
  const conversaciones_sm_vc = ref([])   // Array de nodos del timeline (TEXTO + DOCUMENTO)
  const cargando_sm_vc       = ref(false)
  const error_sm_vc          = ref(null)
  const materiaActiva_sm_vc  = ref(null) // Refleja el último filtro de materia aplicado

  /* ── Actions ── */

  /**
   * Obtiene el historial de trazabilidad de un estudiante.
   *
   * @param {number|string} estudianteId_sm_vc - ID del estudiante (o usuario).
   * @param {number|null}   materiaId_sm_vc    - Opcional. Si se envía, filtra por materia.
   *                                             Si es null/undefined → historial global.
   * @returns {Promise<Array|null>}
   */
  const obtenerConversacion_sm_vc = async (estudianteId_sm_vc, materiaId_sm_vc = null) => {
    if (!estudianteId_sm_vc) return null

    cargando_sm_vc.value    = true
    error_sm_vc.value       = null
    materiaActiva_sm_vc.value = materiaId_sm_vc

    try {
      const data = await getConversacionesByEstudianteId_sm_vc(
        estudianteId_sm_vc,
        materiaId_sm_vc,
      )

      // Extraemos el array de nodos del timeline del objeto envolvente del backend
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
      cargando_sm_vc.value = false
    }
  }

  /**
   * Resetea el estado de conversaciones al navegar entre estudiantes o la materialista.
   */
  const limpiarConversaciones_sm_vc = () => {
    conversaciones_sm_vc.value   = []
    error_sm_vc.value            = null
    materiaActiva_sm_vc.value    = null
  }

  return {
    /* State */
    conversaciones_sm_vc,
    cargando_sm_vc,
    error_sm_vc,
    materiaActiva_sm_vc,

    /* Actions */
    obtenerConversacion_sm_vc,
    limpiarConversaciones_sm_vc,
  }
})