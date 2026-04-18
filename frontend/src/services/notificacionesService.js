import { api } from 'boot/axios'

export const getNotificaciones_sm_vc = async () => {
  const response = await api.get('/notificaciones')
  return response.data
}

export const marcarNotificacionLeida_sm_vc = async (id_sm_vc) => {
  const response = await api.patch(`/notificaciones/${id_sm_vc}/leida`)
  return response.data
}
