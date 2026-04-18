// ══════════════════════════════════════════════════════════════════
// notificacionesStore.js — Gestiona alertas filtradas por receptor.
// Sufijos _sm_vc en todas las variables internas y seeds de datos.
// Se usa estrictamente Arrow Functions y sintaxis reactiva.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { getNotificaciones_sm_vc, marcarNotificacionLeida_sm_vc } from 'src/services/notificacionesService'

const TIPO_ALERTA_sm_vc = {
  IMPORTANTE: { color: '#f0a500', icon: 'warning',  label: 'Importante' },
  URGENTE:    { color: '#ff4b6e', icon: 'error',    label: 'Urgente' },
  INFORMATIVA:{ color: '#6fffe9', icon: 'info',     label: 'Informativa' }
}

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const auth_sm_vc = useAuthStore()

  /* ── State ── */
  const todas_sm_vc       = ref([])
  const loading_sm_vc     = ref(false)
  const filtroTipo_sm_vc  = ref(null)

  /* ── Getters ── */
  const misNotificaciones_sm_vc = computed(() => {
    // Ya vienen filtradas del backend, pero por seguridad verificamos
    if (!auth_sm_vc.user_sm_vc) return []
    return todas_sm_vc.value
  })

  const noLeidas_sm_vc = computed(() =>
    misNotificaciones_sm_vc.value.filter((n_sm_vc) => !n_sm_vc.leida_sm_vc)
  )

  const notificacionesFiltradas_sm_vc = computed(() => {
    if (!filtroTipo_sm_vc.value) return misNotificaciones_sm_vc.value
    return misNotificaciones_sm_vc.value.filter((n_sm_vc) => n_sm_vc.tipo_sm_vc === filtroTipo_sm_vc.value)
  })

  const conteoNoLeidas_sm_vc = computed(() => noLeidas_sm_vc.value.length)

  /* ── Actions ── */
  const fetchNotificaciones_sm_vc = async () => {
    loading_sm_vc.value = true
    try {
      const data = await getNotificaciones_sm_vc()
      todas_sm_vc.value = data
    } catch (e) {
      console.error('Error fetching notifications API:', e)
    } finally {
      loading_sm_vc.value = false
    }
  }

  const agregarNotificacion_sm_vc = (notificacion) => {
    // Al recibirla por socket, se inyecta en primer lugar
    todas_sm_vc.value.unshift(notificacion)
  }

  const marcarLeida_sm_vc = async (id_sm_vc) => {
    const idx_sm_vc = todas_sm_vc.value.findIndex((n_sm_vc) => n_sm_vc.id_sm_vc === id_sm_vc)
    if (idx_sm_vc !== -1 && !todas_sm_vc.value[idx_sm_vc].leida_sm_vc) {
      // Optimistic update
      todas_sm_vc.value[idx_sm_vc].leida_sm_vc = true
      try {
        await marcarNotificacionLeida_sm_vc(id_sm_vc)
      } catch (e) {
        // Rollback
        todas_sm_vc.value[idx_sm_vc].leida_sm_vc = false
        console.error('Error marcando notificación como leída:', e)
      }
    }
  }

  const marcarTodasLeidas_sm_vc = async () => {
    for (const notif of noLeidas_sm_vc.value) {
      await marcarLeida_sm_vc(notif.id_sm_vc)
    }
  }

  const setFiltroTipo_sm_vc = (tipo_sm_vc) => {
    filtroTipo_sm_vc.value = tipo_sm_vc
  }

  const getTipoMeta_sm_vc = (tipo_sm_vc) =>
    TIPO_ALERTA_sm_vc[tipo_sm_vc] ?? TIPO_ALERTA_sm_vc.INFORMATIVA

  return {
    todas_sm_vc,
    loading_sm_vc,
    filtroTipo_sm_vc,
    misNotificaciones_sm_vc,
    noLeidas_sm_vc,
    notificacionesFiltradas_sm_vc,
    conteoNoLeidas_sm_vc,
    TIPO_ALERTA_sm_vc,
    fetchNotificaciones_sm_vc,
    agregarNotificacion_sm_vc,
    marcarLeida_sm_vc,
    marcarTodasLeidas_sm_vc,
    setFiltroTipo_sm_vc,
    getTipoMeta_sm_vc
  }
})