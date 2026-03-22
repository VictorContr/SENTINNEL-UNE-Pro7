// ══════════════════════════════════════════════════════════════════
// pasantiasStore.js — Store centralizado Mock-First de pasantías.
// Corregido: seeds con _sm_vc, refs de estado _sm → _sm_vc,
// arrow functions en todos los handlers. API pública sin cambios.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'

export const ESTADO_APROBACION = {
  PENDIENTE:  { color: '#5a7fa8', bg: 'rgba(90,127,168,0.1)',   icon: 'schedule' },
  ENTREGADO:  { color: '#7ec8e3', bg: 'rgba(126,200,227,0.1)',  icon: 'upload_file' },
  APROBADO:   { color: '#6fffe9', bg: 'rgba(111,255,233,0.1)',  icon: 'check_circle' },
  REPROBADO:  { color: '#ff8fa3', bg: 'rgba(255,143,163,0.1)',  icon: 'cancel' }
}

/* ── Seeds de datos mock ── */
const MOCK_MATERIAS_sm_vc = [
  {
    id_sm_vc: 'MAT-001', nombre_sm_vc: 'Pasantías I', orden_sm_int: 1,
    descripcion_sm_vc: 'Introducción al entorno empresarial y diagnóstico organizacional.',
    requisitos: [
      { id_sm_vc: 'REQ-001', nombre_sm_vc: 'Carta de Aceptación',      obligatorio_sm_vc: true,  orden_sm_int: 1 },
      { id_sm_vc: 'REQ-002', nombre_sm_vc: 'Capítulo I — Introducción', obligatorio_sm_vc: true,  orden_sm_int: 2 },
      { id_sm_vc: 'REQ-003', nombre_sm_vc: 'Capítulo II — Marco Teórico', obligatorio_sm_vc: true, orden_sm_int: 3 },
      { id_sm_vc: 'REQ-004', nombre_sm_vc: 'Informe Final I',           obligatorio_sm_vc: true,  orden_sm_int: 4 }
    ]
  },
  {
    id_sm_vc: 'MAT-002', nombre_sm_vc: 'Pasantías II', orden_sm_int: 2,
    descripcion_sm_vc: 'Desarrollo del proyecto y ejecución de actividades en la empresa.',
    requisitos: [
      { id_sm_vc: 'REQ-005', nombre_sm_vc: 'Capítulo III — Metodología', obligatorio_sm_vc: true,  orden_sm_int: 1 },
      { id_sm_vc: 'REQ-006', nombre_sm_vc: 'Capítulo IV — Resultados',   obligatorio_sm_vc: true,  orden_sm_int: 2 },
      { id_sm_vc: 'REQ-007', nombre_sm_vc: 'Evaluación Empresarial',     obligatorio_sm_vc: false, orden_sm_int: 3 },
      { id_sm_vc: 'REQ-008', nombre_sm_vc: 'Informe Final II',           obligatorio_sm_vc: true,  orden_sm_int: 4 }
    ]
  },
  {
    id_sm_vc: 'MAT-003', nombre_sm_vc: 'Pasantías III', orden_sm_int: 3,
    descripcion_sm_vc: 'Presentación, defensa y documentación del proyecto final.',
    requisitos: [
      { id_sm_vc: 'REQ-009', nombre_sm_vc: 'Capítulo V — Conclusiones',  obligatorio_sm_vc: true,  orden_sm_int: 1 },
      { id_sm_vc: 'REQ-010', nombre_sm_vc: 'Anexos y Bibliografía',      obligatorio_sm_vc: false, orden_sm_int: 2 },
      { id_sm_vc: 'REQ-011', nombre_sm_vc: 'Acta de Entrega Empresa',    obligatorio_sm_vc: true,  orden_sm_int: 3 },
      { id_sm_vc: 'REQ-012', nombre_sm_vc: 'Informe Final III (Tesis)',  obligatorio_sm_vc: true,  orden_sm_int: 4 }
    ]
  }
]

