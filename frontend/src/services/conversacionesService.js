import { api as api_vc } from 'src/boot/axios'

/**
 * Obtiene el historial de trazabilidad de un estudiante
 * @param {number|string} estudianteId_sm_vc 
 * @returns {Promise<Object>}
 */
export const getConversacionesByEstudianteId_sm_vc = async (estudianteId_sm_vc) => {
  const { data } = await api_vc.get(`/conversaciones/${estudianteId_sm_vc}`)
  return data
}
