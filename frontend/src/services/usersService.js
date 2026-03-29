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
 * Crea un nuevo usuario
 * @param {Object} data_sm_vc
 * @returns {Promise<Object>} Usuario creado
 */
export const create_sm_vc = async (data_sm_vc) => {
  const respuesta_sm_vc = await api.post('/users', data_sm_vc)
  return respuesta_sm_vc.data
}

/**
 * Actualiza un usuario existente
 * @param {string} id_sm_vc
 * @param {Object} data_sm_vc
 * @returns {Promise<Object>} Usuario actualizado
 */
export const update_sm_vc = async (id_sm_vc, data_sm_vc) => {
  const respuesta_sm_vc = await api.patch(`/users/${id_sm_vc}`, data_sm_vc)
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
