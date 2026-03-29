import { api } from 'src/boot/axios'

/**
 * Servicio Administrativo
 * Responsable de la comunicación con los endpoints de /admin
 */

/**
 * Obtiene la configuración del periodo actual
 * @returns {Promise<Object>} Periodo actual
 */
export const obtenerPeriodoActual_sm_vc = async () => {
  const respuesta_sm_vc = await api.get('/admin/configuracion/periodo')
  return respuesta_sm_vc.data
}

/**
 * Actualiza el periodo académico
 * @param {Object} dto_sm_vc - { inicio_sm_vc, fin_sm_vc } u otra convención DTO
 * @returns {Promise<Object>} Periodo actualizado
 */
export const actualizarPeriodo_sm_vc = async (dto_sm_vc) => {
  const respuesta_sm_vc = await api.put('/admin/configuracion/periodo', dto_sm_vc)
  return respuesta_sm_vc.data
}
