import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePasantiasStore } from './pasantiasStore'

/**
 * SENTINNEL — progressBarStore
 * Store especializado para manejar la lógica de las barras de progreso
 * en las vistas de estudiantes y profesores.
 * 
 * Funcionalidades:
 *   - Cálculo dinámico de progreso por estudiante-materia
 *   - Actualización reactiva del progreso basado en conversaciones
 *   - Formateo de datos para componentes simples de progreso
 */

export const useProgressBarStore = defineStore('progressBar', () => {
  const pasantiasStore = usePasantiasStore()

  /* ── State ── */
  const loading_sm_vc = ref(false)

  /* ── Getters ── */

  /**
   * Obtiene el progreso simplificado para un estudiante específico
   * @param {string} estudianteId - ID del estudiante
   * @returns {Array} Array de objetos con información simplificada de progreso
   */
  function getProgresoSimplificado(estudianteId) {
    if (!estudianteId) return []
    
    const progresoCompleto = pasantiasStore.getProgresoEstudiante(estudianteId)
    
    return progresoCompleto.map(materia => ({
      materia_id: materia.id_sm_vc,
      materia_nombre: materia.nombre_sm_vc,
      estado: materia.estado_aprobacion_sm_vc,
      progreso: materia.progreso_decimal || 0,
      progreso_porcentaje: Math.round((materia.progreso_decimal || 0) * 100),
      requisitos_aprobados: materia.requisitos_aprobados_sm_int,
      total_requisitos: materia.total_requisitos_sm_int,
      nota: materia.nota_sm_dec,
      intentos: materia.intentos_sm_int,
      color_estado: getEstadoColor(materia.estado_aprobacion_sm_vc),
      bloqueada: materia.bloqueada
    }))
  }

  /**
   * Obtiene el progreso para todos los estudiantes de un profesor
   * @param {string} profesorId - ID del profesor
   * @returns {Array} Array de estudiantes con su progreso simplificado
   */
  function getProgresoEstudiantesProfesor(profesorId) {
    if (!profesorId) return []
    
    const estudiantes = pasantiasStore.getEstudiantesDelProfesor(profesorId)
    
    return estudiantes.map(estudiante => ({
      id: estudiante.id_sm_vc,
      nombre: estudiante.nombre_sm_vc,
      cohorte: estudiante.cohorte_sm_vc,
      empresa: estudiante.empresa_sm_vc,
      estado_actual: estudiante.estado_actual_sm_vc,
      materias: getProgresoSimplificado(estudiante.id_sm_vc)
    }))
  }

  /**
   * Calcula el progreso general de un estudiante (promedio de todas las materias)
   * @param {string} estudianteId - ID del estudiante
   * @returns {Object} Objeto con progreso general
   */
  function getProgresoGeneral(estudianteId) {
    const materias = getProgresoSimplificado(estudianteId)
    
    if (materias.length === 0) {
      return {
        progreso_total: 0,
        materias_aprobadas: 0,
        materias_pendientes: 0,
        materias_entregadas: 0,
        materias_reprobadas: 0
      }
    }

    const aprobadas = materias.filter(m => m.estado === 'APROBADO').length
    const entregadas = materias.filter(m => m.estado === 'ENTREGADO').length
    const pendientes = materias.filter(m => m.estado === 'PENDIENTE').length
    const reprobadas = materias.filter(m => m.estado === 'REPROBADO').length
    
    const progreso_total = materias.reduce((sum, materia) => sum + materia.progreso, 0) / materias.length

    return {
      progreso_total: Math.round(progreso_total * 100) / 100,
      materias_aprobadas: aprobadas,
      materias_pendientes: pendientes,
      materias_entregadas: entregadas,
      materias_reprobadas: reprobadas
    }
  }

  /**
   * Obtiene el color correspondiente a un estado
   * @param {string} estado - Estado de la materia
   * @returns {string} Color para la barra de progreso
   */
  function getEstadoColor(estado) {
    const colores = {
      'APROBADO': 'teal-4',
      'ENTREGADO': 'light-blue-5',
      'PENDIENTE': 'blue-grey-6',
      'REPROBADO': 'red-5'
    }
    return colores[estado] || 'blue-grey-6'
  }

  /**
   * Actualiza el progreso cuando hay cambios en las conversaciones
   * @param {string} estudianteId - ID del estudiante
   * @param {string} materiaId - ID de la materia
   */
  function actualizarProgreso(estudianteId, materiaId) {
    // Forzar reactividad llamando al getter del pasantiasStore
    pasantiasStore.getProgresoEstudiante(estudianteId)
    pasantiasStore.getConversacion(estudianteId, materiaId)
  }

  /**
   * Formatea el texto del progreso para mostrar en UI
   * @param {number} progreso - Valor del progreso (0 a 1)
   * @returns {string} Texto formateado del progreso
   */
  function formatProgresoText(progreso) {
    return `${Math.round(progreso * 100)}%`
  }

  return {
    loading_sm_vc,
    // Getters
    getProgresoSimplificado,
    getProgresoEstudiantesProfesor,
    getProgresoGeneral,
    getEstadoColor,
    // Actions
    actualizarProgreso,
    // Utils
    formatProgresoText
  }
})
