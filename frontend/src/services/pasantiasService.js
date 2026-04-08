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
 * Registra una entrega de requisito (Estudiante)
 * Soporta FormData para envío de archivos físicos.
 * @param {FormData} formData_sm_vc
 */
export const crearEntrega_sm_vc = async (formData_sm_vc) => {
  const respuesta_sm_vc = await api.post('/pasantias/entregas', formData_sm_vc, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return respuesta_sm_vc.data
}

/**
 * Registra la evaluación de una entrega (Profesor)
 * Soporta FormData para archivos de corrección opcionales.
 * @param {FormData} formData_sm_vc
 */
export const evaluarEntrega_sm_vc = async (formData_sm_vc) => {
  const respuesta_sm_vc = await api.post('/pasantias/evaluar-entrega', formData_sm_vc, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return respuesta_sm_vc.data
}

/**
 * Aprobación masiva o granular de requisitos (Profesor)
 * @param {Object} payload_sm_vc - { estudiante_id, materia_id, requisitos_ids, nota_global, comentario }
 */
export const aprobarRequisitosBulk_sm_vc = async (payload_sm_vc) => {
  const respuesta_sm_vc = await api.post('/pasantias/aprobar-requisitos-bulk', payload_sm_vc)
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
