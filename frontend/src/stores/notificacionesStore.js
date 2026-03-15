import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'

/**
 * SENTINNEL – notificacionesStore
 * Gestiona las alertas del sistema filtradas por receptor_id_sm_vc.
 */

const TIPO_ALERTA = {
  IMPORTANTE: { color: '#f0a500', icon: 'warning', label: 'Importante' },
  URGENTE: { color: '#ff4b6e', icon: 'error', label: 'Urgente' },
  INFORMATIVA: { color: '#6fffe9', icon: 'info', label: 'Informativa' }
}

const MOCK_NOTIFICACIONES = [
  {
    id_sm_vc: 'NOT-001',
    receptor_id_sm_vc: 'USR-003',
    tipo_sm_vc: 'URGENTE',
    titulo_sm_vc: 'Informe Capítulo 1 requiere correcciones',
    cuerpo_sm_vc: 'Tu profesor ha revisado el Capítulo 1 de Pasantías I y señaló observaciones críticas. Por favor, revisa y reenvía antes del viernes.',
    leida_sm_vc: false,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // hace 30 min
    materia_id_sm_vc: 'MAT-001'
  },
  {
    id_sm_vc: 'NOT-002',
    receptor_id_sm_vc: 'USR-003',
    tipo_sm_vc: 'INFORMATIVA',
    titulo_sm_vc: 'Pasantías II habilitada',
    cuerpo_sm_vc: 'Has aprobado Pasantías I. La materia Pasantías II ya está disponible en tu panel de trazabilidad.',
    leida_sm_vc: true,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    materia_id_sm_vc: 'MAT-002'
  },
  {
    id_sm_vc: 'NOT-003',
    receptor_id_sm_vc: 'USR-002',
    tipo_sm_vc: 'IMPORTANTE',
    titulo_sm_vc: 'Nuevo informe entregado — Luis Ramírez',
    cuerpo_sm_vc: 'El estudiante Luis Ramírez ha enviado la Versión 2 del Capítulo Final. Pendiente tu revisión.',
    leida_sm_vc: false,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    materia_id_sm_vc: 'MAT-003'
  },
  {
    id_sm_vc: 'NOT-004',
    receptor_id_sm_vc: 'USR-001',
    tipo_sm_vc: 'IMPORTANTE',
    titulo_sm_vc: 'Carga masiva completada',
    cuerpo_sm_vc: '47 usuarios importados correctamente. 2 registros omitidos por duplicados de correo.',
    leida_sm_vc: false,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    materia_id_sm_vc: null
  },
  {
    id_sm_vc: 'NOT-005',
    receptor_id_sm_vc: 'USR-001',
    tipo_sm_vc: 'URGENTE',
    titulo_sm_vc: 'Cuenta revocada detectada',
    cuerpo_sm_vc: 'El usuario Pedro García (USR-088) ha sido baneado por el sistema. Registro de auditoría actualizado.',
    leida_sm_vc: true,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    materia_id_sm_vc: null
  },
  {
    id_sm_vc: 'NOT-006',
    receptor_id_sm_vc: 'USR-003',
    tipo_sm_vc: 'IMPORTANTE',
    titulo_sm_vc: 'Recordatorio: Deploy de proyecto pendiente',
    cuerpo_sm_vc: 'Tu proyecto final está aprobado pero aún no has registrado la URL de producción ni subido el .zip. Completa tu Deploy antes del cierre del semestre.',
    leida_sm_vc: false,
    fecha_sm_vc: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    materia_id_sm_vc: null
  }
]

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const auth = useAuthStore()

  const todas_sm = ref([...MOCK_NOTIFICACIONES])
  const loading_sm_vc = ref(false)
  const filtroTipo_sm_vc = ref(null) // null = todos

  /* ── Filtradas por receptor del usuario actual ── */
  const misNotificaciones = computed(() => {
    if (!auth.user) return []
    return todas_sm.value.filter(
      (n) => n.receptor_id_sm_vc === auth.user.id_sm_vc
    )
  })

  const noLeidas = computed(() =>
    misNotificaciones.value.filter((n) => !n.leida_sm_vc)
  )

  const notificacionesFiltradas = computed(() => {
    if (!filtroTipo_sm_vc.value) return misNotificaciones.value
    return misNotificaciones.value.filter(
      (n) => n.tipo_sm_vc === filtroTipo_sm_vc.value
    )
  })

  const conteoNoLeidas = computed(() => noLeidas.value.length)

  /* ── Actions ── */
  function marcarLeida(id_sm_vc) {
    const idx = todas_sm.value.findIndex((n) => n.id_sm_vc === id_sm_vc)
    if (idx !== -1) todas_sm.value[idx].leida_sm_vc = true
  }

  function marcarTodasLeidas() {
    todas_sm.value = todas_sm.value.map((n) =>
      n.receptor_id_sm_vc === auth.user?.id_sm_vc ? { ...n, leida_sm_vc: true } : n
    )
  }

  function setFiltroTipo(tipo) {
    filtroTipo_sm_vc.value = tipo
  }

  /* Meta del tipo de alerta (color, icono, label) */
  function getTipoMeta(tipo_sm_vc) {
    return TIPO_ALERTA[tipo_sm_vc] ?? TIPO_ALERTA.INFORMATIVA
  }

  return {
    todas_sm,
    loading_sm_vc,
    filtroTipo_sm_vc,
    misNotificaciones,
    noLeidas,
    notificacionesFiltradas,
    conteoNoLeidas,
    TIPO_ALERTA,
    marcarLeida,
    marcarTodasLeidas,
    setFiltroTipo,
    getTipoMeta
  }
})