const MOCK_PROGRESO_sm_vc = [
  { id_sm_vc: 'PRG-001', estudiante_id_sm_vc: 'USR-003', materia_id_sm_vc: 'MAT-001', estado_aprobacion_sm_vc: 'APROBADO',  nota_sm_dec: 18.5, fecha_aprobacion_sm_vc: '2024-03-15T10:00:00Z', intentos_sm_int: 2 },
  { id_sm_vc: 'PRG-002', estudiante_id_sm_vc: 'USR-003', materia_id_sm_vc: 'MAT-002', estado_aprobacion_sm_vc: 'ENTREGADO', nota_sm_dec: null, fecha_aprobacion_sm_vc: null, intentos_sm_int: 1 },
  { id_sm_vc: 'PRG-003', estudiante_id_sm_vc: 'USR-003', materia_id_sm_vc: 'MAT-003', estado_aprobacion_sm_vc: 'PENDIENTE', nota_sm_dec: null, fecha_aprobacion_sm_vc: null, intentos_sm_int: 0 },
  { id_sm_vc: 'PRG-004', estudiante_id_sm_vc: 'USR-010', materia_id_sm_vc: 'MAT-001', estado_aprobacion_sm_vc: 'ENTREGADO', nota_sm_dec: null, fecha_aprobacion_sm_vc: null, intentos_sm_int: 1 },
  { id_sm_vc: 'PRG-005', estudiante_id_sm_vc: 'USR-010', materia_id_sm_vc: 'MAT-002', estado_aprobacion_sm_vc: 'PENDIENTE', nota_sm_dec: null, fecha_aprobacion_sm_vc: null, intentos_sm_int: 0 },
  { id_sm_vc: 'PRG-006', estudiante_id_sm_vc: 'USR-010', materia_id_sm_vc: 'MAT-003', estado_aprobacion_sm_vc: 'PENDIENTE', nota_sm_dec: null, fecha_aprobacion_sm_vc: null, intentos_sm_int: 0 },
  { id_sm_vc: 'PRG-007', estudiante_id_sm_vc: 'USR-011', materia_id_sm_vc: 'MAT-001', estado_aprobacion_sm_vc: 'APROBADO',  nota_sm_dec: 20,   fecha_aprobacion_sm_vc: '2023-12-01T10:00:00Z', intentos_sm_int: 1 },
  { id_sm_vc: 'PRG-008', estudiante_id_sm_vc: 'USR-011', materia_id_sm_vc: 'MAT-002', estado_aprobacion_sm_vc: 'APROBADO',  nota_sm_dec: 19,   fecha_aprobacion_sm_vc: '2024-01-20T10:00:00Z', intentos_sm_int: 1 },
  { id_sm_vc: 'PRG-009', estudiante_id_sm_vc: 'USR-011', materia_id_sm_vc: 'MAT-003', estado_aprobacion_sm_vc: 'APROBADO',  nota_sm_dec: 17,   fecha_aprobacion_sm_vc: '2024-03-05T10:00:00Z', intentos_sm_int: 1 }
]

