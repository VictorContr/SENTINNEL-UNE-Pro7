// =============================================================
// SRC/SERVICES/CONTACTOSERVICE.JS — Servicio Axios de Contacto
//
// Encapsula la llamada HTTP al endpoint POST /api/mailer/contacto
// del backend NestJS. Separa la capa de transporte de la capa
// de estado (Store), siguiendo la misma arquitectura que
// testimoniosService.js.
// =============================================================

import axios from 'axios';

/** URL base del backend. En producción se define via variable de entorno. */
const BASE_URL_sm_vc = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Envía los datos del formulario de contacto al backend NestJS,
 * que se encarga de despachar el correo vía SMTP.
 *
 * @param {Object} payload - Datos del visitante
 * @param {string} payload.nombre_sm_vc - Nombre del visitante
 * @param {string} payload.correo_sm_vc - Correo del visitante
 * @param {string} payload.asunto_sm_vc - Asunto/motivo del contacto
 * @returns {Promise<{message: string}>} Respuesta del backend
 */
export const enviarContacto_sm_vc = async ({ nombre_sm_vc, cedula_sm_vc, correo_sm_vc, asunto_sm_vc }) => {
  const response = await axios.post(`${BASE_URL_sm_vc}/mailer/contacto`, {
    nombre_sm_vc,
    cedula_sm_vc,
    correo_sm_vc,
    asunto_sm_vc,
  });
  return response.data;
};
