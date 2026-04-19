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
  PENDIENTE:     { color: '#5a7fa8', bg: 'rgba(90,127,168,0.1)',   icon: 'schedule' },
  ENTREGADO:     { color: '#7ec8e3', bg: 'rgba(126,200,227,0.1)',  icon: 'upload_file' },
  APROBADO:      { color: '#6fffe9', bg: 'rgba(111,255,233,0.1)',  icon: 'check_circle' },
  OBSERVACIONES: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   icon: 'warning' },
  REPROBADO:     { color: '#ff8fa3', bg: 'rgba(255,143,163,0.1)',  icon: 'cancel' }
}

export const usePasantiasStore = defineStore('pasantias', () => {
  /* ── State ── */
  const materias_sm_vc    = ref([])
  const progreso_sm_vc    = ref([]) // ← FIX: sufijo correcto _sm_vc
  const misEntregas_sm_vc = ref([])
  const cargando_sm_vc    = ref(false)

  /* Fallback: sin datos de deploy conectados aún al backend */
  const deploys_sm_vc = ref([])

  // ─────────────────────────────────────────────────────────────────
  // ACTIONS — API Backend
  // ─────────────────────────────────────────────────────────────────

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

  const fetch_mi_progreso_sm_vc = async () => {
    cargando_sm_vc.value = true
    try {
      const resp_sm_vc = await apiGetMiProgreso_sm_vc()
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

  const fetch_progreso_estudiante_sm_vc = async (id_sm_vc) => {
    cargando_sm_vc.value = true
    try {
      const resp_sm_vc = await apiGetProgresoEstudiante_sm_vc(id_sm_vc)
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

  const ensure_materias_cargadas_sm_vc = async () => {
    if (!materias_sm_vc.value.length) {
      await fetch_materias_sm_vc()
    }
  }

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
  // ─────────────────────────────────────────────────────────────────

  const getMaterias = computed(() => materias_sm_vc.value)

  const getMateriaById = (id_sm_vc) => {
    if (id_sm_vc == null) return null
    return (
      materias_sm_vc.value.find(
        (m) => String(m.id_sm_vc) === String(id_sm_vc) || String(m.id) === String(id_sm_vc)
      ) ?? null
    )
  }

  const miProgreso = computed(() => progreso_sm_vc.value)

  const todasAprobadas = computed(() =>
    progreso_sm_vc.value.length > 0 &&
    progreso_sm_vc.value.every(
      (p_sm_vc) =>
        p_sm_vc.estado_aprobacion_sm_vc === 'APROBADO' ||
        p_sm_vc.aprobado_sm_vc === true
    )
  )

  const getProgresoEstudiante = () => progreso_sm_vc.value || []

  // ─────────────────────────────────────────────────────────────────
  // FALLBACKS
  // ─────────────────────────────────────────────────────────────────
  const getDeployEstudiante   = () => null
  const miDeploy              = computed(() => null)
  const getEstudiantesDelProfesor = () => []

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

      // ✅ FIX 1: Tomar el ID real que viene del formulario y convertirlo a NÚMERO
      if (payload_sm_vc.id_entrega_sm_vc) {
        formData.append('entrega_id_sm_vc', Number(payload_sm_vc.id_entrega_sm_vc))
      }

      // ✅ FIX 2: Mapear la decisión correctamente
      formData.append('decision_sm_vc', payload_sm_vc.estado_evaluacion_sm_vc)

      // ✅ FIX 3: Solo enviar nota si existe y es un número válido
      if (payload_sm_vc.nota_sm_dec !== null && payload_sm_vc.nota_sm_dec !== undefined && payload_sm_vc.nota_sm_dec !== '') {
        formData.append('nota_sm_dec', Number(payload_sm_vc.nota_sm_dec))
      }

      formData.append('observaciones_sm_vc', payload_sm_vc.comentario_sm_vc || '')

      // TAREA 3: Flag de reprobación global (sin documento específico)
      formData.append(
        'es_reprobacion_global_sm_vc',
        payload_sm_vc.es_reprobacion_global_sm_vc ? 'true' : 'false'
      )
      
      if (payload_sm_vc.es_reprobacion_global_sm_vc) {
        if (payload_sm_vc.estudiante_id_sm_vc) formData.append('estudiante_id_sm_vc', payload_sm_vc.estudiante_id_sm_vc);
        if (payload_sm_vc.materia_id_sm_vc) formData.append('materia_id_sm_vc', payload_sm_vc.materia_id_sm_vc);
      }
      
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

      // 💥 Mutación optimista y reactiva para ESTADOS TERMINALES
      if (payload_sm_vc.es_reprobacion_global_sm_vc || payload_sm_vc.estado_evaluacion_sm_vc === 'REPROBADO') {
        const itemProgreso_sm_vc = progreso_sm_vc.value.find(
          p => String(p.estudiante_id_sm_vc) === String(payload_sm_vc.estudiante_id_sm_vc) &&
              (String(p.id_sm_vc) === String(payload_sm_vc.materia_id_sm_vc) || String(p.materia_id_sm_vc) === String(payload_sm_vc.materia_id_sm_vc))
        );
        if (itemProgreso_sm_vc) itemProgreso_sm_vc.estado_aprobacion_sm_vc = 'REPROBADO';
      }

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
  } // <--- ESTA ERA LA LLAVE QUE FALTABA Y ROMPÍA TODO EL ARCHIVO

  /**
   * Acción de aprobación por lote (granular o materia completa).
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

  const registrarDeploy = () => {}

  /**
   * procesarCambioPeriodo_sm_vc
   * ─────────────────────────────────────────────────────────────────
   * Se invoca desde periodoStore tras un Roll-Forward o cambio de período.
   * PROTOCOLO:
   *   1. Limpia el estado local para evitar que la UI muestre datos del
   *      período anterior (el "estado zombie").
   *   2. Rehidrata COMPLETAMENTE: materias Y progreso del estudiante
   *      actual, garantizando que el store quede en un estado válido
   *      antes de que cualquier componente reaccione.
   *
   * FIX: antes solo rehidrataba `materias_sm_vc` y dejaba `progreso_sm_vc`
   * en `[]`, lo que provocaba que TrazabilidadPage renderizara en blanco
   * en el primer intento tras un cambio de período.
   */
  const procesarCambioPeriodo_sm_vc = async () => {
    // Paso 1: Reset atómico — el store queda en pizarra en blanco
    materias_sm_vc.value    = []
    progreso_sm_vc.value    = []
    misEntregas_sm_vc.value = []

    // Paso 2: Rehidratación completa en paralelo
    // fetch_mi_progreso_sm_vc es el endpoint del estudiante logueado;
    // si en el futuro se requiere el progreso del profesor, se añade aquí.
    await Promise.all([
      fetch_materias_sm_vc(),
      fetch_mi_progreso_sm_vc()
    ])

    console.log('[pasantiasStore] Rehidratación completa (materias + progreso) tras cambio de período.')
  }

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