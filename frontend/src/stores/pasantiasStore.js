// ══════════════════════════════════════════════════════════════════
// pasantiasStore.js — Store de Pasantías integrado con Backend NestJS
// Mapea funciones Axios a mutación de estado reactive según arquitectura.
//
// FIX: Corregido el typo crítico `progreso_sm` → `progreso_sm_vc`
//      en todos los getters que antes referenciaban el nombre incorrecto.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import {
  getMaterias_sm_vc,
  getProgresoEstudiante_sm_vc as apiGetProgresoEstudiante_sm_vc,
  getMiProgreso_sm_vc as apiGetMiProgreso_sm_vc,
  crearEntrega_sm_vc as apiCrearEntrega_sm_vc
} from 'src/services/pasantiasService'

export const ESTADO_APROBACION = {
  PENDIENTE:  { color: '#5a7fa8', bg: 'rgba(90,127,168,0.1)',   icon: 'schedule' },
  ENTREGADO:  { color: '#7ec8e3', bg: 'rgba(126,200,227,0.1)',  icon: 'upload_file' },
  APROBADO:   { color: '#6fffe9', bg: 'rgba(111,255,233,0.1)',  icon: 'check_circle' },
  REPROBADO:  { color: '#ff8fa3', bg: 'rgba(255,143,163,0.1)',  icon: 'cancel' }
}

