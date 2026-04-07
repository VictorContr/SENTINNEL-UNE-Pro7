// ══════════════════════════════════════════════════════════════════
// pasantiasStore.js — Store de Pasantías integrado con Backend NestJS
// Mapea funciones Axios a mutación de estado reactive según arquitectura.
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
  const materias_sm_vc       = ref([])
  const progreso_sm_vc       = ref([])
  const misEntregas_sm_vc    = ref([]) // Para mapear local
  const cargando_sm_vc       = ref(false)
  
  /* Fallback Mock Mantenidos para UI no conectada aún */
  const deploys_sm_vc        = ref([])

  /* ── Actions: API Backend ── */

  const fetch_materias_sm_vc = async () => {
    cargando_sm_vc.value = true
    try {
      const resp_sm_vc = await getMaterias_sm_vc()
      materias_sm_vc.value = resp_sm_vc
    } catch (err_sm_vc) {
      Notify.create({ message: err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al obtener materias.', color: 'negative', icon: 'error' })
    } finally {
      cargando_sm_vc.value = false
    }
  }

  const fetch_mi_progreso_sm_vc = async () => {
    cargando_sm_vc.value = true
    try {
      const resp_sm_vc = await apiGetMiProgreso_sm_vc()
      console.log('Respuesta del Backend (Mi Progreso):', resp_sm_vc)
      progreso_sm_vc.value = resp_sm_vc
    } catch (err_sm_vc) {
      Notify.create({ message: err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al obtener progreso personal.', color: 'negative', icon: 'error' })
    } finally {
      cargando_sm_vc.value = false
    }
  }

  const fetch_progreso_estudiante_sm_vc = async (id_sm_vc) => {
    cargando_sm_vc.value = true
    try {
      const resp_sm_vc = await apiGetProgresoEstudiante_sm_vc(id_sm_vc)
      console.log(`Respuesta del Backend (Progreso Estudiante ${id_sm_vc}):`, resp_sm_vc)
      // Guardamos en el estado para que los getters reactivos funcionen
      progreso_sm_vc.value = resp_sm_vc
      return resp_sm_vc
    } catch (err_sm_vc) {
      Notify.create({ message: err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al obtener progreso del estudiante.', color: 'negative', icon: 'error' })
      return null
    } finally {
      cargando_sm_vc.value = false
    }
  }

  const submit_entrega_sm_vc = async (requisito_id_sm_vc, comentario_sm_vc = '') => {
    cargando_sm_vc.value = true
    try {
      const resp_sm_vc = await apiCrearEntrega_sm_vc({ requisito_id_sm_vc, comentario_sm_vc })
      Notify.create({ message: 'Entrega creada exitosamente en el backend.', color: 'positive', icon: 'check_circle' })
      // Actualizamos progreso para reflejar la entrega
      await fetch_mi_progreso_sm_vc()
      return resp_sm_vc
    } catch (err_sm_vc) {
      Notify.create({ message: err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al registrar entrega.', color: 'negative', icon: 'error' })
      return null
    } finally {
      cargando_sm_vc.value = false
    }
  }

  /* ── Getters (Manteniendo nombres para compatibilidad de vistas locales) ── */
  const getMaterias = computed(() => materias_sm_vc.value)
  const getMateriaById = (id_sm_vc) => materias_sm_vc.value.find((m) => m.id_sm_vc === id_sm_vc || m.id === id_sm_vc) ?? null
  
  const miProgreso = computed(() => progreso_sm_vc.value)

  const todasAprobadas = computed(() => 
    progreso_sm_vc.value.length > 0 && 
    progreso_sm_vc.value.every((p_sm_vc) => p_sm_vc.estado_aprobacion_sm_vc === 'APROBADO' || p_sm_vc.aprobado_sm_vc === true)
  )

  const getProgresoEstudiante = () => {
    // Retornamos el progreso actual filtrado o directo si confiamos en el fetch_progreso previa
    // Por simplicidad en la transición a backend real:
    return progreso_sm_vc.value || []
  }

  /* ── Fallbacks Legacy UI (Sin NestJS mapeado aún) ── */
  const getDeployEstudiante = () => null
  const miDeploy = computed(() => null)
  const getEstudiantesDelProfesor = () => []
  const enviarInforme = async (payload_sm_vc) => {
    // Redirige al backend si envía un requisito
    if (payload_sm_vc.requisito_id_sm_vc) {
      return await submit_entrega_sm_vc(payload_sm_vc.requisito_id_sm_vc, payload_sm_vc.comentario_sm_vc)
    }
  }
  const responderCorreccion = () => {}
  const aprobarRequisitosGranular = () => {}
  const registrarDeploy = () => {}
  const procesarCambioPeriodo_sm_vc = () => {}

  return {
    /* State */
    materias_sm_vc,
    progreso_sm_vc,
    cargando_sm_vc,
    misEntregas_sm_vc,
    deploys_sm_vc,

    /* Getters Legacy/Mapping */
    getMaterias,
    getMateriaById,
    miProgreso,
    todasAprobadas,
    getDeployEstudiante,
    miDeploy,
    getEstudiantesDelProfesor,

    /* Actions API */
    fetch_materias_sm_vc,
    fetch_mi_progreso_sm_vc,
    fetch_progreso_estudiante_sm_vc,
    getProgresoEstudiante,
    submit_entrega_sm_vc,

    /* Actions Legacy fallback */
    enviarInforme,
    responderCorreccion,
    aprobarRequisitosGranular,
    registrarDeploy,
    procesarCambioPeriodo_sm_vc,
    ESTADO_APROBACION
  }
})