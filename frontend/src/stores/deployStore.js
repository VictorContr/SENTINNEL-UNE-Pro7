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
  const deployCompletado_sm_vc = ref(false)
  const datosDeploy_sm_vc = ref(null)

  /* ── Actions ── */

  /**
   * Verificar si el estudiante ya tiene un despliegue registrado.
   * @param {number} estudianteId_sm_vc 
   */
  const verificarEstadoDeploy_sm_vc = async (estudianteId_sm_vc) => {
    loading_sm_vc.value = true
    error_sm_vc.value = null
    
    try {
      const response = await api.get(`/deploy/${estudianteId_sm_vc}`)
      if (response.data) {
        deployCompletado_sm_vc.value = true
        datosDeploy_sm_vc.value = response.data
      }
    } catch (err_sm_vc) {
      // Un 404 es esperado si no hay deploy, no lo tratamos como error crítico
      if (err_sm_vc.response?.status === 404) {
        deployCompletado_sm_vc.value = false
        datosDeploy_sm_vc.value = null
      } else {
        error_sm_vc.value = 'Error al verificar el estado del despliegue.'
        console.error('Error verificando deploy:', err_sm_vc)
      }
    } finally {
      loading_sm_vc.value = false
    }
  }

  /**
   * Descargar un archivo del deploy (zip o pdf).
   * @param {number} estudianteId_sm_vc 
   * @param {string} tipo_sm_vc 'zip' | 'pdf'
   */
  const descargarArchivo_sm_vc = async (estudianteId_sm_vc, tipo_sm_vc) => {
    try {
      const response = await api.get(`/deploy/${estudianteId_sm_vc}/descargar/${tipo_sm_vc}`, {
        responseType: 'blob'
      })
      
      // Crear un link temporal para disparar la descarga
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Intentar obtener el nombre del archivo desde el header content-disposition
      const contentDisposition = response.headers['content-disposition']
      let fileName = `deploy_${estudianteId_sm_vc}.${tipo_sm_vc}`
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch?.[1]) fileName = fileNameMatch[1]
      }
      
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err_sm_vc) {
      Notify.create({
        type: 'negative',
        message: 'Error al descargar el archivo.',
        position: 'top'
      })
      console.error('Error descargando archivo:', err_sm_vc)
    }
  }

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
      deployCompletado_sm_vc.value = true
      datosDeploy_sm_vc.value = response.data
      
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
    deployCompletado_sm_vc,
    datosDeploy_sm_vc,

    /* Actions */
    verificarEstadoDeploy_sm_vc,
    descargarArchivo_sm_vc,
    enviar_deploy_sm_vc
  }
})
