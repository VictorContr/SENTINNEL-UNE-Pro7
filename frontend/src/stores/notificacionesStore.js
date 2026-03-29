// ══════════════════════════════════════════════════════════════════
// notificacionesStore.js — Gestiona alertas filtradas por receptor.
// Sufijos _sm_vc en todas las variables internas y seeds de datos.
// Se usa estrictamente Arrow Functions y sintaxis reactiva.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'

const TIPO_ALERTA_sm_vc = {
  IMPORTANTE: { color: '#f0a500', icon: 'warning',  label: 'Importante' },
  URGENTE:    { color: '#ff4b6e', icon: 'error',    label: 'Urgente' },
  INFORMATIVA:{ color: '#6fffe9', icon: 'info',     label: 'Informativa' }
}

const MOCK_NOTIFICACIONES_sm_vc = [
  {
    id_sm_vc: 'NOT-001', receptor_id_sm_vc: 'USR-003',
    tipo_sm_vc: 'URGENTE',
    titulo_sm_vc: 'Informe Capítulo 1 requiere correcciones',
    cuerpo_sm_vc: 'Tu profesor ha revisado el Capítulo 1 de Pasantías I y señaló observaciones críticas. Revisa y reenvía antes del viernes.',
    leida_sm_vc: false,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    materia_id_sm_vc: 'MAT-001'
  },
  {
    id_sm_vc: 'NOT-002', receptor_id_sm_vc: 'USR-003',
    tipo_sm_vc: 'INFORMATIVA',
    titulo_sm_vc: 'Pasantías II habilitada',
    cuerpo_sm_vc: 'Has aprobado Pasantías I. La materia Pasantías II ya está disponible en tu panel de trazabilidad.',
    leida_sm_vc: true,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    materia_id_sm_vc: 'MAT-002'
  },
  {
    id_sm_vc: 'NOT-003', receptor_id_sm_vc: 'USR-002',
    tipo_sm_vc: 'IMPORTANTE',
    titulo_sm_vc: 'Nuevo informe entregado — Luis Ramírez',
    cuerpo_sm_vc: 'El estudiante Luis Ramírez ha enviado la Versión 2 del Capítulo Final. Pendiente tu revisión.',
    leida_sm_vc: false,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    materia_id_sm_vc: 'MAT-003'
  },
  {
    id_sm_vc: 'NOT-004', receptor_id_sm_vc: 'USR-001',
    tipo_sm_vc: 'IMPORTANTE',
    titulo_sm_vc: 'Carga masiva completada',
    cuerpo_sm_vc: '47 usuarios importados correctamente. 2 registros omitidos por duplicados de correo.',
    leida_sm_vc: false,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    materia_id_sm_vc: null
  },
  {
    id_sm_vc: 'NOT-005', receptor_id_sm_vc: 'USR-001',
    tipo_sm_vc: 'URGENTE',
    titulo_sm_vc: 'Cuenta revocada detectada',
    cuerpo_sm_vc: 'El usuario Pedro García (USR-088) ha sido baneado. Registro de auditoría actualizado.',
    leida_sm_vc: true,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    materia_id_sm_vc: null
  },
  {
    id_sm_vc: 'NOT-006', receptor_id_sm_vc: 'USR-003',
    tipo_sm_vc: 'IMPORTANTE',
    titulo_sm_vc: 'Recordatorio: Deploy de proyecto pendiente',
    cuerpo_sm_vc: 'Tu proyecto final está aprobado pero aún no has registrado la URL de producción ni subido el .zip.',
    leida_sm_vc: false,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    materia_id_sm_vc: null
  }
]

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const auth_sm_vc = useAuthStore()

  /* ── State ── */
  const todas_sm_vc       = ref([...MOCK_NOTIFICACIONES_sm_vc])
  const loading_sm_vc     = ref(false)
  const filtroTipo_sm_vc  = ref(null)

  /* ── Getters ── */
  const misNotificaciones_sm_vc = computed(() => {
    if (!auth_sm_vc.user_sm_vc) return []
    return todas_sm_vc.value.filter((n_sm_vc) => n_sm_vc.receptor_id_sm_vc === auth_sm_vc.user_sm_vc.id_sm_vc)
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
  const marcarLeida_sm_vc = (id_sm_vc) => {
    const idx_sm_vc = todas_sm_vc.value.findIndex((n_sm_vc) => n_sm_vc.id_sm_vc === id_sm_vc)
    if (idx_sm_vc !== -1) todas_sm_vc.value[idx_sm_vc].leida_sm_vc = true
  }

  const marcarTodasLeidas_sm_vc = () => {
    todas_sm_vc.value = todas_sm_vc.value.map((n_sm_vc) =>
      n_sm_vc.receptor_id_sm_vc === auth_sm_vc.user_sm_vc?.id_sm_vc
        ? { ...n_sm_vc, leida_sm_vc: true }
        : n_sm_vc
    )
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
    marcarLeida_sm_vc,
    marcarTodasLeidas_sm_vc,
    setFiltroTipo_sm_vc,
    getTipoMeta_sm_vc
  }
})