const MOCK_CONVERSACIONES_sm_vc = [
  { id_sm_vc: 'MSG-001', estudiante_id_sm_vc: 'USR-003', materia_id_sm_vc: 'MAT-001', remitente_id_sm_vc: 'USR-003', remitente_rol_sm_vc: 'ESTUDIANTE', tipo_sm_vc: 'INFORME',    version_sm_vc: 'v1.0', archivo_nombre_sm_vc: 'InformeI_Luis_v1.pdf',         tamanio_sm_vc: '2.3 MB', comentario_sm_vc: 'Primera entrega del Informe Completo.',                                          estado_evaluacion_sm_vc: null,           fecha_sm_vc: '2024-01-10T09:00:00Z', requisito_id_sm_vc: 'REQ-004' },
  { id_sm_vc: 'MSG-002', estudiante_id_sm_vc: 'USR-003', materia_id_sm_vc: 'MAT-001', remitente_id_sm_vc: 'USR-002', remitente_rol_sm_vc: 'PROFESOR',   tipo_sm_vc: 'CORRECCION', version_sm_vc: 'C1',   archivo_nombre_sm_vc: 'Correc_InformeI_v1.pdf',       tamanio_sm_vc: '0.8 MB', comentario_sm_vc: 'Revisar la justificación del problema. Marco teórico incompleto.',              estado_evaluacion_sm_vc: 'OBSERVACIONES', fecha_sm_vc: '2024-01-15T14:30:00Z', requisito_id_sm_vc: null },
  { id_sm_vc: 'MSG-003', estudiante_id_sm_vc: 'USR-003', materia_id_sm_vc: 'MAT-001', remitente_id_sm_vc: 'USR-003', remitente_rol_sm_vc: 'ESTUDIANTE', tipo_sm_vc: 'INFORME',    version_sm_vc: 'v2.0', archivo_nombre_sm_vc: 'InformeI_Luis_v2.pdf',         tamanio_sm_vc: '2.7 MB', comentario_sm_vc: 'Correcciones aplicadas. Amplié la sección 1.3 y completé el marco teórico.', estado_evaluacion_sm_vc: null,           fecha_sm_vc: '2024-02-01T10:00:00Z', requisito_id_sm_vc: 'REQ-004' },
  { id_sm_vc: 'MSG-004', estudiante_id_sm_vc: 'USR-003', materia_id_sm_vc: 'MAT-001', remitente_id_sm_vc: 'USR-002', remitente_rol_sm_vc: 'PROFESOR',   tipo_sm_vc: 'CORRECCION', version_sm_vc: 'C2',   archivo_nombre_sm_vc: 'Evaluacion_Final_InformeI.pdf', tamanio_sm_vc: '0.5 MB', comentario_sm_vc: 'Excelente corrección. Informe aprobado con nota 18.5/20.',                    estado_evaluacion_sm_vc: 'APROBADO',     fecha_sm_vc: '2024-03-15T11:00:00Z', requisito_id_sm_vc: null },
  { id_sm_vc: 'MSG-005', estudiante_id_sm_vc: 'USR-003', materia_id_sm_vc: 'MAT-002', remitente_id_sm_vc: 'USR-003', remitente_rol_sm_vc: 'ESTUDIANTE', tipo_sm_vc: 'INFORME',    version_sm_vc: 'v1.0', archivo_nombre_sm_vc: 'Cap3_Metodologia_v1.pdf',      tamanio_sm_vc: '1.9 MB', comentario_sm_vc: 'Entrego Capítulo 3 — Metodología.',                                           estado_evaluacion_sm_vc: null,           fecha_sm_vc: '2024-04-02T08:00:00Z', requisito_id_sm_vc: 'REQ-005' },
  { id_sm_vc: 'MSG-006', estudiante_id_sm_vc: 'USR-003', materia_id_sm_vc: 'MAT-002', remitente_id_sm_vc: 'USR-002', remitente_rol_sm_vc: 'PROFESOR',   tipo_sm_vc: 'CORRECCION', version_sm_vc: 'C1',   archivo_nombre_sm_vc: 'Obs_Cap3_v1.pdf',              tamanio_sm_vc: '0.6 MB', comentario_sm_vc: 'La metodología está bien. Añade el cronograma de actividades.',              estado_evaluacion_sm_vc: 'OBSERVACIONES', fecha_sm_vc: '2024-04-08T16:00:00Z', requisito_id_sm_vc: null },
  { id_sm_vc: 'MSG-007', estudiante_id_sm_vc: 'USR-003', materia_id_sm_vc: 'MAT-002', remitente_id_sm_vc: 'USR-003', remitente_rol_sm_vc: 'ESTUDIANTE', tipo_sm_vc: 'INFORME',    version_sm_vc: 'v1.0', archivo_nombre_sm_vc: 'Cap4_Resultados_v1.pdf',       tamanio_sm_vc: '3.1 MB', comentario_sm_vc: 'Entrego Capítulo 4 con resultados y gráficas.',                              estado_evaluacion_sm_vc: null,           fecha_sm_vc: '2024-04-20T09:30:00Z', requisito_id_sm_vc: 'REQ-006' }
]

const MOCK_DEPLOY_sm_vc = [
  {
    id_sm_vc: 'DEP-001', estudiante_id_sm_vc: 'USR-011',
    url_produccion_sm_vc: 'https://carlos-perez-pasantia.netlify.app',
    archivo_codigo_id_sm_vc: 'proyecto_final_cperez.zip',
    documentacion_tecnica_id_sm_vc: 'documentacion_tecnica_cperez.pdf',
    fecha_registro_sm_vc: '2024-03-10T12:00:00Z'
  }
]

