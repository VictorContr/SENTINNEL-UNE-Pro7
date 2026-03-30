import { api } from 'src/boot/axios'

/**
 * Servicio de Pasantias
 * Responsable de la comunicación con los endpoints de /pasantias
 */

/**
 * Obtiene las materias disponibles
 * @returns {Promise<Array>} Lista de materias
 */
export const getMaterias_sm_vc = async () => {
  const respuesta_sm_vc = await api.get('/pasantias/materias')
  return respuesta_sm_vc.data
}

/**
 * Crea o actualiza una entrega para un requisito de pasantía
 * @param {Object} datosEntrega_sm_vc - DTO de entrega, ej. { requisito_id_sm_vc }
 * @returns {Promise<Object>} Entrega creada o actualizada
 */
export const crearEntrega_sm_vc = async (datosEntrega_sm_vc) => {
  const respuesta_sm_vc = await api.post('/pasantias/entregas', datosEntrega_sm_vc)
  return respuesta_sm_vc.data
}

/**
 * Obtiene el progreso desglosado de un estudiante (vista Profesor/Admin)
 * @param {string|number} id_sm_vc - ID del estudiante
 * @returns {Promise<Object>} Progreso total
 */
export const getProgresoEstudiante_sm_vc = async (id_sm_vc) => {
  const respuesta_sm_vc = await api.get(`/pasantias/estudiantes/${id_sm_vc}/progreso`)
  return respuesta_sm_vc.data
}

/**
 * Obtiene el progreso del estudiante actualmente logeado (Extraído desde JWT)
 * @returns {Promise<Object>} Mi progreso
 */
export const getMiProgreso_sm_vc = async () => {
  const respuesta_sm_vc = await api.get('/pasantias/estudiantes/mi-progreso')
  return respuesta_sm_vc.data
}
