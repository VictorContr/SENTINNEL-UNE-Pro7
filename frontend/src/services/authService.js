import { api } from 'src/boot/axios'

/**
 * Servicio de Autenticación
 * Responsable de la comunicación con los endpoints de /auth
 */

/**
 * Inicia sesión usando correo y clave.
 * @param {string} correo_sm_vc - Correo del usuario
 * @param {string} clave_sm_vc - Contraseña
 * @returns {Promise<Object>} Respuesta del backend con el JWT
 */
export const login_sm_vc = async (correo_sm_vc, clave_sm_vc) => {
  const respuesta_sm_vc = await api.post('/auth/login', {
    correo_sm_vc,
    clave_sm_vc
  })
  return respuesta_sm_vc.data
}

/**
 * Cambia la contraseña inicial temporal por una nueva.
 * @param {string} correo_sm_vc - Correo del usuario
 * @param {string} clave_temporal_sm_vc - Contraseña temporal recibida
 * @param {string} nueva_clave_sm_vc - Nueva contraseña
 * @returns {Promise<Object>} Respuesta con confirmación y token opcional
 */
export const cambiarClaveInicial_sm_vc = async (correo_sm_vc, clave_temporal_sm_vc, nueva_clave_sm_vc) => {
  const respuesta_sm_vc = await api.post('/auth/cambiar-clave-inicial', {
    correo_sm_vc,
    clave_temporal_sm_vc,
    nueva_clave_sm_vc
  })
  return respuesta_sm_vc.data
}

export const refresh_sm_vc = async () => {
  const respuesta_sm_vc = await api.post('/auth/refresh')
  return respuesta_sm_vc.data
}