const MOCK_ESTUDIANTES_sm_vc = [
  { id_sm_vc: 'USR-003', cohorte_sm_vc: 'P-165', profesor_id_sm_vc: 'USR-002', empresa_sm_vc: 'TechVe C.A.' },
  { id_sm_vc: 'USR-010', cohorte_sm_vc: 'P-165', profesor_id_sm_vc: 'USR-002', empresa_sm_vc: 'DataSoft' },
  { id_sm_vc: 'USR-011', cohorte_sm_vc: 'P-164', profesor_id_sm_vc: 'USR-002', empresa_sm_vc: 'InnoTech' }
]

/* ══════════════════════════════════════════════════════════════════
   STORE
   ══════════════════════════════════════════════════════════════════ */
export const usePasantiasStore = defineStore('pasantias', () => {
  const auth_sm_vc = useAuthStore()

  /* ── State ── */
  const materias_sm_vc       = ref([...MOCK_MATERIAS_sm_vc])
  const progreso_sm_vc       = ref([...MOCK_PROGRESO_sm_vc])
  const conversaciones_sm_vc = ref([...MOCK_CONVERSACIONES_sm_vc])
  const deploys_sm_vc        = ref([...MOCK_DEPLOY_sm_vc])
  const loading_sm_vc        = ref(false)

  /* ── Getters: Materias ── */
  const getMaterias = computed(() => materias_sm_vc.value)

  const getMateriaById = (id_sm_vc) =>
    materias_sm_vc.value.find((m) => m.id_sm_vc === id_sm_vc) ?? null

  /* ── Getters: Progreso ── */
  const getProgresoEstudiante = (estudiante_id_sm_vc) =>
    materias_sm_vc.value.map((materia_sm_vc) => {
      const prog_sm_vc = progreso_sm_vc.value.find(
        (p) => p.estudiante_id_sm_vc === estudiante_id_sm_vc && p.materia_id_sm_vc === materia_sm_vc.id_sm_vc
      )
      const estado_sm_vc = prog_sm_vc?.estado_aprobacion_sm_vc ?? 'PENDIENTE'
      const conversacion_sm_vc = getConversacion(estudiante_id_sm_vc, materia_sm_vc.id_sm_vc)
      const detalles_sm_vc = prog_sm_vc?.requisitos_aprobados_detalle_sm_vc ?? []
      const reqAprobados_sm_vc = detalles_sm_vc.length

      const bloqueada_sm_vc = (() => {
        if (materia_sm_vc.orden_sm_int === 1) return false
        const anterior_sm_vc = materias_sm_vc.value.find(
          (m) => m.orden_sm_int === materia_sm_vc.orden_sm_int - 1
        )
        const progAnterior_sm_vc = progreso_sm_vc.value.find(
          (p) => p.estudiante_id_sm_vc === estudiante_id_sm_vc && p.materia_id_sm_vc === anterior_sm_vc?.id_sm_vc
        )
        return progAnterior_sm_vc?.estado_aprobacion_sm_vc !== 'APROBADO'
      })()

      return {
        ...materia_sm_vc,
        progreso: prog_sm_vc ?? null,
        estado_aprobacion_sm_vc: estado_sm_vc,
        meta_estado: ESTADO_APROBACION[estado_sm_vc],
        nota_sm_dec: prog_sm_vc?.nota_sm_dec ?? null,
        fecha_aprobacion_sm_vc: prog_sm_vc?.fecha_aprobacion_sm_vc ?? null,
        intentos_sm_int: prog_sm_vc?.intentos_sm_int ?? 0,
        requisitos_aprobados_sm_int: reqAprobados_sm_vc,
        total_requisitos_sm_int: materia_sm_vc.requisitos.length,
        progreso_decimal: estado_sm_vc === 'APROBADO'
          ? 1
          : materia_sm_vc.requisitos.length > 0
            ? reqAprobados_sm_vc / materia_sm_vc.requisitos.length
            : 0,
        conversacion_count_sm_int: conversacion_sm_vc.length,
        bloqueada: bloqueada_sm_vc
      }
    })

  const miProgreso = computed(() => {
    if (!auth_sm_vc.user || auth_sm_vc.user.rol_sm_vc !== 'ESTUDIANTE') return []
    return getProgresoEstudiante(auth_sm_vc.user.id_sm_vc)
  })

  const todasAprobadas = computed(
    () => miProgreso.value.length > 0 &&
      miProgreso.value.every((m) => m.estado_aprobacion_sm_vc === 'APROBADO')
  )

  /* ── Getters: Conversación ── */
  const getConversacion = (estudiante_id_sm_vc, materia_id_sm_vc) =>
    conversaciones_sm_vc.value
      .filter(
        (m) => m.estudiante_id_sm_vc === estudiante_id_sm_vc && m.materia_id_sm_vc === materia_id_sm_vc
      )
      .sort((a, b) => new Date(a.fecha_sm_vc) - new Date(b.fecha_sm_vc))

  /* ── Getters: Deploy ── */
  const getDeployEstudiante = (estudiante_id_sm_vc) =>
    deploys_sm_vc.value.find((d) => d.estudiante_id_sm_vc === estudiante_id_sm_vc) ?? null

  const miDeploy = computed(() =>
    auth_sm_vc.user ? getDeployEstudiante(auth_sm_vc.user.id_sm_vc) : null
  )

  /* ── Getters: Estudiantes del profesor ── */
  const getEstudiantesDelProfesor = (profesor_id_sm_vc) =>
    MOCK_ESTUDIANTES_sm_vc
      .filter((e) => e.profesor_id_sm_vc === profesor_id_sm_vc)
      .map((e_sm_vc) => {
        const user_sm_vc = auth_sm_vc.MOCK_USERS.find((u) => u.id_sm_vc === e_sm_vc.id_sm_vc)
        if (!user_sm_vc) return null
        const prog_sm_vc = getProgresoEstudiante(e_sm_vc.id_sm_vc)
        const estado_actual_sm_vc =
          prog_sm_vc.find((m) => m.estado_aprobacion_sm_vc !== 'APROBADO')?.estado_aprobacion_sm_vc ||
          (prog_sm_vc.every((m) => m.estado_aprobacion_sm_vc === 'APROBADO') ? 'APROBADO' : 'PENDIENTE')

        return {
          ...user_sm_vc,
          cohorte_sm_vc: e_sm_vc.cohorte_sm_vc,
          empresa_sm_vc: e_sm_vc.empresa_sm_vc,
          estado_actual_sm_vc,
          materias_sm_vc: prog_sm_vc.map((m) => ({
            nombre: m.nombre_sm_vc,
            estado: m.estado_aprobacion_sm_vc,
            progreso: m.progreso_decimal,
            materia_id: m.id_sm_vc
          }))
        }
      })
      .filter(Boolean)

  /* ── Actions ── */
  const enviarInforme = ({ materia_id_sm_vc, archivo_nombre_sm_vc, version_sm_vc, comentario_sm_vc, requisito_id_sm_vc }) => {
    if (!auth_sm_vc.user) return
    const nuevo_sm_vc = {
      id_sm_vc: `MSG-${Date.now()}`,
      estudiante_id_sm_vc: auth_sm_vc.user.id_sm_vc,
      materia_id_sm_vc,
      remitente_id_sm_vc: auth_sm_vc.user.id_sm_vc,
      remitente_rol_sm_vc: 'ESTUDIANTE',
      tipo_sm_vc: 'INFORME',
      version_sm_vc,
      archivo_nombre_sm_vc,
      tamanio_sm_vc: '— MB',
      comentario_sm_vc,
      estado_evaluacion_sm_vc: null,
      fecha_sm_vc: new Date().toISOString(),
      requisito_id_sm_vc
    }
    conversaciones_sm_vc.value.push(nuevo_sm_vc)
    const idx_sm_vc = progreso_sm_vc.value.findIndex(
      (p) => p.estudiante_id_sm_vc === auth_sm_vc.user.id_sm_vc && p.materia_id_sm_vc === materia_id_sm_vc
    )
    if (idx_sm_vc !== -1 && progreso_sm_vc.value[idx_sm_vc].estado_aprobacion_sm_vc === 'PENDIENTE') {
      progreso_sm_vc.value[idx_sm_vc].estado_aprobacion_sm_vc = 'ENTREGADO'
      progreso_sm_vc.value[idx_sm_vc].intentos_sm_int++
    }
    return nuevo_sm_vc
  }

  const responderCorreccion = ({ estudiante_id_sm_vc, materia_id_sm_vc, archivo_nombre_sm_vc, comentario_sm_vc, estado_evaluacion_sm_vc, nota_sm_dec }) => {
    if (!auth_sm_vc.user || auth_sm_vc.user.rol_sm_vc !== 'PROFESOR') return
    const nuevo_sm_vc = {
      id_sm_vc: `MSG-${Date.now()}`,
      estudiante_id_sm_vc, materia_id_sm_vc,
      remitente_id_sm_vc: auth_sm_vc.user.id_sm_vc,
      remitente_rol_sm_vc: 'PROFESOR',
      tipo_sm_vc: 'CORRECCION',
      version_sm_vc: `C${Date.now()}`,
      archivo_nombre_sm_vc,
      tamanio_sm_vc: '—',
      comentario_sm_vc,
      estado_evaluacion_sm_vc,
      fecha_sm_vc: new Date().toISOString(),
      requisito_id_sm_vc: null
    }
    conversaciones_sm_vc.value.push(nuevo_sm_vc)

    const idx_sm_vc = progreso_sm_vc.value.findIndex(
      (p) => p.estudiante_id_sm_vc === estudiante_id_sm_vc && p.materia_id_sm_vc === materia_id_sm_vc
    )
    if (idx_sm_vc !== -1) {
      if (estado_evaluacion_sm_vc === 'APROBADO') {
        progreso_sm_vc.value[idx_sm_vc].estado_aprobacion_sm_vc = 'APROBADO'
        progreso_sm_vc.value[idx_sm_vc].nota_sm_dec = nota_sm_dec ?? null
        progreso_sm_vc.value[idx_sm_vc].fecha_aprobacion_sm_vc = new Date().toISOString()
      } else if (estado_evaluacion_sm_vc === 'REPROBADO') {
        progreso_sm_vc.value[idx_sm_vc].estado_aprobacion_sm_vc = 'REPROBADO'
      }
    }
    return nuevo_sm_vc
  }

  const aprobarRequisitosGranular = ({ estudiante_id_sm_vc, materia_id_sm_vc, requisitos_seleccionados_ids }) => {
    if (!auth_sm_vc.user || auth_sm_vc.user.rol_sm_vc !== 'PROFESOR') return

    const idx_sm_vc = progreso_sm_vc.value.findIndex(
      (p) => p.estudiante_id_sm_vc === estudiante_id_sm_vc && p.materia_id_sm_vc === materia_id_sm_vc
    )
    if (idx_sm_vc === -1) return

    const p_sm_vc = progreso_sm_vc.value[idx_sm_vc]
    if (!p_sm_vc.requisitos_aprobados_detalle_sm_vc) p_sm_vc.requisitos_aprobados_detalle_sm_vc = []

    const prev_sm_vc = [...p_sm_vc.requisitos_aprobados_detalle_sm_vc]
    const fecha_sm_vc = new Date().toISOString()

    progreso_sm_vc.value[idx_sm_vc].requisitos_aprobados_detalle_sm_vc =
      requisitos_seleccionados_ids.map((req_id_sm_vc) => {
        const existe_sm_vc = prev_sm_vc.find((r) => r.requisito_id_sm_vc === req_id_sm_vc)
        return existe_sm_vc ?? { requisito_id_sm_vc: req_id_sm_vc, fecha_aprobacion_sm_vc: fecha_sm_vc }
      })

    const msg_sm_vc = {
      id_sm_vc: `MSG-${Date.now()}`,
      estudiante_id_sm_vc, materia_id_sm_vc,
      remitente_id_sm_vc: auth_sm_vc.user.id_sm_vc,
      remitente_rol_sm_vc: 'PROFESOR',
      tipo_sm_vc: 'CORRECCION',
      version_sm_vc: `R-${Date.now().toString().slice(-4)}`,
      archivo_nombre_sm_vc: 'Hoja de Requisitos Evaluados',
      tamanio_sm_vc: '—',
      comentario_sm_vc: `El profesor actualizó la aprobación a ${requisitos_seleccionados_ids.length} requisitos validados.`,
      estado_evaluacion_sm_vc: 'EVALUACION_PARCIAL',
      fecha_sm_vc,
      requisito_id_sm_vc: null
    }
    conversaciones_sm_vc.value.push(msg_sm_vc)
    return msg_sm_vc
  }

  const registrarDeploy = ({ url_produccion_sm_vc, archivo_codigo_nombre, documentacion_nombre }) => {
    if (!auth_sm_vc.user) return
    const registro_sm_vc = {
      id_sm_vc: `DEP-${Date.now()}`,
      estudiante_id_sm_vc: auth_sm_vc.user.id_sm_vc,
      url_produccion_sm_vc,
      archivo_codigo_id_sm_vc: archivo_codigo_nombre,
      documentacion_tecnica_id_sm_vc: documentacion_nombre,
      fecha_registro_sm_vc: new Date().toISOString()
    }
    const existente_sm_vc = deploys_sm_vc.value.findIndex(
      (d) => d.estudiante_id_sm_vc === auth_sm_vc.user.id_sm_vc
    )
    if (existente_sm_vc !== -1) {
      deploys_sm_vc.value[existente_sm_vc] = registro_sm_vc
    } else {
      deploys_sm_vc.value.push(registro_sm_vc)
    }
    return registro_sm_vc
  }

  const procesarCambioPeriodo_sm_vc = (nuevo_periodo_sm_vc) => {
    progreso_sm_vc.value.forEach((p_sm_vc) => {
      if (p_sm_vc.estado_aprobacion_sm_vc !== 'APROBADO' && p_sm_vc.estado_aprobacion_sm_vc !== 'REPROBADO') {
        const materia_sm_vc = getMateriaById(p_sm_vc.materia_id_sm_vc)
        if (!materia_sm_vc) return
        
        const requisitosTotales_sm_vc = materia_sm_vc.requisitos.length
        const requisitosAprobados_sm_vc = p_sm_vc.requisitos_aprobados_detalle_sm_vc?.length ?? 0

        if (requisitosAprobados_sm_vc < requisitosTotales_sm_vc) {
          p_sm_vc.estado_aprobacion_sm_vc = 'REPROBADO'
          
          conversaciones_sm_vc.value.push({
            id_sm_vc: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            estudiante_id_sm_vc: p_sm_vc.estudiante_id_sm_vc,
            materia_id_sm_vc: p_sm_vc.materia_id_sm_vc,
            remitente_id_sm_vc: 'SISTEMA',
            remitente_rol_sm_vc: 'SISTEMA',
            tipo_sm_vc: 'SISTEMA',
            version_sm_vc: 'SIS',
            archivo_nombre_sm_vc: 'Transición de Periodo',
            tamanio_sm_vc: '—',
            comentario_sm_vc: `[ALERTA] El estudiante no completó el 100% de los requisitos al finalizar el periodo. Ha sido REPROBADO y pasará a cursar la materia en el nuevo periodo: ${nuevo_periodo_sm_vc}.`,
            estado_evaluacion_sm_vc: 'REPROBADO',
            fecha_sm_vc: new Date().toISOString(),
            requisito_id_sm_vc: null
          })
        }
      }
    })
  }

  return {
    /* State — expuesto con _sm_vc */
    materias_sm_vc,
    progreso_sm_vc,
    conversaciones_sm_vc,
    deploys_sm_vc,
    loading_sm_vc,
    /* Getters */
    getMaterias,
    getMateriaById,
    getProgresoEstudiante,
    miProgreso,
    todasAprobadas,
    getConversacion,
    getDeployEstudiante,
    miDeploy,
    getEstudiantesDelProfesor,
    /* Actions */
    enviarInforme,
    responderCorreccion,
    aprobarRequisitosGranular,
    registrarDeploy,
    procesarCambioPeriodo_sm_vc,
    ESTADO_APROBACION
  }
})