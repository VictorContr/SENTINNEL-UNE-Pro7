import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

/**
 * SENTINNEL – deployStore
 * Gestiona el envío del despliegue final de software.
 */

export const useDeployStore = defineStore('deploy', () => {
  /* ── State ── */
  const loading_sm_vc = ref(false)
  const error_sm_vc = ref(null)
  const success_sm_vc = ref(false)

  /* ── Actions ── */

  /**
   * Enviar el formulario de despliegue al backend.
   * @param {number} estudianteId_sm_vc
   * @param {FormData} formData_sm_vc
   */
  const enviar_deploy_sm_vc = async (estudianteId_sm_vc, formData_sm_vc) => {
    loading_sm_vc.value = true
    error_sm_vc.value = null
    success_sm_vc.value = false

    try {
      const response = await api.post(`/deploy/${estudianteId_sm_vc}`, formData_sm_vc, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      success_sm_vc.value = true
      Notify.create({
        type: 'positive',
        message: '¡Despliegue registrado exitosamente! Tu proyecto está en revisión.',
        position: 'top'
      })
      return response.data
    } catch (err_sm_vc) {
      error_sm_vc.value = err_sm_vc.response?.data?.message || 'Error al procesar el despliegue.'
      Notify.create({
        type: 'negative',
        message: error_sm_vc.value,
        position: 'top'
      })
      throw err_sm_vc
    } finally {
      loading_sm_vc.value = false
    }
  }

  return {
    /* State */
    loading_sm_vc,
    error_sm_vc,
    success_sm_vc,

    /* Actions */
    enviar_deploy_sm_vc
  }
})
