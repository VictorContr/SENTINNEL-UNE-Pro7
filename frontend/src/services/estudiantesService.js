import { api } from 'src/boot/axios'

/**
 * Servicio de Estudiantes
 * Responsable de la comunicación con los endpoints de /estudiantes
 */

/**
 * GET /api/estudiantes/mis-estudiantes_sm_vc
 * Obtiene los estudiantes asignados al profesor autenticado desde el servidor,
 * con la métrica de progreso previamente calculada.
 * Se asume que el token JWT va en los headers implícitamente por el interceptor.
 * @returns {Promise<Array>} Lista enriquecida de estudiantes.
 */
export const getMisEstudiantes_sm_vc = async () => {
  const respuesta_sm_vc = await api.get('/estudiantes/mis-estudiantes_sm_vc')
  return respuesta_sm_vc.data
}

/**
 * GET /api/estudiantes/:id_sm_vc/detalle
 * Ficha completa de un estudiante (usuario vinculado, progreso, etc).
 * Permite evitar el error de IDs usando el ID de Estudiante.
 * @param {string|number} id_sm_vc ID de la pk de estudiante
 */
export const getDetalleEstudiante_sm_vc = async (id_sm_vc) => {
  const respuesta_sm_vc = await api.get(`/estudiantes/${id_sm_vc}/detalle`)
  return respuesta_sm_vc.data
}
