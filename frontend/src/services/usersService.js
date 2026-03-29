import { api } from 'src/boot/axios'

/**
 * Servicio de Usuarios
 * Responsable de la comunicación con los endpoints de /users
 */

/**
 * Obtiene todos los usuarios (Ruta protegida para ADMIN)
 * @returns {Promise<Array>} Lista de usuarios
 */
export const findAll_sm_vc = async () => {
  const respuesta_sm_vc = await api.get('/users')
  return respuesta_sm_vc.data
}

/**
 * Obtiene un usuario específico por ID
 * @param {string} id_sm_vc - ID del usuario
 * @returns {Promise<Object>} Usuario encontrado
 */
export const findOne_sm_vc = async (id_sm_vc) => {
  const respuesta_sm_vc = await api.get(`/users/${id_sm_vc}`)
  return respuesta_sm_vc.data
}

/**
 * Activa/Desactiva (ban) a un usuario alternando su estado
 * @param {string} id_sm_vc - ID del usuario
 * @returns {Promise<Object>} Resultado de la operación
 */
export const toggleBan_sm_vc = async (id_sm_vc) => {
  const respuesta_sm_vc = await api.patch(`/users/${id_sm_vc}/ban`)
  return respuesta_sm_vc.data
}
