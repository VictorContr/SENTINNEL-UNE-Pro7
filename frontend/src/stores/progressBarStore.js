// ══════════════════════════════════════════════════════════════════
// progressBarStore.js — Lógica de barras de progreso.
// Actualizado para consumir la API _sm_vc de pasantiasStore.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePasantiasStore } from './pasantiasStore'

export const useProgressBarStore = defineStore('progressBar', () => {
  const pasantiasStore_sm_vc = usePasantiasStore()
  const loading_sm_vc = ref(false)

  /* Construye la vista simplificada de progreso por estudiante */
  const getProgresoSimplificado_sm_vc = (estudianteId_sm_vc) => {
    if (!estudianteId_sm_vc) return []
    return pasantiasStore_sm_vc
      .getProgresoEstudiante_sm_vc(estudianteId_sm_vc)
      .map((materia_sm_vc) => ({
        materia_id: materia_sm_vc.id_sm_vc,
        materia_nombre: materia_sm_vc.nombre_sm_vc,
        estado: materia_sm_vc.estado_aprobacion_sm_vc,
        progreso: materia_sm_vc.progreso_decimal || 0,
        progreso_porcentaje: Math.round((materia_sm_vc.progreso_decimal || 0) * 100),
        requisitos_aprobados: materia_sm_vc.requisitos_aprobados_sm_int,
        total_requisitos: materia_sm_vc.total_requisitos_sm_int,
        nota: materia_sm_vc.nota_sm_dec,
        intentos: materia_sm_vc.intentos_sm_int,
        color_estado: getEstadoColor_sm_vc(materia_sm_vc.estado_aprobacion_sm_vc),
        bloqueada: materia_sm_vc.bloqueada
      }))
  }

  /* Devuelve todos los estudiantes del profesor con su progreso */
  const getProgresoEstudiantesProfesor_sm_vc = (profesorId_sm_vc) => {
    if (!profesorId_sm_vc) return []
    return pasantiasStore_sm_vc
      .getEstudiantesDelProfesor_sm_vc(profesorId_sm_vc)
      .map((est_sm_vc) => ({
        id: est_sm_vc.id_sm_vc,
        nombre: est_sm_vc.nombre_sm_vc,
        cohorte: est_sm_vc.cohorte_sm_vc,
        empresa: est_sm_vc.empresa_sm_vc,
        estado_actual: est_sm_vc.estado_actual_sm_vc,
        materias: getProgresoSimplificado_sm_vc(est_sm_vc.id_sm_vc)
      }))
  }

  /* Calcula estadísticas globales del estudiante */
  const getProgresoGeneral_sm_vc = (estudianteId_sm_vc) => {
    const materias_sm_vc = getProgresoSimplificado_sm_vc(estudianteId_sm_vc)
    if (!materias_sm_vc.length) {
      return {
        progreso_total: 0, materias_aprobadas: 0,
        materias_pendientes: 0, materias_entregadas: 0, materias_reprobadas: 0
      }
    }
    return {
      progreso_total: Math.round(
        (materias_sm_vc.reduce((sum_sm_vc, m_sm_vc) => sum_sm_vc + m_sm_vc.progreso, 0) /
          materias_sm_vc.length) * 100
      ) / 100,
      materias_aprobadas:  materias_sm_vc.filter((m_sm_vc) => m_sm_vc.estado === 'APROBADO').length,
      materias_pendientes: materias_sm_vc.filter((m_sm_vc) => m_sm_vc.estado === 'PENDIENTE').length,
      materias_entregadas: materias_sm_vc.filter((m_sm_vc) => m_sm_vc.estado === 'ENTREGADO').length,
      materias_reprobadas: materias_sm_vc.filter((m_sm_vc) => m_sm_vc.estado === 'REPROBADO').length
    }
  }

  /* Mapeo de estado a color Quasar */
  const getEstadoColor_sm_vc = (estado_sm_vc) => {
    const colores_sm_vc = {
      APROBADO:  'teal-4',
      ENTREGADO: 'light-blue-5',
      PENDIENTE: 'blue-grey-6',
      REPROBADO: 'red-5'
    }
    return colores_sm_vc[estado_sm_vc] || 'blue-grey-6'
  }

  /* Fuerza recálculo de progreso (activa getters reactivos) */
  const actualizarProgreso_sm_vc = (estudianteId_sm_vc, materiaId_sm_vc) => {
    pasantiasStore_sm_vc.getProgresoEstudiante_sm_vc(estudianteId_sm_vc)
    pasantiasStore_sm_vc.getConversacion_sm_vc(estudianteId_sm_vc, materiaId_sm_vc)
  }

  const formatProgresoText_sm_vc = (progreso_sm_vc) =>
    `${Math.round(progreso_sm_vc * 100)}%`

  return {
    loading_sm_vc,
    getProgresoSimplificado_sm_vc,
    getProgresoEstudiantesProfesor_sm_vc,
    getProgresoGeneral_sm_vc,
    getEstadoColor_sm_vc,
    actualizarProgreso_sm_vc,
    formatProgresoText_sm_vc
  }
})