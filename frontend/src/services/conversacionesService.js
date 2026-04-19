import { api as api_vc } from 'src/boot/axios'

/**
 * Obtiene el historial de trazabilidad/conversación de un estudiante.
 *
 * @param {number|string} estudianteId_sm_vc  - ID del estudiante (o usuario).
 * @param {number|null}   materiaId_sm_vc     - Opcional. Si se envía, filtra por materia.
 *                                              Si es null/undefined → historial global.
 * @returns {Promise<Object>}
 */
export const getConversacionesByEstudianteId_sm_vc = async (
  estudianteId_sm_vc,
  materiaId_sm_vc = null,
  posicion_sm_vc = null,
  intento_sm_vc = null,
) => {
  // Construimos los query params dinámicamente
  const params_sm_vc = {}
  if (materiaId_sm_vc != null) params_sm_vc.materiaId = materiaId_sm_vc
  if (posicion_sm_vc != null)  params_sm_vc.posicion = posicion_sm_vc
  if (intento_sm_vc != null)   params_sm_vc.intento = intento_sm_vc

  const { data } = await api_vc.get(
    `/conversaciones/${estudianteId_sm_vc}`,
    { params: params_sm_vc },
  )
  return data
}
