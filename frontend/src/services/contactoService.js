// =============================================================
// SRC/SERVICES/CONTACTOSERVICE.JS — Servicio Axios de Contacto
// Implementado bajo la arquitectura estándar _sm_vc usando la
// instancia API global.
// =============================================================

import { api } from 'src/boot/axios'

/**
 * Envía los datos del formulario de contacto al backend NestJS,
 * que se encarga de despachar el correo vía SMTP.
 *
 * @param {Object} payload_sm_vc - Datos del visitante
 * @param {string} payload_sm_vc.nombre_sm_vc - Nombre del visitante
 * @param {string} payload_sm_vc.cedula_sm_vc - Cedula referencial
 * @param {string} payload_sm_vc.correo_sm_vc - Correo del visitante
 * @param {string} payload_sm_vc.asunto_sm_vc - Asunto/motivo del contacto
 * @returns {Promise<{message: string}>} Respuesta del backend
 */
export const enviarContacto_sm_vc = async ({ nombre_sm_vc, cedula_sm_vc, correo_sm_vc, asunto_sm_vc }) => {
  const respuesta_sm_vc = await api.post('/mailer/contacto', {
    nombre_sm_vc,
    cedula_sm_vc,
    correo_sm_vc,
    asunto_sm_vc,
  })
  return respuesta_sm_vc.data
}