export const usePasantiasStore = defineStore('pasantias', () => {
  /* ── State ── */
  const materias_sm_vc    = ref([])
  const progreso_sm_vc    = ref([]) // ← FIX: sufijo correcto _sm_vc (antes era progreso_sm en algunos getters)
  const misEntregas_sm_vc = ref([])
  const cargando_sm_vc    = ref(false)

  /* Fallback: sin datos de deploy conectados aún al backend */
  const deploys_sm_vc = ref([])

  // ─────────────────────────────────────────────────────────────────
  // ACTIONS — API Backend
  // ─────────────────────────────────────────────────────────────────

  /**
   * Obtiene el catálogo de materias desde el backend.
   * Ejecutar antes de usar getMateriaById para evitar reads de array vacío.
   */
  const fetch_materias_sm_vc = async () => {
    cargando_sm_vc.value = true
    try {
      const resp_sm_vc = await getMaterias_sm_vc()
      materias_sm_vc.value = resp_sm_vc
    } catch (err_sm_vc) {
      Notify.create({
        message: err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al obtener materias.',
        color: 'negative',
        icon: 'error'
      })
    } finally {
      cargando_sm_vc.value = false
    }
  }

  /**
   * Obtiene el progreso académico del estudiante autenticado (ESTUDIANTE).
   * Guarda en progreso_sm_vc.
   */
  const fetch_mi_progreso_sm_vc = async () => {
    cargando_sm_vc.value = true
    try {
      const resp_sm_vc = await apiGetMiProgreso_sm_vc()
      console.log('[pasantiasStore] Mi progreso (backend):', resp_sm_vc)
      progreso_sm_vc.value = resp_sm_vc
    } catch (err_sm_vc) {
      Notify.create({
        message: err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al obtener progreso personal.',
        color: 'negative',
        icon: 'error'
      })
    } finally {
      cargando_sm_vc.value = false
    }
  }

  /**
   * Obtiene el progreso académico de un estudiante específico (PROFESOR/ADMIN).
   * @param {string|number} id_sm_vc — ID del estudiante (puede ser usuario_id o estudiante_id)
   */
  const fetch_progreso_estudiante_sm_vc = async (id_sm_vc) => {
    cargando_sm_vc.value = true
    try {
      const resp_sm_vc = await apiGetProgresoEstudiante_sm_vc(id_sm_vc)
      console.log(`[pasantiasStore] Progreso estudiante ${id_sm_vc}:`, resp_sm_vc)
      // FIX: guardamos en progreso_sm_vc (sufijo correcto)
      progreso_sm_vc.value = resp_sm_vc
      return resp_sm_vc
    } catch (err_sm_vc) {
      Notify.create({
        message: err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al obtener progreso del estudiante.',
        color: 'negative',
        icon: 'error'
      })
      return null
    } finally {
      cargando_sm_vc.value = false
    }
  }

  /**
   * Ensureiza que el catálogo de materias esté disponible.
   * Útil para acciones que dependen de getMateriaById de forma
   * segura sin condicionales externos.
   */
  const ensure_materias_cargadas_sm_vc = async () => {
    if (!materias_sm_vc.value.length) {
      await fetch_materias_sm_vc()
    }
  }

  /**
   * Registra una entrega documental del estudiante autenticado.
   * @param {number} requisito_id_sm_vc
   * @param {string} comentario_sm_vc
   * @param {File} archivo_sm_vc
   */
  const submit_entrega_sm_vc = async (requisito_id_sm_vc, comentario_sm_vc = '', archivo_sm_vc = null) => {
    cargando_sm_vc.value = true
    try {
      const formData = new FormData()
      formData.append('requisito_id_sm_vc', requisito_id_sm_vc)
      if (comentario_sm_vc) formData.append('comentario_sm_vc', comentario_sm_vc)
      if (archivo_sm_vc)    formData.append('archivo_sm_vc', archivo_sm_vc)

      const resp_sm_vc = await apiCrearEntrega_sm_vc(formData)
      Notify.create({
        message: 'Documento subido exitosamente.',
        color: 'positive',
        icon: 'check_circle'
      })
      // Refrescamos el progreso para reflejar la nueva entrega
      await fetch_mi_progreso_sm_vc()
      return resp_sm_vc
    } catch (err_sm_vc) {
      Notify.create({
        message: err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al registrar entrega.',
        color: 'negative',
        icon: 'error'
      })
      return null
    } finally {
      cargando_sm_vc.value = false
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GETTERS
  // FIX: Todos consumen progreso_sm_vc (sufijo correcto).
  // ─────────────────────────────────────────────────────────────────

  /** Alias computed del catálogo de materias. */
  const getMaterias = computed(() => materias_sm_vc.value)

  /**
   * Busca una materia por su id_sm_vc.
   * Acepta tanto número como string para evitar comparaciones fallidas.
   * SAFE: devuelve null si no encuentra (no rompe la UI).
   */
  const getMateriaById = (id_sm_vc) => {
    if (id_sm_vc == null) return null
    return (
      materias_sm_vc.value.find(
        (m) => String(m.id_sm_vc) === String(id_sm_vc) || String(m.id) === String(id_sm_vc)
      ) ?? null
    )
  }

  /**
   * FIX: `miProgreso` ahora lee de `progreso_sm_vc` (sufijo correcto).
   * Antes el alias apuntaba a `progreso_sm` que nunca existió como ref,
   * causando que el computed devolviera undefined en todas las páginas.
   */
  const miProgreso = computed(() => progreso_sm_vc.value)

  /**
   * Computa si todas las materias del progreso están aprobadas.
   * SAFE: devuelve false si el array está vacío.
   */
  const todasAprobadas = computed(() =>
    progreso_sm_vc.value.length > 0 &&
    progreso_sm_vc.value.every(
      (p_sm_vc) =>
        p_sm_vc.estado_aprobacion_sm_vc === 'APROBADO' ||
        p_sm_vc.aprobado_sm_vc === true
    )
  )

  /**
   * Retorna el array de progreso completo para uso en TrazabilidadPage.vue (Profesor).
   * FIX: ahora apunta a progreso_sm_vc.
   */
  const getProgresoEstudiante = () => progreso_sm_vc.value || []

  // ─────────────────────────────────────────────────────────────────
  // FALLBACKS — Stubs para compatibilidad con vistas heredadas
  // que aún no tienen su endpoint de backend conectado.
  // ─────────────────────────────────────────────────────────────────
  const getDeployEstudiante   = () => null
  const miDeploy              = computed(() => null)
  const getEstudiantesDelProfesor = () => []

  /**
   * Envía un informe documental (Estudiante).
   * @param {Object} payload_sm_vc - { requisito_id_sm_vc, comentario_sm_vc, archivo_sm_vc }
   */
  const enviarInforme = async (payload_sm_vc) => {
    if (payload_sm_vc?.requisito_id_sm_vc) {
      return await submit_entrega_sm_vc(
        payload_sm_vc.requisito_id_sm_vc,
        payload_sm_vc.comentario_sm_vc,
        payload_sm_vc.archivo_sm_vc
      )
    }
  }

  /**
   * Registra la evaluación del profesor para una entrega/mensaje específico.
   * DT-006: Maneja FormData para permitir archivos de corrección.
   */
  const responderCorreccion = async (payload_sm_vc) => {
    cargando_sm_vc.value = true
    try {
      const formData = new FormData()
      formData.append('entrega_id_sm_vc',        payload_sm_vc.entrega_id_sm_vc ?? '')
      formData.append('decision_sm_vc',           payload_sm_vc.estado_evaluacion_sm_vc)
      formData.append('nota_sm_dec',              payload_sm_vc.nota_sm_dec || '')
      formData.append('observaciones_sm_vc',      payload_sm_vc.comentario_sm_vc || '')

      // TAREA 2: ID de la entrega específica vinculada por el profesor
      if (payload_sm_vc.id_entrega_sm_vc) {
        formData.append('id_entrega_sm_vc', payload_sm_vc.id_entrega_sm_vc)
      }

      // TAREA 3: Flag de reprobación global (sin documento específico)
      formData.append(
        'es_reprobacion_global_sm_vc',
        payload_sm_vc.es_reprobacion_global_sm_vc ? 'true' : 'false'
      )
      
      if (payload_sm_vc.archivo_correccion_sm_vc) {
        formData.append('archivo_correccion_sm_vc', payload_sm_vc.archivo_correccion_sm_vc)
      }

      const { evaluarEntrega_sm_vc } = await import('src/services/pasantiasService')
      const resp_sm_vc = await evaluarEntrega_sm_vc(formData)

      Notify.create({
        message: 'Evaluación registrada correctamente.',
        color: 'positive',
        icon: 'how_to_reg'
      })

      // Refrescamos progreso del estudiante
      if (payload_sm_vc.estudiante_id_sm_vc) {
        await fetch_progreso_estudiante_sm_vc(payload_sm_vc.estudiante_id_sm_vc)
      }

      return resp_sm_vc
    } catch (err_sm_vc) {
      console.error('[pasantiasStore] Error evaluando:', err_sm_vc)
      Notify.create({
        message: err_sm_vc.response?.data?.message || 'Error al evaluar entrega.',
        color: 'negative'
      })
      return null
    } finally {
      cargando_sm_vc.value = false
    }
  }

  /**
   * Acción de aprobación por lote (granular o materia completa).
   * DT-007: Si se pasan todos los IDs de la materia, el backend lo trata como aprobación total.
   */
  const aprobarRequisitosGranular = async (payload_sm_vc) => {
    cargando_sm_vc.value = true
    try {
      const { aprobarRequisitosBulk_sm_vc } = await import('src/services/pasantiasService')
      
      const res_sm_vc = await aprobarRequisitosBulk_sm_vc({
        estudiante_id_sm_vc: payload_sm_vc.estudiante_id_sm_vc,
        materia_id_sm_vc:    payload_sm_vc.materia_id_sm_vc,
        requisitos_ids:      payload_sm_vc.requisitos_seleccionados_ids,
        nota_global_sm_dec:  payload_sm_vc.nota_global_sm_dec,
        comentario_sm_vc:    payload_sm_vc.comentario_sm_vc
      })

      Notify.create({
        message: `Se han aprobado ${payload_sm_vc.requisitos_seleccionados_ids.length} requisitos exitosamente.`,
        color: 'positive',
        icon: 'done_all'
      })

      // Refrescamos progreso para actualizar la UI del profesor
      await fetch_progreso_estudiante_sm_vc(payload_sm_vc.estudiante_id_sm_vc)
      
      return res_sm_vc
    } catch (err_sm_vc) {
      console.error('[pasantiasStore] Error en aprobación masiva:', err_sm_vc)
      Notify.create({
        message: err_sm_vc.response?.data?.message || 'Error en la aprobación masiva.',
        color: 'negative'
      })
      return null
    } finally {
      cargando_sm_vc.value = false
    }
  }
  const registrarDeploy            = () => {}
  const procesarCambioPeriodo_sm_vc = () => {}

  return {
    /* State */
    materias_sm_vc,
    progreso_sm_vc,
    cargando_sm_vc,
    misEntregas_sm_vc,
    deploys_sm_vc,

    /* Getters */
    getMaterias,
    getMateriaById,
    miProgreso,
    todasAprobadas,
    getDeployEstudiante,
    miDeploy,
    getEstudiantesDelProfesor,

    /* Actions — API */
    fetch_materias_sm_vc,
    fetch_mi_progreso_sm_vc,
    fetch_progreso_estudiante_sm_vc,
    ensure_materias_cargadas_sm_vc,
    getProgresoEstudiante,
    submit_entrega_sm_vc,

    /* Actions — Legacy fallback */
    enviarInforme,
    responderCorreccion,
    aprobarRequisitosGranular,
    registrarDeploy,
    procesarCambioPeriodo_sm_vc,
    ESTADO_APROBACION
  }
})