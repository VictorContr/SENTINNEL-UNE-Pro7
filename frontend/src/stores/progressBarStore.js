// ══════════════════════════════════════════════════════════════════
// progressBarStore.js — Lógica de barras de progreso.
// Corregido: arrow functions en todos los helpers, sufijos _sm_vc
// en variables internas. API pública estable para componentes.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import { usePasantiasStore } from './pasantiasStore'
import { getMisEstudiantes_sm_vc } from 'src/services/estudiantesService'

export const useProgressBarStore = defineStore('progressBar', () => {
  const pasantiasStore_sm_vc = usePasantiasStore()
  const loading_sm_vc = ref(false)
  const estudiantesAsignados_sm_vc = ref([])

  const fetchEstudiantesProfesor_sm_vc = async () => {
    loading_sm_vc.value = true
    try {
      const resp_sm_vc = await getMisEstudiantes_sm_vc()
      estudiantesAsignados_sm_vc.value = resp_sm_vc
    } catch (error) {
      console.error('[progressBarStore] fetchEstudiantesProfesor_sm_vc error:', error)
      Notify.create({
        color: 'negative',
        icon: 'error',
        message: 'Error al cargar los estudiantes asignados.'
      })
    } finally {
      loading_sm_vc.value = false
    }
  }

  const FASES_META_sm_vc = {
    'MAT-001': {
      icono_sm_vc: 'science',
      captionFase_sm_vc: 'Contexto · Objetivos · Justificación · Delimitación',
    },
    'MAT-002': {
      icono_sm_vc: 'school',
      captionFase_sm_vc: 'Refinamiento · Técnica · Desarrollo Temprano (Obj 1-3)',
    },
    'MAT-003': {
      icono_sm_vc: 'engineering',
      captionFase_sm_vc: 'Desarrollo Avanzado · Cierre Técnico (Obj 4-5) · Fase Opcional',
    },
    'MAT-004': {
      icono_sm_vc: 'workspace_premium',
      captionFase_sm_vc: 'Doc. Final · Aprobación · Defensa · Solvencias',
    },
  }

  const enriquecerMateriasTrazabilidad_sm_vc = (listaProgreso) => {
    return listaProgreso.map((materia_sm_vc) => ({
      ...materia_sm_vc,
      icono_sm_vc: FASES_META_sm_vc[materia_sm_vc.id_sm_vc]?.icono_sm_vc || 'book',
      captionFase_sm_vc: FASES_META_sm_vc[materia_sm_vc.id_sm_vc]?.captionFase_sm_vc || '',
    }))
  }

  const getProgresoSimplificado = (estudianteId_sm_vc) => {
    if (!estudianteId_sm_vc) return []
    return pasantiasStore_sm_vc.getProgresoEstudiante(estudianteId_sm_vc).map((materia_sm_vc) => ({
      materia_id: materia_sm_vc.id_sm_vc,
      icono_sm_vc: FASES_META_sm_vc[materia_sm_vc.id_sm_vc]?.icono_sm_vc || 'book',
      captionFase_sm_vc: FASES_META_sm_vc[materia_sm_vc.id_sm_vc]?.captionFase_sm_vc || '',
      materia_nombre: materia_sm_vc.nombre_sm_vc,
      estado: materia_sm_vc.estado_aprobacion_sm_vc,
      progreso: materia_sm_vc.progreso_decimal || 0,
      progreso_porcentaje: Math.round((materia_sm_vc.progreso_decimal || 0) * 100),
      requisitos_aprobados: materia_sm_vc.requisitos_aprobados_sm_int,
      total_requisitos: materia_sm_vc.total_requisitos_sm_int,
      nota: materia_sm_vc.nota_sm_dec,
      intentos: materia_sm_vc.intentos_sm_int,
      color_estado: getEstadoColor(materia_sm_vc.estado_aprobacion_sm_vc),
      bloqueada: materia_sm_vc.bloqueada
    }))
  }

  const progresoEstudiantesProfesor_sm_vc = computed(() => {
    return estudiantesAsignados_sm_vc.value.map((est_sm_vc) => {
      return {
        id: est_sm_vc.id_sm_vc,
        nombre: `${est_sm_vc.nombre_sm_vc || ''} ${est_sm_vc.apellido_sm_vc || ''}`.trim(),
        // ✅ FIX: est_sm_vc.periodo_sm_vc (string legacy) ya no existe.
        // La cohorte se deriva del objeto de relación anidada en la materia activa.
        cohorte: est_sm_vc.materiaActiva?.periodo?.nombre_sm_vc
               ?? est_sm_vc.materiaActiva?.periodo_id_sm_vc?.toString()
               ?? 'N/A',
        materia_activa_nombre: est_sm_vc.materiaActiva?.nombre_sm_vc ?? 'Sin Materia',
        empresa: est_sm_vc.empresa_sm_vc,
        estado_actual: est_sm_vc.materias_sm_vc?.find(m => m.materia_id_sm_vc === est_sm_vc.materia_activa_id_sm_vc)?.estado_sm_vc || 'PENDIENTE',
        materias: (est_sm_vc.materias_sm_vc || []).map((mat_sm_vc) => ({
          materia_id: mat_sm_vc.materia_id_sm_vc,
          posicion_sm_vc: mat_sm_vc.posicion_sm_vc,
          materia_nombre: mat_sm_vc.nombre_sm_vc,
          estado: mat_sm_vc.estado_sm_vc,
          progreso: mat_sm_vc.progreso_decimal_sm_vc || 0,
          progreso_porcentaje: Math.round((mat_sm_vc.progreso_decimal_sm_vc || 0) * 100),
          bloqueada: mat_sm_vc.bloqueada_sm_vc
        }))
      }
    })
  })

  const getProgresoGeneral = (estudianteId_sm_vc) => {
    const materias_sm_vc = getProgresoSimplificado(estudianteId_sm_vc)
    if (!materias_sm_vc.length) {
      return { progreso_total: 0, materias_aprobadas: 0, materias_pendientes: 0, materias_entregadas: 0, materias_reprobadas: 0 }
    }
    return {
      progreso_total: Math.round(
        (materias_sm_vc.reduce((sum_sm_vc, m_sm_vc) => sum_sm_vc + m_sm_vc.progreso, 0) / materias_sm_vc.length) * 100
      ) / 100,
      materias_aprobadas:  materias_sm_vc.filter((m) => m.estado === 'APROBADO').length,
      materias_pendientes: materias_sm_vc.filter((m) => m.estado === 'PENDIENTE').length,
      materias_entregadas: materias_sm_vc.filter((m) => m.estado === 'ENTREGADO').length,
      materias_reprobadas: materias_sm_vc.filter((m) => m.estado === 'REPROBADO').length
    }
  }

  const getEstadoColor = (estado_sm_vc) => {
    const colores_sm_vc = {
      APROBADO:  'teal-4',
      ENTREGADO: 'light-blue-5',
      PENDIENTE: 'blue-grey-6',
      REPROBADO: 'red-5'
    }
    return colores_sm_vc[estado_sm_vc] || 'blue-grey-6'
  }

  const actualizarProgreso = (estudianteId_sm_vc, materiaId_sm_vc) => {
    pasantiasStore_sm_vc.getProgresoEstudiante(estudianteId_sm_vc)
    pasantiasStore_sm_vc.getConversacion(estudianteId_sm_vc, materiaId_sm_vc)
  }

  const formatProgresoText = (progreso_sm_vc) =>
    `${Math.round(progreso_sm_vc * 100)}%`

  return {
    loading_sm_vc,
    estudiantesAsignados_sm_vc,
    fetchEstudiantesProfesor_sm_vc,
    progresoEstudiantesProfesor_sm_vc,
    getProgresoSimplificado,
    getProgresoGeneral,
    getEstadoColor,
    actualizarProgreso,
    formatProgresoText,
    FASES_META_sm_vc,
    enriquecerMateriasTrazabilidad_sm_vc
  }
})